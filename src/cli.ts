interface Profile {
  personaname: string;
}

interface PlayerResponse {
  profile: Profile | null;
}

interface WinLoss {
  win: number;
  lose: number;
}

interface TotalsEntry {
  field: string;
  sum: number;
}

async function main() {

const command = Bun.argv[2];
const accountId = Bun.argv[3];

const id = Number(accountId);   
const isValid = !Number.isNaN(id) && Number.isInteger(id) && id>0;

const commandValid = command === "analyze-account"

if (!isValid || !commandValid) {
  console.error("Usage: bun run ./src/cli.ts analyze-account <account-id>");
  process.exit(1);
}

try{
const profilePromise = fetch(`https://api.opendota.com/api/players/${id}`);
const wlPromise = fetch(`https://api.opendota.com/api/players/${id}/wl`);
const totalsPromise = fetch(`https://api.opendota.com/api/players/${id}/totals`);

const [profileResponse, wlResponse, totalsResponse] = await Promise.all([
  profilePromise,
  wlPromise,
  totalsPromise,
]);

if (profileResponse.status === 429 || wlResponse.status === 429 || totalsResponse.status === 429) {
  console.error("Rate limited by OpenDota (HTTP 429). Wait and try again.");
  process.exit(1);
}

if (!profileResponse.ok || !wlResponse.ok || !totalsResponse.ok) {
  console.error("OpenDota returned an error response");
  process.exit(1);
}

const [profileData, wlData, totalsData] = await Promise.all([
  profileResponse.json() as Promise<PlayerResponse>,
  wlResponse.json() as Promise<WinLoss>,
  totalsResponse.json() as Promise<TotalsEntry[]>,
]);

if (!profileData.profile) {
  console.error("Profile is unavailable (private or does not exist)");
  process.exit(1);
}



const nickname = profileData.profile.personaname;
const wins = wlData.win;
const losses = wlData.lose;
const killsEntry = totalsData.find((item) => item.field === "kills");
const deathsEntry = totalsData.find((item) => item.field === "deaths");
const assistsEntry = totalsData.find((item) => item.field === "assists");

if (!killsEntry || !deathsEntry || !assistsEntry) {
  console.error("Player totals are unavailable");
  process.exit(1);
}

const killsEntrySum = killsEntry.sum;
const deathsEntrySum = deathsEntry.sum;
const assistsEntrySum = assistsEntry.sum;
const totalGames = wins + losses;



let winRate;
if (totalGames === 0) {
  winRate = "0.00";}
    else {
  winRate =(wins / totalGames * 100).toFixed(2);
}

console.log(`
Account: ${id}
Nickname: ${nickname}
Wins: ${wins}
Losses: ${losses}
Win rate: ${winRate}%
Kills: ${killsEntrySum}
Assists: ${assistsEntrySum}
Deaths: ${deathsEntrySum}
`);
} catch(error){
    console.error("Failed to fetch or parse data from OpenDota");
    console.error(error);
    process.exit(1);
}
};

main();