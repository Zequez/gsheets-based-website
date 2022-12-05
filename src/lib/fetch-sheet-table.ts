const GOOGLE_API_KEY = import.meta.env.GOOGLE_API_KEY;

type Transformer = (person: any) => Promise<any> | any;

async function fetchSheetTable(
  sheetId: string,
  range: string,
  transformers: Transformer[] = []
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}${range}?key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();
  const headers: string[] = data.values[0];
  const rows: string[][] = data.values.slice(1);

  const rowsObjects = rows.map((row) =>
    Object.fromEntries(row.map((val, j) => [headers[j], val]))
  );

  for (let transformer of transformers) {
    await Promise.all(
      rowsObjects.map(async (p, i) => {
        const newData = await transformer(p);
        Object.assign(rowsObjects[i], newData);
      })
    );
  }

  return rowsObjects;
}

export default fetchSheetTable;
