import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      if (typeof window !== "undefined") window.sessionStorage.setItem("applifyr:after-sign-in", location.href);
      throw redirect({ to: "/sign-in" });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});