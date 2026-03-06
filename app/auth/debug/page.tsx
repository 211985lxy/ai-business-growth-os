/**
 * Authentication Debug Page
 * Helps diagnose Supabase Auth configuration issues
 */

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface CheckResult {
  name: string;
  status: "success" | "error" | "warning";
  message: string;
  details?: string;
}

export default function AuthDebugPage() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const checks: CheckResult[] = [];

    // Check 1: Environment Variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    checks.push({
      name: "Environment Variables",
      status: hasUrl && hasKey ? "success" : "error",
      message: hasUrl && hasKey ? "Environment variables are set" : "Missing environment variables",
      details: `NEXT_PUBLIC_SUPABASE_URL: ${hasUrl ? "✓" : "✗"}\nNEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasKey ? "✓" : "✗"}`,
    });

    if (!hasUrl || !hasKey) {
      setResults(checks);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Check 2: Supabase Connection
      try {
        const { data: _data, error: _error } = await supabase.auth.getSession();
        checks.push({
          name: "Supabase Connection",
          status: "success",
          message: "Successfully connected to Supabase",
          details: "Auth service is responding",
        });
      } catch (err: any) {
        checks.push({
          name: "Supabase Connection",
          status: "error",
          message: "Failed to connect to Supabase",
          details: err.message,
        });
      }

      // Check 3: Test Registration
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = "test123456";

      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        if (signUpError) {
          if (signUpError.message.includes("Email")) {
            checks.push({
              name: "Email Confirmation",
              status: "warning",
              message: "Email confirmation is enabled",
              details:
                "Users must confirm their email before signing in. This is normal for production but can be disabled for development.",
            });
          } else {
            checks.push({
              name: "Test Registration",
              status: "error",
              message: "Registration test failed",
              details: signUpError.message,
            });
          }
        } else {
          checks.push({
            name: "Test Registration",
            status: signUpData.user?.confirmed_at ? "success" : "warning",
            message: signUpData.user?.confirmed_at
              ? "Registration works (no email confirmation)"
              : "Email confirmation required",
            details: `User created: ${signUpData.user?.id}\nConfirmed: ${signUpData.user?.confirmed_at || "Pending"}`,
          });

          // Clean up test user
          if (signUpData.user?.id) {
            await supabase.auth.admin.deleteUser(signUpData.user.id);
          }
        }
      } catch (err: any) {
        checks.push({
          name: "Test Registration",
          status: "error",
          message: "Registration test crashed",
          details: err.message,
        });
      }

      // Check 4: Profile Table
      try {
        const { error: profileError } = await supabase.from("profiles").select("id").limit(1);

        if (profileError) {
          checks.push({
            name: "Database Schema",
            status: "error",
            message: "Profiles table not found or RLS issue",
            details: profileError.message,
          });
        } else {
          checks.push({
            name: "Database Schema",
            status: "success",
            message: "Database tables exist",
            details: "Profiles table is accessible",
          });
        }
      } catch (err: any) {
        checks.push({
          name: "Database Schema",
          status: "error",
          message: "Database check failed",
          details: err.message,
        });
      }
    } catch (err: any) {
      checks.push({
        name: "General Error",
        status: "error",
        message: "Diagnostics failed",
        details: err.message,
      });
    }

    setResults(checks);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Authentication Diagnostics</h1>
        <p className="text-muted-foreground">
          Check your Supabase configuration and identify issues
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Fix: Disable Email Confirmation</CardTitle>
          <CardDescription>
            For development, it's recommended to disable email confirmation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to your Supabase project dashboard</li>
            <li>
              Navigate to <strong>Authentication → Providers</strong>
            </li>
            <li>
              Click on <strong>Email</strong> provider
            </li>
            <li>
              Disable <strong>"Confirm email"</strong>
            </li>
            <li>
              Click <strong>Save</strong>
            </li>
            <li>Try signing up again</li>
          </ol>
          <Button onClick={runDiagnostics} disabled={loading}>
            {loading ? "Running..." : "Re-run Diagnostics"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Diagnostic Results</h2>
        {results.length === 0 && loading && (
          <p className="text-muted-foreground">Running diagnostics...</p>
        )}
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {result.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {result.status === "error" && <XCircle className="h-5 w-5 text-destructive" />}
                {result.status === "warning" && (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <CardTitle className="text-lg">{result.name}</CardTitle>
              </div>
              <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            {result.details && (
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                  {result.details}
                </pre>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <strong className="text-destructive">"Invalid login credentials"</strong>
            <p className="text-muted-foreground mt-1">
              Make sure you're using the correct email and password. If you just signed up, ensure
              email confirmation is disabled or check your inbox.
            </p>
          </div>
          <div>
            <strong className="text-destructive">"Email not confirmed"</strong>
            <p className="text-muted-foreground mt-1">
              Disable email confirmation in Supabase Authentication settings for development, or
              check your email for the confirmation link.
            </p>
          </div>
          <div>
            <strong className="text-destructive">"Database schema missing"</strong>
            <p className="text-muted-foreground mt-1">
              Run the SQL schema in Supabase SQL Editor to create required tables.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
