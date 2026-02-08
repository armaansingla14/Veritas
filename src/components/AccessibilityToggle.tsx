"use client";

import { useState, useEffect } from "react";
import { Eye, Type, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type FontSize = "normal" | "large" | "extra-large";

interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  darkMode: boolean;
}

export function AccessibilityToggle() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: "normal",
    highContrast: false,
    darkMode: false,
  });
  const [open, setOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("veritas-accessibility");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const html = document.documentElement;

    // Remove existing classes
    html.classList.remove("large-text", "extra-large-text", "high-contrast", "dark");

    // Apply font size
    if (newSettings.fontSize === "large") {
      html.classList.add("large-text");
    } else if (newSettings.fontSize === "extra-large") {
      html.classList.add("extra-large-text");
    }

    // Apply high contrast
    if (newSettings.highContrast) {
      html.classList.add("high-contrast");
    }

    // Apply dark mode
    if (newSettings.darkMode) {
      html.classList.add("dark");
    }
  };

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem("veritas-accessibility", JSON.stringify(newSettings));
    applySettings(newSettings);
  };

  const fontSizeLabel = {
    normal: "Normal",
    large: "Large",
    "extra-large": "Extra Large",
  };

  const cycleFontSize = () => {
    const sizes: FontSize[] = ["normal", "large", "extra-large"];
    const currentIndex = sizes.indexOf(settings.fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    updateSettings({ fontSize: sizes[nextIndex] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="focus-ring border-slate-600 hover:bg-slate-700 text-slate-300 hover:text-white"
          aria-label="Accessibility settings"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Accessibility Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Font Size */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-slate-400" />
              <div>
                <Label htmlFor="font-size" className="text-base text-white">
                  Text Size
                </Label>
                <p className="text-sm text-slate-400">
                  Current: {fontSizeLabel[settings.fontSize]}
                </p>
              </div>
            </div>
            <Button
              id="font-size"
              variant="outline"
              onClick={cycleFontSize}
              className="focus-ring border-slate-600 hover:bg-slate-700 text-white"
            >
              {settings.fontSize === "normal" && "Aa"}
              {settings.fontSize === "large" && "Aa+"}
              {settings.fontSize === "extra-large" && "Aa++"}
            </Button>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-slate-400" />
              <div>
                <Label htmlFor="high-contrast" className="text-base text-white">
                  High Contrast
                </Label>
                <p className="text-sm text-slate-400">
                  Increase color contrast
                </p>
              </div>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) =>
                updateSettings({ highContrast: checked })
              }
              className="focus-ring"
            />
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="h-5 w-5 text-slate-400" />
              ) : (
                <Sun className="h-5 w-5 text-slate-400" />
              )}
              <div>
                <Label htmlFor="dark-mode" className="text-base text-white">
                  Dark Mode
                </Label>
                <p className="text-sm text-slate-400">
                  Use dark color theme
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) =>
                updateSettings({ darkMode: checked })
              }
              className="focus-ring"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
