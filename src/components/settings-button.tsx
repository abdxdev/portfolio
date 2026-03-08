"use client";

import {
  Settings,
  MousePointerClick,
  Sun,
  Sparkles,
  Play,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useAnimationSettings,
  type AnimationSettings,
} from "@/components/animation-settings";
import {
  useReplyNotifications,
  NotificationToggleRow,
} from "@/components/notification-prompt";

const items: {
  key: keyof AnimationSettings;
  label: string;
  icon: React.ReactNode;
}[] = [
    { key: "introAnimation", label: "Intro animation", icon: <Play className="h-3.5 w-3.5" /> },
    { key: "lightRays", label: "Light rays", icon: <Sun className="h-3.5 w-3.5" /> },
    { key: "cardHover", label: "Card hover", icon: <MousePointerClick className="h-3.5 w-3.5" /> },
    { key: "clickSparks", label: "Click sparks", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: "shinyText", label: "Shiny text", icon: <Type className="h-3.5 w-3.5" /> },
  ];

export function SettingsButton() {
  const { settings, toggle, setAll } = useAnimationSettings();
  const { enabled: notifEnabled, loading: notifLoading, toggle: toggleNotif } = useReplyNotifications([]);
  const allEnabled = Object.values(settings).every(Boolean);
  const noneEnabled = Object.values(settings).every((v) => !v);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Animation settings">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 ">
          <span className="text-sm font-semibold">Animations</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setAll(!allEnabled)}
          >
            {allEnabled || (!allEnabled && !noneEnabled) ? "Disable all" : "Enable all"}
          </Button>
        </div>

        {/* Toggle list */}
        <div className="px-4 py-2 space-y-1">
          {items.map(({ key, label, icon }) => (
            <label
              key={key}
              className="flex items-center justify-between py-1.5 rounded-md cursor-pointer group"
            >
              <span className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {icon}
                {label}
              </span>
              <Switch
                checked={settings[key]}
                onCheckedChange={() => toggle(key)}
              />
            </label>
          ))}
        </div>

        {/* Notifications section */}
        <div className="border-t">
          <div className="flex items-center justify-between px-4 pt-3 ">
            <span className="text-sm font-semibold">Notifications</span>
          </div>
          <div className="px-4 py-2 space-y-1">
            <NotificationToggleRow enabled={notifEnabled} loading={notifLoading} onToggle={toggleNotif} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
