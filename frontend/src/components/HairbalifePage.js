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
import { mockData } from "../data/mock"; // We still need this for prices, IDs, and images
import { Toaster } from "./ui/toaster";
import {
  addItemToCart,
  updateQuantity,
  removeItem,
  calculateTotals,
} from "../utils/cartUtils";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_live_51SJeVXCQ8Tn4kDoE0oHJdQEntTIrc4GzH0kIGINYBNyk38UecWrqSmndcahYzBdWv8hBE6NkGEEHZmQwrEWPQfIs00LqnvTEKe");

// --- 1. ALL OUR TEXT IS HERE ---
// All text (EN and DE) now lives inside this object
const translations = {
  en: {
    hero_tagline: "Revive Your Hair. Redefine Your Confidence.",
    hero_cta: "Shop Now",
    cart_view: "View Cart",
    carousel_title: "Premium Formula",
    carousel_subtitle: "Experience the ultimate in luxury hair care with our scientifically formulated shampoo.",
    benefit_1_title: "Strengthens Roots",
    benefit_1_desc: "Advanced keratin complex penetrates deep into hair follicles, reinforcing from the root up for visibly stronger, more resilient hair.",
    benefit_2_title: "Adds Brilliant Shine",
    benefit_2_desc: "Premium argan oil and silk proteins create a luminous, mirror-like shine that catches light beautifully throughout the day.",
    benefit_3_title: "100% Natural Formula",
    benefit_3_desc: "Carefully curated botanical extracts and essential oils deliver powerful results without harsh chemicals or sulfates.",
    about_title: "Our Philosophy",
    about_desc: "At Hairbalife, we believe that exceptional hair care begins with the finest natural ingredients and cutting-edge scientific research. Our premium formulations combine centuries-old botanical wisdom with modern innovation, creating luxurious products that transform your hair care ritual into a moment of pure indulgence.",
    gallery_title: "Our Product Collection",
    gallery_item_1_name: "Standard Hairbalife Shampoo - 500 ml",
    gallery_item_1_desc: "Single 500 ml bottle of Hairbalife Shampoo",
    gallery_item_2_name: "2 United Hairbalife Shampoo - 500 ml",
    gallery_item_2_desc: "2 x 500 ml bottle of Hairbalife Shampoo",
    gallery_item_3_name: "3 United Hairbalife Shampoo - 500 ml",
    gallery_item_3_desc: "3 x 500 ml bottle of Hairbalife Shampoo",
    gallery_add_to_cart: "Add to Cart",
    reels_title: "Behind the Essence",
    visual_gallery_title: "Discover The Essence",
    visual_gallery_subtitle: "Every drop tells a story — explore our luxurious textures and natural beauty.",
    reviews_title: "What Our Customers Say",
    buy_title: "Get Yours Today",
    buy_product_name: "Get Yours Now Just For",
    buy_select_qty: "Select Quantity First",
    buy_add_to_cart: "Add", // We will add the quantity manually, e.g., "Add 3 to Cart"
    buy_to_cart: "to Cart",
    footer_copyright: "All rights reserved.",
    cart_title: "Your Cart",
    cart_close: "Close",
    cart_empty: "Your cart is empty.",
    cart_each: "each",
    cart_remove: "Remove",
    cart_items: "Items",
    cart_total: "Total",
    cart_checkout: "Proceed to Checkout",
    select_language: "Select Language", // <-- ADDED
    gallery_tagline: "Build your routine with salon-grade essentials for every hair type.",
    featured_badge: "New Collection",
  },
  de: {
    hero_tagline: "Beleben Sie Ihr Haar. Definieren Sie Ihr Selbstvertrauen neu.",
    hero_cta: "Jetzt einkaufen",
    cart_view: "Warenkorb ansehen",
    carousel_title: "Premium-Formel",
    carousel_subtitle: "Erleben Sie die ultimative Luxus-Haarpflege mit unserem wissenschaftlich entwickelten Shampoo.",
    benefit_1_title: "Stärkt die Wurzeln",
    benefit_1_desc: "Fortschrittlicher Keratinkomplex dringt tief in die Haarfollikel ein und stärkt sie von der Wurzel an für sichtbar kräftigeres, widerstandsfähigeres Haar.",
    benefit_2_title: "Verleiht brillanten Glanz",
    benefit_2_desc: "Hochwertiges Arganöl und Seidenproteine sorgen für einen leuchtenden, spiegelähnlichen Glanz, der das Licht den ganzen Tag über wunderschön einfängt.",
    benefit_3_title: "100% natürliche Formel",
    benefit_3_desc: "Sorgfältig ausgewählte Pflanzenextrakte und ätherische Öle liefern starke Ergebnisse ohne aggressive Chemikalien oder Sulfate.",
    about_title: "Unsere Philosophie",
    about_desc: "Wir bei Hairbalife glauben, dass außergewöhnliche Haarpflege mit den besten natürlichen Inhaltsstoffen und modernster wissenschaftlicher Forschung beginnt. Unsere Premium-Rezepturen verbinden jahrhundertealtes botanisches Wissen mit moderner Innovation und schaffen luxuriöse Produkte, die Ihr Haarpflegeritual in einen Moment puren Genusses verwandeln.",
    gallery_title: "Unsere Produktkollektion",
    gallery_item_1_name: "Standard Hairbalife Shampoo - 500 ml",
    gallery_item_1_desc: "Einzelne 500-ml-Flasche Hairbalife Shampoo",
    gallery_item_2_name: "2er-Pack Hairbalife Shampoo - 500 ml",
    gallery_item_2_desc: "2 x 500-ml-Flasche Hairbalife Shampoo",
    gallery_item_3_name: "3er-Pack Hairbalife Shampoo - 500 ml",
    gallery_item_3_desc: "3 x 500-ml-Flasche Hairbalife Shampoo",
    gallery_add_to_cart: "In den Warenkorb",
    reels_title: "Hinter der Essenz",
    visual_gallery_title: "Entdecke die Essenz",
    visual_gallery_subtitle: "Jeder Tropfen erzählt eine Geschichte – entdecken Sie unsere luxuriöse Texturen und natürliche Schönheit.",
    reviews_title: "Was unsere Kunden sagen",
    buy_title: "Holen Sie sich noch heute",
    buy_product_name: "Hol es dir jetzt nur für",
    buy_select_qty: "Wählen Sie zuerst die Menge",
    buy_add_to_cart: "Hinzufügen",
    buy_to_cart: "zum Warenkorb",
    footer_copyright: "Alle Rechte vorbehalten.",
    cart_title: "Ihr Warenkorb",
    cart_close: "Schließen",
    cart_empty: "Ihr Warenkorb ist leer.",
    cart_each: "pro Stück",
    cart_remove: "Entfernen",
    cart_items: "Artikel",
    cart_total: "Gesamt",
    cart_checkout: "Zur Kasse gehen",
    select_language: "Sprache wählen", // <-- ADDED
    gallery_tagline: "Stellen Sie Ihre Routine mit salonreifer Pflege für jeden Haartyp zusammen.",
    featured_badge: "Neue Kollektion",
  }
};


const HairbalifePage = () => {
  const [language, setLanguage] = useState("de"); // <-- 2. CHANGED DEFAULT TO 'de'
  const [isVisible, setIsVisible] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [buyQty, setBuyQty] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const { total: totalCartValue, totalQty: totalCartQuantity } =
    calculateTotals(cartItems);

  // We use mockData for images, but translations for titles
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
      name: mockData.product.name, // Name from mockData
      price: parseFloat(mockData.product.price), // Price from mockData
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

  // Checkout Handler (no changes needed)
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/create-checkout-session`, {
            method: "POST",
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
        if (session.url) {
            window.location.href = session.url;
        } else {
            throw new Error("Failed to create a checkout session.");
        }
    } catch (error) {
        console.error("Checkout process error:", error);
        alert(`Checkout failed: ${error.message}`);
    }
  };

  // useEffects (no changes needed)
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


  // --- 3. USE THE TRANSLATIONS IN YOUR JSX ---
  return (
    <div className="min-h-screen bg-black text-white font-['Poppins'] relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="absolute top-[35%] -right-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>
      <Toaster />

      {/* --- 4. MODIFIED LANGUAGE SWITCHER --- */}
      <div className="fixed top-4 right-4 z-50 p-3 bg-zinc-950/70 backdrop-blur-md border border-yellow-300/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <h4 className="text-sm font-medium text-yellow-400 text-center mb-2">
          {/* REPLACED with new translation key */}
          {translations[language].select_language}
        </h4>
        <div className="flex space-x-2">
          <Button 
            variant={language === 'en' ? 'default' : 'outline'}
            onClick={() => setLanguage('en')}
            className="text-yellow-400 border-yellow-400 px-3 py-1 h-auto text-sm"
          >
            EN
          </Button>
          <Button 
            variant={language === 'de' ? 'default' : 'outline'}
            onClick={() => setLanguage('de')}
            className="text-yellow-400 border-yellow-400 px-3 py-1 h-auto text-sm"
          >
            DE
          </Button>
        </div>
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden animate-section">
        <div
          className={`text-center transform transition-all duration-1000 relative z-10 ${
            isVisible[0]
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <Badge className="mb-5 bg-yellow-400/15 text-yellow-300 border-yellow-300/30 hover:bg-yellow-400/20">
            {translations[language].featured_badge}
          </Badge>
          <img
            src="/images/logo.png"
            alt="Hairbalife Logo"
            className="h-26 w-auto mx-auto mb-8 drop-shadow-2xl"
          />
          <h1 className="text-5xl md:text-7xl font-['Playfair_Display'] font-bold mb-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
            Hairbalife
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {/* REPLACED */}
            {translations[language].hero_tagline}
          </p>
          <Button
            size="lg"
            onClick={scrollToBuySection}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {/* REPLACED */}
            {translations[language].hero_cta}
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
                {/* REPLACED */}
                {translations[language].cart_view}
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
              {/* REPLACED */}
              {translations[language].carousel_title}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {/* REPLACED */}
              {translations[language].carousel_subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image Carousel (no text changes needed here) */}
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

            {/* Benefits Section */}
            <div className="space-y-8">
              {/* Benefit 1 */}
              <div className="flex items-start space-x-4 group">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-xl">
                  <Award className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                    {translations[language].benefit_1_title}
                  </h3>
                  <p className="text-gray-400">
                    {translations[language].benefit_1_desc}
                  </p>
                </div>
              </div>
              {/* Benefit 2 */}
              <div className="flex items-start space-x-4 group">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-xl">
                  <Sparkles className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                    {translations[language].benefit_2_title}
                  </h3>
                  <p className="text-gray-400">
                    {translations[language].benefit_2_desc}
                  </p>
                </div>
              </div>
              {/* Benefit 3 */}
              <div className="flex items-start space-x-4 group">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-xl">
                  <Leaf className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                    {translations[language].benefit_3_title}
                  </h3>
                  <p className="text-gray-400">
                    {translations[language].benefit_3_desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900 animate-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold mb-8 text-yellow-400">
            {/* REPLACED */}
            {translations[language].about_title}
          </h2>
          <Card className="bg-gray-900/50 border-yellow-400/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                {/* REPLACED */}
                {translations[language].about_desc}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {/* Badges are from mockData, which is fine, no translation needed */}
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
      <section className="py-24 px-6 animate-section relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] text-yellow-400 font-bold">
              {translations[language].gallery_title}
            </h2>
            <p className="text-zinc-300/90 max-w-3xl mx-auto mt-4 text-lg leading-relaxed">
              {translations[language].gallery_tagline}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
            {mockData.productGallery.map((product, index) => (
              <Card
                key={product.id}
                className="group bg-zinc-900/65 border border-zinc-700/60 hover:border-yellow-300/50 hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/55 text-yellow-300 border-yellow-300/40">
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-yellow-300 mb-2 leading-snug min-h-[56px]">
                      {product.name}
                    </h3>
                    <p className="text-zinc-300 text-sm mb-5 min-h-[44px]">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-2xl font-bold text-white tracking-tight">
                        €{product.price}
                      </span>
                      <Button
                        className="bg-gradient-to-r from-yellow-300 to-amber-500 text-black font-semibold hover:from-yellow-200 hover:to-amber-400"
                        onClick={() => addGalleryItem(product)}
                      >
                        {translations[language].gallery_add_to_cart}
                      </Button>
                    </div>
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
            {/* REPLACED */}
            {translations[language].reels_title}
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {/* Video titles from mockData, assuming they might need translation */}
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
                    {reel.title} {/* Note: This text is still from mockData, add to translations if needed */}
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
            {/* REPLACED */}
            {translations[language].visual_gallery_title}
          </h2>
          <p className="text-gray-400 mb-12 text-lg max-w-2xl mx-auto">
            {/* REPLACED */}
            {translations[language].visual_gallery_subtitle}
          </p>
          {/* Gallery images (no text) */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {[
              "/images/gallery/p1.png",
              "/images/gallery/p2.png",
              "/images/gallery/p3.png",
              "/images/gallery/p4.png",
              "/images/gallery/p5.png",
              "/images/gallery/p6.png",
              "/images/gallery/p7.png",
              "/images/gallery/p8.png",
              "/images/gallery/p9.png",
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
        {/* Lightbox Modal (no text) */}
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
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-400/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black animate-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] text-yellow-400 text-center mb-12 font-bold">
            {/* REPLACED */}
            {translations[language].reviews_title}
          </h2>
          {/* Reviews are from mockData, which is fine since they are in mixed languages already */}
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
            {/* REPLACED */}
            {translations[language].buy_title}
          </h2>
          <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-400/30 shadow-2xl max-w-md mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-yellow-400 mb-4">
                {/* REPLACED */}
                {translations[language].buy_product_name}
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
                {/* REPLACED with dynamic text */}
                {buyQty === 0
                  ? translations[language].buy_select_qty
                  : `${translations[language].buy_add_to_cart} ${buyQty} ${translations[language].buy_to_cart}`}
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
          {/* REPLACED */}
          © {new Date().getFullYear()} Hairbalife. {translations[language].footer_copyright}
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
                {/* REPLACED */}
                {translations[language].cart_title}
              </h3>
              <button
                className="text-gray-400 hover:text-yellow-400"
                onClick={() => setShowCart(false)}
              >
                {/* REPLACED */}
                {translations[language].cart_close}
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-gray-400">
                {/* REPLACED */}
                {translations[language].cart_empty}
              </p>
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
                        {/* REPLACED */}
                        €{item.price.toFixed(2)} {translations[language].cart_each}
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
                        {/* REPLACED */}
                        {translations[language].cart_remove}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t border-yellow-400/20 pt-4">
                  <div className="flex justify-between mb-2 text-gray-400">
                    {/* REPLACED */}
                    <span>{translations[language].cart_items}</span>
                    <span>{totalCartQuantity}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-yellow-400">
                    {/* REPLACED */}
                    <span>{translations[language].cart_total}</span>
                    <span>€{totalCartValue.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                    onClick={handleCheckout}
                  >
                    {/* REPLACED */}
                    {translations[language].cart_checkout}
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
