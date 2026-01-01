"use client";

import { Moon, Sun, Type, Minus, Plus, Layout } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface ReaderSettingsProps {
  fontSize: number;
  lineHeight: number;
  contentWidth: string;
  fontFamily: string;
  readerTheme: string;
  onFontSizeChange: (size: number) => void;
  onLineHeightChange: (height: number) => void;
  onContentWidthChange: (width: string) => void;
  onFontFamilyChange: (font: string) => void;
  onReaderThemeChange: (theme: string) => void;
}

export function ReaderSettings({
  fontSize,
  lineHeight,
  contentWidth,
  fontFamily,
  readerTheme,
  onFontSizeChange,
  onLineHeightChange,
  onContentWidthChange,
  onFontFamilyChange,
  onReaderThemeChange,
}: ReaderSettingsProps) {
  const { setTheme } = useTheme();

  const fontOptions = [
    { value: "system-ui, sans-serif", label: "Sans", preview: "Aa" },
    { value: "Georgia, serif", label: "Serif", preview: "Aa" },
    { value: "ui-monospace, monospace", label: "Mono", preview: "Aa" },
  ];

  const widthOptions = [
    { value: "narrow", label: "Narrow" },
    { value: "normal", label: "Normal" },
    { value: "wide", label: "Wide" },
  ];

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "sepia", label: "Sepia", icon: Type },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:border-primary/50">
          <Type className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-semibold">Reader Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
        <div className="flex gap-2 px-2 pb-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={readerTheme === option.value ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  onReaderThemeChange(option.value);
                  if (option.value !== "sepia") {
                    setTheme(option.value);
                  }
                }}
              >
                <Icon className="h-4 w-4 mr-1" />
                {option.label}
              </Button>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">Font Size</DropdownMenuLabel>
        <div className="flex items-center gap-3 px-2 pb-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onFontSizeChange(Math.max(14, fontSize - 2))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="flex-1 text-center font-medium">{fontSize}px</span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onFontSizeChange(Math.min(28, fontSize + 2))}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">Line Height</DropdownMenuLabel>
        <div className="flex items-center gap-3 px-2 pb-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() =>
              onLineHeightChange(Math.max(1.3, Math.round((lineHeight - 0.1) * 10) / 10))
            }
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="flex-1 text-center font-medium">{lineHeight}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() =>
              onLineHeightChange(Math.min(2.4, Math.round((lineHeight + 0.1) * 10) / 10))
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">Font Family</DropdownMenuLabel>
        <div className="flex gap-1 px-2 pb-3">
          {fontOptions.map((option) => (
            <Button
              key={option.value}
              variant={fontFamily === option.value ? "default" : "outline"}
              size="sm"
              className="flex-1"
              style={{ fontFamily: option.value }}
              onClick={() => onFontFamilyChange(option.value)}
            >
              {option.preview}
            </Button>
          ))}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">Content Width</DropdownMenuLabel>
        <div className="flex gap-1 px-2 pb-2">
          {widthOptions.map((option) => (
            <Button
              key={option.value}
              variant={contentWidth === option.value ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => onContentWidthChange(option.value)}
            >
              <Layout className="h-3.5 w-3.5 mr-1" />
              {option.label}
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
