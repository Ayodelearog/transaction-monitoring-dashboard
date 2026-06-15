"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuthStore } from "@/lib/store/auth";
import { useSettingsStore, type NotificationPrefs } from "@/lib/store/settings";

const NOTIFICATION_ROWS: Array<{
  key: keyof NotificationPrefs;
  title: string;
  description: string;
}> = [
  {
    key: "criticalAlerts",
    title: "Critical alerts",
    description: "Notify me when a critical-priority case is opened.",
  },
  {
    key: "sarFiled",
    title: "SAR filings",
    description: "Notify me when a Suspicious Activity Report is filed.",
  },
  {
    key: "kycPending",
    title: "KYC reviews",
    description: "Notify me when a customer needs a KYC decision.",
  },
  {
    key: "weeklyDigest",
    title: "Weekly digest",
    description: "Email me a summary of queue activity every Monday.",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, clearAuth } = useAuthStore();
  const { notifications, setNotification } = useSettingsStore();

  const [name, setName] = useState(user?.name ?? "");
  const dirty = user ? name.trim() !== user.name && name.trim().length > 0 : false;

  const handleSignOut = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-1">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile, appearance, and notification preferences.
        </p>
      </div>

      {/* Account */}
      <Section title="Account" description="Your profile as it appears across the workspace.">
        <div className="flex items-center gap-3">
          <Avatar name={name || user?.name || "?"} color={user?.avatarColor} size="lg" />
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{user?.name}</p>
            <Badge tone="primary" className="mt-1">
              {user?.role ?? "analyst"}
            </Badge>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-foreground">Display name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Display name"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-foreground">Email</span>
            <Input value={user?.email ?? ""} disabled aria-label="Email" />
          </label>
        </div>
        <div className="mt-4">
          <Button
            size="sm"
            disabled={!dirty}
            onClick={() => updateUser({ name: name.trim() })}
          >
            Save changes
          </Button>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" description="Choose how the console looks.">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Theme</p>
          <ThemeToggle />
        </div>
      </Section>

      {/* Notifications */}
      <Section
        title="Notifications"
        description="Control which events you're alerted about. Preferences are saved to this browser."
      >
        <ul className="divide-y divide-border">
          {NOTIFICATION_ROWS.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.description}</p>
              </div>
              <Switch
                checked={notifications[row.key]}
                onChange={(value) => setNotification(row.key, value)}
                aria-label={row.title}
              />
            </li>
          ))}
        </ul>
      </Section>

      {/* Session */}
      <Section title="Session" description="Sign out of the demo workspace.">
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {children}
    </Card>
  );
}
