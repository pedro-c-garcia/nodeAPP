import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

const yahooFinance = new YahooFinance({
  suppressNotices: ["ripHistorical"],
});

type CacheEntry = {
  createdAt: number;
  payload: {
    meta: { start: string; end: string };
    rows: Array<{
      date: string;
      sp500: number | null;
      dow: number | null;
      nasdaq: number | null;
      russell: number | null;
    }>;
  };
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

const TICKERS: Record<string, string> = {
  sp500: "^GSPC",
  dow: "^DJI",
  nasdaq: "^IXIC",
  russell: "^RUT",
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endParam = searchParams.get("end");
  const startParam = searchParams.get("start");

  const end = endParam ? new Date(endParam) : new Date();
  const start = startParam ? new Date(startParam) : subDays(end, 30);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json(
      { error: "Datas inválidas." },
      { status: 400 }
    );
  }

  const startKey = toDateKey(start);
  const endKey = toDateKey(end);
  const cacheKey = `${startKey}_${endKey}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return NextResponse.json(cached.payload, {
      headers: { "x-cache": "HIT" },
    });
  }

  const [sp500, dow, nasdaq, russell] = await Promise.all(
    Object.entries(TICKERS).map(async ([key, symbol]) => {
      const data = await yahooFinance.chart(symbol, {
        period1: start,
        period2: end,
        interval: "1d",
      });
      return [key, data] as const;
    })
  );

  const maps = new Map<string, Map<string, number>>();
  for (const [key, chart] of [sp500, dow, nasdaq, russell]) {
    const map = new Map<string, number>();
    const quotes = chart?.quotes ?? [];
    for (const item of quotes) {
      if (!item.date || item.close == null) continue;
      map.set(toDateKey(item.date), item.close);
    }
    maps.set(key, map);
  }

  const baseMap = maps.get("sp500");
  if (!baseMap || baseMap.size === 0) {
    return NextResponse.json(
      { error: "Sem dados do S&P 500 para o período informado." },
      { status: 404 }
    );
  }

  const dates = Array.from(baseMap.keys()).sort();
  const rows = dates.map((date) => ({
    date,
    sp500: baseMap.get(date) ?? null,
    dow: maps.get("dow")?.get(date) ?? null,
    nasdaq: maps.get("nasdaq")?.get(date) ?? null,
    russell: maps.get("russell")?.get(date) ?? null,
  }));

  const payload = {
    meta: {
      start: startKey,
      end: endKey,
    },
    rows,
  };

  cache.set(cacheKey, { createdAt: Date.now(), payload });

  return NextResponse.json(payload, {
    headers: { "x-cache": "MISS", "cache-control": "s-maxage=300" },
  });
}
