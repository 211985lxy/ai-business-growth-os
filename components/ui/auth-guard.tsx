/**
 * Auth Guard - Pure UI Component
 * Displays authentication state messages (no logic, just presentation)
 */

"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2, AlertCircle } from "lucide-react";

interface AuthGuardProps {
  isAuthenticated: boolean | null;
  isLoading?: boolean;
  error?: string | null;
  onLogin?: () => void;
  onDismissError?: () => void;
  featureName?: string;
  children: ReactNode;
}

export function AuthGuard({
  isAuthenticated,
  isLoading = false,
  error,
  onLogin,
  onDismissError,
  featureName = "this feature",
  children,
}: AuthGuardProps) {
  // Loading state
  if (isAuthenticated === null || isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <Card className="w-full border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <LogIn className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Sign In Required
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
              Please sign in to use {featureName}
            </p>
            {onLogin && (
              <Button onClick={onLogin} className="bg-amber-600 hover:bg-amber-700 text-white">
                Sign In
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full border-destructive/50 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-destructive mb-1">Error</h4>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            {onDismissError && (
              <Button variant="ghost" size="sm" onClick={onDismissError}>
                Dismiss
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
}
