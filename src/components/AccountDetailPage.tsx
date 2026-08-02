import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

const ALLOWED_DAYS = [7, 30, 60, 90, 160, 365];

export function AccountDetailPage() {
  const { accountId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const daysParam = Number(searchParams.get("days"));
  const days = ALLOWED_DAYS.includes(daysParam) ? daysParam : 30;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/accounts/${accountId}/matches?days=${days}`,
        { signal: controller.signal }
      );
      if (response.status === 404) {
        throw new Error("Account not analyzed");
      }
      if (!response.ok) {
        throw new Error("Failed to load account");
      }
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;                    
      }
      setError(err.message || "Cannot load account");
    } finally {
      setIsLoading(false);
    }
  }
  fetchData();

  return () => {
    controller.abort();           
  };
}, [accountId, days]);

    if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">Loading…</div>;
    }
    if (error) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">Error: {error}</div>;
    }
    if (!data) {
    return null;
}

  return (
  <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
    <Link to="/accounts" className="text-sm text-zinc-400">← Back to accounts</Link>
    <h1 className="text-3xl font-bold my-4">{data.account.nickname}</h1>
    <p className="text-sm text-zinc-400 mb-4">ID: {data.account.account_id}</p>

    <p className="mb-6">
      Last {days} days: {data.summary.wins}W / {data.summary.losses}L · {data.summary.games} games · {data.summary.win_rate}%
    </p>

    <div className="flex flex-wrap gap-2 mb-6">
  {ALLOWED_DAYS.map((d) => (
    <button
      key={d}
      onClick={() => setSearchParams({ days: String(d) })}
      className={`px-3 py-1 rounded text-sm ${
        d === days ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-300"
      }`}
    >
      {d}D
    </button>
  ))}
    </div>
    {data.matches.length === 0 ? (
  <p className="text-zinc-500">No matches in the last {days} days.</p>
) : (
  <div className="space-y-2">
    {data.matches.map((m: any) => {
      const heroName = m.localized_name ?? `Unknown hero (${m.hero_id})`;
      const minutes = Math.floor(m.duration / 60);
      const seconds = m.duration % 60;
      return (
        <div key={m.match_id} className="flex flex-wrap items-center gap-3 p-3 bg-zinc-900 rounded">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.result === "win" ? "bg-green-700" : "bg-red-700"}`}>
            {m.result === "win" ? "WIN" : "LOSS"}
          </span>
          <span className="text-sm text-zinc-400">{new Date(m.start_time * 1000).toLocaleDateString()}</span>
          <span className="font-semibold">{heroName}</span>
          <span className="text-sm">{m.kills} / {m.deaths} / {m.assists}</span>
          <span className="text-sm text-zinc-400">{minutes}m {seconds}s</span>
          <a href={`https://www.opendota.com/matches/${m.match_id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 ml-auto">
            OpenDota →
          </a>
        </div>
      );
    })}
  </div>
)}
  </div>
);
}

