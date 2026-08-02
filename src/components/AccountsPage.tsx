import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

export function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/accounts");
        if (!response.ok) {
          throw new Error("Failed to load accounts");
        }
        const data = await response.json();
        setAccounts(data.accounts);
      } catch (err: any) {
        setError(err.message || "Cannot load accounts");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">Loading accounts…</div>;
  }
  if (error) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">Error: {error}</div>;
  }
  if (accounts.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
        No analyzed accounts yet. Run: bun run ./src/cli.ts analyze-account &lt;account-id&gt;
      </div>
    );
  }

return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <Link to="/" className="text-sm text-zinc-400">← Home</Link>
      <h1 className="text-3xl font-bold my-6">Analyzed Accounts</h1>

      <div className="space-y-4">
        {accounts.map((acc) => (
          <Card key={acc.account_id} className="p-4">
            <h2 className="text-xl font-bold">{acc.nickname}</h2>
            <p className="text-sm text-zinc-400">ID: {acc.account_id}</p>
            <p className="mt-2">
              {acc.cached_wins}W / {acc.cached_losses}L · {acc.cached_win_rate}% · {acc.cached_games} cached matches
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Last analyzed: {new Date(acc.last_analysed).toLocaleDateString()}
            </p>
            <Link to={`/accounts/${acc.account_id}`} className="inline-block mt-3 text-sm text-blue-400">
              Open full history →
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

