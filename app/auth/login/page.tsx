/**
 * Simple Login Page
 * For development and testing purposes
 * Default: Magic Link (passwordless login)
 */

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Mail, Lock } from "lucide-react";

type AuthMode = "magiclink" | "password";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState<AuthMode>("magiclink");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      if (mode === "password") {
        // Password sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("Sign in error:", signInError);
          throw signInError;
        }

        if (data.session) {
          setSuccess("登录成功！正在跳转...");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 500);
        } else {
          throw new Error("未返回会话，请重试");
        }
      } else {
        // Magic link login (passwordless)
        const { error: magicLinkError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo:
              typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
          },
        });

        if (magicLinkError) {
          console.error("Magic link error:", magicLinkError);
          throw magicLinkError;
        }

        setSuccess(
          `魔法链接已发送到 ${email}！\n\n请检查您的收件箱（包括垃圾邮件文件夹），然后点击链接登录。\n\n链接有效期为 1 小时`
        );
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMessage = err.message || "认证失败";

      // Provide helpful error messages
      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "邮箱或密码无效。\n\n试试使用魔法链接登录 - 无需密码！";
      } else if (errorMessage.includes("Email not confirmed")) {
        errorMessage = "请先确认您的邮箱地址";
      } else if (errorMessage.includes("is invalid") || errorMessage.includes("Invalid email")) {
        errorMessage = "邮箱地址无效。请使用真实的邮箱格式（例如：user@gmail.com）";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === "magiclink" ? "魔法链接登录" : "密码登录"}
          </CardTitle>
          <CardDescription>
            {mode === "magiclink" ? "无密码登录 - 只需输入您的邮箱" : "输入您的凭证以访问您的账户"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {mode === "password" && (
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  autoComplete="current-password"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive flex items-start gap-2 whitespace-pre-line">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-sm text-green-600 whitespace-pre-line">{success}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : mode === "magiclink" ? (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  发送魔法链接
                </>
              ) : (
                "登录"
              )}
            </Button>

            <div className="text-center text-sm space-y-2">
              {mode === "magiclink" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("password");
                    setError("");
                    setSuccess("");
                  }}
                  className="flex items-center justify-center w-full gap-1.5 text-muted-foreground hover:text-foreground underline"
                  disabled={loading}
                >
                  <Lock className="h-3 w-3" />
                  使用密码登录
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode("magiclink");
                    setError("");
                    setSuccess("");
                  }}
                  className="flex items-center justify-center w-full gap-1.5 text-blue-600 hover:text-blue-700 underline"
                  disabled={loading}
                >
                  <Mail className="h-3 w-3" />
                  使用魔法链接（无需密码）
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 pt-6 border-t">
            <div className="text-center text-xs text-muted-foreground space-y-2">
              <p className="font-semibold">💡 魔法链接 = 无密码登录</p>
              <p>• 无需密码 - 只需检查您的邮箱</p>
              <p>• 点击邮件中的链接即可立即登录</p>
              <p className="text-amber-600 dark:text-amber-400">
                ⚠️ 请使用真实邮箱（例如：user@gmail.com），不要使用 test@example.com
              </p>
            </div>
            <div className="text-center mt-4">
              <a
                href="/auth/debug"
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                🔧 运行诊断
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
