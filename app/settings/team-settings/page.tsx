"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

export default function TeamSettingsPage() {
  const [accountName, setAccountName] = useState("My Company");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulasi save
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Team settings updated successfully");
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-muted-foreground" />
          Team settings
        </h1>
      </div>

      <Separator />

      <div className="space-y-8">
        {/* Upload Logo Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Upload your company logo</h2>
            <p className="text-sm text-muted-foreground">
              It will be displayed on the left-side dashboard, in exported
              files, and in shared projects.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Image Placeholder */}
            <div className="w-32 h-32 bg-muted border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <ImageIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Upload</span>
              </div>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                accept="image/*"
              />
            </div>

            {/* Account Name Input */}
            <div className="flex-1 w-full max-w-xl space-y-2">
              <Label htmlFor="accountName">Account name</Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account name"
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* Storage Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-lg font-semibold">Storage</h2>
              <p className="text-sm text-muted-foreground">Used</p>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              0 B / 5 GB
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: "1%" }} // Contoh usage 1%
            />
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
