// utils/sightingsApi.js

// 获取观鸟记录
export async function fetchSightings() {
  try {
    const res = await fetch("/api/sightings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 确保带上登录状态
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("❌ Error fetching:", error);
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Error fetching:", err);
    return [];
  }
}

// 新建观鸟记录
export async function createSighting(payload) {
  try {
    const res = await fetch("/api/sightings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("❌ Error creating sighting:", error);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Error creating sighting:", err);
    return null;
  }
}
