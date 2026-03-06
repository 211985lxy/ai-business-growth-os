/**
 * Auth Callback Page
 * Handles OAuth and Magic Link redirects from Supabase
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your magic link...");
  const [details, setDetails] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        // Check URL parameters for errors
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        const errorDescription = params.get("error_description");

        if (error) {
          setStatus("error");
          setMessage(`Authentication Error: ${error}`);
          setDetails(errorDescription || "The magic link may have expired or been already used.");
          return;
        }

        // Wait for Supabase to process the session from URL
        // With detectSessionInUrl: true, Supabase automatically handles PKCE
        setMessage("Verifying your credentials...");

        // Give Supabase time to process
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Check session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setStatus("error");
          setMessage("Failed to establish session");
          setDetails(sessionError.message);
          return;
        }

        if (session) {
          setStatus("success");
          setMessage("Welcome! You are now signed in.");
          setDetails("Redirecting you to the dashboard...");

          // Redirect to home
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          // No session found - might need to refresh or user clicked link twice
          setStatus("error");
          setMessage("No session detected");
          setDetails(
            "The magic link may have been already used or expired. Please try requesting a new one."
          );
        }
      } catch (err) {
        console.error("Error during auth callback:", err);
        setStatus("error");
        setMessage("An unexpected error occurred");
        setDetails(
          err instanceof Error
            ? err.message
            : "Please try again or contact support if the problem persists."
        );
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Status Icon */}
        <div className="flex justify-center">
          {status === "loading" && (
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-primary/20" />
            </div>
          )}
          {status === "success" && (
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-green-500/20" />
            </div>
          )}
          {status === "error" && <XCircle className="h-16 w-16 text-destructive" />}
        </div>

        {/* Message */}
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {status === "loading" && "Signing You In"}
            {status === "success" && "Authentication Successful"}
            {status === "error" && "Authentication Failed"}
          </h1>
          <p className="text-muted-foreground">{message}</p>
          {details && <p className="text-sm text-muted-foreground mt-2">{details}</p>}
        </div>

        {/* Error Actions */}
        {status === "error" && (
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="font-medium">Common solutions:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Open the magic link in the same browser and device</li>
                    <li>• Enable cookies and localStorage in your browser</li>
                    <li>• Request a new magic link if it&apos;s been more than 1 hour</li>
                    <li>• Each magic link can only be used once</li>
                  </ul>
                </div>
              </div>
            </div>
            <a
              href="/auth/login"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              ← Back to login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
