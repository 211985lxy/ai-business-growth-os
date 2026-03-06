/**
 * Settings Page
 * 设置页面 - 用户偏好设置
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Palette, Bell, Shield, User as UserIcon } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";

export default function SettingsPage() {
  const { theme, setTheme, actualTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-linear-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/20 transition-colors duration-200">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Enhanced Header with Page Title */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-4">
            <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-xl shadow-indigo-500/20">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                设置
              </h1>
              <p className="text-base text-zinc-600 dark:text-zinc-300 dark:text-zinc-400 font-medium">
                管理您的账户和偏好设置
              </p>
            </div>
          </div>
          <div className="h-px bg-linear-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* 外观设置 */}
          <Card className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md border-0">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">外观</CardTitle>
                  <CardDescription className="text-base">自定义应用的外观和主题</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 主题选择 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 dark:text-slate-300">
                  主题模式
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {/* 浅色模式 */}
                  <button
                    onClick={() => setTheme("light")}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                      ${
                        theme === "light"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md"
                          : "border-zinc-200 dark:border-zinc-800 dark:border-slate-700 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600 dark:border-zinc-400"
                      }
                    `}
                  >
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-800 dark:border-zinc-600 dark:border-zinc-400 flex items-center justify-center shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-yellow-300 to-orange-400"></div>
                    </div>
                    <span className="text-sm font-medium">浅色</span>
                    {theme === "light" && (
                      <span className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {/* 深色模式 */}
                  <button
                    onClick={() => setTheme("dark")}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                      ${
                        theme === "dark"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md"
                          : "border-zinc-200 dark:border-zinc-800 dark:border-slate-700 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600 dark:border-zinc-400"
                      }
                    `}
                  >
                    <div className="w-12 h-12 rounded-lg bg-zinc-900 border-2 border-slate-700 flex items-center justify-center shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-slate-600 to-slate-800"></div>
                    </div>
                    <span className="text-sm font-medium">深色</span>
                    {theme === "dark" && (
                      <span className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    )}
                  </button>

                  {/* 跟随系统 */}
                  <button
                    onClick={() => setTheme("system")}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                      ${
                        theme === "system"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md"
                          : "border-zinc-200 dark:border-zinc-800 dark:border-slate-700 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600 dark:border-zinc-400"
                      }
                    `}
                  >
                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-white to-slate-900 dark:from-slate-800 dark:to-slate-200 border-2 border-zinc-200 dark:border-zinc-800 dark:border-zinc-600 dark:border-zinc-400 flex items-center justify-center shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-yellow-300 via-slate-500 to-slate-800"></div>
                    </div>
                    <span className="text-sm font-medium">跟随系统</span>
                    {theme === "system" && (
                      <span className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  当前主题：{actualTheme === "dark" ? "深色模式" : "浅色模式"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 通知设置 */}
          <Card className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md border-0">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-amber-500 to-orange-600 rounded-xl">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">通知</CardTitle>
                  <CardDescription className="text-base">管理您的通知偏好</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-200 dark:text-slate-300">推送通知</p>
                  <p className="text-sm text-muted-foreground">接收生成完成的通知</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`
                    relative w-14 h-8 rounded-full transition-all duration-200
                    ${notifications ? "bg-blue-600" : "bg-zinc-300 dark:bg-slate-600"}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-200
                      ${notifications ? "left-7" : "left-1"}
                    `}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* 账户安全 */}
          <Card className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md border-0">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">安全</CardTitle>
                  <CardDescription className="text-base">管理您的账户安全设置</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-12 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200"
              >
                <UserIcon className="h-4 w-4 mr-3" />
                修改密码
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200"
              >
                <Shield className="h-4 w-4 mr-3" />
                两步验证
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
