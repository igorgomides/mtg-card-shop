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
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-50 flex items-center justify-center">
        <Card className="bg-white border-red-200 max-w-md w-full mx-4 shadow-xl">
          <CardHeader>
            <CardTitle className="text-red-600 text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 mb-4">
              You need administrator privileges to access this area.
            </p>
            <Link href="/">
              <Button variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-50">Return to Home</Button>
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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="h-12 flex items-center">
                <img 
                  src="/deck-core-logo.png" 
                  alt="DECK CORE Logo" 
                  className="h-10 w-auto object-contain transition-opacity duration-200 hover:opacity-90"
                  onError={(e) => {
                    // Fallback to DC badge if image fails to load
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.fallback-logo') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="fallback-logo w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl items-center justify-center shadow-lg hidden">
                  <span className="text-white font-bold text-xl">DC</span>
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hidden sm:inline">
                {APP_TITLE} Admin
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                View Site
              </Button>
            </Link>
            <div className="text-sm text-slate-600">
              Welcome, {user?.name}
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white/50 border-r border-blue-200/50 p-4 backdrop-blur-sm">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                    item.active 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
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
        <div className="flex-1 p-8 bg-gradient-to-br from-slate-50/50 to-blue-50/50">
          {children}
        </div>
      </div>
    </div>
  );
}