import { db } from "./database";

interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: "str" | "agi" | "int" | "all";
  attack_type: "Melee" | "Ranged";
  roles: string[];
}

export async function syncHeroes() {
try{
const response = await fetch(`https://api.opendota.com/api/heroes`);

if (response.status === 429) {
  console.error("Rate limited by OpenDota (HTTP 429). Wait and try again.");
  return;
}

if (!response.ok) {
  console.error("OpenDota returned an error response");
  return;
}

const data = await response.json();

if (!Array.isArray(data)) {
    console.error("Unexpected response: not an array");
    return;
}

const heroes = data as Hero[];

const upsertHero = db.query(`
  INSERT INTO heroes (id, name, localized_name, primary_attr, attack_type, last_synced)
  VALUES ($id, $name, $localized_name, $primary_attr, $attack_type, $last_synced)
  ON CONFLICT(id) DO UPDATE SET
    name = $name,
    localized_name = $localized_name,
    primary_attr = $primary_attr,
    attack_type = $attack_type,
    last_synced = $last_synced
`);

const deleteRoles = db.query(`DELETE FROM hero_roles WHERE hero_id = $hero_id`);

const insertRole = db.query(`
  INSERT INTO hero_roles (hero_id, role) VALUES ($hero_id, $role)
`);

const runSync = db.transaction((heroesArray: Hero[]) => {
  const now = new Date().toISOString();
  for (const hero of heroesArray) {
    upsertHero.run({
        $id: hero.id,
        $name: hero.name,
        $localized_name: hero.localized_name,
        $primary_attr: hero.primary_attr,
        $attack_type: hero.attack_type,
        $last_synced: now,
    });
    deleteRoles.run({$hero_id: hero.id});

    for (const role of hero.roles) {
    insertRole.run({
    $hero_id: hero.id,
    $role: role,
  });
}
  }
});

runSync(heroes);
console.log(`Synced ${heroes.length} heroes`);

} catch (error){
    console.error("Failed to fetch or parse heroes:",error);
    return;
}
}