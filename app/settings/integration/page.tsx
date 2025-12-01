"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Lock,
  Link as LinkIcon,
  Layers,
  MessageSquare,
  Zap,
  Users,
  Calendar,
  Mail,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  status: "available" | "development";
}

const integrations: IntegrationItem[] = [
  {
    id: "jira",
    name: "Jira",
    description:
      "Bring GanttPRO & JIRA Software together for advanced productivity!",
    icon: Layers,
    iconColor: "text-[#0052CC]",
    status: "available",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications and create tasks directly from Slack.",
    icon: MessageSquare,
    iconColor: "text-foreground",
    status: "available",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Integration with Zapier is currently under development.",
    icon: Zap,
    iconColor: "text-[#FF4F00]",
    status: "development",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description:
      "Get notifications and create tasks directly from Microsoft Teams.",
    icon: Users,
    iconColor: "text-[#6264A7]",
    status: "available",
  },
  {
    id: "gcal",
    name: "Google Calendar",
    description: "View GanttPRO tasks in Google Calendar.",
    icon: Calendar,
    iconColor: "text-[#4285F4]",
    status: "available",
  },
  {
    id: "outlook",
    name: "Outlook",
    description: "View GanttPRO tasks in Outlook Calendar.",
    icon: Mail,
    iconColor: "text-[#0078D4]",
    status: "available",
  },
];

export default function IntegrationPage() {
  // State untuk menyimpan ID layanan yang sedang loading
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // State untuk menyimpan daftar layanan yang sudah "Terhubung"
  const [connectedList, setConnectedList] = useState<string[]>([]);

  const handleConnect = async (item: IntegrationItem) => {
    if (item.status === "development") {
      toast.info(`${item.name} integration is coming soon!`);
      return;
    }

    setLoadingId(item.id);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setConnectedList((prev) => [...prev, item.id]);
    setLoadingId(null);
    toast.success(`Successfully connected to ${item.name}`);
  };

  const handleDisconnect = async (item: IntegrationItem) => {
    setLoadingId(item.id);

    // Simulasi proses disconnect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setConnectedList((prev) => prev.filter((id) => id !== item.id));
    setLoadingId(null);
    toast.info(`Disconnected from ${item.name}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LinkIcon className="w-6 h-6 text-muted-foreground" />
          Integration and API
        </h1>
      </div>

      <Separator />

      {/* Integration Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Integration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Missing something you need?{" "}
            <a href="#" className="text-primary hover:underline">
              Request an integration.
            </a>
          </p>
        </div>

        {/* Grid Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item) => {
            const isConnected = connectedList.includes(item.id);
            const isLoading = loadingId === item.id;

            return (
              <div
                key={item.id}
                className={cn(
                  "border rounded-lg p-6 flex flex-col h-full transition-all duration-300 bg-card relative overflow-hidden",
                  isConnected
                    ? "border-green-500/50 shadow-md bg-green-50/10"
                    : "hover:shadow-sm"
                )}
              >
                {/* Connected Badge Overlay */}
                {isConnected && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> CONNECTED
                  </div>
                )}

                {/* Header Card: Icon & Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "p-2 rounded-lg bg-muted/50",
                      isConnected && "bg-white dark:bg-muted"
                    )}
                  >
                    <item.icon className={cn("w-8 h-8", item.iconColor)} />
                  </div>
                  <h3 className="font-bold text-xl">{item.name}</h3>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground flex-1 mb-6 leading-relaxed">
                  {item.description}
                </p>

                {/* Buttons */}
                <div className="flex gap-3 mt-auto">
                  {item.status === "available" ? (
                    isConnected ? (
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                        onClick={() => handleDisconnect(item)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Disconnect"
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 bg-[#0070f3] hover:bg-[#0060df] text-white transition-all active:scale-95"
                        onClick={() => handleConnect(item)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                            Connecting...
                          </>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="secondary"
                      disabled
                      className="flex-1 cursor-not-allowed opacity-70"
                    >
                      Coming Soon
                    </Button>
                  )}

                  {/* Help Button - Selalu Muncul */}
                  <Button
                    variant="outline"
                    className="px-3"
                    title="Read Documentation"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* API Section (Placeholder) */}
      <section className="space-y-4 opacity-50 pointer-events-none grayscale">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              API Access <Lock className="w-4 h-4" />
            </h2>
            <p className="text-sm text-muted-foreground">
              Generate API keys to access your data programmatically.
            </p>
          </div>
          <Button variant="outline" disabled>
            Manage Keys
          </Button>
        </div>
      </section>
    </div>
  );
}
