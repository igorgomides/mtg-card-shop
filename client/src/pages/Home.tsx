import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Zap, TrendingUp, Settings } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const adminLoginMutation = trpc.auth.adminLogin.useMutation({
    onSuccess: async (data) => {
      console.log('Admin login successful:', data);
      setShowAdminLogin(false);
      
      // Force refresh the auth state and wait for it
      try {
        await utils.auth.me.invalidate();
        await utils.auth.me.refetch();
        
        // Small delay to ensure the state has updated
        setTimeout(() => {
          console.log('Navigating to admin...');
          setLocation("/admin");
        }, 200);
      } catch (error) {
        console.error('Error refreshing auth state:', error);
        // Fallback: navigate anyway
        setLocation("/admin");
      }
    },
    onError: (error) => {
      console.error('Admin login failed:', error);
      alert('Admin login failed: ' + error.message);
    }
  });

  const handleAdminLogin = (openId: string) => {
    adminLoginMutation.mutate({ openId });
  };

  const { data: searchResults, isLoading: isSearching } = trpc.cards.search.useQuery(
    {
      search: searchQuery,
      rarity: selectedRarity,
      limit: 12,
      offset: 0,
    },
    { enabled: searchQuery.length > 0 || selectedRarity.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already triggered by useQuery above
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/50 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚔️</span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:inline">{APP_TITLE}</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
                <Link href="/cart">
                  <Button variant="ghost" size="sm">
                    <ShoppingCart className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/account">
                  <Button variant="outline" size="sm">
                    {user?.name || "Account"}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowAdminLogin(!showAdminLogin)}
                  className="text-slate-400 hover:text-white"
                >
                  Admin
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-600">
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        {/* Admin Login Modal */}
        {showAdminLogin && !isAuthenticated && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <Card className="bg-slate-800 border-purple-500/20 max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="text-white">Admin Login</CardTitle>
                <CardDescription>
                  Quick login for development purposes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleAdminLogin('admin-igor-gomides')}
                  disabled={adminLoginMutation.isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                >
                  Login as Igor Gomides
                </Button>
                <Button 
                  onClick={() => handleAdminLogin('admin-rodrigo-t')}
                  disabled={adminLoginMutation.isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to--600"
                >
                  Login as Rodrigo T
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowAdminLogin(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Find Magic Cards with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Best Value</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Discover Magic: The Gathering cards with the best cost-benefit ratio. Compare prices, analyze value, and build your collection smarter.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search cards by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 bg-slate-800 border-purple-500/30 text-white placeholder:text-slate-400"
                />
              </div>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-purple-500/30 text-white rounded-md"
              >
                <option value="">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="mythic">Mythic</option>
              </select>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600 py-6">
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <Zap className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Smart Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Our algorithm calculates cost-benefit scores for every card, helping you find the best value.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-pink-400 mb-2" />
              <CardTitle className="text-white">Price Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Real-time pricing from Scryfall ensures you always know the market value of cards.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <ShoppingCart className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Easy Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Build your collection with our streamlined shopping experience and secure payments.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {(searchQuery || selectedRarity) && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              {isSearching ? "Searching..." : `Found ${searchResults?.length || 0} cards`}
            </h2>

            {searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.map((card: any) => (
                  <Link key={card.id} href={`/card/${card.id}`}>
                    <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-500/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm sm:text-base text-white line-clamp-2">
                          {card.name}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {card.setName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {card.imageUrl && (
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="w-full h-auto rounded-md mb-3"
                          />
                        )}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Price:</span>
                            <span className="text-white font-semibold">${card.priceUsd}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Rarity:</span>
                            <span className="text-purple-400 capitalize">{card.rarity}</span>
                          </div>
                          {card.costBenefitScore && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Value Score:</span>
                              <span className="text-pink-400 font-semibold">{card.costBenefitScore}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : !isSearching && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">No cards found. Try adjusting your search.</p>
              </div>
            )}
          </div>
        )}

        {/* CTA Section */}
        {!isAuthenticated && !loading && (
          <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Build Your Collection?
            </h2>
            <p className="text-lg text-white/90 mb-6">
              Sign in to add cards to your cart and start shopping.
            </p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100">
              Sign In Now
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
