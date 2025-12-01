import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account settings",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground poppins overflow-hidden">
      <SettingsSidebar />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-10 pb-20">{children}</div>
      </main>
    </div>
  );
}
