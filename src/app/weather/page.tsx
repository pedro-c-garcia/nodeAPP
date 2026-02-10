import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/auth-options";

type DailyWeather = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  weathercode: number[];
};

type WeatherResponse = {
  daily: DailyWeather;
  timezone: string;
};

const LISBON = {
  lat: 38.7223,
  lon: -9.1393,
  timezone: "Europe/Lisbon",
};

function weatherCodeLabel(code: number) {
  if (code === 0) return "Céu limpo";
  if (code <= 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code <= 48) return "Nevoeiro";
  if (code <= 57) return "Chuviscos";
  if (code <= 67) return "Chuva";
  if (code <= 77) return "Neve";
  if (code <= 82) return "Aguaceiros";
  if (code <= 86) return "Neve fraca";
  if (code <= 99) return "Trovoada";
  return "Indefinido";
}

async function fetchWeather(): Promise<WeatherResponse> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LISBON.lat}` +
    `&longitude=${LISBON.lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode` +
    `&timezone=${encodeURIComponent(LISBON.timezone)}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error("Falha ao obter dados de meteorologia.");
  }
  return res.json();
}

export default async function WeatherPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth?callbackUrl=/weather");
  }

  const data = await fetchWeather();
  const days = data.daily.time.map((date, index) => ({
    date,
    max: data.daily.temperature_2m_max[index],
    min: data.daily.temperature_2m_min[index],
    rain: data.daily.precipitation_sum[index],
    code: data.daily.weathercode[index],
  }));

  return (
    <section style={{ marginTop: 24 }}>
      <div className="card">
        <h1>Meteorologia de Lisboa</h1>
        <p className="muted">
          Previsão diária para os próximos 7 dias (timezone: {data.timezone}).
        </p>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Máx (°C)</th>
              <th>Mín (°C)</th>
              <th>Precipitação (mm)</th>
              <th>Condição</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.date}>
                <td>{day.date}</td>
                <td>{day.max.toFixed(1)}</td>
                <td>{day.min.toFixed(1)}</td>
                <td>{day.rain.toFixed(1)}</td>
                <td>{weatherCodeLabel(day.code)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
