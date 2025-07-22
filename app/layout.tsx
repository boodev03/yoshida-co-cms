import Header from "@/components/header";
import ProtectedRoute from "@/components/protected-route";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/query-provider";
import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
  variable: "--font-not-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Yoshida Industrial CMS",
  description: "Content Management System for Yoshida Industrial Corporation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.className} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <ProtectedRoute>
              <Header />
              <main className="min-h-[calc(100vh-62px)] flex flex-col">
                {children}
              </main>
            </ProtectedRoute>
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
