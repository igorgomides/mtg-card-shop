import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CardDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const showMessage = (message: string) => {
    alert(message);
  };

  const cardId = parseInt(id || "0");

  const { data: card, isLoading } = trpc.cards.getById.useQuery(cardId, {
    enabled: cardId > 0,
  });

  const { data: cheapestPrice } = trpc.prices.getCheapest.useQuery(cardId, {
    enabled: cardId > 0,
  });

  const { data: allPrices } = trpc.prices.getLatest.useQuery(cardId, {
    enabled: cardId > 0,
  });

  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      showMessage(`${quantity} copy(ies) of ${card?.name} added to your cart.`);
      setQuantity(1);
    },
    onError: () => {
      showMessage("Failed to add item to cart. Please try again.");
    },
  });

  const addToWishlistMutation = trpc.wishlist.addItem.useMutation({
    onSuccess: () => {
      setIsWishlisted(true);
      showMessage(`${card?.name} added to your wishlist.`);
    },
    onError: () => {
      showMessage("Failed to add to wishlist. Please try again.");
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showMessage("Please sign in to add items to your cart.");
      return;
    }

    if (!card) return;

    addToCartMutation.mutate({
      cardId: card.id,
      quantity,
      priceAtAddTime: card.priceUsd || "0",
    });
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      showMessage("Please sign in to add items to your wishlist.");
      return;
    }

    if (!card) return;

    addToWishlistMutation.mutate(card.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading card details...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="text-white mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Card not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="text-white mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Image */}
          <div className="flex items-center justify-center">
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-full max-w-sm rounded-lg shadow-2xl shadow-purple-500/50"
              />
            ) : (
              <div className="w-full max-w-sm h-96 bg-slate-800 rounded-lg flex items-center justify-center">
                <p className="text-slate-400">No image available</p>
              </div>
            )}
          </div>

          {/* Card Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{card.name}</h1>
              <p className="text-slate-400">{card.setName}</p>
            </div>

            {/* Card Stats */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Mana Cost</p>
                    <p className="text-white font-semibold">{card.manaCost || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">CMC</p>
                    <p className="text-white font-semibold">{card.cmc || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Type</p>
                    <p className="text-white font-semibold text-sm">{card.typeLine}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Rarity</p>
                    <p className="text-purple-400 font-semibold capitalize">{card.rarity}</p>
                  </div>
                </div>

                {(card.power || card.toughness) && (
                  <div className="pt-4 border-t border-purple-500/20">
                    <p className="text-slate-400 text-sm mb-2">Power / Toughness</p>
                    <p className="text-white font-semibold">
                      {card.power} / {card.toughness}
                    </p>
                  </div>
                )}

                {card.oracleText && (
                  <div className="pt-4 border-t border-purple-500/20">
                    <p className="text-slate-400 text-sm mb-2">Oracle Text</p>
                    <p className="text-white text-sm leading-relaxed">{card.oracleText}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing and Value */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Pricing & Value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {card.priceUsd && (
                    <div>
                      <p className="text-slate-400 text-sm">USD Price</p>
                      <p className="text-white font-semibold text-lg">${card.priceUsd}</p>
                    </div>
                  )}
                  {card.priceEur && (
                    <div>
                      <p className="text-slate-400 text-sm">EUR Price</p>
                      <p className="text-white font-semibold text-lg">€{card.priceEur}</p>
                    </div>
                  )}
                </div>

                {card.costBenefitScore && (
                  <div className="pt-4 border-t border-purple-500/20">
                    <p className="text-slate-400 text-sm mb-2">Cost-Benefit Score</p>
                    <p className="text-pink-400 font-semibold text-lg">{card.costBenefitScore}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Higher scores indicate better value for the mana cost.
                    </p>
                  </div>
                )}

                {card.edhrecRank && (
                  <div className="pt-4 border-t border-purple-500/20">
                    <p className="text-slate-400 text-sm mb-2">EDHREC Rank</p>
                    <p className="text-white font-semibold">#{card.edhrecRank}</p>
                  </div>
                )}

                {cheapestPrice && (
                  <div className="pt-4 border-t border-purple-500/20">
                    <p className="text-slate-400 text-sm mb-2">Cheapest Online</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-400 font-semibold text-lg">${cheapestPrice.priceUSD || cheapestPrice.price}</p>
                        <p className="text-slate-400 text-xs">{cheapestPrice.retailer}</p>
                      </div>
                      {cheapestPrice.url && (
                        <a href={cheapestPrice.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/10">
                            View
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {allPrices && allPrices.length > 0 && (
                  <div className="pt-4 border-t border-purple-500/20">
                    <p className="text-slate-400 text-sm mb-3">Price Comparison</p>
                    <div className="space-y-2">
                      {allPrices.map((price: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">{price.retailer}</span>
                          <span className="text-white font-semibold">${price.priceUSD || price.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase Section */}
            <Card className="bg-gradient-to-br from-purple-600/50 to-pink-600/50 border-purple-500/20">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 text-white rounded-md"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    className="flex-1 bg-white text-purple-600 hover:bg-slate-100"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleAddToWishlist}
                    disabled={addToWishlistMutation.isPending || isWishlisted}
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
