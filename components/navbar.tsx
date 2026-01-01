"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, BookOpen, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth-context";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
          <div className="gradient-bg p-2 rounded-xl shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl md:text-2xl gradient-text hidden sm:block">Read Abid&apos;s Books</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/library">
            <Button variant="ghost" className="font-medium">Library</Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50 rounded-full">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {!loading && user ? (
            <Button 
              variant="ghost" 
              size="icon" 
              title="Logout" 
              className="hover:bg-destructive/10 hover:text-destructive rounded-full"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button variant="default" size="sm" title="Login" className="gradient-bg rounded-full px-6">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
