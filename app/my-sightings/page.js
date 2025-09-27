"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SightingsPage() {
  const [sightings, setSightings] = useState([]);

  async function fetchSightings() {
    // 从 Supabase 获取 session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error("❌ 用户未登录");
      return;
    }

    const res = await fetch("/api/sightings", {
      headers: {
        Authorization: `Bearer ${session.access_token}`, // 🔑 关键
      },
    });

    const data = await res.json();
    console.log("✅ Fetched sightings:", data);
    setSightings(data);
  }

  useEffect(() => {
    fetchSightings();
  }, []);

  return (
    <div>
      <h1>我的梦观察</h1>
      <ul>
        {sightings.map((s) => (
          <li key={s.id}>
            {s.happened_on} - {s.species_name} - {s.mood}
          </li>
        ))}
      </ul>
    </div>
  );
}
