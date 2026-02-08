"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import * as dfd from "danfojs";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type QuoteRow = {
  date: string;
  sp500: number | null;
  dow: number | null;
  nasdaq: number | null;
  russell: number | null;
};

type QuoteRowWithVar = QuoteRow & {
  sp500Var: number | null;
  dowVar: number | null;
  nasdaqVar: number | null;
  russellVar: number | null;
};

export default function QuotesPage() {
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataFrame, setDataFrame] = useState<dfd.DataFrame | null>(null);
  const [tableRows, setTableRows] = useState<QuoteRowWithVar[]>([]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/quotes?start=${startDate}&end=${endDate}`
      );
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Erro ao buscar dados.");
      }
      const payload = await res.json();
      const apiRows: QuoteRow[] = payload.rows ?? [];
      const enriched: QuoteRowWithVar[] = apiRows.map((row) => {
        const base = row.sp500 ?? 0;
        const ratio = (value: number | null) =>
          base ? ((value ?? 0) / base - 1) * 100 : null;

        return {
          ...row,
          sp500Var: 0,
          dowVar: ratio(row.dow),
          nasdaqVar: ratio(row.nasdaq),
          russellVar: ratio(row.russell),
        };
      });

      const df = new dfd.DataFrame(enriched);
      setDataFrame(df);
      setTableRows(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      loadData();
    }, 60000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, startDate, endDate]);

  const chartData = useMemo(() => {
    const labels = tableRows.map((row) => row.date);
    return {
      labels,
      datasets: [
        {
          label: "S&P 500",
          data: tableRows.map((row) => row.sp500Var),
          borderColor: "#204b9b",
          backgroundColor: "rgba(32, 75, 155, 0.2)",
        },
        {
          label: "Dow Jones",
          data: tableRows.map((row) => row.dowVar),
          borderColor: "#f0b429",
          backgroundColor: "rgba(240, 180, 41, 0.2)",
        },
        {
          label: "Nasdaq",
          data: tableRows.map((row) => row.nasdaqVar),
          borderColor: "#1b998b",
          backgroundColor: "rgba(27, 153, 139, 0.2)",
        },
        {
          label: "Russell 2000",
          data: tableRows.map((row) => row.russellVar),
          borderColor: "#3d3a4b",
          backgroundColor: "rgba(61, 58, 75, 0.2)",
        },
      ],
    };
  }, [tableRows]);

  function exportToExcel() {
    if (!tableRows.length) return;
    const sheetData = tableRows.map((row) => ({
      Data: row.date,
      "S&P 500 (%)": row.sp500Var?.toFixed(2),
      "Dow Jones (%)": row.dowVar?.toFixed(2),
      Nasdaq: row.nasdaqVar?.toFixed(2),
      "Russell 2000 (%)": row.russellVar?.toFixed(2),
    }));
    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Variacao");
    XLSX.writeFile(workbook, `variacao_${startDate}_${endDate}.xlsx`);
  }

  return (
    <section style={{ marginTop: 24 }}>
      <div className="card">
        <h1>Cotações históricas</h1>
        <p className="muted">
          Comparação das variações percentuais de fechamento em relação ao S&P
          500.
        </p>
        <div className="form-row">
          <div className="field">
            <label htmlFor="start">Data inicial</label>
            <input
              id="start"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="end">Data final</label>
            <input
              id="end"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <label className="field">
            <span>Auto refresh</span>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
            />
          </label>
          <button className="button" onClick={loadData} type="button">
            Atualizar
          </button>
          <a
            className="button secondary"
            href="#export"
            onClick={(event) => {
              event.preventDefault();
              exportToExcel();
            }}
          >
            Exportar para Excel
          </a>
        </div>
        {loading && <p className="muted">Carregando dados...</p>}
        {error && <p className="muted">{error}</p>}
        {!loading && !error && dataFrame && (
          <p className="muted">Linhas carregadas: {dataFrame.shape[0]}</p>
        )}
      </div>

      <div className="chart-wrap">
        {tableRows.length ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              interaction: { mode: "index", intersect: false },
              scales: {
                y: {
                  title: {
                    display: true,
                    text: "Variação (%) vs S&P 500",
                  },
                },
              },
            }}
          />
        ) : (
          <p className="muted">Sem dados para exibir.</p>
        )}
      </div>

      {tableRows.length > 0 && (
        <div className="card">
          <h2>Tabela de variações</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>S&P 500 (%)</th>
                <th>Dow Jones (%)</th>
                <th>Nasdaq (%)</th>
                <th>Russell 2000 (%)</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.sp500Var?.toFixed(2)}</td>
                  <td>{row.dowVar?.toFixed(2)}</td>
                  <td>{row.nasdaqVar?.toFixed(2)}</td>
                  <td>{row.russellVar?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
