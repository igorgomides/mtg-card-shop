import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Cart() {
  const { isAuthenticated, loading } = useAuth();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const { data: cartItems, isLoading, refetch } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const removeFromCartMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      setRemovingId(null);
      refetch();
    },
  });

  const handleRemove = (cartItemId: number) => {
    setRemovingId(cartItemId);
    removeFromCartMutation.mutate(cartItemId);
  };

  const total = useMemo(() => {
    if (!cartItems) return 0;
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(item.priceAtAddTime || "0");
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
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
            <p className="text-slate-400 text-lg">Please sign in to view your cart.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Link href="/">
          <Button variant="ghost" className="text-white mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading cart...</p>
          </div>
        ) : !cartItems || cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-6">Your cart is empty</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-slate-800/50 border-purple-500/20">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-2">Card #{item.cardId}</h3>
                        <p className="text-slate-400 text-sm mb-2">
                          Quantity: <span className="text-white font-semibold">{item.quantity}</span>
                        </p>
                        <p className="text-slate-400 text-sm">
                          Price: <span className="text-white font-semibold">${item.priceAtAddTime}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold text-lg mb-4">
                          ${(parseFloat(item.priceAtAddTime || "0") * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          onClick={() => handleRemove(item.id)}
                          disabled={removingId === item.id}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="bg-gradient-to-br from-purple-600/50 to-pink-600/50 border-purple-500/20 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 pb-4 border-b border-purple-500/20">
                    <div className="flex justify-between text-slate-200">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-200">
                      <span>Shipping</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-slate-200">
                      <span>Tax</span>
                      <span>$0.00</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-white text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full bg-white text-purple-600 hover:bg-slate-100 py-6">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
