/**
 * User Menu Component
 * Shows user info and logout button with modern design
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);

    const getUser = async () => {
      const supabase = createClient();

      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setEmail(data.user.email);
      }
    };

    getUser();

    // Listen for auth changes
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return <div className="h-9 w-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />;
  }

  if (email) {
    return (
      <div className="flex items-center gap-3">
        {/* User Avatar with Gradient */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full border border-gray-200/50 dark:border-gray-700/50">
          <div className="bg-linear-to-br from-blue-500 to-purple-600 p-1.5 rounded-full">
            <User className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
            {email.split("@")[0]}
          </span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoading}
          className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span className="hidden sm:inline ml-2">退出登录</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Theme Toggle */}
      <ThemeToggle />

      <Link href="/auth/login">
        <Button
          size="sm"
          className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          登录
        </Button>
      </Link>
    </div>
  );
}
