import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  TestTube, 
  Calendar, 
  Users, 
  LogOut,
  ClipboardList,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, userRoles, signOut } = useAuth();
  const location = useLocation();

  if (!user) return <>{children}</>;

  const navItems = [
    { href: "/", icon: Home, label: "דף הבית", roles: ["admin", "operator", "qa_viewer"] },
    { href: "/stations", icon: TestTube, label: "עמדות ניסוי", roles: ["admin"] },
    { href: "/trial-days", icon: Calendar, label: "ימי ניסוי", roles: ["admin", "operator"] },
    { href: "/participants", icon: Users, label: "נסיינים", roles: ["admin", "operator"] },
    { href: "/audit", icon: ClipboardList, label: "יומן ביקורת", roles: ["admin", "qa_viewer"] },
    { href: "/admin", icon: Shield, label: "ניהול משתמשים", roles: ["admin"] },
  ];

  const filteredNavItems = navItems.filter(item =>
    item.roles.some(role => userRoles?.includes(role as any))
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold text-primary">
                ניהול נסיינים
              </Link>
              <div className="hidden md:flex items-center gap-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link key={item.href} to={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              התנתק
            </Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
