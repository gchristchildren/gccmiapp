import { Bell, BellRing, BookOpen, CalendarDays, FileText, GraduationCap, HandHeart, Newspaper, Heart, LayoutDashboard, ListChecks, UserRound, Users } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { requireAdmin } from "@/lib/auth";
import { noIndex } from "@/lib/seo";

export const metadata = noIndex;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireAdmin();
  const items = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
    { href: "/admin/families", label: "Families", icon: <Users /> },
    { href: "/admin/sessions", label: "Bible Club sessions", icon: <BookOpen /> },
    { href: "/admin/events", label: "Events", icon: <CalendarDays /> },
    { href: "/admin/posts", label: "Blog posts", icon: <Newspaper /> },
    { href: "/admin/announcements", label: "Announcements", icon: <Bell /> },
    { href: "/admin/notifications", label: "Push notifications", icon: <BellRing /> },
    { href: "/admin/masterclass", label: "Masterclass", icon: <GraduationCap /> },
    { href: "/admin/forms", label: "Consent forms", icon: <FileText /> },
    { href: "/admin/volunteers", label: "Volunteers", icon: <HandHeart /> },
    { href: "/admin/opportunities", label: "Opportunities", icon: <ListChecks /> },
    { href: "/admin/donations", label: "Donations", icon: <Heart /> },
    { href: "/portal", label: "Parent view", icon: <UserRound /> },
  ];
  return (
    <AppShell items={items} name={profile?.full_name || user.email || ""} roleLabel="Admin">
      {children}
    </AppShell>
  );
}
