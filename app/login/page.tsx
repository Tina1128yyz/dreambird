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
        // --- 注册逻辑 ---
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
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

        if (data.user) {
          router.push("/dashboard");
        } else {
          setError("注册成功！请检查你的邮箱，点击验证链接以完成注册。");
        }

      } else {
        // --- 登录逻辑 ---
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
                  setError(null);
                }}
                className="text-blue-600 hover:underline"
              >
                {isSignUp ? "去登录" : "去注册"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 👇 更新后的欢迎说明部分：去掉了列表圆点，统一了字号 */}
        <Card className="p-4 shadow-md bg-green-50">
          <CardContent className="space-y-3 text-sm leading-relaxed text-gray-700">
            <p className="font-medium">
              🌿 欢迎来到 DreamBird！感谢大家对 1.0 版本的反馈！
            </p>
            <p>
              在这个平台你可以记录梦中见到的各种生物。以下是简单的使用指南：
            </p>
            <p>
              利用邮箱注册登录后，网站自动跳转到记录页面。
            </p>
            <p>
              在“这是什么生物？”中选择种类（共 6 类）。如果是鸟类，现实鸟种可在搜索栏用中文 / 英文 / 学名搜索；梦见现实中不存在的鸟可选择“想象鸟种”，自行命名并在备注中描述。
            </p>
            <p>
              如果是其他生物（植物、哺乳动物、昆虫、水生等），选择现实或想象后，直接输入物种名（暂不支持搜索）。
            </p>
            <p>
              填写梦境地点、做梦日期和心情（5 种可选），有更多想说的也可以在备注区写下来！
            </p>
            <p>
              如果想要分享自己的梦境记录则可以勾选“公开这条记录”。大家可以去“梦境展馆”翻阅他人的梦境，都很有趣呢！最后点击“添加记录”就上传成功啦~
            </p>
            <p>
              这是观鸟人第一次尝试搭建网站，有什么反馈和建议欢迎大家提出！（xhs鸭鸭子吃番茄或者邮箱：t10191128@163.com）
            </p>
            {/* ✅ 斜体 + 居中 + 统一字号 + 标准颜色 */}
            <p className="italic text-sm pt-2">
              最后祝大家鸟运昌盛，博物运昌盛，生活愉快！
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}