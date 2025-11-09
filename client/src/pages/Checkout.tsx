import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Checkout() {
  const { isAuthenticated, loading, user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const { data: cartItems } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const total = useMemo(() => {
    if (!cartItems) return 0;
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(item.priceAtAddTime || "0");
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Stripe payment integration
    alert("Payment processing coming soon! This would integrate with Stripe.");
  };

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
              Back
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Please sign in to checkout.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Link href="/cart">
          <Button variant="ghost" className="text-white mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                  />
                  <Input
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                  />
                </div>

                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                />

                <Input
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                  />
                  <Input
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                  />
                </div>

                <Input
                  name="zipCode"
                  placeholder="ZIP Code"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                />
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  name="cardNumber"
                  placeholder="Card Number"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                  />
                  <Input
                    name="cvv"
                    placeholder="CVV"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                  />
                </div>

                <p className="text-slate-400 text-sm">
                  ⚠️ Note: This is a demo. Payment processing will be integrated with Stripe.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-gradient-to-br from-purple-600/50 to-pink-600/50 border-purple-500/20 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 pb-4 border-b border-purple-500/20 max-h-64 overflow-y-auto">
                  {cartItems && cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-200 text-sm">
                      <span>Card #{item.cardId} x{item.quantity}</span>
                      <span>${(parseFloat(item.priceAtAddTime || "0") * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

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

                <Button
                  onClick={handleSubmit}
                  className="w-full bg-white text-purple-600 hover:bg-slate-100 py-6"
                >
                  Complete Purchase
                </Button>

                <Link href="/cart">
                  <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                    Back to Cart
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
