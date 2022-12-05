const GOOGLE_API_KEY = import.meta.env.GOOGLE_API_KEY;
import { fetchTelegramAvatarUrl } from "./downloadTelegramAvatars";

const SHEET_ID = "1UEa0Zpwu6YV4STZMQK4hjjOnBj0prpeh6zalVciWSq4";
const range = `/values/Responses`;

export type Person = {
  Timestamp: string;
  "Email Address": string;
  Website: string;
  "Job Title": string;
  Avatar: string | null;
  "Telegram Handle": string;
  "Freeform Writing Space": string;
  "Subscribe to my newsletter?": string;
  "Full Name": string;
};

async function fetchPeople() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${range}?key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();
  const headers: string[] = data.values[0];
  const rows: string[][] = data.values.slice(1);

  const people: Person[] = rows.map((row) =>
    Object.fromEntries(row.map((val, j) => [headers[j], val]))
  ) as Person[];

  // Load all the Telegram avatars URLs
  await Promise.all(
    people.map(async (p, i) => {
      const avatarUrl = p["Telegram Handle"]
        ? await fetchTelegramAvatarUrl(p["Telegram Handle"])
        : null;
      people[i]["Avatar"] = avatarUrl;
    })
  );

  // downloadTelegramAvatars(people.map((p) => p["Telegram Handle"]));

  return people;
}

export default fetchPeople;
