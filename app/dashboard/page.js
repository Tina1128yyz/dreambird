"use client";

import { useEffect, useState } from "react";
import Link from 'next/link'; // 确保引入 Link
import AsyncSelect from "react-select/async";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [sightings, setSightings] = useState([]);
  
  const [realSpeciesList, setRealSpeciesList] = useState([]); 
  const [dreamSpeciesName, setDreamSpeciesName] = useState("");
  
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [happenedOn, setHappenedOn] = useState("");
  const [speciesType, setSpeciesType] = useState("real");
  const [mood, setMood] = useState("peaceful");
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false); // ✅ “是否公开”的 state

  // 🔹 taxonomy
  const [taxonomyData, setTaxonomyData] = useState([]);
  const [zhMapping, setZhMapping] = useState({});

  // ✅ 初始化：获取用户 & taxonomy
  useEffect(() => {
    async function loadUserAndData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      setUsername(profile?.username || null);
      setLoadingUser(false);

      try {
        const res = await fetch("/api/getTaxonomy");
        const { taxonomy, zhMapping } = await res.json();
        setTaxonomyData(taxonomy);
        setZhMapping(zhMapping);
      } catch (err) {
        console.error("❌ 加载 taxonomy/zhMapping 失败:", err);
      }

      fetchSightings(user.id);
    }
    loadUserAndData();
  }, [router]);

  // 🔍 搜索鸟种
  const searchSpecies = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const res = await fetch(
        `/api/speciesSearch?q=${encodeURIComponent(inputValue)}`
      );
      if (!res.ok) return [{ label: "❌ 搜索出错", value: "" }];
      const data = await res.json();
      if (!Array.isArray(data)) return [{ label: "❌ 数据格式错误", value: "" }];
      if (data.length === 0) return [{ label: "未找到相关鸟种", value: "" }];

      return data.slice(0, 10).map((item) => {
        const sci = item.sciName;
        const zh = zhMapping[sci] || null;
        const en = item.comName;
        const labelParts = [];
        if (zh) labelParts.push(zh);
        if (en && en !== sci) labelParts.push(en);
        if (sci) labelParts.push(sci);
        return {
          label: labelParts.join(" / "),
          value: sci,
        };
      });
    } catch (err) {
      console.error("searchSpecies 出错:", err);
      return [{ label: "❌ 网络错误", value: "" }];
    }
  };

  // 拉取数据
  async function fetchSightings(userId) {
    const { data, error } = await supabase
      .from("sightings")
      .select("*, sighting_species(species_name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) {
        console.error("❌ 拉取 sightings 失败:", error.message);
    }
    setSightings(data || []);
  }

  // 提交记录
  async function addSighting(e) {
    e.preventDefault();
    setLoading(true);

    const { data: sightingData, error: sightingError } = await supabase
      .from("sightings")
      .insert([
        {
          location_text: location,
          happened_on: happenedOn
            ? new Date(happenedOn).toISOString()
            : new Date().toISOString(),
          description: notes,
          user_id: user.id,
          mood: mood,
          species_type: speciesType,
          is_public: isPublic, // <-- 添加 is_public
        },
      ])
      .select()
      .single();

    if (sightingError) {
      console.error("❌ 创建 sighting 失败:", sightingError.message);
      setLoading(false);
      return;
    }

    const newSightingId = sightingData.id;

    let speciesToInsert = [];
    if (speciesType === "real") {
      speciesToInsert = realSpeciesList.map(s => ({
        sighting_id: newSightingId,
        species_name: s.value,
      }));
    } else {
      if (dreamSpeciesName) {
        speciesToInsert = [{
          sighting_id: newSightingId,
          species_name: dreamSpeciesName,
        }];
      }
    }

    if (speciesToInsert.length > 0) {
      const { error: speciesError } = await supabase
        .from("sighting_species")
        .insert(speciesToInsert);

      if (speciesError) {
        console.error("❌ 插入 sighting_species 失败:", speciesError.message);
      }
    }

    setRealSpeciesList([]);
    setDreamSpeciesName("");
    setLocation("");
    setNotes("");
    setHappenedOn("");
    setSpeciesType("real");
    setMood("peaceful");
    setIsPublic(false); // <-- 重置 isPublic
    fetchSightings(user.id);

    setLoading(false);
  }

  // 删除记录
  async function handleDelete(id) {
    const { error } = await supabase.from("sightings").delete().eq("id", id);
    if (error) {
      console.error("❌ 删除失败:", error.message);
    } else {
      setSightings((prev) => prev.filter((s) => s.id !== id));
    }
  }

  if (loadingUser) return <p>加载中...</p>;

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 to-green-50 p-6 space-y-6">
      {/* 顶部欢迎卡片 */}
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            🐦 DreamBird Dashboard
          </CardTitle>
          <div className="text-center mt-2">
            <Link href="/gallery">
              <Button variant="outline">去大家的梦境展馆看看 →</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          欢迎回来，{username ? username : user.email}！
        </CardContent>
      </Card>

      {/* 添加记录表单 */}
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            ✍️ 添加新的梦境鸟类记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addSighting} className="space-y-4">
            {/* 鸟种类型 */}
            <div>
              <Label>鸟种类型</Label>
              <select
                value={speciesType}
                onChange={(e) => {
                  setSpeciesType(e.target.value);
                  setRealSpeciesList([]);
                  setDreamSpeciesName("");
                }}
                className="w-full rounded-md border p-2"
              >
                <option value="real">现实鸟种</option>
                <option value="dream">想象鸟种</option>
              </select>
            </div>

            {/* 鸟种名 */}
            {speciesType === "real" ? (
              <div>
                <Label>鸟种名 (可添加多个)</Label>
                <AsyncSelect
                  isMulti
                  cacheOptions
                  defaultOptions
                  loadOptions={searchSpecies}
                  value={realSpeciesList}
                  onChange={setRealSpeciesList}
                  isClearable
                  placeholder="搜索并添加多种真实鸟种..."
                />
              </div>
            ) : (
              <div>
                <Label>鸟种名</Label>
                <Input
                  type="text"
                  value={dreamSpeciesName}
                  onChange={(e) => setDreamSpeciesName(e.target.value)}
                  placeholder="给自己梦到的奇幻鸟种起个名吧！"
                  required
                />
              </div>
            )}

            {/* 地点 */}
            <div>
              <Label>地点</Label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="请输入梦境中的地点"
              />
            </div>

            {/* 日期 */}
            <div>
              <Label>日期</Label>
              <Input
                type="date"
                value={happenedOn}
                onChange={(e) => setHappenedOn(e.target.value)}
              />
            </div>

            {/* 心情 */}
            <div>
              <Label>心情</Label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full rounded-md border p-2"
              >
                <option value="happy">开心</option>
                <option value="peaceful">平静</option>
                <option value="scary">害怕</option>
                <option value="weird">奇怪</option>
                <option value="annoyed">懊恼</option>
                <option value="other">其他</option>
              </select>
            </div>

            {/* 备注 */}
            <div>
              <Label>备注</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="写下你梦境中的细节..."
              />
            </div>

            {/* 是否公开 Checkbox */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is-public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label
                htmlFor="is-public"
                className="text-sm font-medium text-gray-700 select-none"
              >
                公开这条记录？(其他人将能在“展馆”页面看到你的用户名和记录)
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "提交中..." : "添加记录"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 我的记录 */}
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">📋 我的记录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sightings.length === 0 ? (
            <p className="text-gray-500">暂无记录。</p>
          ) : (
            sightings.map((sighting) => {
              const speciesList = sighting.sighting_species || [];
              const displayNamesArray = speciesList.map(species => {
                const sci = species.species_name;
                const tax = taxonomyData.find((t) => t.sciName === sci);
                const zh = zhMapping[sci] || null;
                const en = tax?.comName || null;
                const labelParts = [];
                if (zh) labelParts.push(zh);
                if (en && en !== sci) labelParts.push(en);
                if (sci) labelParts.push(sci);
                return labelParts.join(" / ");
              });
              const displayName = displayNamesArray.join(", ");

              return (
                <Card key={sighting.id} className="p-4 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(sighting.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                  <h3 className="font-bold pr-10">{displayName || "未知鸟种"}</h3>
                  <p className="text-sm text-gray-600">
                    {sighting.location_text || "未知地点"} ·{" "}
                    {sighting.happened_on
                      ? new Date(sighting.happened_on).toLocaleDateString()
                      : "未知时间"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge>
                      {sighting.species_type === "real" ? "现实鸟种" : "想象鸟种"}
                    </Badge>
                    <Badge variant="secondary">
                      心情：{sighting.mood || "未记录"}
                    </Badge>
                  </div>
                  {sighting.description && (
                    <p className="mt-2 text-sm">{sighting.description}</p>
                  )}
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
      
      <footer className="w-full text-center py-4 mt-8 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} DreamBird by Lei Bao.
      </footer>
    </main>
  );
}



