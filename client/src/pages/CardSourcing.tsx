import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { 
  Search, 
  ExternalLink, 
  Plus,
  DollarSign,
  TrendingUp,
  Eye,
  CheckCircle
} from "lucide-react";

export default function CardSourcing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(50);
  const [selectedGame, setSelectedGame] = useState("mtg");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchExternalCards = trpc.admin.searchExternalCards.useQuery(
    { cardName: searchQuery, maxPrice, game: selectedGame },
    { 
      enabled: false,
      retry: false,
    }
  );

  const addCardMutation = trpc.admin.addCard.useMutation({
    onSuccess: () => {
      // Show success message or update UI
      console.log('Card added successfully');
    },
    onError: (error) => {
      console.error('Error adding card:', error);
    }
  });

  // Monitor query state changes
  useEffect(() => {
    if (searchExternalCards.isLoading || searchExternalCards.isFetching) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
      if (searchExternalCards.data) {
        setSearchResults(searchExternalCards.data);
      }
    }
  }, [
    searchExternalCards.isLoading, 
    searchExternalCards.isFetching, 
    searchExternalCards.data
  ]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    console.log('[CardSourcing] Starting search for:', searchQuery, 'max price:', maxPrice);
    setSearchResults([]); // Clear previous results
    
    // The useEffect will handle setting isSearching based on query state
    searchExternalCards.refetch();
  };

  const handleAddCard = async (card: any) => {
    try {
      await addCardMutation.mutateAsync(card);
      // Update the card in the results to show it's been added
      setSearchResults(prev => 
        prev.map(c => 
          c.scryfallId === card.scryfallId 
            ? { ...c, isAdded: true }
            : c
        )
      );
    } catch (error) {
      console.error('Failed to add card:', error);
    }
  };

  const formatPrice = (price: string | null) => {
    if (!price) return 'N/A';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getGameDisplayName = (gameCode: string) => {
    const gameNames: Record<string, string> = {
      mtg: 'Magic: The Gathering',
      yugioh: 'Yu-Gi-Oh!',
      pokemon: 'Pokémon',
      lorcana: 'Disney Lorcana',
      onepiece: 'One Piece',
      digimon: 'Digimon',
      starwars: 'Star Wars',
      fab: 'Flesh and Blood',
      vanguard: 'Cardfight!! Vanguard',
      weiss: 'Weiß Schwarz',
      shadowverse: 'Shadowverse',
      godzilla: 'Godzilla',
    };
    return gameNames[gameCode] || gameCode.toUpperCase();
  };

  const getPrimaryPurchaseUrl = (card: any) => {
    // Priority order: TCGPlayer > Cardmarket > Scryfall
    return card.tcgplayerUrl || card.cardmarketUrl || card.scryfallUrl;
  };

  const getPurchaseButtonText = (card: any) => {
    if (card.tcgplayerUrl) return 'Buy on TCGPlayer';
    if (card.cardmarketUrl) return 'Buy on Cardmarket';
    if (card.scryfallUrl) return 'View on Scryfall';
    return 'View Details';
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Card Sourcing</h1>
          <p className="text-slate-600 text-lg">
            Search for cards from various trading card games and add them to your inventory.
          </p>
        </div>

        {/* Search Form */}
        <Card className="bg-white/80 border-blue-200/50 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2 text-xl">
              <Search className="w-6 h-6 text-blue-500" />
              Search External Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Card Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Search for cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Trading Card Game
                  </label>
                  <Select value={selectedGame} onValueChange={setSelectedGame}>
                    <SelectTrigger className="bg-white border-blue-200 text-slate-800">
                      <SelectValue placeholder="Select a game" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200">
                      <SelectItem value="mtg">Magic: The Gathering</SelectItem>
                      <SelectItem value="yugioh">Yu-Gi-Oh!</SelectItem>
                      <SelectItem value="pokemon">Pokémon</SelectItem>
                      <SelectItem value="lorcana">Disney Lorcana</SelectItem>
                      <SelectItem value="onepiece">One Piece Card Game</SelectItem>
                      <SelectItem value="digimon">Digimon Card Game</SelectItem>
                      <SelectItem value="starwars">Star Wars: Unlimited</SelectItem>
                      <SelectItem value="fab">Flesh and Blood</SelectItem>
                      <SelectItem value="vanguard">Cardfight!! Vanguard</SelectItem>
                      <SelectItem value="weiss">Weiß Schwarz</SelectItem>
                      <SelectItem value="shadowverse">Shadowverse: Evolve</SelectItem>
                      <SelectItem value="godzilla">Godzilla Card Game</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Price (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium"
                >
                  {isSearching ? 'Searching...' : 'Search Cards'}
                </Button>
                
                {isSearching && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Cancel the query and reset state
                      searchExternalCards.remove();
                      setIsSearching(false);
                      setSearchResults([]);
                    }}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">
              Found {searchResults.length} {getGameDisplayName(selectedGame)} cards under ${maxPrice}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {searchResults.map((card) => {
                const primaryPurchaseUrl = getPrimaryPurchaseUrl(card);
                console.log('Card:', card.name, 'Purchase URL:', primaryPurchaseUrl);
                
                return (
                  <Card 
                    key={card.scryfallId} 
                    className="bg-white/80 border-blue-200/50 group hover:border-blue-300/60 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg hover:shadow-xl backdrop-blur-sm"
                    onClick={() => {
                      console.log('Card clicked:', card.name, 'URL:', primaryPurchaseUrl);
                      if (primaryPurchaseUrl) {
                        console.log('Opening URL:', primaryPurchaseUrl);
                        window.open(primaryPurchaseUrl, '_blank');
                      } else {
                        console.log('No purchase URL available for:', card.name);
                      }
                    }}
                  >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-slate-800 text-lg line-clamp-2 mb-1">
                          {card.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-blue-500 text-white text-xs">
                            {getGameDisplayName(selectedGame)}
                          </Badge>
                          <p className="text-blue-600 text-sm capitalize font-medium">{card.rarity}</p>
                        </div>
                        <p className="text-slate-500 text-sm">{card.setName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(card.priceUsd)}
                        </div>
                        {card.costBenefitScore && (
                          <div className="text-sm text-slate-500">
                            Value: {card.costBenefitScore}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {card.imageUrl && (
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {card.manaCost && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            {selectedGame === 'mtg' ? 'Mana Cost:' : 
                             selectedGame === 'pokemon' ? 'Energy Cost:' : 
                             selectedGame === 'yugioh' ? 'Level/Rank:' : 'Cost:'}
                          </span>
                          <span className="text-slate-800 font-medium">{card.manaCost}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Type:</span>
                        <span className="text-slate-800 font-medium">{card.typeLine}</span>
                      </div>
                      {card.power && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            {selectedGame === 'mtg' ? 'P/T:' : 
                             selectedGame === 'pokemon' ? 'HP:' : 
                             selectedGame === 'yugioh' ? 'ATK/DEF:' : 'Stats:'}
                          </span>
                          <span className="text-slate-800 font-medium">
                            {card.toughness ? `${card.power}/${card.toughness}` : card.power}
                          </span>
                        </div>
                      )}
                      {card.setName && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Set:</span>
                          <span className="text-slate-800 font-medium truncate ml-2">{card.setName}</span>
                        </div>
                      )}
                    </div>

                    {/* Primary Purchase Button */}
                    {primaryPurchaseUrl && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          window.open(primaryPurchaseUrl, '_blank');
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white mb-2"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {getPurchaseButtonText(card)}
                      </Button>
                    )}

                    {/* Secondary Action Buttons */}
                    <div className="flex gap-2 mb-2">
                      {card.scryfallUrl && card.tcgplayerUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(card.scryfallUrl, '_blank');
                          }}
                          className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      )}
                      
                      {card.cardmarketUrl && card.tcgplayerUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(card.cardmarketUrl, '_blank');
                          }}
                          className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          EU
                        </Button>
                      )}
                    </div>

                    {/* Add to Inventory Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleAddCard(card);
                      }}
                      disabled={addCardMutation.isLoading || card.isAdded}
                      className={`w-full ${
                        card.isAdded 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                      } text-white font-medium`}
                    >
                      {card.isAdded ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Added to Inventory
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Inventory
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && searchResults.length === 0 && !isSearching && (
          <Card className="bg-white/80 border-blue-200/50 shadow-lg backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <p className="text-slate-600 text-lg">
                No cards found under ${maxPrice}. Try a different search term or increase the price limit.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        {searchResults.length === 0 && !searchQuery && (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sourcing Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Search Strategy</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Search for specific card names</li>
                    <li>• Try partial names for broader results</li>
                    <li>• Select the correct game first</li>
                    <li>• Use character or creature names</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Price Optimization</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Set realistic price limits</li>
                    <li>• Check multiple retailers</li>
                    <li>• Consider foil vs non-foil pricing</li>
                    <li>• Look for undervalued cards</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}