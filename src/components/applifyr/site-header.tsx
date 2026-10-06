import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, ShieldCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/explore" as const, label: "Explore" },
  { to: "/categories" as const, label: "Categories" },
  { to: "/for-builders" as const, label: "For builders" },
];

export function SiteHeader() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const authControls = user ? (
    <>
      <Button variant="ghost" asChild><Link to="/admin"><ShieldCheck /> Admin</Link></Button>
      <Button variant="ghost" onClick={signOut}>Sign out</Button>
    </>
  ) : (
    <Button variant="ghost" asChild><Link to="/sign-in">Sign in</Link></Button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((item) => <Link key={item.to} to={item.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>{item.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {authControls}
          <Button asChild><Link to="/submit">Submit an app</Link></Button>
        </div>
        <Sheet>
          <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu"><Menu /></Button></SheetTrigger>
          <SheetContent className="border-border bg-card pt-20">
            <nav className="flex flex-col gap-2">
              {links.map((item) => <Button key={item.to} variant="ghost" className="justify-start" asChild><Link to={item.to}>{item.label}</Link></Button>)}
              {user ? (
                <>
                  <Button variant="ghost" className="justify-start" asChild><Link to="/admin">Admin</Link></Button>
                  <Button variant="ghost" className="justify-start" onClick={signOut}>Sign out</Button>
                </>
              ) : (
                <Button variant="ghost" className="justify-start" asChild><Link to="/sign-in">Sign in</Link></Button>
              )}
              <Button className="mt-4" asChild><Link to="/submit">Submit an app</Link></Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
