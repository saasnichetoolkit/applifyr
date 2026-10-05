import { createFileRoute, redirect } from "@tanstack/react-router";
import { checkAdminAccess, listAppsForAdmin } from "@/lib/admin.functions";
import { AdminDashboard } from "@/components/applifyr/admin-dashboard";

export const Route = createFileRoute("/_authenticated/admin")({
  loader: async () => {
    try {
      await checkAdminAccess();
      return await listAppsForAdmin();
    } catch {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [
    { title: "Submission review — APPLIFYR" },
    { name: "description", content: "Private APPLIFYR submission review dashboard." },
    { property: "og:title", content: "Submission review — APPLIFYR" },
    { property: "og:description", content: "Private APPLIFYR submission review dashboard." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ]}),
  component: AdminPage,
});

function AdminPage() {
  return <AdminDashboard initialApps={Route.useLoaderData()} />;
}