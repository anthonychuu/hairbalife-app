import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Award,
  Leaf,
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { mockData } from "../data/mock";
import { Toaster } from "./ui/toaster";
import {
  addItemToCart,
  updateQuantity,
  removeItem,
  calculateTotals,
} from "../utils/cartUtils";
import { loadStripe } from "@stripe/stripe-js";

// ✅ 1. Load Stripe outside the component render logic.
// This prevents recreating the Stripe promise on every render.
const stripePromise = loadStripe("pk_live_51SJeVXCQ8Tn4kDoE0oHJdQEntTIrc4GzH0kIGINYBNyk38UecWrqSmndcahYzBdWv8hBE6NkGEEHZmQwrEWPQfIs00LqnvTEKe");

const HairbalifePage = () => {
  const [isVisible, setIsVisible] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [buyQty, setBuyQty] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const { total: totalCartValue, totalQty: totalCartQuantity } =
    calculateTotals(cartItems);

  const productImages = [
    { url: "/images/p1.png", title: "Premium Hairbalife Shampoo" },
    { url: "/images/p2.png", title: "Luxury Black & Gold Design" },
    { url: "/images/p3.png", title: "Complete Hair Care System" },
    { url: "/images/p4.png", title: "Elegant Bottle Design" },
    { url: "/images/p5.png", title: "Premium Collection Display" },
    { url: "/images/p6.png", title: "Premium Collection Display" },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + productImages.length) % productImages.length
    );
  };

  const incBuyQty = () => setBuyQty((q) => q + 1);
  const decBuyQty = () => setBuyQty((q) => Math.max(0, q - 1));

  const addBuySectionToCart = () => {
    if (buyQty <= 0) return;
    const product = {
      id: "hairbalife-main",
      name: mockData.product.name,
      price: parseFloat(mockData.product.price),
    };
    let updated = [...cartItems];
    for (let i = 0; i < buyQty; i++) {
      updated = addItemToCart(updated, product);
    }
    setCartItems(updated);
    setBuyQty(0);
    setShowCart(true);
  };

  const addGalleryItem = (p) => {
    const product = {
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
    };
    const updated = addItemToCart(cartItems, product);
    setCartItems(updated);
    setShowCart(true);
  };

  const incItem = (id) =>
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === id);
      return updateQuantity(prev, id, (item?.quantity || 0) + 1);
    });

  const decItem = (id) =>
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === id);
      return updateQuantity(prev, id, (item?.quantity || 0) - 1);
    });

  const removeLine = (id) => setCartItems((prev) => removeItem(prev, id));

  // HairbalifePage.js

// ✅ Corrected Checkout Handler for the new Stripe API
const handleCheckout = async () => {
    if (cartItems.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        // Step 1: Send cart data to your backend
const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
const response = await fetch(`${apiUrl}/api/create-checkout-session`, {            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: cartItems.map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Server error: ${response.status}`);
        }

        const session = await response.json();

        // Step 2: Verify the session URL exists and redirect
        if (session.url) {
            // This is the new, simpler way to redirect.
            window.location.href = session.url;
        } else {
            throw new Error("Failed to create a checkout session.");
        }

    } catch (error) {
        console.error("Checkout process error:", error);
        alert(`Checkout failed: ${error.message}`);
    }
};




  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observers = [];
    const sections = document.querySelectorAll(".animate-section");
    sections.forEach((section, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [index]: true }));
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(section);
      observers.push(observer);
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const scrollToBuySection = () => {
    const section = document.getElementById("buy-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // --- The rest of your JSX remains exactly the same ---
  return (
    <div className="min-h-screen bg-black text-white font-['Poppins']">
      <Toaster />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden animate-section">
        <div
          className={`text-center transform transition-all duration-1000 ${
            isVisible[0]
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <img
            src="/images/logo.png"
            alt="Hairbalife Logo"
            className="h-26 w-auto mx-auto mb-8 drop-shadow-2xl"
          />
          <h1 className="text-5xl md:text-7xl font-['Playfair_Display'] font-bold mb-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
            Hairbalife
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {mockData.hero.tagline}
          </p>
          <Button
            size="lg"
            onClick={scrollToBuySection}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {mockData.hero.ctaButton}
          </Button>

          {totalCartQuantity > 0 && (
            <div className="mt-4 inline-block bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30">
              <span className="text-yellow-400 text-sm">
                Cart: {totalCartQuantity} items (€{totalCartValue.toFixed(2)})
              </span>
              <Button
                variant="outline"
                size="sm"
                className="ml-3 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                onClick={() => setShowCart(true)}
              >
                View Cart
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Product Carousel */}
      <section className="py-20 px-6 relative animate-section">
        <div
          className={`max-w-6xl mx-auto transform transition-all duration-1000 ${
            isVisible[1]
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] text-yellow-400 font-bold mb-4">
              Premium Formula
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience the ultimate in luxury hair care with our scientifically formulated shampoo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentImageIndex * 100}%)`,
                  }}
                >
                  {productImages.map((image, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                      />
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-yellow-400 p-2 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-yellow-400 p-2 rounded-full"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <p className="text-center text-gray-400 mt-4 text-sm">
                {productImages[currentImageIndex].title}
              </p>
            </div>

            <div className="space-y-8">
              {mockData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-xl">
                    {benefit.icon === "Award" && (
                      <Award className="h-6 w-6 text-black" />
                    )}
                    {benefit.icon === "Sparkles" && (
                      <Sparkles className="h-6 w-6 text-black" />
                    )}
                    {benefit.icon === "Leaf" && (
                      <Leaf className="h-6 w-6 text-black" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900 animate-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold mb-8 text-yellow-400">
            Our Philosophy
          </h2>
          <Card className="bg-gray-900/50 border-yellow-400/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                {mockData.about.description}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {mockData.about.values.map((value, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-yellow-400 text-yellow-400 px-4 py-2 hover:bg-yellow-400 hover:text-black"
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Product Collection */}
      <section className="py-20 px-6 animate-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] text-yellow-400 text-center mb-12 font-bold">
            Our Product Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockData.productGallery.map((product) => (
              <Card
                key={product.id}
                className="bg-gray-900/50 border-yellow-400/20 hover:border-yellow-400/50 transition-all"
              >
                <CardContent className="p-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">
                      €{product.price}
                    </span>
                    <Button
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                      onClick={() => addGalleryItem(product)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    

      {/* Reels Section */}
<section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900 animate-section">
  <div className="max-w-6xl mx-auto text-center">
    <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] text-yellow-400 font-bold mb-12">
      Behind the Essence
    </h2>
    <div className="flex flex-col md:flex-row justify-center items-center gap-8">
      {mockData.reels.map((reel) => (
        <div
          key={reel.id}
          className="relative w-full md:w-1/3 aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-yellow-400/30 shadow-2xl hover:border-yellow-400/60 transition-all duration-500"
        >
          <video
            src={reel.src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-2xl"
          ></video>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-lg font-semibold text-yellow-400">
              {reel.title}
            </h3>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>



{/* Product Visual Gallery */}
<section className="py-24 px-6 bg-gradient-to-b from-gray-950 via-black to-gray-900 animate-section relative overflow-hidden">
  <div className="max-w-6xl mx-auto text-center relative z-10">
    <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] text-yellow-400 font-bold mb-4">
      Discover The Essence
    </h2>
    <p className="text-gray-400 mb-12 text-lg max-w-2xl mx-auto">
      Every drop tells a story — explore our luxurious textures and natural beauty.
    </p>

    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {[
        "/images/gallery/p1.png",
        "/images/gallery/p2.png",
        "/images/gallery/p3.png",
        "/images/gallery/p4.png",
        "/images/gallery/p5.png",
        "/images/gallery/p6.png",
        "/images/gallery/p4.png",
        "/images/gallery/p3.png",
        "/images/gallery/p2.png",
      ].map((src, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-3xl cursor-pointer group break-inside-avoid border border-yellow-400/10 hover:border-yellow-400/40 shadow-xl hover:shadow-yellow-400/20 transition-all duration-500"
          onClick={() => setSelectedImage(src)}
        >
          <img
            src={src}
            alt={`Gallery ${index + 1}`}
            className="w-full h-auto rounded-3xl object-cover transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="absolute bottom-4 left-4 text-left opacity-0 group-hover:opacity-100 transition-all duration-500">
            <p className="text-sm text-yellow-400 font-semibold tracking-wide">
              #HairbalifeLuxury
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Lightbox Modal */}
  {selectedImage && (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={() => setSelectedImage(null)}
    >
      <img
        src={selectedImage}
        alt="Full View"
        className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl transform scale-100 transition-all duration-500"
      />
      <button
        className="absolute top-8 right-8 text-yellow-400 hover:text-white text-3xl font-bold"
        onClick={() => setSelectedImage(null)}
      >
        ✕
      </button>
    </div>
  )}

  {/* Floating glow accent */}
  <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-400/10 rounded-full blur-[100px] animate-pulse-slow"></div>
  <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
</section>






      {/* Reviews */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black animate-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] text-yellow-400 text-center mb-12 font-bold">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockData.reviews.map((review) => (
              <Card key={review.id} className="bg-black/50 border-yellow-400/20">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">
                    "{review.review}"
                  </p>
                  <div className="flex items-center">
                    {review.image && (
                      <img
                        src={review.image}
                        alt={review.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    )}
                    <div>
                      <p className="text-yellow-400 font-semibold">
                        {review.name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {review.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

  

      {/* Buy Section */}
      <section id="buy-section" className="py-20 px-6 animate-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] text-yellow-400 mb-12 font-bold">
            Get Yours Today
          </h2>
          <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-400/30 shadow-2xl max-w-md mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-yellow-400 mb-4">
                {mockData.product.name}
              </h3>
              <p className="text-4xl font-bold text-white mb-4">
                €{mockData.product.price}
                <span className="text-lg text-gray-400 line-through ml-2">
                  €{mockData.product.originalPrice}
                </span>
              </p>

              <div className="flex items-center justify-center space-x-4 mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decBuyQty}
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-16 text-center">
                  {buyQty}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incBuyQty}
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                size="lg"
                onClick={addBuySectionToCart}
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold py-4 transform hover:scale-105 transition-all duration-300 shadow-xl"
                disabled={buyQty === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {buyQty === 0
                  ? "Select Quantity First"
                  : `Add ${buyQty} to Cart`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-black text-center border-t border-yellow-400/10">
        <div className="mb-4 flex justify-center space-x-6">
          <a
            href="#"
            className="text-gray-400 hover:text-yellow-400 transition"
          >
            <Instagram className="h-6 w-6" />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-yellow-400 transition"
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-yellow-400 transition"
          >
            <Twitter className="h-6 w-6" />
          </a>
        </div>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Hairbalife. All rights reserved.
        </p>
      </footer>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/50"
            onClick={() => setShowCart(false)}
          />
          <div className="w-full max-w-md bg-black border-l border-yellow-400/20 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-['Playfair_Display'] text-yellow-400">
                Your Cart
              </h3>
              <button
                className="text-gray-400 hover:text-yellow-400"
                onClick={() => setShowCart(false)}
              >
                Close
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-gray-400">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border border-yellow-400/20 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-gray-400 text-sm">
                        €{item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        onClick={() => decItem(item.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-3 w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        onClick={() => incItem(item.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <button
                        className="ml-4 text-gray-500 hover:text-red-400"
                        onClick={() => removeLine(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t border-yellow-400/20 pt-4">
                  <div className="flex justify-between mb-2 text-gray-400">
                    <span>Items</span>
                    <span>{totalCartQuantity}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-yellow-400">
                    <span>Total</span>
                    <span>€{totalCartValue.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HairbalifePage;
