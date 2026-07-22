import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

export function HeroesPage() {
    const [heroes, setHeroes] = useState<any[]>([]);
    const [lastSynced, setLastSynced] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("")
    const [attrFilter, setAttrFilter] = useState("");
    const [attackFilter, setAttackFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("");


    useEffect(() => {
  async function fetchData() {
    try {
      const response = await fetch("/api/heroes");
      if (!response.ok) {
        throw new Error("Failed to load heroes");
      }
      const data = await response.json();
      setHeroes(data.heroes);
      setLastSynced(data.lastSynced);
    } catch (err: any) {
      setError(err.message || "Cannot load heroes");
    } finally {
      setIsLoading(false);
    }
  }
  fetchData();
}, []);

if (isLoading) {
  return <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">Loading heroes…</div>;
}
if (error) {
  return <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">Error: {error}</div>;
}
if (heroes.length === 0) {
  return <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">No heroes cached yet. Run sync-heroes.</div>;
}

const attrNames: Record<string, string> = {
  str: "Strength",
  agi: "Agility",
  int: "Intelligence",
  all: "Universal",
};

const filteredHeroes = heroes.filter((hero) => {
  const matchesSearch = hero.localized_name.toLowerCase().includes(search.toLowerCase());
  const matchesAttr = attrFilter === "" || hero.primary_attr === attrFilter;
  const matchesAttack = attackFilter === "" || hero.attack_type === attackFilter;
  const matchesRole = roleFilter === "" || hero.roles.includes(roleFilter);
  return matchesSearch && matchesAttr && matchesAttack && matchesRole;
});


return (
  <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
    <Link to="/">Home</Link>
    <h1 className="text-3xl font-bold mb-6">Heroes</h1>

    <input
    type="text"
    placeholder="Search heroes…"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="mb-6 px-3 py-2 rounded bg-zinc-800 text-zinc-100 w-full max-w-sm"
    />

    <select
    value={attrFilter}
    onChange={(e) => setAttrFilter(e.target.value)}
    className="mb-6 px-3 py-2 rounded bg-zinc-800 text-zinc-100"
    >
    <option value="">All attributes</option>
    <option value="str">Strength</option>
    <option value="agi">Agility</option>
    <option value="int">Intelligence</option>
    <option value="all">Universal</option>
    </select>

    <select
    value={attackFilter}
    onChange={(e) => setAttackFilter(e.target.value)}
    className="mb-6 px-3 py-2 rounded bg-zinc-800 text-zinc-100"
    >
    <option value="">All attack types</option>
    <option value="Melee">Melee</option>
    <option value="Ranged">Ranged</option>
    </select>

    <select
    value={roleFilter}
    onChange={(e) => setRoleFilter(e.target.value)}
    className="mb-6 px-3 py-2 rounded bg-zinc-800 text-zinc-100"
    >
    <option value="">All roles</option>
    <option value="Carry">Carry</option>
    <option value="Support">Support</option>
    <option value="Nuker">Nuker</option>
    <option value="Disabler">Disabler</option>
    <option value="Initiator">Initiator</option>
    <option value="Durable">Durable</option>
    <option value="Escape">Escape</option>
    <option value="Pusher">Pusher</option>
    <option value="Jungler">Jungler</option>
    </select>

    {lastSynced && (
      <p className="text-sm text-zinc-500 mb-6">
        Last updated: {new Date(lastSynced).toLocaleString()}
      </p>
    )}

    {filteredHeroes.length === 0 && <p>Nothing matches your filters</p>}
    
    {filteredHeroes.map((hero) => (
      <Card key={hero.id} className="mb-4 p-4">
        <h2 className="text-xl font-bold">{hero.localized_name}</h2>
        <p>{attrNames[hero.primary_attr]} · {hero.attack_type}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {hero.roles.map((role: string) => (
            <span key={role} className="px-2 py-1 text-xs rounded bg-zinc-800">
              {role}
            </span>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

}