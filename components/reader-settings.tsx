"use client";

import { Moon, Sun, Type, Minus, Plus } from "lucide-react";
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
  onFontSizeChange: (size: number) => void;
  onLineHeightChange: (height: number) => void;
}

export function ReaderSettings({
  fontSize,
  lineHeight,
  onFontSizeChange,
  onLineHeightChange,
}: ReaderSettingsProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:border-primary/50">
          <Type className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-semibold">Reader Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
        <div className="flex gap-2 px-2 pb-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4 mr-1" />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4 mr-1" />
            Dark
          </Button>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">Font Size</DropdownMenuLabel>
        <div className="flex items-center gap-3 px-2 pb-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="flex-1 text-center font-medium">{fontSize}px</span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">Line Height</DropdownMenuLabel>
        <div className="flex items-center gap-3 px-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() =>
              onLineHeightChange(Math.max(1.2, Math.round((lineHeight - 0.1) * 10) / 10))
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
              onLineHeightChange(Math.min(2.5, Math.round((lineHeight + 0.1) * 10) / 10))
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
