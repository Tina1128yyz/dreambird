import { supabase } from "../../lib/supabaseClient";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function GalleryPage({ searchParams }) {
  // 1. 获取当前页码，默认为第 1 页
  // searchParams 是 Next.js 页面组件自动接收的参数
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const ITEMS_PER_PAGE = 10;

  // 2. 计算 Supabase 查询的范围
  // 例如第1页: 0-9, 第2页: 10-19
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const [sightingsRes, taxonomyRes] = await Promise.all([
    supabase
      .from("sightings")
      .select("*, sighting_species(species_name), profiles(username)", { count: 'exact' }) // 添加 count: 'exact' 以获取总数
      .eq('is_public', true)
      .order("created_at", { ascending: false })
      .range(from, to), // 这里替换了原来的 limit(20)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/getTaxonomy`, { cache: 'no-store' })
  ]);

  const { data: sightings, count: totalCount, error: sightingsError } = sightingsRes;

  // 计算总页数
  const totalPages = totalCount ? Math.ceil(totalCount / ITEMS_PER_PAGE) : 1;

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
              <Card key={sighting.id} className="p-4">
                <h3 className="font-bold">{displayName || "未知鸟种"}</h3>
                <p className="text-sm text-gray-600">
                  {sighting.location_text || "未知地点"} ·{" "}
                  {new Date(sighting.happened_on || sighting.created_at).toLocaleDateString()}
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
      
      {/* 3. 分页控制按钮区 */}
      <div className="flex items-center justify-center gap-4 w-full max-w-3xl pt-4 pb-8">
        {/* 上一页按钮：如果在第1页则禁用 */}
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

        {/* 下一页按钮：如果是最后一页则禁用 */}
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