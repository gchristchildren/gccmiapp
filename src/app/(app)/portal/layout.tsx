import { Bell, CalendarDays, FileText, GraduationCap, HandHeart, Home, Settings2, Users } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { requireUser } from "@/lib/auth";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireUser();
  const items = [
    { href: "/portal", label: "Home", icon: <Home />, exact: true },
    { href: "/portal/children", label: "My children", icon: <Users /> },
    { href: "/portal/schedule", label: "Schedule & lessons", icon: <CalendarDays /> },
    { href: "/portal/announcements", label: "Announcements", icon: <Bell /> },
    { href: "/portal/forms", label: "Consent forms", icon: <FileText /> },
    { href: "/portal/masterclass", label: "Masterclass", icon: <GraduationCap /> },
    { href: "/portal/volunteering", label: "Volunteering", icon: <HandHeart /> },
    ...(profile?.role === "admin" ? [{ href: "/admin", label: "Admin area", icon: <Settings2 /> }] : []),
  ];
  return (
    <AppShell items={items} name={profile?.full_name || user.email || ""} roleLabel="Parent portal">
      {children}
    </AppShell>
  );
}
