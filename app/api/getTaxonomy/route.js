import taxonomy from "@/data/taxonomy.json";
import zhMapping from "@/data/zhMapping.json";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ taxonomy, zhMapping });
}
