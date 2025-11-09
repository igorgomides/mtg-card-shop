import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Package, 
  TrendingUp, 
  ShoppingCart,
  DollarSign,
  Activity
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const { data: users } = trpc.admin.getUsers.useQuery();
  const { data: cards } = trpc.cards.search.useQuery({ search: '', limit: 1000 });

  const stats = [
    {
      title: "Total Users",
      value: users?.length || 0,
      icon: Users,
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "Total Cards",
      value: cards?.length || 0,
      icon: Package,
      color: "from-green-400 to-green-600"
    },
    {
      title: "Orders Today",
      value: 0, // TODO: Implement orders count
      icon: ShoppingCart,
      color: "from-purple-400 to-purple-600"
    },
    {
      title: "Revenue",
      value: "$0", // TODO: Implement revenue calculation
      icon: DollarSign,
      color: "from-yellow-400 to-yellow-600"
    }
  ];

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-300">
            Manage your MTG card shop from this central dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="bg-slate-800/50 border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a 
                href="/admin/card-sourcing" 
                className="block p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white hover:from-purple-600 hover:to-pink-700 transition-colors"
              >
                <h3 className="font-semibold mb-1">Source New Cards</h3>
                <p className="text-sm opacity-90">
                  Find and add cheap cards to your inventory
                </p>
              </a>
              
              <a 
                href="/admin/inventory" 
                className="block p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white hover:from-blue-600 hover:to-purple-700 transition-colors"
              >
                <h3 className="font-semibold mb-1">Manage Inventory</h3>
                <p className="text-sm opacity-90">
                  Update card prices and quantities
                </p>
              </a>
              
              <a 
                href="/admin/orders" 
                className="block p-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg text-white hover:from-green-600 hover:to-blue-700 transition-colors"
              >
                <h3 className="font-semibold mb-1">Process Orders</h3>
                <p className="text-sm opacity-90">
                  Review and fulfill customer orders
                </p>
              </a>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Database initialized</p>
                    <p className="text-slate-400 text-xs">Sample cards added successfully</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Admin users created</p>
                    <p className="text-slate-400 text-xs">Igor Gomides and Rodrigo T</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">System ready</p>
                    <p className="text-slate-400 text-xs">All services operational</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}