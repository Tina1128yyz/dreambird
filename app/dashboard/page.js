"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
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

// ✅ 引入 react-datepicker 和对应的 date-fns 语言包
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { enUS, zhCN } from "date-fns/locale";

// ✅ 引入语言 Context 与语言切换按钮
import { useLanguage } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const CATEGORY_ICONS = {
  bird: "🐦",
  plant: "🌿",
  insect: "🐞",
  mammal: "🦊",
  fish: "🐟",
  other: "🌀"
};

export default function Dashboard() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [sightings, setSightings] = useState([]);
  
  // 表单状态
  const [category, setCategory] = useState("bird");
  const [realSpeciesList, setRealSpeciesList] = useState([]); 
  const [dreamSpeciesName, setDreamSpeciesName] = useState("");
  
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [happenedOn, setHappenedOn] = useState("");
  const [speciesType, setSpeciesType] = useState("real");
  const [mood, setMood] = useState("peaceful");
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  // taxonomy
  const [taxonomyData, setTaxonomyData] = useState([]);
  const [zhMapping, setZhMapping] = useState({});

  const MOOD_MAP = {
    happy: t('moodHappy'),
    peaceful: t('moodPeaceful'),
    scary: t('moodScary'),
    weird: t('moodWeird'),
    annoyed: t('moodAnnoyed'),
    other: t('moodOther')
  };

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

  const searchSpecies = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const res = await fetch(
        `/api/speciesSearch?q=${encodeURIComponent(inputValue)}`
      );
      if (!res.ok) return [{ label: t('searchError'), value: "" }];
      const data = await res.json();
      if (!Array.isArray(data)) return [{ label: t('searchFormatError'), value: "" }];
      if (data.length === 0) return [{ label: t('searchNotFound'), value: "" }];

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
      return [{ label: t('searchNetworkError'), value: "" }];
    }
  };

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

  async function addSighting(e) {
    e.preventDefault();
    setLoading(true);

    const { data: sightingData, error: sightingError } = await supabase
      .from("sightings")
      .insert([
        {
          location_text: location,
          happened_on: happenedOn ? new Date(happenedOn).toISOString() : new Date().toISOString(),
          description: notes,
          user_id: user.id,
          mood: mood,
          species_type: speciesType,
          is_public: isPublic,
          category: category, 
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

    if (category === "bird" && speciesType === "real") {
      speciesToInsert = realSpeciesList.map(s => ({
        sighting_id: newSightingId,
        species_name: s.value,
      }));
    } else {
      if (dreamSpeciesName) {
        speciesToInsert = [{
          sighting_id: newSightingId,
          species_name: dreamSpeciesName.trim(), 
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
    setCategory("bird"); 
    setMood("peaceful");
    setIsPublic(false);
    fetchSightings(user.id);

    setLoading(false);
  }

  async function handleDelete(id) {
    const { error } = await supabase.from("sightings").delete().eq("id", id);
    if (error) {
      console.error("❌ 删除失败:", error.message);
    } else {
      setSightings((prev) => prev.filter((s) => s.id !== id));
    }
  }

  if (loadingUser) return <p className="p-6 text-center">{t('loading')}</p>;

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 to-green-50 p-6 space-y-6 relative">
      
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <Card className="w-full max-w-3xl shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {t('dashTitle')}
          </CardTitle>
          <div className="text-center mt-2">
            <Link href="/gallery">
              <Button variant="outline">{t('goToGalleryBtn')}</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="text-center text-gray-700">
          {t('welcomeUser', { name: username || user.email })}
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {t('addNewRecordTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addSighting} className="space-y-4">
            
            <div>
              <Label>{t('categoryLabel')}</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border p-2 bg-white"
              >
                <option value="bird">{t('catBird')}</option>
                <option value="plant">{t('catPlant')}</option>
                <option value="insect">{t('catInsect')}</option>
                <option value="mammal">{t('catMammal')}</option>
                <option value="fish">{t('catFish')}</option>
                <option value="other">{t('catOther')}</option>
              </select>
            </div>

            <div>
              <Label>{t('typeLabel')}</Label>
              <select
                value={speciesType}
                onChange={(e) => {
                  setSpeciesType(e.target.value);
                  setRealSpeciesList([]);
                  setDreamSpeciesName("");
                }}
                className="w-full rounded-md border p-2 bg-white"
              >
                <option value="real">{t('typeReal')}</option>
                <option value="dream">{t('typeImaginary')}</option>
              </select>
            </div>

            {category === "bird" && speciesType === "real" ? (
              <div>
                <Label>{t('birdSpeciesLabel')}</Label>
                <AsyncSelect
                  isMulti
                  cacheOptions
                  defaultOptions
                  loadOptions={searchSpecies}
                  value={realSpeciesList}
                  onChange={setRealSpeciesList}
                  isClearable
                  placeholder={t('birdSearchPlaceholder')}
                />
              </div>
            ) : (
              <div>
                <Label>{t('speciesNameLabel')}</Label>
                <Input
                  type="text"
                  value={dreamSpeciesName}
                  onChange={(e) => setDreamSpeciesName(e.target.value)}
                  placeholder={
                    category === 'plant' ? t('placeholderPlant') :
                    category === 'bird' ? t('placeholderBirdImaginary') :
                    t('placeholderDefaultSpecies')
                  }
                  required
                />
              </div>
            )}

            <div>
              <Label>{t('locationLabel')}</Label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('locationPlaceholder')}
              />
            </div>

            {/* ✅ 替换为了 react-datepicker，加入本地时间处理以避免时区偏移 */}
            <div>
              <Label>{t('dateLabel')}</Label>
              <div className="relative">
                <DatePicker
                  selected={happenedOn ? new Date(happenedOn + "T00:00:00") : null}
                  onChange={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setHappenedOn(`${year}-${month}-${day}`);
                    } else {
                      setHappenedOn("");
                    }
                  }}
                  locale={lang === "en" ? enUS : zhCN}
                  dateFormat={lang === "en" ? "MM/dd/yyyy" : "yyyy/MM/dd"}
                  placeholderText={lang === "en" ? "Select a date" : "选择日期"}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                />
              </div>
            </div>

            <div>
              <Label>{t('moodSelectLabel')}</Label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full rounded-md border p-2 bg-white"
              >
                <option value="happy">{t('moodHappy')}</option>
                <option value="peaceful">{t('moodPeaceful')}</option>
                <option value="scary">{t('moodScary')}</option>
                <option value="weird">{t('moodWeird')}</option>
                <option value="annoyed">{t('moodAnnoyed')}</option>
                <option value="other">{t('moodOther')}</option>
              </select>
            </div>

            <div>
              <Label>{t('notesLabel')}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
              />
            </div>

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
                {t('isPublicLabel')}
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('submittingBtn') : t('submitRecordBtn')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t('myRecordsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sightings.length === 0 ? (
            <p className="text-gray-500">{t('noRecordsText')}</p>
          ) : (
            sightings.map((sighting) => {
              const cat = sighting.category || 'bird';
              const icon = CATEGORY_ICONS[cat] || "🌀";
              const speciesList = sighting.sighting_species || [];
              
              const displayNamesArray = speciesList.map(species => {
                const nameInDb = species.species_name;

                if (cat === 'bird') {
                   const sci = nameInDb;
                   const tax = taxonomyData.find((t) => t.sciName === sci);
                   const zh = zhMapping[sci] || null;
                   const en = tax?.comName || null;
                   
                   const labelParts = [];
                   if (zh) labelParts.push(zh);
                   if (en && en !== sci) labelParts.push(en);
                   if (sci) labelParts.push(sci);
                   
                   return labelParts.length > 0 ? labelParts.join(" / ") : sci;
                } else {
                   return nameInDb;
                }
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
                  <h3 className="font-bold pr-10">
                    <span className="mr-2 text-lg">{icon}</span>
                    {displayName || t('unknownSpecies')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {sighting.location_text || t('unknownLocation')} ·{" "}
                    {sighting.happened_on
                      ? new Date(sighting.happened_on).toLocaleDateString()
                      : t('unknownTime')}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge>
                      {sighting.species_type === "real" ? t('typeReal') : t('typeImaginary')}
                    </Badge>
                    <Badge variant="secondary">
                      {t('moodLabel')}：{MOOD_MAP[sighting.mood] || sighting.mood || t('unrecorded')}
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