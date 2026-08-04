"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useLanguage } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

export default function LoginPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
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
          setError(
            lang === 'zh' 
              ? "注册成功！请检查你的邮箱，点击验证链接以完成注册。" 
              : "Registration successful! Please check your email and click the verification link."
          );
        }

      } else {
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
      setError(lang === 'zh' ? "未知错误，请稍后再试。" : "Unknown error, please try again later.");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6 relative">
      
      {/* 右上角语言切换 */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="max-w-2xl w-full space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              {isSignUp ? t('signupTitle') : t('loginTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={lang === 'zh' ? "输入邮箱" : "Enter your email"}
                />
              </div>
              <div>
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={lang === 'zh' ? "输入密码" : "Enter your password"}
                />
              </div>

              {isSignUp && (
                <div>
                  <Label htmlFor="username">{t('username')}</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={lang === 'zh' ? "给自己取一个昵称" : "Choose a nickname"}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('processing') : isSignUp ? t('signupBtn') : t('loginBtn')}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  {error.includes("验证") || error.includes("successful") ? "✅ " : "❌ "}
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-4 text-center text-sm">
              {isSignUp ? t('hasAccount') : t('noAccount')}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-blue-600 hover:underline"
              >
                {isSignUp ? t('goToLogin') : t('goToSignup')}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 欢迎指南卡片 */}
        <Card className="p-4 shadow-md bg-green-50">
          <CardContent className="space-y-3 text-sm leading-relaxed text-gray-700">
            <p className="font-medium">{t('welcomeTitle')}</p>
            <p>{t('welcomeGuide')}</p>
            <p>{t('guide1')}</p>
            <p>{t('guide2')}</p>
            <p>{t('guide3')}</p>
            <p>{t('guide4')}</p>
            <p>{t('guide5')}</p>
            <p>{t('feedback')}</p>
            {/* 斜体居中祝福语 */}
            <p className="italic text-sm pt-2 text-center font-serif">
              {t('blessing')}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}