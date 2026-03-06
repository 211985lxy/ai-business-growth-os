import { createClient } from "@/lib/supabase/server";

interface SearchResult {
  content: Array<{
    id: string;
    type: string;
    title: string;
    preview: string;
    created_at: string;
    url: string;
  }>;
  knowledge: Array<{
    id: string;
    type: string;
    name: string;
    content: string;
    created_at: string;
    url: string;
  }>;
  navigation: Array<{
    title: string;
    path: string;
    icon: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return Response.json({ error: "搜索关键词不能为空" }, { status: 400 });
    }

    const searchQuery = query.trim().toLowerCase();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const results: SearchResult = {
      content: [],
      knowledge: [],
      navigation: [],
    };

    if (user) {
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, workflow_type, input_data, output_content, created_at")
        .or(`input_data.ilike.%${searchQuery}%,output_content.ilike.%${searchQuery}%`)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!tasksError && tasks) {
        results.content = tasks.map((task) => ({
          id: task.id as string,
          type: task.workflow_type as string,
          title: (task.input_data?.niche || task.input_data?.topic || "未命名内容") as string,
          preview: (task.output_content?.substring(0, 100) || "") as string,
          created_at: task.created_at as string,
          url: getTaskUrl(task.workflow_type as string, task.id as string),
        }));
      }

      const { data: assets, error: assetsError } = await supabase
        .from("brand_assets")
        .select("id, asset_type, name, content, created_at")
        .or(`name.ilike.%${searchQuery}%,content->>.ilike.%${searchQuery}%`)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!assetsError && assets) {
        results.knowledge = assets.map((asset) => ({
          id: asset.id as string,
          type: asset.asset_type as string,
          name: asset.name as string,
          content:
            typeof asset.content === "object"
              ? JSON.stringify(asset.content).substring(0, 100)
              : String(asset.content),
          created_at: asset.created_at as string,
          url: "/knowledge",
        }));
      }
    }

    results.navigation = getNavigationResults(searchQuery);

    return Response.json({
      query,
      results,
      total: results.content.length + results.knowledge.length + results.navigation.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "搜索失败" },
      { status: 500 }
    );
  }
}

function getTaskUrl(workflowType: string, _id: string): string {
  const urlMap: Record<string, string> = {
    strategy_research: "/strategy",
    script_draft: "/content-factory",
    script_critic: "/content-factory",
    script_refiner: "/content-factory",
    xhs_generator: "/content-factory",
  };
  return urlMap[workflowType] || "/strategy";
}

function getNavigationResults(query: string): Array<{ title: string; path: string; icon: string }> {
  const navigationItems = [
    { title: "首页", path: "/", icon: "home" },
    { title: "战略研究", path: "/strategy", icon: "lightbulb" },
    { title: "内容工厂", path: "/content-factory", icon: "video" },
    { title: "产品矩阵", path: "/products", icon: "package" },
    { title: "知识库", path: "/knowledge", icon: "book" },
    { title: "用户管理", path: "/users", icon: "users" },
    { title: "财务管理", path: "/finance", icon: "dollar" },
    { title: "规则设置", path: "/rules", icon: "scale" },
    { title: "系统设置", path: "/settings", icon: "settings" },
    { title: "AI 对话", path: "/chat", icon: "message" },
  ];

  return navigationItems.filter((item) => item.title.toLowerCase().includes(query));
}
