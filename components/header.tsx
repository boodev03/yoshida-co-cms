"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Cases", href: "/cases" },
    { name: "News", href: "/news" },
    { name: "Equipments", href: "/equipments" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Yoshida Industrial CMS
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <ul className="flex space-x-8">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors pb-1 hover:text-primary",
                      "text-gray-700 hover:text-gray-900",
                      pathname.startsWith(item.href) &&
                        "border-b-2 border-primary"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
