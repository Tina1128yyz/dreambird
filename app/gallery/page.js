"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from 'next/link';
import { supabase } from "../../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ✅ 引入语言 Context 和切换按钮
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

export default function GalleryPage() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const ITEMS_PER_PAGE = 10;

  const [sightings, setSightings] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [taxonomyData, setTaxonomyData] = useState([]);
  const [zhMapping, setZhMapping] = useState({});

  // ✅ 心情对应 key 词典映射
  const MOOD_MAP = {
    happy: t('moodHappy'),
    peaceful: t('moodPeaceful'),
    scary: t('moodScary'),
    weird: t('moodWeird'),
    annoyed: t('moodAnnoyed'),
    other: t('moodOther')
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      try {
        // 并行请求：拉取数据库 + 鸟类字典
        const [sightingsRes, taxonomyRes] = await Promise.all([
          supabase
            .from("sightings")
            .select("*, sighting_species(species_name), profiles(username)", { count: "exact" })
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .range(from, to),
          fetch("/api/getTaxonomy")
        ]);

        const { data, count, error: sightingsErr } = sightingsRes;

        if (sightingsErr) {
          throw sightingsErr;
        }

        setSightings(data || []);
        setTotalPages(count ? Math.ceil(count / ITEMS_PER_PAGE) : 1);

        if (taxonomyRes.ok) {
          const taxonomyJson = await taxonomyRes.json();
          setTaxonomyData(taxonomyJson.taxonomy || []);
          setZhMapping(taxonomyJson.zhMapping || {});
        }
      } catch (err) {
        console.error("Failed to load gallery data:", err);
        setError(t('fetchError'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentPage]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-purple-50 to-indigo-50 p-6 space-y-6 relative">
      
      {/* 右上角语言切换按钮 */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <Card className="w-full max-w-3xl shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {t('dreamGallery')}
          </CardTitle>
          <div className="text-center text-sm text-gray-600 pt-2 space-y-2">
            <p>{t('galleryDesc')}</p>
            <Link href="/dashboard">
              <Button variant="outline">{t('backToDashboard')}</Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      <div className="w-full max-w-3xl space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 py-8">{t('loading')}</p>
        ) : sightings && sightings.length > 0 ? (
          sightings.map((sighting) => {
            const cat = sighting.category || "bird";
            const icon = CATEGORY_ICONS[cat] || "🌀";
            const speciesList = sighting.sighting_species || [];

            const displayNamesArray = speciesList.map((species) => {
              const nameInDb = species.species_name;

              if (cat === "bird") {
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

            const authorName = sighting.profiles?.username || t('anonymous');

            return (
              <Card key={sighting.id} className="p-4 relative">
                <h3 className="font-bold text-lg">
                  <span className="mr-2">{icon}</span>
                  {displayName || t('unknownSpecies')}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  {sighting.location_text || t('unknownLocation')} ·{" "}
                  {sighting.happened_on || sighting.created_at
                    ? new Date(sighting.happened_on || sighting.created_at).toLocaleDateString()
                    : t('unknownTime')}
                </p>

                <div className="flex gap-2 mt-2">
                  <Badge>
                    {sighting.species_type === "real" ? t('realSpecies') : t('imaginarySpecies')}
                  </Badge>
                  <Badge variant="secondary">
                    {t('moodLabel')}：{MOOD_MAP[sighting.mood] || sighting.mood || t('unrecorded')}
                  </Badge>
                </div>

                {sighting.description && (
                  <p className="mt-3 text-sm leading-relaxed bg-white/50 p-2 rounded-md">
                    {sighting.description}
                  </p>
                )}

                <p className="text-xs text-right text-gray-500 mt-2">
                  {t('postedBy', { name: authorName })}
                </p>
              </Card>
            );
          })
        ) : (
          <Card className="w-full max-w-3xl shadow-lg text-center p-8">
            <p className="text-gray-500">{t('emptyGallery')}</p>
          </Card>
        )}
      </div>

      {/* 分页控制 */}
      <div className="flex items-center justify-center gap-4 w-full max-w-3xl pt-4 pb-8">
        {currentPage > 1 ? (
          <Link href={`/gallery?page=${currentPage - 1}`}>
            <Button variant="outline">{t('prevPage')}</Button>
          </Link>
        ) : (
          <Button variant="outline" disabled>{t('prevPage')}</Button>
        )}

        <span className="text-sm text-gray-600">
          {t('pageInfo', { current: currentPage, total: totalPages })}
        </span>

        {currentPage < totalPages ? (
          <Link href={`/gallery?page=${currentPage + 1}`}>
            <Button variant="outline">{t('nextPage')}</Button>
          </Link>
        ) : (
          <Button variant="outline" disabled>{t('nextPage')}</Button>
        )}
      </div>

      <footer className="w-full text-center py-4 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} DreamBird by Lei Bao.
      </footer>
    </main>
  );
}