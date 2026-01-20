import { supabase } from "../../lib/supabaseClient";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ✅ 1. 引入图标映射
const CATEGORY_ICONS = {
  bird: "🐦",
  plant: "🌿",
  insect: "🐞",
  mammal: "🦊",
  fish: "🐟",
  other: "🌀"
};

export default async function GalleryPage({ searchParams }) {
  // 1. 获取当前页码
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const ITEMS_PER_PAGE = 10;

  // 2. 计算范围
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // 3. 并行获取数据
  const [sightingsRes, taxonomyRes] = await Promise.all([
    supabase
      .from("sightings")
      .select("*, sighting_species(species_name), profiles(username)", { count: 'exact' })
      .eq('is_public', true)
      .order("created_at", { ascending: false })
      .range(from, to),
    // 获取鸟类字典
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/getTaxonomy`, { cache: 'no-store' })
  ]);

  const { data: sightings, count: totalCount, error: sightingsError } = sightingsRes;

  // 计算总页数
  const totalPages = totalCount ? Math.ceil(totalCount / ITEMS_PER_PAGE) : 1;

  // 处理字典数据
  let taxonomyData = [];
  let zhMapping = {};
  if (taxonomyRes.ok) {
    const taxonomyJson = await taxonomyRes.json();
    taxonomyData = taxonomyJson.taxonomy;
    zhMapping = taxonomyJson.zhMapping;
  } else {
    console.error("Failed to fetch taxonomy data on server.");
  }

  if (sightingsError) {
    console.error("Error fetching public sightings:", sightingsError);
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <p className="text-red-500">加载数据失败，请稍后再试。</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-purple-50 to-indigo-50 p-6 space-y-6">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            🌌 大家的梦境展馆
          </CardTitle>
          <div className="text-center text-sm text-gray-600 pt-2 space-y-2">
            <p>这里展示了来自所有用户的最新公开记录。</p>
            <Link href="/dashboard">
              <Button variant="outline">回到我的 Dashboard</Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      <div className="w-full max-w-3xl space-y-4">
        {sightings && sightings.length > 0 ? (
          sightings.map((sighting) => {
            
            // ✅ 2. 获取类别图标
            const cat = sighting.category || 'bird';
            const icon = CATEGORY_ICONS[cat] || "🌀";

            const speciesList = sighting.sighting_species || [];
            
            // ✅ 3. 生成显示名称（区分鸟类和其他）
            const displayNamesArray = speciesList.map(species => {
              const nameInDb = species.species_name;

              // 只有是 "bird" 且 taxonomy 有数据时，才去查字典
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
                // 植物、昆虫等直接显示存入的名字
                return nameInDb;
              }
            });
            const displayName = displayNamesArray.join(", ");

            return (
              <Card key={sighting.id} className="p-4 relative">
                {/* 标题带上图标 */}
                <h3 className="font-bold text-lg">
                  <span className="mr-2">{icon}</span>
                  {displayName || "未知物种"}
                </h3>
                
                <p className="text-sm text-gray-600 mt-1">
                  {sighting.location_text || "未知地点"} ·{" "}
                  {new Date(sighting.happened_on || sighting.created_at).toLocaleDateString()}
                </p>
                
                <div className="flex gap-2 mt-2">
                  <Badge>
                     {/* ✅ 4. 文案更新：现实物种 / 想象物种 */}
                    {sighting.species_type === "real" ? "现实物种" : "想象物种"}
                  </Badge>
                  <Badge variant="secondary">
                    心情：{sighting.mood || "未记录"}
                  </Badge>
                </div>
                
                {sighting.description && (
                  <p className="mt-3 text-sm leading-relaxed bg-white/50 p-2 rounded-md">
                    {sighting.description}
                  </p>
                )}
                
                {/* ✅ 5. 恢复原本的用户名样式 (去掉了蓝色) */}
                <p className="text-xs text-right text-gray-500 mt-2">
                  由 {sighting.profiles?.username || '匿名用户'} 发布
                </p>
              </Card>
            );
          })
        ) : (
          <Card className="w-full max-w-3xl shadow-lg text-center p-8">
            <p className="text-gray-500">还没有人公开分享记录呢，或者这一页没有数据。</p>
          </Card>
        )}
      </div>
      
      {/* 分页控制 */}
      <div className="flex items-center justify-center gap-4 w-full max-w-3xl pt-4 pb-8">
        {currentPage > 1 ? (
          <Link href={`/gallery?page=${currentPage - 1}`}>
            <Button variant="outline">上一页</Button>
          </Link>
        ) : (
          <Button variant="outline" disabled>上一页</Button>
        )}

        <span className="text-sm text-gray-600">
           第 {currentPage} 页 / 共 {totalPages} 页
        </span>

        {currentPage < totalPages ? (
          <Link href={`/gallery?page=${currentPage + 1}`}>
            <Button variant="outline">下一页</Button>
          </Link>
        ) : (
          <Button variant="outline" disabled>下一页</Button>
        )}
      </div>

      <footer className="w-full text-center py-4 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} DreamBird by Lei Bao.
      </footer>
    </main>
  );
}