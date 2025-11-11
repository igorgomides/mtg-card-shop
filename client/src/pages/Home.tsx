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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="h-12 flex items-center">
                <img 
                  src="/deck-core-logo.png" 
                  alt="DECK CORE Logo" 
                  className="h-18 w-auto object-contain transition-opacity duration-200 hover:opacity-90"
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
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hidden sm:inline"></span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                    <ShoppingCart className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/account">
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
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
                  className="text-slate-600 hover:text-blue-600"
                >
                  Admin
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg">
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
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
            <Card className="bg-white border-blue-200 max-w-md w-full mx-4 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-slate-800">Admin Login</CardTitle>
                <CardDescription className="text-slate-600">
                  Quick login for development purposes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleAdminLogin('admin-igor-gomides')}
                  disabled={adminLoginMutation.isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  Login as Igor Gomides
                </Button>
                <Button 
                  onClick={() => handleAdminLogin('admin-rodrigo-t')}
                  disabled={adminLoginMutation.isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                >
                  Login as Rodrigo T
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowAdminLogin(false)}
                  className="w-full border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center mb-1">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">BEST CARD, LOWER PRICE!</span><br />
            Premium Cards Finder
          </h1>
          <p className="text-xl sm:text-1xl text-slate-600 mb-12 max-w-xl mx-auto leading-relaxed">
            The ultimate destination for trading card enthusiasts. Discover Magic: The Gathering, Yu-Gi-Oh!, Pokémon and more with the best prices and value analysis.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-2xl shadow-lg border border-blue-200/50">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search cards by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-4 bg-transparent border-0 text-slate-800 placeholder:text-slate-400 text-lg focus:ring-0"
                />
              </div>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="px-4 py-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-lg"
              >
                <option value="">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="mythic">Mythic</option>
              </select>
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 px-8 text-lg rounded-xl">
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white border-blue-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Zap className="w-8 h-8 text-blue-500 mb-4" />
              <CardTitle className="text-slate-800 text-xl">Smart Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                Our algorithm calculates cost-benefit scores for every card, helping you find the best value.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-cyan-500 mb-4" />
              <CardTitle className="text-slate-800 text-xl">Price Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                Real-time pricing from Scryfall ensures you always know the market value of cards.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <ShoppingCart className="w-8 h-8 text-blue-600 mb-4" />
              <CardTitle className="text-slate-800 text-xl">Easy Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                Build your collection with our streamlined shopping experience and secure payments.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {(searchQuery || selectedRarity) && (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-8">
              {isSearching ? "Searching..." : `Found ${searchResults?.length || 0} cards`}
            </h2>

            {searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((card: any) => (
                  <Link key={card.id} href={`/card/${card.id}`}>
                    <Card className="bg-white border-blue-200/50 hover:border-blue-400/50 cursor-pointer transition-all hover:shadow-xl hover:shadow-blue-500/10 group">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm sm:text-base text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">{card.name}</CardTitle>
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
