/**
 * useAuth Hook
 * 封装认证逻辑，提供统一的认证状态管理
 */

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UseAuthReturn {
  isAuthenticated: boolean | null;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  checkAuth: () => Promise<void>;
}

/**
 * 认证 Hook
 * 自动检查用户登录状态，提供认证相关的状态和方法
 *
 * @example
 * ```tsx
 * const { isAuthenticated, isLoading } = useAuth();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (!isAuthenticated) return <LoginForm />;
 * return <Dashboard />;
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      const isAuth = !!user;
      setIsAuthenticated(isAuth);
      setUser(user);
    } catch (err) {
      console.error("Auth check error:", err);
      setError(err instanceof Error ? err.message : "认证检查失败");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    checkAuth,
  };
}
