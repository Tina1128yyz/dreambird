import { NextResponse } from "next/server";
import taxonomyData from "@/data/taxonomy.json";
import zhMapping from "@/data/zhMapping.json";

function isChinese(text = "") {
  return /[\u4E00-\u9FFF]/.test(text);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rawQ = (searchParams.get("q") || "").trim();
  if (!rawQ) return NextResponse.json([]);

  console.log("speciesSearch query:", rawQ);

  let results = [];

  if (isChinese(rawQ)) {
    // 中文搜索：在 zhMapping 里找中文名匹配
    results = Object.entries(zhMapping)
      .filter(([sciName, zhName]) => zhName.includes(rawQ))
      .map(([sciName, zhName]) => {
        const tax = taxonomyData.find((t) => t.sciName === sciName);
        return {
          sciName,
          comName: tax?.comName || sciName,
          zhName,
        };
      });
  } else {
    // 英文/学名搜索
    const qLower = rawQ.toLowerCase();
    results = taxonomyData
      .filter(
        (t) =>
          (t.comName || "").toLowerCase().includes(qLower) ||
          (t.sciName || "").toLowerCase().includes(qLower)
      )
      .map((t) => ({
        sciName: t.sciName,
        comName: t.comName,
        zhName: zhMapping[t.sciName] || null,
      }));
  }

  console.log("results count:", results.length);
  return NextResponse.json(results.slice(0, 30));
}
