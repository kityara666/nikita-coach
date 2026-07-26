console.log("before fetch");
const url = "https://api.opendota.com/api/players/64447082/matches?limit=100&offset=0&date=730";
const response = await fetch(url);
console.log("status:", response.status);
const data = await response.json();
console.log("count:", Array.isArray(data) ? data.length : "not array");