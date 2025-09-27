// 使用方法：node scripts/csv_to_json.js
import fs from "fs";
import path from "path";
import readline from "readline";

const INPUT = path.join(process.cwd(), "data", "eBird_taxonomy_v2024.csv");
const OUTPUT = path.join(process.cwd(), "data", "ebird_subset.json");
const LIMIT = 200;

async function run() {
  const rl = readline.createInterface({
    input: fs.createReadStream(INPUT),
    crlfDelay: Infinity,
  });

  let header = null;
  const rows = [];

  for await (const line of rl) {
    if (!header) {
      header = line.split(",");
      continue;
    }
    const cols = line.split(",");
    const record = {};
    for (let i = 0; i < header.length; i++) {
      record[header[i]] = cols[i] || "";
    }
    rows.push({
      comName: record["PRIMARY_COM_NAME"] || record["comName"] || "",
      sciName: record["SCI_NAME"] || record["sciName"] || "",
    });
    if (rows.length >= LIMIT) break;
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(rows, null, 2), "utf8");
  console.log(`✅ Wrote ${rows.length} records to ${OUTPUT}`);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
