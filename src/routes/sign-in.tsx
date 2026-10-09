import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — APPLIFYR" },
      { name: "description", content: "Sign in to manage your APPLIFYR submissions." },
      { property: "og:title", content: "Sign in — APPLIFYR" },
      { property: "og:description", content: "Sign in to manage your APPLIFYR submissions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignIn,
});

const AFTER_SIGN_IN_KEY = "applifyr:after-sign-in";

function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function goToDestination() {
      const dest = window.sessionStorage.getItem(AFTER_SIGN_IN_KEY) || "/admin";
      window.sessionStorage.removeItem(AFTER_SIGN_IN_KEY);
      navigate({ href: dest });
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) goToDestination();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") goToDestination();
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/sign-in` },
    });
    if (oauthError) {
      setError("Sign in didn't work. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="grid min-h-[70vh] place-items-center px-5 py-16">
      <div className="w-full max-w-md border border-border bg-card p-8">
        <Radio className="size-8 text-signal" />
        <h1 className="mt-8 font-display text-3xl font-semibold">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Sign in with your Google account to review submissions in the admin dashboard.
        </p>
        <Button className="mt-8 w-full" onClick={signInWithGoogle} disabled={loading}>
          {loading ? "Opening Google…" : "Continue with Google"}
        </Button>
        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      </div>
    </section>
  );
}
