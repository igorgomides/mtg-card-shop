import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { 
  Package, 
  Search, 
  Edit3,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  DollarSign,
  Calendar,
  Tag,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Inventory() {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [setCodeFilter, setSetCodeFilter] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Sorting state
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [editPrices, setEditPrices] = useState({
    priceUsd: "",
    priceEur: "",
    priceFoil: ""
  });

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch inventory data
  const inventoryQuery = trpc.admin.getInventory.useQuery({
    search: searchQuery || undefined,
    rarity: rarityFilter !== "all" ? rarityFilter : undefined,
    setCode: setCodeFilter !== "all" ? setCodeFilter : undefined,
    minPrice,
    maxPrice,
    limit: itemsPerPage,
    offset,
    sortBy,
    sortOrder,
  });

  // Delete card mutation
  const deleteCardMutation = trpc.admin.deleteCard.useMutation({
    onSuccess: () => {
      inventoryQuery.refetch();
    },
    onError: (error) => {
      console.error('Error deleting card:', error);
      alert('Failed to delete card. Please try again.');
    }
  });

  // Update card mutation
  const updateCardMutation = trpc.admin.updateCard.useMutation({
    onSuccess: () => {
      inventoryQuery.refetch();
      setEditingCard(null);
    },
    onError: (error) => {
      console.error('Error updating card:', error);
      alert('Failed to update card. Please try again.');
    }
  });

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rarityFilter, setCodeFilter, minPrice, maxPrice, sortBy, sortOrder]);

  const handleDeleteCard = async (cardId: number) => {
    try {
      await deleteCardMutation.mutateAsync(cardId);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setEditPrices({
      priceUsd: card.priceUsd || "",
      priceEur: card.priceEur || "",
      priceFoil: card.priceFoil || ""
    });
  };

  const handleUpdateCard = async () => {
    if (!editingCard) return;
    
    try {
      await updateCardMutation.mutateAsync({
        id: editingCard.id,
        priceUsd: editPrices.priceUsd || null,
        priceEur: editPrices.priceEur || null,
        priceFoil: editPrices.priceFoil || null,
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const formatPrice = (price: string | null) => {
    if (!price) return 'N/A';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-slate-500';
      case 'uncommon': return 'bg-slate-400';
      case 'rare': return 'bg-yellow-500';
      case 'mythic': return 'bg-orange-500';
      default: return 'bg-slate-500';
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const cards = inventoryQuery.data || [];
  const totalCards = cards.length;
  const hasNextPage = totalCards === itemsPerPage;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Inventory Management</h1>
          <p className="text-slate-600 text-lg">
            Manage your MTG card inventory, update prices, and track stock.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/80 border-blue-200/50 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center justify-between text-xl">
              <div className="flex items-center gap-2">
                <Search className="w-6 h-6 text-blue-500" />
                Search & Filter Inventory
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-blue-600 hover:bg-blue-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div>
              <Input
                type="text"
                placeholder="Search cards by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rarity
                  </label>
                  <Select value={rarityFilter} onValueChange={setRarityFilter}>
                    <SelectTrigger className="bg-white border-blue-200 text-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rarities</SelectItem>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="uncommon">Uncommon</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="mythic">Mythic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min Price
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={minPrice || ""}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Price
                  </label>
                  <Input
                    type="number"
                    placeholder="999.99"
                    value={maxPrice || ""}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sort By
                  </label>
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-');
                    setSortBy(field);
                    setSortOrder(order as "asc" | "desc");
                  }}>
                    <SelectTrigger className="bg-white border-blue-200 text-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                      <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                      <SelectItem value="rarity-asc">Rarity (A-Z)</SelectItem>
                      <SelectItem value="rarity-desc">Rarity (Z-A)</SelectItem>
                      <SelectItem value="setName-asc">Set (A-Z)</SelectItem>
                      <SelectItem value="setName-desc">Set (Z-A)</SelectItem>
                      <SelectItem value="createdAt-desc">Recently Added</SelectItem>
                      <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Grid */}
        {inventoryQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-white/80 border-blue-200/50 shadow-lg backdrop-blur-sm animate-pulse">
                <CardContent className="p-4">
                  <div className="h-48 bg-blue-100 rounded mb-4"></div>
                  <div className="h-4 bg-blue-100 rounded mb-2"></div>
                  <div className="h-3 bg-blue-100 rounded mb-1"></div>
                  <div className="h-3 bg-blue-100 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cards.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-slate-600">
                Showing {cards.length} cards {totalCards === itemsPerPage && '(may be more)'}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-slate-600 px-2">Page {currentPage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasNextPage}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cards.map((card: any) => (
                <Card key={card.id} className="bg-white/80 border-blue-200/50 shadow-lg group hover:border-blue-300/60 transition-all duration-300 hover:shadow-xl backdrop-blur-sm">
                  <CardContent className="p-4">
                    {/* Card Image */}
                    {card.imageUrl && (
                      <div className="relative mb-4">
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-full h-48 object-cover rounded-md"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge className={`${getRarityColor(card.rarity)} text-white capitalize`}>
                            {card.rarity}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Card Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {card.name}
                      </h3>
                      
                      <div className="text-sm text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Set:</span>
                          <span className="text-slate-700 font-medium">{card.setName}</span>
                        </div>
                        
                        {card.manaCost && (
                          <div className="flex justify-between">
                            <span>Mana:</span>
                            <span className="text-slate-700 font-medium">{card.manaCost}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="text-slate-700 font-medium truncate ml-2">{card.typeLine}</span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="bg-blue-50/80 rounded p-3 space-y-1 border border-blue-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">USD:</span>
                          <span className="font-semibold text-green-600">{formatPrice(card.priceUsd)}</span>
                        </div>
                        {card.priceEur && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">EUR:</span>
                            <span className="font-semibold text-blue-600">€{parseFloat(card.priceEur).toFixed(2)}</span>
                          </div>
                        )}
                        {card.priceFoil && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Foil:
                            </span>
                            <span className="font-semibold text-yellow-500">${parseFloat(card.priceFoil).toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCard(card)}
                          className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border-red-200">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-slate-800">Delete Card</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-600">
                                Are you sure you want to delete "{card.name}" from your inventory? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-blue-300 text-blue-600 hover:bg-blue-50">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCard(card.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card className="bg-white/80 border-blue-200/50 shadow-lg backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-slate-700 text-lg mb-2">No cards found</p>
              <p className="text-slate-500 text-sm">
                {searchQuery || rarityFilter !== "all" || minPrice || maxPrice
                  ? "Try adjusting your search criteria or filters."
                  : "Your inventory is empty. Add some cards to get started."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Edit Card Dialog */}
        {editingCard && (
          <AlertDialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
            <AlertDialogContent className="bg-white border-blue-200 max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-800">Edit Card Pricing</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600">
                  Update pricing information for "{editingCard.name}"
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    USD Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editPrices.priceUsd}
                    onChange={(e) => setEditPrices(prev => ({ ...prev, priceUsd: e.target.value }))}
                    className="bg-white border-blue-200 text-slate-800 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    EUR Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editPrices.priceEur}
                    onChange={(e) => setEditPrices(prev => ({ ...prev, priceEur: e.target.value }))}
                    className="bg-white border-blue-200 text-slate-800 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Foil Price (USD)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editPrices.priceFoil}
                    onChange={(e) => setEditPrices(prev => ({ ...prev, priceFoil: e.target.value }))}
                    className="bg-white border-blue-200 text-slate-800 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel className="border-blue-300 text-blue-600 hover:bg-blue-50">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUpdateCard}
                  disabled={updateCardMutation.isLoading}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  {updateCardMutation.isLoading ? 'Updating...' : 'Update Prices'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </AdminDashboardLayout>
  );
}