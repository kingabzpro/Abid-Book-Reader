import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-context";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Read Abid's Books",
  description: "Interactive way of reading my books online for free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="fixed inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.02]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_0%,theme('colors.primary/0.05'),transparent_70%)]" />
            </div>
            <Navbar />
            <main className="min-h-screen relative">{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
