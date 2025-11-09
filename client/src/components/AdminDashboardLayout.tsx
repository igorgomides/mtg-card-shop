import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { 
  Settings, 
  Users, 
  Package, 
  TrendingUp, 
  Search,
  ShoppingCart,
  BarChart3,
  Plus
} from "lucide-react";
import { APP_TITLE } from "@/const";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  console.log('[AdminLayout] Auth state:', { user: user ? { openId: user.openId, role: user.role } : null, isAuthenticated });

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-red-500/20 max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-red-400 text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-300 mb-4">
              You need administrator privileges to access this area.
            </p>
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: BarChart3,
      active: location === "/admin"
    },
    {
      href: "/admin/card-sourcing",
      label: "Card Sourcing",
      icon: Search,
      active: location === "/admin/card-sourcing"
    },
    {
      href: "/admin/inventory",
      label: "Inventory",
      icon: Package,
      active: location === "/admin/inventory"
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: ShoppingCart,
      active: location === "/admin/orders"
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      active: location === "/admin/users"
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: TrendingUp,
      active: location === "/admin/analytics"
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: location === "/admin/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚔️</span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:inline">
                {APP_TITLE} Admin
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                View Site
              </Button>
            </Link>
            <div className="text-sm text-slate-300">
              Welcome, {user?.name}
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-slate-950/50 border-r border-purple-500/20 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    item.active 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}