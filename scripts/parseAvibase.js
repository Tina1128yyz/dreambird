// scripts/parseAvibase.js
import fs from "fs";
import path from "path";
import { load } from "cheerio";

// 输入目录（存放所有 Avibase HTML）
const inputDir = path.join(process.cwd(), "data", "avibase_html");
const outputFile = path.join(process.cwd(), "data", "zhMapping.json");
const conflictsFile = path.join(process.cwd(), "data", "conflicts.json");

// 清理中文名，去掉状态词、括号说明，只保留汉字
function cleanZhName(name) {
  if (!name) return null;
  let cleaned = name;

  // 去掉括号里的说明（中英文括号都处理）
  cleaned = cleaned.replace(/\（.*?\）|\(.*?\)/g, "");

  // 去掉已知状态词（以及它们后面的所有东西）
  cleaned = cleaned.replace(
    /(易危|近危|濒危|极危|无危|未评估|来源不明|稀见|偶见|外来物种|已灭绝|野外绝灭|数据不足).*$/g,
    ""
  );

  // 只保留中文（安全兜底）
  cleaned = cleaned.replace(/[^\u4e00-\u9fa5]/g, "");

  return cleaned.trim();
}

const mapping = {};
const conflicts = {};

// 读取所有 HTML 文件
const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".html"));
console.log(`📂 Found ${files.length} Avibase files`);

for (const file of files) {
  const filePath = path.join(inputDir, file);
  const html = fs.readFileSync(filePath, "utf-8");
  const $ = load(html);

  $("tr").each((_, row) => {
    const cols = $(row).find("td");
    if (cols.length < 3) return;

    const enName = $(cols[0]).text().trim();
    const sciName = $(cols[1]).text().trim();
    const zhNameRaw = $(cols[2]).text().trim();
    const zhName = cleanZhName(zhNameRaw);

    if (sciName && zhName) {
      if (mapping[sciName] && mapping[sciName] !== zhName) {
        // 记录冲突
        if (!conflicts[sciName]) conflicts[sciName] = new Set();
        conflicts[sciName].add(mapping[sciName]);
        conflicts[sciName].add(zhName);
      } else {
        mapping[sciName] = zhName;
      }
    }
  });

  console.log(
    `✅ Parsed ${file}, total species so far: ${Object.keys(mapping).length}`
  );
}

// 保存 JSON
fs.writeFileSync(outputFile, JSON.stringify(mapping, null, 2), "utf-8");
console.log(
  `🎉 zhMapping.json saved to ${outputFile}, total ${
    Object.keys(mapping).length
  } species`
);

// 保存冲突
if (Object.keys(conflicts).length > 0) {
  const conflictObj = {};
  for (const [k, v] of Object.entries(conflicts)) {
    conflictObj[k] = Array.from(v);
  }
  fs.writeFileSync(conflictsFile, JSON.stringify(conflictObj, null, 2), "utf-8");
  console.log(`⚠️ Conflicts saved to ${conflictsFile}`);
} else {
  console.log("✅ No conflicts found.");
}
