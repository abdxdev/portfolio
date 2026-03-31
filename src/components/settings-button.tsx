"use client";

import {
  Settings,
  MousePointerClick,
  Sun,
  Sparkles,
  Play,
  Type,
  Expand,
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
import { useRevealHighlight } from "./reveal-highlight";
import {
  useReplyNotifications,
  NotificationToggleRow,
} from "@/components/notification-prompt";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const items: {
  key: keyof AnimationSettings;
  label: string;
  icon: React.ReactNode;
}[] = [
    { key: "introAnimation", label: "Intro animation", icon: <Play className="h-3.5 w-3.5" /> },
    { key: "lightRays", label: "Light rays", icon: <Sun className="h-3.5 w-3.5" /> },
    { key: "clickSparks", label: "Click sparks", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: "shinyText", label: "Shiny text", icon: <Type className="h-3.5 w-3.5" /> },
    { key: "expandableCard", label: "Expandable card", icon: <Expand className="h-3.5 w-3.5" /> },
  ];

export function SettingsButton() {
  const { settings, toggle, setAll } = useAnimationSettings();
  const { enabled: revealEnabled, toggle: toggleReveal, setEnabled: setRevealEnabled } = useRevealHighlight();
  const { enabled: notifEnabled, loading: notifLoading, toggle: toggleNotif } = useReplyNotifications([]);
  const isAllEnabled = Object.values(settings).every(Boolean) && revealEnabled;

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Animation settings" className="group">
              <Settings className="transition-transform duration-500 ease-in-out group-hover:-rotate-60 group-data-[state=open]:rotate-180" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-64 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 ">
          <span className="text-sm font-semibold">Animations</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              const newState = !isAllEnabled;
              setAll(newState);
              setRevealEnabled(newState);
            }}
          >
            {isAllEnabled ? "Disable all" : "Enable all"}
          </Button>
        </div>

        {/* Toggle list */}
        <div className="px-4 py-2 space-y-1">
          {/* Reveal highlight (own provider) */}
          <label className="flex items-center justify-between py-1.5 rounded-md cursor-pointer group">
            <span className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              <MousePointerClick className="h-3.5 w-3.5" />
              Mouse hover
            </span>
            <Switch checked={revealEnabled} onCheckedChange={toggleReveal} />
          </label>
          {/* Animation settings */}
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
