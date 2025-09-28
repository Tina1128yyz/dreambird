"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // ✅ 注册时用
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false); // 登录 / 注册切换

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // --- 注册逻辑 (已修改) ---
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          // ✅ 关键改动：将 username 作为元数据一起提交
          options: {
            data: {
              username: username,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        // ✅ 简化逻辑：数据库触发器会自动创建 profile。
        // 如果 Supabase 设置了邮件验证，data.user 会是 null，直到用户点击邮件链接。
        if (data.user) {
          router.push("/dashboard");
        } else {
          setError("注册成功！请检查你的邮箱，点击验证链接以完成注册。");
        }

      } else {
        // --- 登录逻辑 (保持不变) ---
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("未知错误，请稍后再试。");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-2xl w-full space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              {isSignUp ? "注册新账号" : "登录 DreamBird"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="输入邮箱"
                />
              </div>
              <div>
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="输入密码"
                />
              </div>

              {isSignUp && (
                <div>
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="给自己取一个昵称"
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "处理中..." : isSignUp ? "注册并登录" : "登录"}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  {/* 使用 ❌ 或 ✅ 来增加视觉提示 */}
                  {error.includes("验证") ? "✅ " : "❌ "}
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-4 text-center text-sm">
              {isSignUp ? "已有账号？" : "还没有账号？"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null); // 切换时清空错误信息
                }}
                className="text-blue-600 hover:underline"
              >
                {isSignUp ? "去登录" : "去注册"}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 shadow-md bg-green-50">
          <CardContent className="space-y-2 text-sm leading-relaxed">
            <p className="font-medium">
              🌿 欢迎来到 DreamBird！你可以在这个平台记录你梦中看见的小鸟。
            </p>
            <p>利用邮箱注册登录后，网站会自动跳转到记录提交页面。</p>
            <p>
              如果梦见了现实存在的鸟种，就在“鸟种选择”部分选择“现实鸟种”后在搜索栏进行搜索。
              可以支持中文/英文/学名的搜索。当然，如果梦见了现实中不存在的鸟种，可以选择“想象鸟种”并且自行命名，并在备注区详细描述。
            </p>
            <p>
              地点可以描述梦境中看见小鸟的环境。心情目前有6种选择，有更多想说的也可以在备注区写下来！
            </p>
            <p>最后点击“添加记录”就上传成功啦~</p>
            <p>
              这是观鸟人第一次尝试搭建网站，有什么反馈和建议欢迎大家提出！
              （xhs鸭鸭子吃番茄或者邮箱：t10191128@163.com）
            </p>
            <p>最后祝大家鸟运昌盛，生活愉快！</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}