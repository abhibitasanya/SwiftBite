"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { PwaInstallButton } from "./pwa-install-button";

type LoginMode = "email" | "phone";
type AuthMode = "login" | "register";
type UserRole = "customer" | "delivery" | "restaurant" | "platform";
type Stage = "role" | "login" | "dashboard" | "continue" | "restaurants" | "restaurant-menu" | "checkout";

type RestaurantCard = {
  id: number;
  name: string;
  cuisine: string;
  location: string;
  etaMinutes: number;
  rating: number;
  description: string;
  featured: boolean;
  menu: string[];
};

type DashboardData =
  | {
      role: "customer";
      source: string;
      activeOrder: {
        id: string;
        restaurant: string;
        status: string;
        rider: string;
        etaMinutes: number;
        address: string;
      };
      timeline: string[];
      restaurants: RestaurantCard[];
    }
  | {
      role: "delivery";
      source: string;
      stats: { activeTrips: number; completedToday: number; earningsToday: string };
      currentPosition: string;
      nextDrop: string;
      timeToReach: string;
      activeTrips: Array<{
        id: number;
        customer: string;
        pickup: string;
        dropoff: string;
        status: string;
        etaMinutes: number;
        currentLocation: string;
      }>;
    }
  | {
      role: "restaurant";
      source: string;
      profile: { name: string; branch: string; ordersPending: number; kitchenStatus: string };
      restaurantOptions: RestaurantCard[];
      pendingOrders: Array<{ id: string; customer: string; items: string; status: string; due: string }>;
      menu: string[];
    }
  | {
      role: "platform";
      source: string;
      totals: { users: number; restaurants: number; activeOrders: number; deliveries: number };
      recentUsers: Array<{ fullName: string; identifier: string; role: UserRole }>;
      recentRestaurants: RestaurantCard[];
      activity: string[];
    };

type CaptchaChallenge = {
  left: number;
  right: number;
  operator: "+" | "-";
  answer: number;
};

type MenuCartItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderLineItem = {
  name: string;
  quantity: number;
  price: number;
};

type LiveOrderSummary = {
  id: number;
  restaurantId: number;
  restaurantName: string;
  customerIdentifier: string;
  status: string;
  rider: string;
  etaMinutes: number;
  address: string;
  total: number;
  items: OrderLineItem[];
};

type RiderProfileDraft = {
  userIdentifier: string;
  fullName: string;
  profileImageUrl: string;
  age: string;
  gender: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  email: string;
  residentialAddress: string;
  cityState: string;
  emergencyContact: string;
  vehicleType: string;
  vehicleNumber: string;
  drivingLicenseNumber: string;
  availabilityStatus: "available" | "busy" | "offline";
  isOnline: boolean;
  deliveryZone: string;
  joiningDate: string;
  completedOrdersCount: string;
  activeDeliveries: string;
  earningsToday: string;
  verificationStatus: "pending" | "verified" | "rejected";
  idProofUrl: string;
  drivingLicenseUrl: string;
  profilePhotoUrl: string;
};

type RestaurantProfileDraft = {
  userIdentifier: string;
  restaurantName: string;
  restaurantLogoUrl: string;
  coverImageUrl: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  restaurantAddress: string;
  cityState: string;
  cuisineType: string;
  gstLicenseNumber: string;
  openingHours: string;
  deliveryRadius: string;
  description: string;
  verificationStatus: "pending" | "verified" | "rejected";
};

type MenuItemDraft = {
  restaurantIdentifier: string;
  dishName: string;
  dishImageUrl: string;
  price: string;
  category: string;
  description: string;
  spiceLevel: "mild" | "medium" | "hot" | "extra-hot";
  vegType: "veg" | "non-veg";
  isAvailable: boolean;
  preparationTimeMinutes: string;
  isFeatured: boolean;
  isBestseller: boolean;
  isRecommended: boolean;
};

type CheckoutMethod = "cash" | "card" | "upi";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  timestamp?: string;
};

type ChatSuggestion = {
  label: string;
  value: string;
};
type PlatformSection = "overview" | "users" | "restaurants" | "notifications" | "activity";

type PlatformNotification = {
  id: number;
  title: string;
  details: string;
  timestamp: string;
};

const roleCards: Array<{
  id: UserRole;
  title: string;
  subtitle: string;
  accent: string;
  icon: string;
}> = [
  { id: "customer", title: "Order Maker", subtitle: "Browse and order", accent: "from-[#4f6b52] to-[#93a884]", icon: "📱" },
  { id: "delivery", title: "Delivery Partner", subtitle: "Pick up and deliver", accent: "from-[#46624b] to-[#89a07a]", icon: "🛵" },
  { id: "restaurant", title: "Restaurant Owner", subtitle: "Manage menu and orders", accent: "from-[#58745b] to-[#a0b28f]", icon: "🍴" },
  { id: "platform", title: "Main Team", subtitle: "Support and control", accent: "from-[#3f5a43] to-[#7f9772]", icon: "🖥️" },
];

function createCaptchaChallenge(): CaptchaChallenge {
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 8) + 1;
  const operator = Math.random() > 0.5 ? "+" : "-";

  return { left, right, operator, answer: operator === "+" ? left + right : left - right };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return /^[6-9]\d{9}$/.test(value);
}

function formatChatTimestamp(timestamp?: string) {
  if (!timestamp) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function cleanChatbotReply(reply: string) {
  return reply
    .trim()
    .replace(/^(customer|delivery|restaurant|platform|assistant)\s*:\s*/i, "")
    .trim();
}

const fallbackRestaurantsForUi: RestaurantCard[] = [
  {
    id: 1,
    name: "Green Fork",
    cuisine: "Healthy bowls",
    location: "City Center",
    etaMinutes: 18,
    rating: 4.8,
    description: "Fresh bowls, wraps, and grain plates for quick lunch orders.",
    featured: true,
    menu: ["Quinoa Power Bowl", "Avocado Wrap", "Seasonal Smoothie", "Chia Parfait"],
  },
  {
    id: 2,
    name: "Spice Harbor",
    cuisine: "North Indian",
    location: "Market Road",
    etaMinutes: 24,
    rating: 4.6,
    description: "Comfort meals, curries, and tandoor plates for dinner.",
    featured: true,
    menu: ["Paneer Tikka Platter", "Butter Naan Combo", "Dal Tadka Bowl", "Mango Lassi"],
  },
  {
    id: 3,
    name: "Ocean Bites",
    cuisine: "Seafood",
    location: "Harbor View",
    etaMinutes: 32,
    rating: 4.5,
    description: "Grilled seafood and coastal specials with house sauces.",
    featured: false,
    menu: ["Grilled Fish Bowl", "Prawn Rice Box", "Lemon Herb Fries", "Coastal Soup"],
  },
  {
    id: 4,
    name: "Brick Oven House",
    cuisine: "Pizza & Pasta",
    location: "Lake District",
    etaMinutes: 20,
    rating: 4.7,
    description: "Wood-fired pizzas, pasta bowls, and cheesy sides.",
    featured: true,
    menu: ["Margherita Slice Box", "Creamy Alfredo", "Garlic Bread", "Cheese Dip"],
  },
];



function getChatSuggestions(intent: string | null, isStarter: boolean): ChatSuggestion[] {
  if (isStarter) {
    return [
      { label: "How do I order food?", value: "How do I order food?" },
      { label: "Where is sign out?", value: "Where is the sign out option?" },
      { label: "What can you do?", value: "What can you help me with in SwiftBite?" },
    ];
  }

  const normalizedIntent = (intent ?? "").toLowerCase();

  if (normalizedIntent.includes("register")) {
    return [
      { label: "What details are needed?", value: "What details are needed to register?" },
      { label: "Which role should I choose?", value: "Which role should I choose?" },
      { label: "What if captcha fails?", value: "What if captcha fails during registration?" },
    ];
  }

  if (normalizedIntent.includes("login") || normalizedIntent.includes("log in")) {
    return [
      { label: "Email or phone?", value: "Should I use email or phone to log in?" },
      { label: "Why login fails?", value: "Why is my login failing?" },
      { label: "What if I forgot password?", value: "What if I forget my password?" },
    ];
  }

  if (normalizedIntent.includes("order") || normalizedIntent.includes("cart") || normalizedIntent.includes("checkout")) {
    return [
      { label: "How to add items?", value: "How do I add items to the cart?" },
      { label: "How to checkout?", value: "How do I go to checkout?" },
      { label: "How to change quantity?", value: "How do I change item quantity?" },
    ];
  }

  if (normalizedIntent.includes("delivery") || normalizedIntent.includes("track") || normalizedIntent.includes("eta")) {
    return [
      { label: "How to track rider?", value: "How do I track the rider?" },
      { label: "What does ETA mean?", value: "What does ETA mean?" },
      { label: "Where is my order?", value: "Where is my order right now?" },
    ];
  }

  if (normalizedIntent.includes("sign out") || normalizedIntent.includes("logout") || normalizedIntent.includes("menu")) {
    return [
      { label: "Change role?", value: "How do I change role?" },
      { label: "Back button?", value: "Will the phone back button sign me out?" },
      { label: "Go home?", value: "How do I go back to home?" },
    ];
  }

  if (normalizedIntent.includes("database") || normalizedIntent.includes("db") || normalizedIntent.includes("mysql")) {
    return [
      { label: "What is saved?", value: "What is saved in the database?" },
      { label: "Is data online?", value: "Is the data stored online?" },
      { label: "How to connect DB?", value: "How do I connect the database?" },
    ];
  }

  return [];
}

function createEmptyRestaurantProfileDraft(userIdentifier = ""): RestaurantProfileDraft {
  return {
    userIdentifier,
    restaurantName: "",
    restaurantLogoUrl: "",
    coverImageUrl: "",
    ownerName: "",
    contactNumber: "",
    email: "",
    restaurantAddress: "",
    cityState: "",
    cuisineType: "",
    gstLicenseNumber: "",
    openingHours: "",
    deliveryRadius: "",
    description: "",
    verificationStatus: "pending",
  };
}

function createEmptyMenuItemDraft(restaurantIdentifier = ""): MenuItemDraft {
  return {
    restaurantIdentifier,
    dishName: "",
    dishImageUrl: "",
    price: "",
    category: "",
    description: "",
    spiceLevel: "medium",
    vegType: "veg",
    isAvailable: true,
    preparationTimeMinutes: "",
    isFeatured: false,
    isBestseller: false,
    isRecommended: false,
  };
}

function formatOrderItems(items: OrderLineItem[]) {
  return items.map((item) => `${item.name} x${item.quantity}`).join(" • ");
}

function createRestaurantIdentifier(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "restaurant"}-${Date.now().toString(36)}`;
}

function createNotification(title: string, details: string): PlatformNotification {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title,
    details,
    timestamp: new Date().toISOString(),
  };
}

function formatNotificationTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function ChatWidget({
  isOpen,
  isSending,
  messages,
  chatInput,
  onToggle,
  onInputChange,
  onSubmit,
  onSuggestionClick,
}: {
  isOpen: boolean;
  isSending: boolean;
  messages: ChatMessage[];
  chatInput: string;
  onToggle: () => void;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onSuggestionClick: (value: string) => void;
}) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const hasUserMessage = Boolean(latestUserMessage);
  const suggestions = getChatSuggestions(latestUserMessage?.text ?? null, !hasUserMessage);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex flex-col items-end gap-3 sm:bottom-[max(1.25rem,env(safe-area-inset-bottom))] sm:right-[max(1.25rem,env(safe-area-inset-right))]">
      {isOpen ? (
        <div className="w-[min(94vw,24.5rem)] overflow-hidden rounded-[1.85rem] border border-[#31543a]/35 bg-[#f9fbf5] shadow-[0_28px_76px_rgba(27,47,31,0.24)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4 border-b border-[#24412c] bg-[linear-gradient(135deg,#35543a_0%,#23412b_55%,#13281b_100%)] px-4 py-4 text-[#f3f6f2]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-[#18321d] bg-[#223326] shadow-[inset_0_1px_0_rgba(0,0,0,0.12),0_8px_18px_rgba(20,28,24,0.12)]">
                <img src="/message-icon.svg" alt="chat avatar" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f3f6f2]">SwiftBite assistant</p>
                <h3 className="mt-1 text-lg font-black text-[#f3f6f2]">Need help?</h3>
                <p className="mt-1 text-sm text-[#f3f6f2]">Ask me about login, register, orders, delivery, or support.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#f3f6f2] hover:bg-white/18"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[22rem] space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[88%] whitespace-pre-line rounded-[1.2rem] px-4 py-3 text-sm leading-6 shadow-[0_8px_22px_rgba(37,46,34,0.08)] ${
                  message.role === "user"
                    ? "ml-auto bg-[#254b34] text-[#f5f8f1]"
                    : "border border-[#cfd5d0] bg-[linear-gradient(180deg,#ffffff_0%,#eef2f1_100%)] text-[#243025]"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.85rem] border border-[#c2cbc7] bg-gradient-to-br from-[#f6f7f7] via-[#d6dbda] to-[#a7b0ad] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                      <div className="relative h-4.5 w-4.5 rounded-[0.5rem] border border-[#7a8582] bg-gradient-to-br from-[#f7f8f8] via-[#dfe3e3] to-[#bac2c0]">
                        <span className="absolute left-[0.22rem] top-[0.24rem] h-0.9 w-0.9 rounded-full bg-[#5d6764]" />
                        <span className="absolute right-[0.22rem] top-[0.24rem] h-0.9 w-0.9 rounded-full bg-[#5d6764]" />
                        <span className="absolute bottom-[0.2rem] left-1/2 h-0.8 w-2 -translate-x-1/2 rounded-full bg-[#5d6764]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div>{message.text}</div>
                      {message.timestamp ? (
                        <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#738078]">{formatChatTimestamp(message.timestamp)}</div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div>{message.text}</div>
                    {message.timestamp ? (
                      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">{formatChatTimestamp(message.timestamp)}</div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}

            {isSending ? (
              <div className="max-w-[88%] rounded-[1.2rem] border border-[#cfd5d0] bg-[linear-gradient(180deg,#ffffff_0%,#eef2f1_100%)] px-4 py-3 text-sm leading-6 text-[#243025] shadow-[0_8px_22px_rgba(37,46,34,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[0.85rem] border border-[#c2cbc7] bg-gradient-to-br from-[#f6f7f7] via-[#d6dbda] to-[#a7b0ad] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5d6764]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5d6764] [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5d6764] [animation-delay:300ms]" />
                    </div>
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#dfe7d6] bg-[#f1f6ec] px-4 py-3">
            {suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => onSuggestionClick(suggestion.value)}
                    className="rounded-full border border-[#cfe0c8] bg-[#dde9d6] px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#23412b] hover:bg-[#f2f7ee]"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex items-end gap-2">
              <textarea
                value={chatInput}
                onChange={(event) => onInputChange(event.target.value)}
                placeholder="Type your question"
                rows={2}
                className="min-h-12 flex-1 resize-none rounded-[1.1rem] border border-[#cdd8c2] bg-white px-4 py-3 text-sm text-[#243025] outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/15"
              />
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSending || !chatInput.trim()}
                className="rounded-full bg-[#254b34] px-4 py-3 text-sm font-semibold text-[#f5f8f1] shadow-[0_12px_26px_rgba(36,75,52,0.34)] transition hover:bg-[#1e3928] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onToggle}
        className="flex h-16 w-16 items-center justify-center rounded-full border border-[#d3dfcb] bg-[linear-gradient(135deg,#f0f6ea_0%,#a9bb8d_55%,#4f6b52_100%)] text-2xl font-black text-white shadow-[0_18px_44px_rgba(44,74,49,0.28)] transition hover:-translate-y-0.5"
        aria-label="Open chat assistant"
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-[1rem] border border-white/35 bg-[linear-gradient(180deg,#ffffff_0%,#dce7d0_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
          <span className="absolute left-[0.45rem] top-[0.55rem] h-1.5 w-1.5 rounded-full bg-[#51604a]" />
          <span className="absolute right-[0.45rem] top-[0.55rem] h-1.5 w-1.5 rounded-full bg-[#51604a]" />
          <span className="absolute bottom-[0.55rem] left-1/2 h-1.5 w-3 -translate-x-1/2 rounded-full bg-[#51604a]" />
          <span className="absolute -top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-[#ffe89a] shadow-[0_0_0_2px_rgba(255,255,255,0.28)]" />
        </div>
      </button>
    </div>
  );
}

function MoodBoardPhone({ variant }: { variant: "bag" | "tracking" | "rewards" }) {
  if (variant === "bag") {
    return (
      <div className="rounded-[2rem] border border-[#f2f2eb] bg-[#f8fbf4] p-2.5 shadow-[0_18px_44px_rgba(12,18,11,0.24)]">
        <div className="rounded-[1.55rem] border border-[#e3e7db] bg-white px-3 py-3.5">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-[#d6ddcf]" />
          <div className="mt-2.5 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#66745c]">
            <span>Your bag</span>
            <span>10:54</span>
          </div>
          <div className="mt-3 space-y-2.5">
            <div className="flex gap-3 rounded-[1rem] bg-[#eef3e8] p-2">
              <div className="h-14 w-14 rounded-[0.85rem] bg-[radial-gradient(circle_at_30%_30%,#c8d7b7,#74885a)]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-3/4 rounded-full bg-[#cad6bd]" />
                <div className="h-2.5 w-1/2 rounded-full bg-[#dde4d3]" />
                <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-[#506046]">
                  <span>$14.75</span>
                  <span className="rounded-full bg-[#8a9d71] px-2 py-1 text-[#f7f8f2]">Add</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 rounded-[1rem] bg-[#f1eee5] p-2">
              <div className="h-14 w-14 rounded-[0.85rem] bg-[radial-gradient(circle_at_30%_30%,#d8c29f,#8d7755)]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-2/3 rounded-full bg-[#d7ddcf]" />
                <div className="h-2.5 w-5/6 rounded-full bg-[#e3e6dc]" />
                <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-[#506046]">
                  <span>$10.50</span>
                  <span className="rounded-full bg-[#7d8f63] px-2 py-1 text-[#f7f8f2]">Add</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-[1rem] border border-[#dde4d6] bg-[#f5f8f0] p-2.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#66745c]">
              <span>Subtotal</span>
              <span>$25.25</span>
            </div>
            <div className="mt-2.5 rounded-full bg-[#6f845b] py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f8faf5]">
              Continue to checkout
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "tracking") {
    return (
      <div className="rounded-[2rem] border border-[#f2f2eb] bg-[#f8fbf4] p-2.5 shadow-[0_18px_44px_rgba(12,18,11,0.24)]">
        <div className="rounded-[1.55rem] border border-[#e3e7db] bg-white px-3 py-3.5">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-[#d6ddcf]" />
          <div className="mt-2.5 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#66745c]">
            <span>Order tracking</span>
            <span>11:02</span>
          </div>
          <div className="mt-3 rounded-[1.15rem] bg-[radial-gradient(circle_at_30%_30%,#5d744b,#395238)] p-2.5 text-[#f5f7ef]">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] opacity-80">
              <span>Map</span>
              <span>ETA 12 min</span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="rounded-full bg-white/12 py-2">Picked up</div>
              <div className="rounded-full bg-white/22 py-2">On route</div>
              <div className="rounded-full bg-white/12 py-2">Arriving</div>
            </div>
          </div>
          <div className="mt-3 space-y-2.5 rounded-[1rem] border border-[#e3e7db] bg-[#f4f7ef] p-2.5">
            <div className="h-2.5 w-2/3 rounded-full bg-[#d7ddcf]" />
            <div className="h-2.5 w-1/2 rounded-full bg-[#dde4d3]" />
            <div className="h-2.5 w-5/6 rounded-full bg-[#d7ddcf]" />
          </div>
          <div className="mt-3 rounded-full bg-[#657d53] py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f7f8f2]">
            Confirm to receive order
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-[#f2f2eb] bg-[#f8fbf4] p-2.5 shadow-[0_18px_44px_rgba(12,18,11,0.24)]">
      <div className="rounded-[1.55rem] border border-[#e3e7db] bg-white px-3 py-3.5">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-[#d6ddcf]" />
        <div className="mt-2.5 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#66745c]">
          <span>Rewards</span>
          <span>11:08</span>
        </div>
        <div className="mt-3 rounded-[1rem] bg-[linear-gradient(180deg,#eef3e8_0%,#dfe8d4_100%)] p-2.5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-2.5 w-16 rounded-full bg-[#cad6bd]" />
              <div className="h-2.5 w-24 rounded-full bg-[#e0e6d7]" />
            </div>
            <div className="h-12 w-12 rounded-[1rem] bg-[radial-gradient(circle_at_30%_30%,#b6c79d,#7d9163)]" />
          </div>
          <div className="mt-3 rounded-full bg-[#f7f9f3] px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64745c]">
            Buy more to get rewards
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {["#8a9d71", "#c8d4b5", "#dde4d3", "#6f845b"].map((color) => (
            <div key={color} className="h-8 rounded-[0.8rem]" style={{ background: color }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SoftScreen({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[2rem] border border-white/65 bg-[linear-gradient(145deg,rgba(255,255,252,0.96)_0%,rgba(238,246,231,0.94)_52%,rgba(221,232,214,0.96)_100%)] p-2.5 shadow-[0_24px_70px_rgba(44,61,40,0.16),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-2xl ${className}`}>
      <div className="relative overflow-hidden rounded-[1.55rem] border border-[#e2ead8] bg-[linear-gradient(180deg,rgba(255,255,253,0.96)_0%,rgba(248,251,244,0.92)_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-5 sm:py-5">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(79,107,82,0.45),transparent)]" />
        {children}
      </div>
    </div>
  );
}

function AppMenu({
  isOpen,
  onToggle,
  onDashboard,
  onBrowseRestaurants,
  onChangeRole,
  onSignOut,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onDashboard: () => void;
  onBrowseRestaurants: () => void;
  onChangeRole: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-50 sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:top-[max(1.5rem,env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#edf4e8_100%)] text-[#263f2a] shadow-[0_14px_34px_rgba(45,71,44,0.18)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#223326] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6b52]"
        aria-label="Open app menu"
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[2.7]">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <div
        className={`absolute right-0 mt-3 w-[min(82vw,18rem)] rounded-[1.35rem] border border-white/70 bg-[rgba(252,254,249,0.96)] p-2 shadow-[0_24px_70px_rgba(37,46,34,0.2)] backdrop-blur-2xl transition ${
          isOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <button type="button" onClick={onDashboard} className="w-full rounded-[1rem] px-4 py-3 text-left text-sm font-semibold text-[#243025] transition hover:bg-[#eef5e8]">
          Home
        </button>
        <button type="button" onClick={onBrowseRestaurants} className="w-full rounded-[1rem] px-4 py-3 text-left text-sm font-semibold text-[#243025] transition hover:bg-[#eef5e8]">
          Browse restaurants
        </button>
        <button type="button" onClick={onChangeRole} className="w-full rounded-[1rem] px-4 py-3 text-left text-sm font-semibold text-[#243025] transition hover:bg-[#eef5e8]">
          Change role
        </button>
        <button type="button" onClick={onSignOut} className="w-full rounded-[1rem] px-4 py-3 text-left text-sm font-semibold text-[#8b2d25] transition hover:bg-[#fff1ec]">
          Sign out
        </button>
      </div>
    </div>
  );
}

function toneFromText(message: string): "neutral" | "success" | "warning" | "error" {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("successful") || lowerMessage.includes("added") || lowerMessage.includes("created") || lowerMessage.includes("loaded")) {
    return "success";
  }

  if (lowerMessage.includes("offline") || lowerMessage.includes("disconnect") || lowerMessage.includes("unable") || lowerMessage.includes("invalid") || lowerMessage.includes("mismatch") || lowerMessage.includes("does not match")) {
    return "error";
  }

  if (lowerMessage.includes("checking") || lowerMessage.includes("pending")) {
    return "warning";
  }

  return "neutral";
}

function StatusBanner({ message }: { message: string }) {
  const tone = toneFromText(message);
  const styles = {
    neutral: "border-[#b9c6b0] bg-[linear-gradient(135deg,rgba(245,248,240,0.98)_0%,rgba(225,234,216,0.96)_100%)] text-[#2f4132] shadow-[0_14px_30px_rgba(58,78,57,0.12)]",
    success: "border-[#7fa071] bg-[linear-gradient(135deg,rgba(232,247,228,0.98)_0%,rgba(194,225,181,0.98)_100%)] text-[#204026] shadow-[0_14px_30px_rgba(53,92,52,0.16)]",
    warning: "border-[#d3a94b] bg-[linear-gradient(135deg,rgba(252,241,210,0.99)_0%,rgba(245,220,147,0.97)_100%)] text-[#6b4f13] shadow-[0_14px_30px_rgba(120,94,25,0.16)]",
    error: "border-[#cf7b6f] bg-[linear-gradient(135deg,rgba(251,230,224,0.99)_0%,rgba(245,199,191,0.97)_100%)] text-[#6d2e28] shadow-[0_14px_30px_rgba(128,58,50,0.16)]",
  } as const;

  const symbols = {
    neutral: "ℹ",
    success: "✓",
    warning: "!",
    error: "⚠",
  } as const;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden rounded-[1.2rem] border px-4 py-3 text-sm font-semibold ${styles[tone]}`}
    >
      <div className="absolute left-0 top-0 h-full w-1.5 bg-current opacity-45" />
      <div className="flex items-start gap-3 pl-2">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-sm font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          {symbols[tone]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] opacity-80">Live status</p>
          <p className="mt-1 leading-6">{message}</p>
        </div>
      </div>
    </div>
  );
}

function createFallbackDashboard(role: UserRole, restaurants: RestaurantCard[]): DashboardData {
  if (role === "delivery") {
    return {
      role,
      source: "fallback",
      stats: { activeTrips: 2, completedToday: 24, earningsToday: "₹1,240" },
      currentPosition: "Near Lake Bridge",
      nextDrop: "Sector 12, Block C",
      timeToReach: "14 min",
      activeTrips: [
        { id: 1, customer: "Customer Demo", pickup: "Green Fork", dropoff: "Sector 12, Block C", status: "Heading to customer", etaMinutes: 14, currentLocation: "Near Lake Bridge", restaurantName: "Green Fork", total: 348, items: [{ name: "Quinoa Power Bowl", quantity: 1, price: 189 }, { name: "Avocado Wrap", quantity: 1, price: 159 }] },
        { id: 2, customer: "Riya Sharma", pickup: "Spice Harbor", dropoff: "Market Heights", status: "Picked up", etaMinutes: 21, currentLocation: "Main Road checkpoint", restaurantName: "Spice Harbor", total: 429, items: [{ name: "Paneer Tikka Platter", quantity: 1, price: 249 }, { name: "Butter Naan Combo", quantity: 1, price: 180 }] },
      ],
    } as unknown as DashboardData;
  }

  if (role === "restaurant") {
    return {
      role,
      source: "fallback",
      profile: { name: "Restaurant Owner", branch: "Market Road", ordersPending: 7, kitchenStatus: "Busy" },
      restaurantOptions: restaurants,
      pendingOrders: [
        { id: "SB-301", customer: "Aarav", items: "2 curries, rice", status: "Preparing", due: "12 min" },
        { id: "SB-302", customer: "Nila", items: "Pizza + pasta", status: "Packed", due: "8 min" },
      ],
      menu: ["Paneer Bowl", "Veg Wrap", "Tandoori Platter", "Cold Drinks"],
    };
  }

  if (role === "platform") {
    return {
      role,
      source: "fallback",
      totals: { users: 4, restaurants: restaurants.length, activeOrders: 39, deliveries: 52 },
      recentUsers: [
        { fullName: "Customer Demo", identifier: "customer@example.com", role: "customer" },
        { fullName: "Delivery Demo", identifier: "9876543210", role: "delivery" },
        { fullName: "Restaurant Demo", identifier: "restaurant@example.com", role: "restaurant" },
        { fullName: "Platform Demo", identifier: "platform@example.com", role: "platform" },
      ],
      recentRestaurants: restaurants,
      activity: [
        "Restaurant owner logged in from Market Road",
        "Delivery partner accepted order SB-301",
        "New customer registration completed",
      ],
    };
  }

  return {
    role: "customer",
    source: "fallback",
    activeOrder: {
      id: "SB-2041",
      restaurant: restaurants[0]?.name ?? "Green Fork",
      status: "On the way",
      rider: "Aman",
      etaMinutes: 18,
      address: "Sector 12, Block C",
      total: 348,
      items: [
        { name: "Quinoa Power Bowl", quantity: 1, price: 189 },
        { name: "Avocado Wrap", quantity: 1, price: 159 },
      ],
    },
    liveOrders: [
      {
        id: 2041,
        restaurantId: restaurants[0]?.id ?? 1,
        restaurantName: restaurants[0]?.name ?? "Green Fork",
        customerIdentifier: "guest",
        status: "On the way",
        rider: "Aman",
        etaMinutes: 18,
        address: "Sector 12, Block C",
        total: 348,
        items: [
          { name: "Quinoa Power Bowl", quantity: 1, price: 189 },
          { name: "Avocado Wrap", quantity: 1, price: 159 },
        ],
      },
      {
        id: 2042,
        restaurantId: restaurants[1]?.id ?? 2,
        restaurantName: restaurants[1]?.name ?? "Spice Harbor",
        customerIdentifier: "guest",
        status: "Preparing",
        rider: "Ravi",
        etaMinutes: 24,
        address: "Market Heights",
        total: 429,
        items: [
          { name: "Paneer Tikka Platter", quantity: 1, price: 249 },
          { name: "Butter Naan Combo", quantity: 1, price: 180 },
        ],
      },
    ],
    timeline: ["Restaurant accepted", "Order packed", "Picked up by rider", "Arriving soon"],
    restaurants,
  } as DashboardData;
}

export function AuthLanding() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const [stage, setStage] = useState<Stage>(() => {
    if (typeof window === "undefined") return "role";
    const savedStage = window.localStorage.getItem("swiftbite.stage") as Stage;
    const validStages: Stage[] = ["role", "login", "dashboard", "continue", "restaurants", "restaurant-menu", "checkout"];
    if (savedStage && validStages.includes(savedStage)) {
      return savedStage;
    }
    return "role";
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    if (typeof window === "undefined") return "customer";
    const savedRole = window.localStorage.getItem("swiftbite.selectedRole");
    return savedRole === "customer" || savedRole === "delivery" || savedRole === "restaurant" || savedRole === "platform" ? savedRole : "customer";
  });
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    if (typeof window === "undefined") return "login";
    const savedAuthMode = window.localStorage.getItem("swiftbite.authMode");
    return savedAuthMode === "register" ? "register" : "login";
  });
  const [loginMode, setLoginMode] = useState<LoginMode>(() => {
    if (typeof window === "undefined") return "email";
    const savedLoginMode = window.localStorage.getItem("swiftbite.loginMode");
    return savedLoginMode === "phone" ? "phone" : "email";
  });
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaChallenge>(() => createCaptchaChallenge());
  const [captchaInput, setCaptchaInput] = useState("");
  const [statusMessage, setStatusMessage] = useState("Sign in to continue.");
  const [backendState, setBackendState] = useState("checking backend...");
  const [restaurantSource, setRestaurantSource] = useState("loading restaurant options...");
  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [selectedDeliveryTripId, setSelectedDeliveryTripId] = useState<number | null>(null);
  const [selectedRestaurantOptionId, setSelectedRestaurantOptionId] = useState<number | null>(null);
  const [selectedPlatformUserIdentifier, setSelectedPlatformUserIdentifier] = useState<string | null>(null);
  const [selectedPlatformRestaurantId, setSelectedPlatformRestaurantId] = useState<number | null>(null);
  const [selectedPlatformSection, setSelectedPlatformSection] = useState<PlatformSection>("overview");
  const [platformNotifications, setPlatformNotifications] = useState<PlatformNotification[]>([]);
  const [selectedPlatformNotificationId, setSelectedPlatformNotificationId] = useState<number | null>(null);
  const [restaurantMenuCart, setRestaurantMenuCart] = useState<MenuCartItem[]>([]);
  const [isRestaurantCartOpen, setIsRestaurantCartOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("Sector 12, Block C");
  const [deliveryLandmark, setDeliveryLandmark] = useState("Near Lake Bridge");
  const [riderNotes, setRiderNotes] = useState("Call on arrival and keep the order at the gate.");
  const [contactNumber, setContactNumber] = useState("9876543210");
  const [checkoutMethod, setCheckoutMethod] = useState<CheckoutMethod>("upi");
  const [restaurantFormStatus, setRestaurantFormStatus] = useState("");
  const [restaurantCreateStep, setRestaurantCreateStep] = useState<1 | 2>(1);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number | null>(null);
  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [newRestaurantCuisine, setNewRestaurantCuisine] = useState("");
  const [newRestaurantLocation, setNewRestaurantLocation] = useState("");
  const [newRestaurantEta, setNewRestaurantEta] = useState("");
  const [newRestaurantRating, setNewRestaurantRating] = useState("");
  const [newRestaurantDescription, setNewRestaurantDescription] = useState("");
  const [newRestaurantFeatured, setNewRestaurantFeatured] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [viewportHeight, setViewportHeight] = useState(900);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [riderProfileDraft, setRiderProfileDraft] = useState<RiderProfileDraft>({
    userIdentifier: "9876543210",
    fullName: "Delivery Demo",
    profileImageUrl: "/message-icon.svg",
    age: "29",
    gender: "Male",
    phoneNumber: "9876543210",
    alternatePhoneNumber: "9876500000",
    email: "delivery@example.com",
    residentialAddress: "Sector 12, Block C",
    cityState: "Kolkata, West Bengal",
    emergencyContact: "Ravi: 9876501234",
    vehicleType: "Scooter",
    vehicleNumber: "WB20AB1234",
    drivingLicenseNumber: "DL-DEL-123456",
    availabilityStatus: "available",
    isOnline: true,
    deliveryZone: "Central Kolkata",
    joiningDate: "2024-01-12",
    completedOrdersCount: "284",
    activeDeliveries: "2",
    earningsToday: "₹1,240",
    verificationStatus: "verified",
    idProofUrl: "",
    drivingLicenseUrl: "",
    profilePhotoUrl: "",
  });
  const [restaurantProfileDraft, setRestaurantProfileDraft] = useState<RestaurantProfileDraft>(() => createEmptyRestaurantProfileDraft());
  const [menuItemDraft, setMenuItemDraft] = useState<MenuItemDraft>(() => createEmptyMenuItemDraft());
  const [riderProfileStatus, setRiderProfileStatus] = useState("");
  const [restaurantProfileStatus, setRestaurantProfileStatus] = useState("");
  const [menuItemStatus, setMenuItemStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [chatSessionId] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const savedSessionId = window.localStorage.getItem("swiftbite.chatSessionId");

    if (savedSessionId) {
      return savedSessionId;
    }

    const generatedSessionId = window.crypto?.randomUUID?.() ?? `swiftbite-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem("swiftbite.chatSessionId", generatedSessionId);
    return generatedSessionId;
  });
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, role: "assistant", text: "Hi. Ask me where to tap in SwiftBite for login, ordering, checkout, tracking, menu updates, or signing out.", timestamp: new Date().toISOString() },
  ]);
  const chatbotRootRef = useRef<Root | null>(null);
  const chatMessagesRef = useRef(chatMessages);

  const selectedRoleCard = useMemo(
    () => roleCards.find((card) => card.id === selectedRole) ?? roleCards[0],
    [selectedRole]
  );

  const roleWheelCards = useMemo(() => {
    const selectedIndex = roleCards.findIndex((card) => card.id === selectedRole);

    return roleCards.map((card, index) => {
      const rawOffset = index - selectedIndex;
      const normalizedOffset = ((rawOffset % roleCards.length) + roleCards.length) % roleCards.length;
      const offset = normalizedOffset > roleCards.length / 2 ? normalizedOffset - roleCards.length : normalizedOffset;

      return { card, offset };
    });
  }, [selectedRole]);

  const helperText = loginMode === "email" ? "name@example.com" : "10-digit mobile number";

  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

  useEffect(() => {
    const activeDashboard = dashboardData as any;

    if (selectedRole === "delivery" && activeDashboard?.riderProfile) {
      const riderProfile = activeDashboard.riderProfile;
      setRiderProfileDraft({
        userIdentifier: riderProfile.userIdentifier ?? riderProfile.phoneNumber ?? "9876543210",
        fullName: riderProfile.fullName ?? "Delivery Demo",
        profileImageUrl: riderProfile.profileImageUrl ?? "",
        age: String(riderProfile.age ?? 29),
        gender: riderProfile.gender ?? "Male",
        phoneNumber: riderProfile.phoneNumber ?? "9876543210",
        alternatePhoneNumber: riderProfile.alternatePhoneNumber ?? "",
        email: riderProfile.email ?? "",
        residentialAddress: riderProfile.residentialAddress ?? "",
        cityState: riderProfile.cityState ?? "",
        emergencyContact: riderProfile.emergencyContact ?? "",
        vehicleType: riderProfile.vehicleType ?? "Scooter",
        vehicleNumber: riderProfile.vehicleNumber ?? "",
        drivingLicenseNumber: riderProfile.drivingLicenseNumber ?? "",
        availabilityStatus: riderProfile.availabilityStatus ?? "available",
        isOnline: Boolean(riderProfile.isOnline),
        deliveryZone: riderProfile.deliveryZone ?? "",
        joiningDate: riderProfile.joiningDate ?? "2024-01-12",
        completedOrdersCount: String(riderProfile.completedOrdersCount ?? 0),
        activeDeliveries: String(riderProfile.activeDeliveries ?? 0),
        earningsToday: riderProfile.earningsToday ?? "₹0",
        verificationStatus: riderProfile.verificationStatus ?? "pending",
        idProofUrl: riderProfile.idProofUrl ?? "",
        drivingLicenseUrl: riderProfile.drivingLicenseUrl ?? "",
        profilePhotoUrl: riderProfile.profilePhotoUrl ?? "",
      });
    }

    if (selectedRole === "restaurant" && activeDashboard?.restaurantProfile) {
      const restaurantIdentifier = activeDashboard.restaurantProfile.userIdentifier ?? "";
      setRestaurantProfileDraft(createEmptyRestaurantProfileDraft(restaurantIdentifier));
    }
  }, [dashboardData, selectedMenuItemId, selectedRole]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("swiftbite.selectedRole", selectedRole);
  }, [selectedRole]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("swiftbite.authMode", authMode);
  }, [authMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("swiftbite.loginMode", loginMode);
  }, [loginMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [stage, selectedRestaurantId, selectedRole]);

  // Synchronize stage state with browser history (popstate) and save to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.history.state || !window.history.state.stage) {
      window.history.replaceState({ stage }, "");
    }

    const handlePopState = (event: PopStateEvent) => {
      const stateFromHistory = event.state;
      if (stateFromHistory && stateFromHistory.stage) {
        const nextStage = stateFromHistory.stage as Stage;
        const currentStage = window.localStorage.getItem("swiftbite.stage") as Stage | null;
        const protectedStages: Stage[] = ["dashboard", "continue", "restaurants", "restaurant-menu", "checkout"];

        if (currentStage === "dashboard" && (nextStage === "login" || nextStage === "role")) {
          window.history.pushState({ stage: "dashboard" }, "");
          setStage("dashboard");
          return;
        }

        if (protectedStages.includes(currentStage as Stage) && (nextStage === "login" || nextStage === "role")) {
          window.history.pushState({ stage: currentStage }, "");
          setStage(currentStage as Stage);
          return;
        }

        setStage(stateFromHistory.stage);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("swiftbite.stage", stage);

    const currentHistoryStage = window.history.state?.stage;
    if (currentHistoryStage !== stage) {
      window.history.pushState({ stage }, "");
    }
  }, [stage]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(display-mode: standalone)");

    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
      setIsStandaloneMode(media.matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    media.addEventListener("change", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      media.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const response = await fetch(`${apiBaseUrl}/health`);
        const data = (await response.json()) as { api?: string; database?: string; message?: string };

        if (!cancelled) {
          setBackendState(
            data.message ?? `API ${data.api ?? (response.ok ? "online" : "offline")} • DB ${data.database ?? "unknown"}`
          );
        }
      } catch {
        if (!cancelled) setBackendState("API offline • please connect MySQL");
      } finally {
        if (!cancelled) setIsBooting(false);
      }
    }

    async function loadDashboard() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/dashboard/${selectedRole}`);
        const payload = (await response.json()) as DashboardData;

        if (!cancelled) {
          setDashboardData(payload);
        }
      } catch {
        if (!cancelled) setDashboardData(createFallbackDashboard(selectedRole, fallbackRestaurantsForUi));
      }
    }

    boot();
    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, selectedRole]);

  // Poll dashboard periodically while on the dashboard to show realtime changes
  useEffect(() => {
    let intervalId: number | null = null;

    async function fetchDashboard() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/dashboard/${selectedRole}`);
        if (!response.ok) return;
        const payload = await response.json();
        setDashboardData(payload);
      } catch {
        // ignore
      }
    }

    if (stage === "dashboard") {
      // initial fetch
      fetchDashboard();
      // poll every 6 seconds
      intervalId = window.setInterval(fetchDashboard, 6000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [apiBaseUrl, selectedRole, stage]);

  useEffect(() => {
    if (selectedRole !== "platform") {
      return;
    }

    const platformDashboard = dashboardData && dashboardData.role === "platform" ? dashboardData : null;
    const activityEntries = (platformDashboard?.activity ?? []) as string[];

    if (activityEntries.length === 0) {
      return;
    }

    setPlatformNotifications((current) => {
      const seenDetails = new Set(current.map((notification) => notification.details));
      const nextNotifications = activityEntries
        .filter((item) => !seenDetails.has(item))
        .map((item) => createNotification("App activity", item));

      if (nextNotifications.length === 0) {
        return current;
      }

      return [...nextNotifications, ...current].slice(0, 12);
    });
  }, [dashboardData, selectedRole]);

  useEffect(() => {
    const rootId = "swiftbite-chatbot-root";
    let mountPoint = document.getElementById(rootId) as HTMLDivElement | null;

    if (!mountPoint) {
      mountPoint = document.createElement("div");
      mountPoint.id = rootId;
      document.body.appendChild(mountPoint);
    }

    chatbotRootRef.current = createRoot(mountPoint);

    return () => {
      chatbotRootRef.current?.unmount();
      chatbotRootRef.current = null;
    };
  }, []);

  function chooseRole(role: UserRole) {
    setSelectedRole(role);
  }

  function pushPlatformNotification(title: string, details: string) {
    setPlatformNotifications((current) => [createNotification(title, details), ...current].slice(0, 12));
  }

  function openRestaurantMenu(restaurantId: number) {
    setSelectedRestaurantId(restaurantId);
    setRestaurantMenuCart([]);
    setIsRestaurantCartOpen(false);
    setStage("restaurant-menu");
  }

  function openRestaurantCheckout() {
    setIsRestaurantCartOpen(false);
    setStage("checkout");
  }

  async function placeOrder() {
    if (!selectedRestaurantId || restaurantMenuCart.length === 0) {
      setStatusMessage("Add items to cart before placing an order.");
      return;
    }

    const payload = {
      restaurantId: selectedRestaurantId,
      // `dashboard` is a union type - only some variants include `restaurants`.
      // Safely derive a restaurant list: prefer dashboard restaurants when present,
      // otherwise fall back to the UI fallback list.
      restaurantName: (
        ((dashboard && (dashboard as any).restaurants) ?? fallbackRestaurantsForUi)
          .find((r: any) => r.id === selectedRestaurantId)
          ?.name ?? ""
      ),
      customerIdentifier: identifier || "guest",
      items: restaurantMenuCart.map((it) => ({ name: it.name, quantity: it.quantity, price: it.price })),
      address: deliveryAddress,
      contactNumber,
      notes: riderNotes,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setStatusMessage(body.message ?? "Unable to place order.");
        return;
      }

      const result = await response.json();
      setStatusMessage(result.message ?? "Order placed.");
      setRestaurantMenuCart([]);
      setIsRestaurantCartOpen(false);
      setStage("dashboard");
    } catch (err) {
      setStatusMessage("Network error placing order.");
    }
  }

  async function markOrderAsComplete(orderId: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      const payload = (await response.json()) as { message?: string; order?: { id?: number; status?: string } };

      if (!response.ok) {
        setStatusMessage(payload.message ?? "Unable to update order status.");
        return;
      }

      setDashboardData((current) => {
        if (!current) {
          return current;
        }

        if (current.role === "delivery") {
          const nextTrips = current.activeTrips.map((trip) =>
            trip.id === orderId
              ? { ...trip, status: payload.order?.status ?? "completed" }
              : trip
          );

          return {
            ...current,
            activeTrips: nextTrips,
          };
        }

        if (current.role === "customer") {
          const nextLiveOrders = (((current as any).liveOrders ?? []) as LiveOrderSummary[]).map((order) =>
            order.id === orderId
              ? { ...order, status: payload.order?.status ?? "completed" }
              : order
          );

          return {
            ...current,
            liveOrders: nextLiveOrders,
            activeOrder:
              current.activeOrder && Number(current.activeOrder.id) === orderId
                ? { ...current.activeOrder, status: payload.order?.status ?? "completed" }
                : current.activeOrder,
          };
        }

        return current;
      });

      setStatusMessage(`Order #${orderId} marked complete.`);
    } catch {
      setStatusMessage("Unable to reach the backend while updating order status.");
    }
  }

  function getMenuPrice(restaurantId: number, dishIndex: number) {
    return 79 + restaurantId * 7 + dishIndex * 18;
  }

  function updateRestaurantMenuCart(dishName: string, price: number, delta: 1 | -1) {
    setRestaurantMenuCart((current) => {
      const existingIndex = current.findIndex((item) => item.name === dishName);

      if (existingIndex < 0 && delta < 0) {
        return current;
      }

      if (existingIndex < 0) {
        return [...current, { name: dishName, quantity: 1, price }];
      }

      const nextItems = [...current];
      const nextQuantity = nextItems[existingIndex].quantity + delta;

      if (nextQuantity <= 0) {
        nextItems.splice(existingIndex, 1);
        return nextItems;
      }

      nextItems[existingIndex] = { ...nextItems[existingIndex], quantity: nextQuantity };
      return nextItems;
    });
  }

  const restaurantMenuSubtotal = restaurantMenuCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const restaurantMenuItemCount = restaurantMenuCart.reduce((sum, item) => sum + item.quantity, 0);

  function cycleRole(direction: "left" | "right") {
    const currentIndex = roleCards.findIndex((card) => card.id === selectedRole);
    const nextIndex = direction === "right"
      ? (currentIndex + 1) % roleCards.length
      : (currentIndex - 1 + roleCards.length) % roleCards.length;

    chooseRole(roleCards[nextIndex].id);
  }

  function refreshCaptcha() {
    setCaptcha(createCaptchaChallenge());
    setCaptchaInput("");
  }

  function switchAuthMode(mode: AuthMode) {
    setAuthMode(mode);
    setStatusMessage(mode === "login" ? "Sign in to continue." : "Create your account to continue.");
  }

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authMode === "register" && fullName.trim().length < 2) {
      setStatusMessage("Add your full name.");
      return;
    }

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();
    const cleanFullName = fullName.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setStatusMessage(authMode === "login" ? "Enter your login details." : "Complete all required fields.");
      return;
    }

    if (loginMode === "email" && !isValidEmail(cleanIdentifier)) {
      setStatusMessage("Enter a valid email.");
      return;
    }

    if (loginMode === "phone" && !isValidPhone(cleanIdentifier)) {
      setStatusMessage("Enter a valid mobile number.");
      return;
    }

    if (Number(captchaInput.trim()) !== captcha.answer) {
      setStatusMessage("Captcha mismatch.");
      refreshCaptcha();
      return;
    }

    if (authMode === "register" && cleanPassword !== confirmPassword.trim()) {
      setStatusMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(authMode === "login" ? `${apiBaseUrl}/api/auth/login` : `${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          authMode === "login"
            ? { identifier: cleanIdentifier, password: cleanPassword, role: selectedRole, loginMode }
            : { fullName: cleanFullName, identifier: cleanIdentifier, password: cleanPassword, role: selectedRole, loginMode }
        ),
      });

      const payload = (await response.json()) as { message?: string; user?: { fullName?: string } };

      if (!response.ok) {
        setStatusMessage(payload.message ?? "Login failed.");
        return;
      }

      if (authMode === "register") {
        setStatusMessage(`${payload.message ?? "Account created."} Please log in with the same details.`);
        setAuthMode("login");
        setPassword("");
        setConfirmPassword("");
        refreshCaptcha();
        return;
      }

      setStatusMessage(`${payload.message ?? "Login successful."} Welcome ${payload.user?.fullName ?? "there"}.`);
      setStage("dashboard");
    } catch {
      setStatusMessage("Unable to reach the backend server at the moment.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRestaurantCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedRole !== "restaurant") {
      return;
    }

    const cleanName = newRestaurantName.trim();
    const cleanCuisine = newRestaurantCuisine.trim();
    const cleanLocation = newRestaurantLocation.trim();
    const cleanEta = newRestaurantEta.trim();
    const cleanRating = newRestaurantRating.trim();
    const cleanDescription = newRestaurantDescription.trim();

    const missingStepOneFields: string[] = [];

    if (!cleanName) missingStepOneFields.push("restaurant name");
    if (!cleanCuisine) missingStepOneFields.push("cuisine");
    if (!cleanLocation) missingStepOneFields.push("location");
    if (!cleanEta) missingStepOneFields.push("ETA minutes");
    if (!cleanRating) missingStepOneFields.push("rating");
    if (!cleanDescription) missingStepOneFields.push("description");

    if (missingStepOneFields.length > 0) {
      setRestaurantFormStatus(`Step 1/2 missing: ${missingStepOneFields.join(", ")}.`);
      return;
    }

    if (restaurantCreateStep === 1) {
      setRestaurantProfileDraft((current) => ({
        ...current,
        restaurantName: current.restaurantName || cleanName,
        cuisineType: current.cuisineType || cleanCuisine,
        cityState: current.cityState || cleanLocation,
        description: current.description || cleanDescription,
      }));
      setRestaurantCreateStep(2);
      setRestaurantFormStatus("Step 1/2 complete. Fill Step 2/2 restaurant profile, then add the restaurant.");
      return;
    }

    const profileRestaurantName = restaurantProfileDraft.restaurantName.trim() || cleanName;
    const profileOwnerName = restaurantProfileDraft.ownerName.trim();
    const profileContactNumber = restaurantProfileDraft.contactNumber.trim();
    const profileEmail = restaurantProfileDraft.email.trim();
    const profileAddress = restaurantProfileDraft.restaurantAddress.trim();
    const profileCityState = restaurantProfileDraft.cityState.trim();
    const profileCuisineType = restaurantProfileDraft.cuisineType.trim() || cleanCuisine;
    const profileGstLicenseNumber = restaurantProfileDraft.gstLicenseNumber.trim();
    const profileOpeningHours = restaurantProfileDraft.openingHours.trim();
    const profileDeliveryRadius = restaurantProfileDraft.deliveryRadius.trim();
    const profileDescription = restaurantProfileDraft.description.trim() || cleanDescription;

    const missingStepTwoFields: string[] = [];

    if (!profileRestaurantName) missingStepTwoFields.push("restaurant name");
    if (!profileOwnerName) missingStepTwoFields.push("owner name");
    if (!profileContactNumber) missingStepTwoFields.push("contact number");
    if (!profileEmail) missingStepTwoFields.push("email");
    if (!profileAddress) missingStepTwoFields.push("restaurant address");
    if (!profileCityState) missingStepTwoFields.push("city / state");
    if (!profileCuisineType) missingStepTwoFields.push("cuisine type");
    if (!profileGstLicenseNumber) missingStepTwoFields.push("GST / license number");
    if (!profileOpeningHours) missingStepTwoFields.push("opening hours");
    if (!profileDeliveryRadius) missingStepTwoFields.push("delivery radius");
    if (!profileDescription) missingStepTwoFields.push("profile description");

    if (missingStepTwoFields.length > 0) {
      setRestaurantFormStatus(`Step 2/2 missing: ${missingStepTwoFields.join(", ")}.`);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/restaurants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          cuisine: cleanCuisine,
          location: cleanLocation,
          etaMinutes: Number(cleanEta),
          rating: Number(cleanRating),
          description: cleanDescription,
          featured: newRestaurantFeatured,
        }),
      });

      const payload = (await response.json()) as { message?: string; source?: string; restaurant?: RestaurantCard };

      if (!response.ok) {
        setRestaurantFormStatus(payload.message ?? "Unable to add restaurant.");
        return;
      }

      const restaurantIdentifier = restaurantProfileDraft.userIdentifier.trim() || createRestaurantIdentifier(cleanName);
      const profileResponse = await fetch(`${apiBaseUrl}/api/restaurant-profiles/${encodeURIComponent(restaurantIdentifier)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIdentifier: restaurantIdentifier,
          restaurantName: profileRestaurantName,
          restaurantLogoUrl: restaurantProfileDraft.restaurantLogoUrl,
          coverImageUrl: restaurantProfileDraft.coverImageUrl,
          ownerName: profileOwnerName,
          contactNumber: profileContactNumber,
          email: profileEmail,
          restaurantAddress: profileAddress,
          cityState: profileCityState,
          cuisineType: profileCuisineType,
          gstLicenseNumber: profileGstLicenseNumber,
          openingHours: profileOpeningHours,
          deliveryRadius: profileDeliveryRadius,
          description: profileDescription,
          verificationStatus: restaurantProfileDraft.verificationStatus,
        }),
      });

      const profilePayload = (await profileResponse.json()) as { message?: string; profile?: RestaurantProfileDraft };

      if (!profileResponse.ok) {
        setRestaurantFormStatus(`Restaurant added, but profile save failed: ${profilePayload.message ?? "Please retry Step 2/2."}`);
        return;
      }

      setRestaurantFormStatus(`${payload.message ?? "Restaurant added."} Step 1/2 and Step 2/2 complete. Source: ${payload.source ?? "backend"}.`);
      setRestaurantProfileStatus(profilePayload.message ?? "Restaurant profile saved.");
      if (!payload.restaurant) {
        setNewRestaurantName("");
        setNewRestaurantCuisine("");
        setNewRestaurantLocation("");
        setNewRestaurantEta("");
        setNewRestaurantRating("");
        setNewRestaurantDescription("");
        setNewRestaurantFeatured(false);
        setRestaurantCreateStep(1);
        setRestaurantProfileDraft(createEmptyRestaurantProfileDraft());
        return;
      }

      const addedRestaurant: RestaurantCard = payload.restaurant;
      setDashboardData((current) => {
        if (!current || current.role !== "restaurant") {
          return current;
        }

        return {
          ...current,
          restaurantOptions: [addedRestaurant, ...current.restaurantOptions],
        };
      });
      setSelectedRestaurantOptionId(addedRestaurant.id);
      pushPlatformNotification("Restaurant added", `${addedRestaurant.name} is now live in the restaurant list.`);
      setNewRestaurantName("");
      setNewRestaurantCuisine("");
      setNewRestaurantLocation("");
      setNewRestaurantEta("");
      setNewRestaurantRating("");
      setNewRestaurantDescription("");
      setNewRestaurantFeatured(false);
      setRestaurantCreateStep(1);
      setRestaurantProfileDraft(createEmptyRestaurantProfileDraft());
    } catch {
      setRestaurantFormStatus("Unable to reach the backend while adding the restaurant.");
    }
  }

  async function uploadImageFile(file: File, ownerType: "rider" | "restaurant" | "menu-item", ownerIdentifier: string, purpose: string, onSuccess: (publicUrl: string) => void) {
    const previewUrl = URL.createObjectURL(file);
    onSuccess(previewUrl);

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    try {
      const response = await fetch(`${apiBaseUrl}/api/uploads/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerType,
          ownerIdentifier,
          purpose,
          fileName: file.name,
          mimeType: file.type || "image/png",
          dataUrl,
        }),
      });

      const payload = (await response.json()) as { image?: { publicUrl?: string }; message?: string };

      if (!response.ok) {
        setUploadStatus(payload.message ?? "Image upload failed.");
        return;
      }

      const publicUrl = payload.image?.publicUrl ?? previewUrl;
      onSuccess(publicUrl);
      setUploadStatus(`${purpose} image uploaded.`);
    } catch {
      setUploadStatus("Unable to upload the image right now.");
    }
  }

  async function handleRiderProfileSave() {
    try {
      const response = await fetch(`${apiBaseUrl}/api/rider-profiles/${encodeURIComponent(riderProfileDraft.userIdentifier)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(riderProfileDraft),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setRiderProfileStatus(payload.message ?? "Unable to save rider profile.");
        return;
      }

      setRiderProfileStatus(payload.message ?? "Rider profile saved.");
    } catch {
      setRiderProfileStatus("Unable to save rider profile right now.");
    }
  }

  async function handleRestaurantProfileSave() {
    try {
      const restaurantIdentifier = restaurantProfileDraft.userIdentifier || ((dashboardData as any)?.restaurantProfile?.userIdentifier ?? "");
      const response = await fetch(`${apiBaseUrl}/api/restaurant-profiles/${encodeURIComponent(restaurantIdentifier)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...restaurantProfileDraft,
          userIdentifier: restaurantIdentifier,
        }),
      });

      const payload = (await response.json()) as { message?: string; profile?: RestaurantProfileDraft };

      if (!response.ok) {
        setRestaurantProfileStatus(payload.message ?? "Unable to save restaurant profile.");
        return;
      }

      if (payload.profile) {
        setDashboardData((current) => {
          if (!current || current.role !== "restaurant") {
            return current;
          }

          return {
            ...current,
            restaurantProfile: payload.profile,
          };
        });
        pushPlatformNotification("Restaurant profile updated", `${payload.profile.restaurantName} profile was saved successfully.`);
      }

      setRestaurantProfileStatus(payload.message ?? "Restaurant profile saved.");
    } catch {
      setRestaurantProfileStatus("Unable to save restaurant profile right now.");
    }
  }

  async function handleMenuItemSave() {
    const editingItemId = selectedMenuItemId;
    const restaurantIdentifier = menuItemDraft.restaurantIdentifier || restaurantProfileDraft.userIdentifier || ((dashboardData as any)?.restaurantProfile?.userIdentifier ?? "");
    const endpoint = editingItemId ? `${apiBaseUrl}/api/menu-items/${editingItemId}` : `${apiBaseUrl}/api/restaurant-profiles/${encodeURIComponent(restaurantIdentifier)}/menu-items`;
    const method = selectedMenuItemId ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...menuItemDraft,
          restaurantIdentifier,
        }),
      });

      const payload = (await response.json()) as { message?: string; item?: { id?: number; dishName?: string } };

      if (!response.ok) {
        setMenuItemStatus(payload.message ?? "Unable to save menu item.");
        return;
      }

      if (payload.item?.id && editingItemId) {
        setSelectedMenuItemId(payload.item.id);
      }

      if (payload.item) {
        const savedMenuItem = payload.item as { id?: number; dishName?: string; restaurantIdentifier?: string; price?: number; category?: string; description?: string; spiceLevel?: MenuItemDraft["spiceLevel"]; vegType?: MenuItemDraft["vegType"]; isAvailable?: boolean; preparationTimeMinutes?: number; isFeatured?: boolean; isBestseller?: boolean; isRecommended?: boolean };
        setDashboardData((current) => {
          if (!current || current.role !== "restaurant") {
            return current;
          }

          const currentMenuItems = Array.isArray((current as any).menuItems) ? ((current as any).menuItems as any[]) : [];
          const nextMenuItems = editingItemId
            ? currentMenuItems.map((item) => (item.id === editingItemId ? savedMenuItem : item))
            : [savedMenuItem, ...currentMenuItems];

          return {
            ...current,
            menuItems: nextMenuItems,
            menu: nextMenuItems.map((item: any) => item.dishName ?? item.name ?? ""),
          };
        });
        pushPlatformNotification(
          editingItemId ? "Menu item updated" : "Menu item added",
          `${savedMenuItem.dishName ?? "A menu item"} is now reflected in the restaurant menu.`
        );
      }

      setMenuItemStatus(payload.message ?? "Menu item saved.");
    } catch {
      setMenuItemStatus("Unable to save menu item right now.");
    }
  }

  async function handleMenuItemDelete(itemId: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/menu-items/${itemId}`, { method: "DELETE" });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMenuItemStatus(payload.message ?? "Unable to delete menu item.");
        return;
      }

      setMenuItemStatus(payload.message ?? "Menu item deleted.");
      pushPlatformNotification("Menu item deleted", `Menu item #${itemId} was removed from the restaurant menu.`);
      if (selectedMenuItemId === itemId) {
        setSelectedMenuItemId(null);
      }
    } catch {
      setMenuItemStatus("Unable to delete menu item right now.");
    }
  }

  async function handleChatSubmit() {
    const cleanMessage = chatInput.trim();

    if (!cleanMessage || isChatSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: cleanMessage,
      timestamp: new Date().toISOString(),
    };

    const assistantMessageId = userMessage.id + 1;
    const conversation = [...chatMessagesRef.current, userMessage].slice(-12);

    setChatMessages((current) => [...current, userMessage]);
    setChatInput("");
    setIsChatSending(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/chatbot/assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: chatSessionId, messages: conversation, role: selectedRole }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };

        setChatMessages((current) => [
          ...current,
          {
            id: assistantMessageId,
            role: "assistant",
            text: cleanChatbotReply(payload.message ?? "Sorry, I could not answer right now."),
            timestamp: new Date().toISOString(),
          },
        ]);
        return;
      }

      if (!response.body) {
        const fallbackReply = cleanChatbotReply(await response.text()) || "I can help with that.";

        setChatMessages((current) => [
          ...current,
          {
            id: assistantMessageId,
            role: "assistant",
            text: fallbackReply,
            timestamp: new Date().toISOString(),
          },
        ]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedReply = "";
      let assistantStarted = false;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });

        if (!chunk) {
          continue;
        }

        accumulatedReply += chunk;
        const displayReply = cleanChatbotReply(accumulatedReply) || "I can help with that.";

        if (!assistantStarted) {
          assistantStarted = true;
          setChatMessages((current) => [
            ...current,
            {
              id: assistantMessageId,
              role: "assistant",
              text: displayReply,
              timestamp: new Date().toISOString(),
            },
          ]);
          continue;
        }

        setChatMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId ? { ...message, text: displayReply } : message
          )
        );
      }

      if (!assistantStarted) {
        setChatMessages((current) => [
          ...current,
          {
            id: assistantMessageId,
            role: "assistant",
            text: "I can help with that.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setChatMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          text: "I could not reach the chatbot service right now. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  }

  const chatbotWidget = (
    <ChatWidget
      isOpen={isChatOpen}
      isSending={isChatSending}
      messages={chatMessages}
      chatInput={chatInput}
      onToggle={() => setIsChatOpen((current) => !current)}
      onInputChange={setChatInput}
      onSubmit={handleChatSubmit}
      onSuggestionClick={(value) => {
        setChatInput(value);
        setIsChatOpen(true);
      }}
    />
  );

  useEffect(() => {
    if (!chatbotRootRef.current) {
      return;
    }

    chatbotRootRef.current.render(chatbotWidget);
  }, [chatbotWidget]);

  function handleGoBack() {
    if (stage === "dashboard") {
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      if (stage === "checkout") {
        setStage("restaurant-menu");
      } else if (stage === "restaurant-menu") {
        setStage("restaurants");
      } else if (stage === "restaurants") {
        setStage("continue");
      } else if (stage === "continue") {
        setStage("dashboard");
      } else if (stage === "login") {
        setStage("role");
      }
    }
  }

  function goToDashboardFromMenu() {
    setIsAppMenuOpen(false);
    setStage("dashboard");
  }

  function browseRestaurantsFromMenu() {
    setIsAppMenuOpen(false);
    setStage("restaurants");
  }

  function changeRoleFromMenu() {
    setIsAppMenuOpen(false);
    setStage("role");
    setStatusMessage("Select your role to continue.");
  }

  function signOutFromMenu() {
    setIsAppMenuOpen(false);
    setStage("login");
    setStatusMessage("Signed out. Sign in to continue.");
    if (typeof window !== "undefined") {
      window.localStorage.setItem("swiftbite.stage", "login");
      window.history.pushState({ stage: "login" }, "");
    }
  }

  const appMenu = stage !== "role" && stage !== "login" ? (
    <AppMenu
      isOpen={isAppMenuOpen}
      onToggle={() => setIsAppMenuOpen((current) => !current)}
      onDashboard={goToDashboardFromMenu}
      onBrowseRestaurants={browseRestaurantsFromMenu}
      onChangeRole={changeRoleFromMenu}
      onSignOut={signOutFromMenu}
    />
  ) : null;

  const globalBackButton = stage !== "role" && stage !== "dashboard" && (
    <button
      type="button"
      onClick={handleGoBack}
      className="fixed left-[max(1rem,env(safe-area-inset-left))] top-[max(1.2rem,env(safe-area-inset-top))] z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#cbd5c0] bg-[#fbfcf9]/90 text-[#2d472c] shadow-[0_10px_25px_rgba(63,78,56,0.14)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2d472c] hover:text-white hover:border-[#2d472c] hover:shadow-[0_14px_30px_rgba(45,71,44,0.26)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d472c] sm:left-[max(1.5rem,env(safe-area-inset-left))] sm:top-[max(1.5rem,env(safe-area-inset-top))]"
      aria-label="Go back"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[2.8]">
        <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  const dashboard = dashboardData ?? createFallbackDashboard(selectedRole, fallbackRestaurantsForUi);

  if (stage === "dashboard") {
    if (selectedRole === "delivery") {
      const deliveryDashboard = (dashboard.role === "delivery" ? dashboard : createFallbackDashboard("delivery", fallbackRestaurantsForUi)) as Extract<DashboardData, { role: "delivery" }>;
      const selectedTrip = (deliveryDashboard.activeTrips.find((trip) => trip.id === selectedDeliveryTripId) ?? deliveryDashboard.activeTrips[0] ?? null) as any;

      return (
        <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.20),_transparent_20%),radial-gradient(circle_at_22%_78%,_rgba(255,252,245,0.22),_transparent_36%),linear-gradient(180deg,_#f0f4e9_0%,_#d9e3d3_42%,_#bdd0bb_100%)]" />
          {globalBackButton}
          {appMenu}
          <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <SoftScreen>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite • Delivery</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Where you are right now</h1>
              <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">Track your active trips, current position, and ETA to the next drop.</p>
              <div className="mt-6 rounded-[1.5rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-5 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Route status</p>
                <p className="mt-2 text-sm text-[#5e6b5a]">Current location: {deliveryDashboard.currentPosition}</p>
                <p className="mt-1 text-sm text-[#5e6b5a]">Next drop: {deliveryDashboard.nextDrop}</p>
                <p className="mt-1 text-sm text-[#5e6b5a]">Time to reach: {deliveryDashboard.timeToReach}</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.1rem] border border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] px-4 py-3 shadow-[0_10px_24px_rgba(63,78,56,0.08)]"><span className="block text-2xl font-black text-[#1f2b21]">{deliveryDashboard.stats.activeTrips}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Active trips</span></div>
                <div className="rounded-[1.1rem] border border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] px-4 py-3 shadow-[0_10px_24px_rgba(63,78,56,0.08)]"><span className="block text-2xl font-black text-[#1f2b21]">{deliveryDashboard.stats.completedToday}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Delivered today</span></div>
                <div className="rounded-[1.1rem] border border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] px-4 py-3 shadow-[0_10px_24px_rgba(63,78,56,0.08)]"><span className="block text-2xl font-black text-[#1f2b21]">{deliveryDashboard.stats.earningsToday}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Today</span></div>
              </div>
            </SoftScreen>
            <SoftScreen>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Active deliveries</p>
              <div className="mt-4 grid gap-3">
                {deliveryDashboard.activeTrips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => setSelectedDeliveryTripId(trip.id)}
                    className={`rounded-[1.35rem] border p-4 text-left shadow-[0_10px_24px_rgba(63,78,56,0.08)] transition ${
                      selectedTrip?.id === trip.id
                        ? "border-[#bdd0b2] bg-[linear-gradient(180deg,#f3f7ef_0%,#e7f0df_100%)]"
                        : "border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] hover:bg-[#f7faf4]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-[#1f2b21]">{trip.customer}</p>
                        <p className="mt-1 text-sm text-[#5e6b5a]">{trip.pickup} → {trip.dropoff}</p>
                      </div>
                      <span className="rounded-full bg-[#4f6b52] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5f8f1]">{trip.etaMinutes} min</span>
                    </div>
                    <p className="mt-3 text-sm text-[#5e6b5a]">{trip.status}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#4f6750]">Current location: {trip.currentLocation}</p>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Selected trip</p>
                {selectedTrip ? (
                  <>
                    <p className="mt-2 text-2xl font-black text-[#1f2b21]">{selectedTrip.restaurantName ?? selectedTrip.pickup}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">Order for {selectedTrip.customer}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">{selectedTrip.pickup} → {selectedTrip.dropoff}</p>
                    <p className="mt-3 text-sm text-[#5e6b5a]">Status: {selectedTrip.status}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">Current location: {selectedTrip.currentLocation}</p>
                    {selectedTrip.items?.length ? (
                      <div className="mt-4 rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-3">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#4f6750]">Ordered dishes</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedTrip.items.map((item: any) => (
                            <span key={`${selectedTrip.id}-${item.name}`} className="rounded-full bg-[#eef3e8] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#4f5b47]">
                              {item.name} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">ETA {selectedTrip.etaMinutes} min</span>
                      <span className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">Trip {selectedTrip.id}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => markOrderAsComplete(selectedTrip.id)}
                      disabled={selectedTrip.status.toLowerCase() === "completed"}
                      className={`mt-4 rounded-full px-5 py-3 text-sm font-semibold shadow-[0_10px_24px_rgba(63,90,61,0.18)] ${
                        selectedTrip.status.toLowerCase() === "completed"
                          ? "cursor-not-allowed bg-[#d8e4ce] text-[#60705d]"
                          : "bg-[#223326] text-[#f5f8f1]"
                      }`}
                    >
                      {selectedTrip.status.toLowerCase() === "completed" ? "Marked complete" : "Mark as complete"}
                    </button>
                  </>
                ) : null}
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Rider profile</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">Edit personal, professional, and verification details.</p>
                  </div>
                  <label className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">
                    <input type="checkbox" checked={riderProfileDraft.isOnline} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, isOnline: event.target.checked }))} />
                    Online
                  </label>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input value={riderProfileDraft.fullName} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, fullName: event.target.value }))} placeholder="Full name" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.age} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, age: event.target.value }))} placeholder="Age" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.gender} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, gender: event.target.value }))} placeholder="Gender" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.phoneNumber} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder="Phone number" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.alternatePhoneNumber} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, alternatePhoneNumber: event.target.value }))} placeholder="Alternate phone" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.email} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.residentialAddress} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, residentialAddress: event.target.value }))} placeholder="Residential address" className="sm:col-span-2 rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.cityState} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, cityState: event.target.value }))} placeholder="City / state" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.emergencyContact} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, emergencyContact: event.target.value }))} placeholder="Emergency contact" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.vehicleType} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, vehicleType: event.target.value }))} placeholder="Vehicle type" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.vehicleNumber} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, vehicleNumber: event.target.value }))} placeholder="Vehicle number" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.drivingLicenseNumber} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, drivingLicenseNumber: event.target.value }))} placeholder="Driving license number" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.deliveryZone} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, deliveryZone: event.target.value }))} placeholder="Delivery zone" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.joiningDate} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, joiningDate: event.target.value }))} placeholder="Joining date" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.completedOrdersCount} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, completedOrdersCount: event.target.value }))} placeholder="Completed orders" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.activeDeliveries} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, activeDeliveries: event.target.value }))} placeholder="Active deliveries" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={riderProfileDraft.earningsToday} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, earningsToday: event.target.value }))} placeholder="Earnings today" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <select value={riderProfileDraft.availabilityStatus} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, availabilityStatus: event.target.value as RiderProfileDraft["availabilityStatus"] }))} className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10">
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                  <select value={riderProfileDraft.verificationStatus} onChange={(event) => setRiderProfileDraft((current) => ({ ...current, verificationStatus: event.target.value as RiderProfileDraft["verificationStatus"] }))} className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10">
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1rem] border border-dashed border-[#c9d7bf] bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">Preview</p>
                    <div className="mt-2 overflow-hidden rounded-[0.9rem] border border-[#dfe7d6] bg-[#eef3e8]">
                      <img src={riderProfileDraft.profilePhotoUrl || riderProfileDraft.profileImageUrl || "/message-icon.svg"} alt="Rider preview" className="h-24 w-full object-cover" />
                    </div>
                  </div>
                  <label className="rounded-[1rem] border border-dashed border-[#c9d7bf] bg-white px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">
                    Profile photo
                    <input type="file" accept="image/*" className="mt-2 block w-full text-[11px] normal-case tracking-normal" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        uploadImageFile(file, "rider", riderProfileDraft.userIdentifier, "profile-photo", (url) => setRiderProfileDraft((current) => ({ ...current, profilePhotoUrl: url, profileImageUrl: url })));
                      }
                    }} />
                  </label>
                  <label className="rounded-[1rem] border border-dashed border-[#c9d7bf] bg-white px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">
                    ID proof
                    <input type="file" accept="image/*" className="mt-2 block w-full text-[11px] normal-case tracking-normal" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        uploadImageFile(file, "rider", riderProfileDraft.userIdentifier, "id-proof", (url) => setRiderProfileDraft((current) => ({ ...current, idProofUrl: url })));
                      }
                    }} />
                  </label>
                  <label className="rounded-[1rem] border border-dashed border-[#c9d7bf] bg-white px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">
                    License upload
                    <input type="file" accept="image/*" className="mt-2 block w-full text-[11px] normal-case tracking-normal" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        uploadImageFile(file, "rider", riderProfileDraft.userIdentifier, "license", (url) => setRiderProfileDraft((current) => ({ ...current, drivingLicenseUrl: url })));
                      }
                    }} />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-[#5e6b5a]">{riderProfileStatus || uploadStatus}</div>
                  <button type="button" onClick={handleRiderProfileSave} className="rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f8f1] shadow-[0_10px_24px_rgba(63,90,61,0.18)]">
                    Save rider profile
                  </button>
                </div>
              </div>
            </SoftScreen>
          </section>
        </main>
      );
    }

    if (selectedRole === "restaurant") {
      const restaurantDashboard = (dashboard.role === "restaurant" ? dashboard : createFallbackDashboard("restaurant", fallbackRestaurantsForUi)) as any;
      const restaurantOptions = (restaurantDashboard.restaurantOptions ?? []) as RestaurantCard[];
      const menuItems = (restaurantDashboard.menuItems ?? []) as any[];
      const pendingOrders = (restaurantDashboard.pendingOrders ?? []) as Array<{ id: string; customer: string; items: string; status: string; due: string }>;
      const selectedRestaurantOption = restaurantOptions.find((restaurant) => restaurant.id === selectedRestaurantOptionId) ?? restaurantOptions[0] ?? null;

      return (
        <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.20),_transparent_20%),radial-gradient(circle_at_22%_78%,_rgba(255,252,245,0.22),_transparent_36%),linear-gradient(180deg,_#f0f4e9_0%,_#d9e3d3_42%,_#bdd0bb_100%)]" />
          {globalBackButton}
          {appMenu}
          <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[1fr_1fr]">
            <SoftScreen>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite • Restaurant Owner</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Manage your restaurant</h1>
              <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">Add a restaurant, edit your profile, and keep the kitchen queue moving.</p>

              <form className="mt-6 grid gap-3" onSubmit={handleRestaurantCreate}>
                <div className="flex items-center justify-between rounded-[1.15rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#4f6750]">Step {restaurantCreateStep}/2</p>
                  {restaurantCreateStep === 2 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRestaurantCreateStep(1);
                        setRestaurantFormStatus("Back to Step 1/2.");
                      }}
                      className="rounded-full border border-[#c9d7bf] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#4f5b47]"
                    >
                      Back to Step 1
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={newRestaurantName} onChange={(event) => setNewRestaurantName(event.target.value)} placeholder="Restaurant name" className="rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={newRestaurantCuisine} onChange={(event) => setNewRestaurantCuisine(event.target.value)} placeholder="Cuisine" className="rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={newRestaurantLocation} onChange={(event) => setNewRestaurantLocation(event.target.value)} placeholder="Location" className="rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={newRestaurantEta} onChange={(event) => setNewRestaurantEta(event.target.value)} placeholder="ETA minutes" className="rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={newRestaurantRating} onChange={(event) => setNewRestaurantRating(event.target.value)} placeholder="Rating" className="rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <label className="flex items-center gap-2 rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 text-sm text-[#4f5b47]"><input type="checkbox" checked={newRestaurantFeatured} onChange={(event) => setNewRestaurantFeatured(event.target.checked)} /> Featured</label>
                </div>
                <textarea value={newRestaurantDescription} onChange={(event) => setNewRestaurantDescription(event.target.value)} placeholder="Short description" className="min-h-24 rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                <button type="submit" className="rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f8f1] shadow-[0_10px_24px_rgba(63,90,61,0.18)]">{restaurantCreateStep === 1 ? "Continue to Step 2" : "Add restaurant"}</button>
              </form>

              <div className="mt-6 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Restaurant profile {restaurantCreateStep === 2 ? "• Step 2/2 required" : ""}</p>
                <p className="mt-1 text-sm text-[#5e6b5a]">{restaurantCreateStep === 2 ? "Complete these fields before adding the restaurant." : "Edit owner, contact, and brand details."}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input value={restaurantProfileDraft.restaurantName} onChange={(event) => setRestaurantProfileDraft((current) => ({ ...current, restaurantName: event.target.value }))} placeholder="Restaurant name" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={restaurantProfileDraft.ownerName} onChange={(event) => setRestaurantProfileDraft((current) => ({ ...current, ownerName: event.target.value }))} placeholder="Owner name" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={restaurantProfileDraft.contactNumber} onChange={(event) => setRestaurantProfileDraft((current) => ({ ...current, contactNumber: event.target.value }))} placeholder="Contact number" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={restaurantProfileDraft.email} onChange={(event) => setRestaurantProfileDraft((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={restaurantProfileDraft.restaurantAddress} onChange={(event) => setRestaurantProfileDraft((current) => ({ ...current, restaurantAddress: event.target.value }))} placeholder="Restaurant address" className="sm:col-span-2 rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={restaurantProfileDraft.cityState} onChange={(event) => setRestaurantProfileDraft((current) => ({ ...current, cityState: event.target.value }))} placeholder="City / state" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={restaurantProfileDraft.cuisineType} onChange={(event) => setRestaurantProfileDraft((current) => ({ ...current, cuisineType: event.target.value }))} placeholder="Cuisine type" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={restaurantProfileDraft.gstLicenseNumber} onChange={(event) => setRestaurantProfileDraft((current) => ({ ...current, gstLicenseNumber: event.target.value }))} placeholder="GST / license number" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={restaurantProfileDraft.openingHours} onChange={(event) => setRestaurantProfileDraft((current) => ({ ...current, openingHours: event.target.value }))} placeholder="Opening hours" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={restaurantProfileDraft.deliveryRadius} onChange={(event) => setRestaurantProfileDraft((current) => ({ ...current, deliveryRadius: event.target.value }))} placeholder="Delivery radius (km)" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <select value={restaurantProfileDraft.verificationStatus} onChange={(event) => setRestaurantProfileDraft((current) => ({ ...current, verificationStatus: event.target.value as RestaurantProfileDraft["verificationStatus"] }))} className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10">
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-[#5e6b5a]">{restaurantProfileStatus || uploadStatus}</div>
                  <button type="button" onClick={handleRestaurantProfileSave} className="rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f8f1] shadow-[0_10px_24px_rgba(63,90,61,0.18)]">
                    {restaurantCreateStep === 2 ? "Save profile draft" : "Save restaurant profile"}
                  </button>
                </div>
              </div>

              
            </SoftScreen>

            <SoftScreen>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Menu management</p>
              <div className="mt-4 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={menuItemDraft.dishName} onChange={(event) => setMenuItemDraft((current) => ({ ...current, dishName: event.target.value }))} placeholder="Dish name" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={menuItemDraft.price} onChange={(event) => setMenuItemDraft((current) => ({ ...current, price: event.target.value }))} placeholder="Price" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={menuItemDraft.category} onChange={(event) => setMenuItemDraft((current) => ({ ...current, category: event.target.value }))} placeholder="Category" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={menuItemDraft.preparationTimeMinutes} onChange={(event) => setMenuItemDraft((current) => ({ ...current, preparationTimeMinutes: event.target.value }))} placeholder="Prep time (min)" className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <select value={menuItemDraft.spiceLevel} onChange={(event) => setMenuItemDraft((current) => ({ ...current, spiceLevel: event.target.value as MenuItemDraft["spiceLevel"] }))} className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10">
                    <option value="mild">Mild</option>
                    <option value="medium">Medium</option>
                    <option value="hot">Hot</option>
                    <option value="extra-hot">Extra hot</option>
                  </select>
                  <select value={menuItemDraft.vegType} onChange={(event) => setMenuItemDraft((current) => ({ ...current, vegType: event.target.value as MenuItemDraft["vegType"] }))} className="rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10">
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-veg</option>
                  </select>
                  <label className="flex items-center gap-2 rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm text-[#4f5b47]"><input type="checkbox" checked={menuItemDraft.isAvailable} onChange={(event) => setMenuItemDraft((current) => ({ ...current, isAvailable: event.target.checked }))} /> Available</label>
                  <label className="flex items-center gap-2 rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm text-[#4f5b47]"><input type="checkbox" checked={menuItemDraft.isFeatured} onChange={(event) => setMenuItemDraft((current) => ({ ...current, isFeatured: event.target.checked }))} /> Featured</label>
                  <label className="flex items-center gap-2 rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm text-[#4f5b47]"><input type="checkbox" checked={menuItemDraft.isBestseller} onChange={(event) => setMenuItemDraft((current) => ({ ...current, isBestseller: event.target.checked }))} /> Bestseller</label>
                  <label className="flex items-center gap-2 rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm text-[#4f5b47]"><input type="checkbox" checked={menuItemDraft.isRecommended} onChange={(event) => setMenuItemDraft((current) => ({ ...current, isRecommended: event.target.checked }))} /> Recommended</label>
                </div>
                <textarea value={menuItemDraft.description} onChange={(event) => setMenuItemDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Menu item description" className="mt-3 min-h-24 w-full rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-[#5e6b5a]">{menuItemStatus}</div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={handleMenuItemSave} className="rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f8f1] shadow-[0_10px_24px_rgba(63,90,61,0.18)]">
                      {selectedMenuItemId ? "Update item" : "Add item"}
                    </button>
                    {selectedMenuItemId ? (
                      <button type="button" onClick={() => handleMenuItemDelete(selectedMenuItemId)} className="rounded-full border border-[#c9d7bf] bg-white px-5 py-3 text-sm font-semibold text-[#4f5b47]">
                        Delete item
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {restaurantOptions.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => setSelectedRestaurantOptionId(restaurant.id)}
                    className={`rounded-[1.35rem] border p-4 text-left shadow-[0_10px_24px_rgba(63,78,56,0.08)] transition ${
                      selectedRestaurantOption?.id === restaurant.id
                        ? "border-[#557051] bg-[linear-gradient(180deg,#dce9d4_0%,#bfd2b5_100%)] shadow-[0_14px_30px_rgba(46,68,44,0.2)]"
                        : "border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] hover:bg-[#f7faf4]"
                    }`}
                  >
                    <p className="text-lg font-black text-[#1f2b21]">{restaurant.name}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">{restaurant.cuisine} • {restaurant.location}</p>
                    <p className="mt-2 text-sm text-[#5e6b5a]">{restaurant.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Live menu items</p>
                <div className="mt-3 grid gap-2">
                  {menuItems.map((item: any) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedMenuItemId(item.id);
                        setMenuItemDraft({
                          restaurantIdentifier: item.restaurantIdentifier ?? restaurantProfileDraft.userIdentifier,
                          dishName: item.dishName ?? "",
                          dishImageUrl: item.dishImageUrl ?? "",
                          price: String(item.price ?? 0),
                          category: item.category ?? "Featured",
                          description: item.description ?? "",
                          spiceLevel: item.spiceLevel ?? "medium",
                          vegType: item.vegType ?? "veg",
                          isAvailable: Boolean(item.isAvailable),
                          preparationTimeMinutes: String(item.preparationTimeMinutes ?? 15),
                          isFeatured: Boolean(item.isFeatured),
                          isBestseller: Boolean(item.isBestseller),
                          isRecommended: Boolean(item.isRecommended),
                        });
                      }}
                      className={`rounded-xl border px-3 py-2 text-left transition ${
                        selectedMenuItemId === item.id
                          ? "border-[#bdd0b2] bg-[linear-gradient(180deg,#f3f7ef_0%,#e7f0df_100%)] text-[#1f2b21]"
                          : "border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] text-[#5e6b5a] hover:bg-[#f7faf4]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[#1f2b21]">{item.dishName}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">{item.category} • {item.vegType} • {item.spiceLevel}</p>
                        </div>
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#4f6750]">₹{Number(item.price).toFixed(0)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Selected restaurant</p>
                {selectedRestaurantOption ? (
                  <>
                    <p className="mt-2 text-2xl font-black text-[#1f2b21]">{selectedRestaurantOption.name}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">{selectedRestaurantOption.cuisine} • {selectedRestaurantOption.location}</p>
                    <p className="mt-3 text-sm text-[#5e6b5a]">{selectedRestaurantOption.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedRestaurantOption.menu.map((dish) => (
                        <span key={dish} className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">{dish}</span>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Pending orders</p>
                <div className="mt-3 grid gap-2">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2 text-sm text-[#5e6b5a]">{order.id} • {order.customer} • {order.items} • {order.status} • {order.due}</div>
                  ))}
                </div>
              </div>
            </SoftScreen>
          </section>
        </main>
      );
    }

    if (selectedRole === "platform") {
      const platformDashboard = (dashboard.role === "platform" ? dashboard : createFallbackDashboard("platform", fallbackRestaurantsForUi)) as any;
      const recentUsers = (platformDashboard.recentUsers ?? []) as Array<{ fullName: string; identifier: string; role: UserRole }>;
      const recentRestaurants = (platformDashboard.recentRestaurants ?? []) as RestaurantCard[];
      const riderProfiles = (platformDashboard.riderProfiles ?? []) as Array<{ userIdentifier: string; fullName: string; vehicleType: string; deliveryZone: string; availabilityStatus: string; isOnline: boolean; completedOrdersCount: string }>;
      const restaurantProfiles = (platformDashboard.restaurantProfiles ?? []) as Array<{ userIdentifier: string; restaurantName: string; cuisineType: string; cityState: string; ownerName: string; deliveryRadius: string }>;
      const activity = (platformDashboard.activity ?? []) as string[];
      const notificationsFeed = platformNotifications.length > 0
        ? platformNotifications
        : activity.map((item) => createNotification("App activity", item));
      const selectedPlatformUser = recentUsers.find((user) => user.identifier === selectedPlatformUserIdentifier) ?? recentUsers[0] ?? null;
      const selectedPlatformRestaurant = recentRestaurants.find((restaurant) => restaurant.id === selectedPlatformRestaurantId) ?? recentRestaurants[0] ?? null;
      const selectedPlatformNotification = notificationsFeed.find((notification) => notification.id === selectedPlatformNotificationId) ?? notificationsFeed[0] ?? null;

      const platformSectionCards: Array<{ id: PlatformSection; title: string; description: string; accent: string }> = [
        { id: "overview", title: "Overview", description: "Totals and live health", accent: "from-[#35533a] to-[#6d8660]" },
        { id: "users", title: "Users", description: "Recent logins and roles", accent: "from-[#405c45] to-[#829a76]" },
        { id: "restaurants", title: "Restaurants", description: "Live restaurant records", accent: "from-[#58745b] to-[#a0b28f]" },
        { id: "notifications", title: "Notifications", description: "New in-app events", accent: "from-[#2f4c35] to-[#728a63]" },
        { id: "activity", title: "Activity", description: "What happened lately", accent: "from-[#4a654d] to-[#92a784]" },
      ];

      const sectionTitle = {
        overview: "Home overview",
        users: "User details",
        restaurants: "Restaurant details",
        notifications: "Notification center",
        activity: "Activity timeline",
      }[selectedPlatformSection];

      const sectionSubtitle = {
        overview: "Keep the home page clean and let each section open into a focused panel.",
        users: "Select a user to inspect their role, identifier, and quick status.",
        restaurants: "Select a restaurant to view the live menu and branch summary.",
        notifications: "New app events land here first, then stay in the feed for later review.",
        activity: "A chronological view of what has happened across the app.",
      }[selectedPlatformSection];

      return (
        <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.20),_transparent_20%),radial-gradient(circle_at_22%_78%,_rgba(255,252,245,0.22),_transparent_36%),linear-gradient(180deg,_#f0f4e9_0%,_#d9e3d3_42%,_#bdd0bb_100%)]" />
          {globalBackButton}
          {appMenu}
          <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <SoftScreen>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite • Main Team</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Main Team home</h1>
              <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">Each section opens separately so users, restaurants, notifications, and activity stay organized.</p>

              <div className="mt-6 grid gap-3">
                {platformSectionCards.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlatformSection(section.id);
                      if (section.id === "users" && recentUsers[0]) {
                        setSelectedPlatformUserIdentifier(recentUsers[0].identifier);
                      }
                      if (section.id === "restaurants" && recentRestaurants[0]) {
                        setSelectedPlatformRestaurantId(recentRestaurants[0].id);
                      }
                      if (section.id === "notifications" && notificationsFeed[0]) {
                        setSelectedPlatformNotificationId(notificationsFeed[0].id);
                      }
                    }}
                    className={`rounded-[1.35rem] border p-4 text-left shadow-[0_10px_24px_rgba(63,78,56,0.08)] transition ${
                      selectedPlatformSection === section.id
                        ? "border-[#b9cdb0] bg-[linear-gradient(180deg,#f3f7ef_0%,#e7f0df_100%)]"
                        : "border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] hover:bg-[#f7faf4]"
                    }`}
                  >
                    <div className={`inline-flex rounded-full bg-gradient-to-r ${section.accent} px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white`}>
                      {section.title}
                    </div>
                    <p className="mt-3 text-sm text-[#5e6b5a]">{section.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.1rem] border border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] px-4 py-3 shadow-[0_10px_24px_rgba(63,78,56,0.08)]"><span className="block text-2xl font-black text-[#1f2b21]">{platformDashboard.totals.users}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Users</span></div>
                <div className="rounded-[1.1rem] border border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] px-4 py-3 shadow-[0_10px_24px_rgba(63,78,56,0.08)]"><span className="block text-2xl font-black text-[#1f2b21]">{platformDashboard.totals.restaurants}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Restaurants</span></div>
                <div className="rounded-[1.1rem] border border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] px-4 py-3 shadow-[0_10px_24px_rgba(63,78,56,0.08)]"><span className="block text-2xl font-black text-[#1f2b21]">{platformDashboard.totals.activeOrders}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Active orders</span></div>
                <div className="rounded-[1.1rem] border border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] px-4 py-3 shadow-[0_10px_24px_rgba(63,78,56,0.08)]"><span className="block text-2xl font-black text-[#1f2b21]">{platformDashboard.totals.deliveries}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Deliveries</span></div>
              </div>
            </SoftScreen>

            <SoftScreen>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">{sectionTitle}</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-[#1f2b21]">{selectedPlatformSection === "overview" ? "Work in separate sections" : sectionTitle}</h2>
              <p className="mt-2 text-sm leading-7 text-[#5e6b5a]">{sectionSubtitle}</p>

              <div className="mt-6 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
                {selectedPlatformSection === "overview" && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1rem] border border-[#dfe7d6] bg-white/92 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f6750]">Current status</p>
                        <p className="mt-2 text-lg font-black text-[#1f2b21]">Live dashboard ready</p>
                        <p className="mt-1 text-sm text-[#5e6b5a]">Open users, restaurants, notifications, or activity to drill into details.</p>
                      </div>
                      <div className="rounded-[1rem] border border-[#dfe7d6] bg-white/92 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f6750]">Notifications</p>
                        <p className="mt-2 text-lg font-black text-[#1f2b21]">{notificationsFeed.length} items</p>
                        <p className="mt-1 text-sm text-[#5e6b5a]">New events from the app collect here automatically.</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {activity.slice(0, 4).map((item) => (
                        <div key={item} className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2 text-sm text-[#5e6b5a]">{item}</div>
                      ))}
                    </div>
                  </>
                )}

                {selectedPlatformSection === "users" && (
                  <>
                    <div className="grid gap-2">
                      {recentUsers.map((user) => (
                        <button
                          key={`${user.identifier}-${user.role}`}
                          type="button"
                          onClick={() => setSelectedPlatformUserIdentifier(user.identifier)}
                          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                            selectedPlatformUser?.identifier === user.identifier
                              ? "border-[#bdd0b2] bg-[linear-gradient(180deg,#f3f7ef_0%,#e7f0df_100%)] text-[#1f2b21]"
                              : "border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] text-[#5e6b5a] hover:bg-[#f7faf4]"
                          }`}
                        >
                          {user.fullName} • {user.role} • {user.identifier}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 rounded-[1rem] border border-[#dfe7d6] bg-white/92 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f6750]">User detail</p>
                      {selectedPlatformUser ? (
                        <>
                          <p className="mt-2 text-xl font-black text-[#1f2b21]">{selectedPlatformUser.fullName}</p>
                          <p className="mt-1 text-sm text-[#5e6b5a]">{selectedPlatformUser.role} • {selectedPlatformUser.identifier}</p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-[#5e6b5a]">Select a user to inspect the account details.</p>
                      )}
                    </div>
                  </>
                )}

                {selectedPlatformSection === "restaurants" && (
                  <>
                    <div className="grid gap-2">
                      {recentRestaurants.map((restaurant) => (
                        <button
                          key={restaurant.id}
                          type="button"
                          onClick={() => setSelectedPlatformRestaurantId(restaurant.id)}
                          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                            selectedPlatformRestaurant?.id === restaurant.id
                              ? "border-[#bdd0b2] bg-[linear-gradient(180deg,#f3f7ef_0%,#e7f0df_100%)] text-[#1f2b21]"
                              : "border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] text-[#5e6b5a] hover:bg-[#f7faf4]"
                          }`}
                        >
                          {restaurant.name} • {restaurant.cuisine} • {restaurant.location}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 rounded-[1rem] border border-[#dfe7d6] bg-white/92 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f6750]">Restaurant detail</p>
                      {selectedPlatformRestaurant ? (
                        <>
                          <p className="mt-2 text-xl font-black text-[#1f2b21]">{selectedPlatformRestaurant.name}</p>
                          <p className="mt-1 text-sm text-[#5e6b5a]">{selectedPlatformRestaurant.cuisine} • {selectedPlatformRestaurant.location}</p>
                          <p className="mt-2 text-sm text-[#5e6b5a]">{selectedPlatformRestaurant.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedPlatformRestaurant.menu.map((dish) => (
                              <span key={dish} className="rounded-full bg-[#f8faf4] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">{dish}</span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-[#5e6b5a]">Select a restaurant to inspect its menu and summary.</p>
                      )}
                    </div>
                  </>
                )}

                {selectedPlatformSection === "notifications" && (
                  <>
                    <div className="grid gap-2">
                      {notificationsFeed.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => setSelectedPlatformNotificationId(notification.id)}
                          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                            selectedPlatformNotification?.id === notification.id
                              ? "border-[#bdd0b2] bg-[linear-gradient(180deg,#f3f7ef_0%,#e7f0df_100%)] text-[#1f2b21]"
                              : "border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] text-[#5e6b5a] hover:bg-[#f7faf4]"
                          }`}
                        >
                          <span className="block font-semibold text-[#1f2b21]">{notification.title}</span>
                          <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[#4f6750]">{formatNotificationTime(notification.timestamp)}</span>
                          <span className="mt-1 block text-sm text-[#5e6b5a]">{notification.details}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 rounded-[1rem] border border-[#dfe7d6] bg-white/92 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f6750]">Notification detail</p>
                      {selectedPlatformNotification ? (
                        <>
                          <p className="mt-2 text-xl font-black text-[#1f2b21]">{selectedPlatformNotification.title}</p>
                          <p className="mt-1 text-sm text-[#5e6b5a]">{selectedPlatformNotification.details}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#4f6750]">{formatNotificationTime(selectedPlatformNotification.timestamp)}</p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-[#5e6b5a]">Notifications will appear here as the app generates them.</p>
                      )}
                    </div>
                  </>
                )}

                {selectedPlatformSection === "activity" && (
                  <>
                    <div className="grid gap-2">
                      {activity.map((item, index) => (
                        <div key={`${item}-${index}`} className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2 text-sm text-[#5e6b5a]">
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-[1rem] border border-[#dfe7d6] bg-white/92 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f6750]">Latest update</p>
                      <p className="mt-2 text-sm text-[#5e6b5a]">{activity[0] ?? "No activity recorded yet."}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Live notifications</p>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#4f6750]">{notificationsFeed.length}</span>
                </div>
                <div className="mt-3 grid gap-2">
                  {notificationsFeed.slice(0, 4).map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatformSection("notifications");
                        setSelectedPlatformNotificationId(notification.id);
                      }}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                        selectedPlatformNotification?.id === notification.id
                          ? "border-[#bdd0b2] bg-[linear-gradient(180deg,#f3f7ef_0%,#e7f0df_100%)] text-[#1f2b21]"
                          : "border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] text-[#5e6b5a] hover:bg-[#f7faf4]"
                      }`}
                    >
                      <span className="block font-semibold text-[#1f2b21]">{notification.title}</span>
                      <span className="mt-1 block text-sm text-[#5e6b5a]">{notification.details}</span>
                    </button>
                  ))}
                </div>
              </div>
            </SoftScreen>
          </section>
        </main>
      );
    }

    const customerDashboard = (dashboard.role === "customer" ? dashboard : createFallbackDashboard("customer", fallbackRestaurantsForUi)) as any;
    const liveOrders = customerDashboard.liveOrders && customerDashboard.liveOrders.length > 0
      ? customerDashboard.liveOrders
      : [
          {
            id: Number(String(customerDashboard.activeOrder.id).replace(/\D/g, "")) || Date.now(),
            restaurantId: customerDashboard.restaurants[0]?.id ?? 1,
            restaurantName: customerDashboard.activeOrder.restaurant,
            customerIdentifier: identifier || "guest",
            status: customerDashboard.activeOrder.status,
            rider: customerDashboard.activeOrder.rider,
            etaMinutes: customerDashboard.activeOrder.etaMinutes,
            address: customerDashboard.activeOrder.address,
            total: customerDashboard.activeOrder.total ?? 0,
            items: customerDashboard.activeOrder.items ?? [],
          },
        ];

    return (
      <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.20),_transparent_20%),radial-gradient(circle_at_22%_78%,_rgba(255,252,245,0.22),_transparent_36%),linear-gradient(180deg,_#f0f4e9_0%,_#d9e3d3_42%,_#bdd0bb_100%)]" />
        {globalBackButton}
        {appMenu}
        <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SoftScreen>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite • Customer</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Track your order</h1>
            <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">See your active order, rider ETA, and the restaurants available right now.</p>
            <div className="mt-6 grid gap-3">
              {liveOrders.map((order: any) => (
                <div key={order.id} className="rounded-[1.5rem] border border-[#dfe7d6] bg-[#eef3e8] p-5 shadow-[0_10px_24px_rgba(37,46,34,0.05)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Live order status</p>
                      <p className="mt-2 text-2xl font-black text-[#1f2b21]">{order.restaurantName}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${order.status.toLowerCase() === "completed" ? "bg-[#223326] text-[#f5f8f1]" : "bg-[#4f6b52] text-[#f5f8f1]"}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#5e6b5a]">Rider {order.rider}</p>
                  <p className="mt-1 text-sm text-[#5e6b5a]">ETA {order.etaMinutes} min • {order.address}</p>
                  {order.items.length > 0 ? (
                    <div className="mt-4 rounded-[1rem] border border-[#dfe7d6] bg-white px-3 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#4f6750]">Ordered dishes</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {order.items.map((item: any) => (
                          <span key={`${order.id}-${item.name}`} className="rounded-full bg-[#eef3e8] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#4f5b47]">
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <p className="mt-3 text-sm text-[#5e6b5a]">Total ₹{order.total.toFixed(0)} • {formatOrderItems(order.items)}</p>
                </div>
              ))}
            </div>
          </SoftScreen>

          <SoftScreen>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Live options</p>
            <div className="mt-4 grid gap-3">
              {customerDashboard.restaurants.map((restaurant: any) => (
                <button
                  key={restaurant.id}
                  type="button"
                  onClick={() => openRestaurantMenu(restaurant.id)}
                  className={`rounded-[1.35rem] border p-4 text-left shadow-[0_10px_24px_rgba(37,46,34,0.06)] transition ${
                    "border-[#dfe7d6] bg-[#fbfcf8] hover:bg-[#f7faf4]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black text-[#1f2b21]">{restaurant.name}</p>
                      <p className="mt-1 text-sm text-[#5e6b5a]">{restaurant.cuisine} • {restaurant.location}</p>
                    </div>
                    <span className="rounded-full bg-[#4f6b52] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5f8f1]">ETA {restaurant.etaMinutes} min</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">{restaurant.description}</p>
                </button>
              ))}
            </div>
          </SoftScreen>
        </section>
      </main>
    );
  }

  if (stage === "restaurant-menu") {
    const customerDashboard = (dashboard.role === "customer" ? dashboard : createFallbackDashboard("customer", fallbackRestaurantsForUi)) as Extract<DashboardData, { role: "customer" }>;
    const selectedRestaurant = customerDashboard.restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? customerDashboard.restaurants[0] ?? null;

    if (!selectedRestaurant) {
      return null;
    }

    return (
      <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.20),_transparent_20%),radial-gradient(circle_at_22%_78%,_rgba(255,252,245,0.22),_transparent_36%),linear-gradient(180deg,_#f0f4e9_0%,_#d9e3d3_42%,_#bdd0bb_100%)]" />
        {globalBackButton}
        {appMenu}
        <button type="button" onClick={() => setIsRestaurantCartOpen((current) => !current)} className="fixed right-3 top-1/2 z-30 -translate-y-1/2 rounded-full border border-[#6f7f68]/45 bg-[#223326] p-3 shadow-[0_14px_30px_rgba(37,46,34,0.14)]" aria-label="Open cart">
          <span className="block text-lg font-black text-[#f5f8f1]">🛒</span>
          {restaurantMenuItemCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d6e2c2] px-1 text-[10px] font-black text-[#1f2b21]">{restaurantMenuItemCount}</span>
          ) : null}
        </button>

        <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SoftScreen>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite • Menu</p>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{selectedRestaurant.name}</h1>
                <p className="mt-2 text-sm text-[#5e6b5a]">{selectedRestaurant.cuisine} • {selectedRestaurant.location}</p>
              </div>
              <button type="button" onClick={() => setStage("restaurants")} className="rounded-full border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#4f5b47]">
                Back
              </button>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#5e6b5a]">{selectedRestaurant.description}</p>
            <div className="mt-6 grid gap-3 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Delivery address</p>
                  <p className="mt-1 text-sm text-[#5e6b5a]">Set where this order should be sent.</p>
                </div>
                <span className="rounded-full bg-[#e7efdf] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#4f6750]">Required</span>
              </div>
              <input
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                placeholder="Enter delivery address"
                className="w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10"
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">
              <span className="rounded-full bg-[#e7efdf] px-3 py-1">ETA {selectedRestaurant.etaMinutes} min</span>
              <span className="rounded-full bg-[#e7efdf] px-3 py-1">Rating {selectedRestaurant.rating.toFixed(1)}</span>
              <span className="rounded-full bg-[#e7efdf] px-3 py-1">Use + / - to change quantity</span>
            </div>
            <div className="mt-6 grid gap-3">
              {selectedRestaurant.menu.map((dish, index) => {
                const price = getMenuPrice(selectedRestaurant.id, index);
                const cartItem = restaurantMenuCart.find((item) => item.name === dish);

                return (
                  <div key={dish} className="rounded-[1.35rem] border border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] p-4 shadow-[0_10px_24px_rgba(63,78,56,0.08)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-[#1f2b21]">{dish}</p>
                        <p className="mt-1 text-sm text-[#5e6b5a]">Freshly prepared and easy to customize.</p>
                        <p className="mt-2 text-sm font-semibold text-[#4f6750]">₹{price}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-[#dfe7d6] bg-white px-2 py-2">
                        <button type="button" onClick={() => updateRestaurantMenuCart(dish, price, -1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef3e8] text-lg font-black text-[#4f6750]">-</button>
                        <span className="min-w-7 text-center text-sm font-bold text-[#1f2b21]">{cartItem?.quantity ?? 0}</span>
                        <button type="button" onClick={() => updateRestaurantMenuCart(dish, price, 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#223326] text-lg font-black text-[#f5f8f1]">+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SoftScreen>

          <SoftScreen>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Checkout preview</p>
            <div className="mt-4 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Address</p>
              <p className="mt-2 text-sm text-[#1f2b21]">{deliveryAddress || "No address added yet"}</p>
            </div>
            <div className="mt-4 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Cart summary</p>
                <span className="rounded-full bg-[#e7efdf] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#4f6750]">{restaurantMenuItemCount} items</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-[#5e6b5a]">
                <span>Subtotal</span>
                <span className="text-lg font-black text-[#1f2b21]">₹{restaurantMenuSubtotal.toFixed(0)}</span>
              </div>
              <button type="button" onClick={openRestaurantCheckout} className="mt-4 w-full rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f8f1]">Proceed to checkout</button>
            </div>
            <div className={`fixed right-16 top-24 z-30 w-[min(92vw,24rem)] rounded-[1.6rem] border border-[#dfe7d6] bg-[#fbfcf8] p-4 shadow-[0_20px_60px_rgba(37,46,34,0.18)] transition ${isRestaurantCartOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-6 opacity-0"}`}>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Cart</p>
              <div className="mt-3 grid gap-2 max-h-[18rem] overflow-auto pr-1">
                {restaurantMenuCart.length > 0 ? restaurantMenuCart.map((item) => (
                  <div key={item.name} className="rounded-xl border border-[#d3dfca] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] px-3 py-2 shadow-[0_10px_24px_rgba(63,78,56,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#1f2b21]">{item.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateRestaurantMenuCart(item.name, item.price, -1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef3e8] text-lg font-black text-[#4f6750]">-</button>
                        <span className="min-w-7 text-center text-sm font-bold text-[#1f2b21]">{item.quantity}</span>
                        <button type="button" onClick={() => updateRestaurantMenuCart(item.name, item.price, 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#223326] text-lg font-black text-[#f5f8f1]">+</button>
                      </div>
                    </div>
                  </div>
                )) : <p className="text-sm leading-7 text-[#5e6b5a]">Your cart is empty.</p>}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-[#5e6b5a]">
                <span>Total</span>
                <span className="text-lg font-black text-[#1f2b21]">₹{restaurantMenuSubtotal.toFixed(0)}</span>
              </div>
            </div>
          </SoftScreen>
        </section>
      </main>
    );
  }

  if (stage === "checkout") {
    const customerDashboard = (dashboard.role === "customer" ? dashboard : createFallbackDashboard("customer", fallbackRestaurantsForUi)) as Extract<DashboardData, { role: "customer" }>;
    const selectedRestaurant = customerDashboard.restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? customerDashboard.restaurants[0] ?? null;

    if (!selectedRestaurant) {
      return null;
    }

    return (
      <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.20),_transparent_20%),radial-gradient(circle_at_22%_78%,_rgba(255,252,245,0.22),_transparent_36%),linear-gradient(180deg,_#f0f4e9_0%,_#d9e3d3_42%,_#bdd0bb_100%)]" />
        {globalBackButton}
        {appMenu}

        <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SoftScreen>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite • Checkout</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Delivery details</h1>
            <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">Add the rider instructions, landmark, and contact details before placing the order.</p>

            <div className="mt-6 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Delivering to</p>
              <input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Delivery address" className="mt-3 w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
              <input value={deliveryLandmark} onChange={(event) => setDeliveryLandmark(event.target.value)} placeholder="Landmark / area" className="mt-3 w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
              <input value={contactNumber} onChange={(event) => setContactNumber(event.target.value)} placeholder="Contact number" className="mt-3 w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
              <textarea value={riderNotes} onChange={(event) => setRiderNotes(event.target.value)} placeholder="Rider instructions" className="mt-3 min-h-28 w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
            </div>

            <div className="mt-6 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#f6faf2_0%,#e8f1df_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Payment method</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {(["upi", "card", "cash"] as CheckoutMethod[]).map((method) => (
                  <button key={method} type="button" onClick={() => setCheckoutMethod(method)} className={`rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition ${checkoutMethod === method ? "border-[#4f6b52]/70 bg-[#223326] text-[#f5f8f1]" : "border-[#dfe7d6] bg-white/92 text-[#4f5b47] hover:bg-[#f7faf4]"}`}>
                    {method === "upi" ? "UPI" : method}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Final confirmation</p>
              <p className="mt-2 text-sm leading-7 text-[#5e6b5a]">Review the details above, then confirm the order once.</p>
              <button
                type="button"
                onClick={placeOrder}
                className="mt-4 w-full rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f1e7]"
              >
                Confirm order
              </button>
            </div>
          </SoftScreen>

          <SoftScreen>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Order summary</p>
            <div className="mt-4 rounded-[1.35rem] border border-[#dfe7d6] bg-[#fbfcf8] p-4">
              <p className="text-sm font-bold text-[#1f2b21]">{selectedRestaurant.name}</p>
              <p className="mt-1 text-sm text-[#5e6b5a]">{selectedRestaurant.cuisine} • {selectedRestaurant.location}</p>
              <div className="mt-4 grid gap-2">
                {restaurantMenuCart.length > 0 ? restaurantMenuCart.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm text-[#5e6b5a]">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-semibold text-[#1f2b21]">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                )) : <p className="text-sm leading-7 text-[#5e6b5a]">Your cart is empty.</p>}
              </div>
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Rider-ready details</p>
              <div className="mt-3 grid gap-2 text-sm text-[#5e6b5a]">
                <div className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2">Address: {deliveryAddress || "Add delivery address"}</div>
                <div className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2">Landmark: {deliveryLandmark || "Add landmark"}</div>
                <div className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2">Phone: {contactNumber || "Add contact number"}</div>
                <div className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2">Instructions: {riderNotes || "Add rider instructions"}</div>
                <div className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2">Payment: {checkoutMethod.toUpperCase()}</div>
              </div>
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-[#c9d7bf] bg-[linear-gradient(180deg,#fbfdf8_0%,#eef4e6_100%)] p-4 shadow-[0_12px_28px_rgba(63,78,56,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Total</p>
                <span className="text-lg font-black text-[#1f2b21]">₹{restaurantMenuSubtotal.toFixed(0)}</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">The button on the left confirms and sends the order in one step.</p>
            </div>
          </SoftScreen>
        </section>
      </main>
    );
  }

  if (stage === "role") {
    const isPhoneViewport = viewportWidth < 640;
    const isTabletViewport = viewportWidth >= 640 && viewportWidth < 1024;
    const isCompactHeight = viewportHeight < 760;
    const isCompactLayout = isPhoneViewport || (isStandaloneMode && viewportWidth < 820);
    const roleShellMaxWidth = isCompactLayout ? "max-w-[26.5rem]" : isTabletViewport ? "max-w-[36rem]" : "max-w-[38rem]";
    const roleShellPadding = isCompactLayout ? "px-8" : isTabletViewport ? "px-6" : "px-4 sm:px-6";
    const roleStackHeight = isCompactLayout ? "h-[12.8rem]" : isTabletViewport ? "h-[13.2rem]" : "h-[13.4rem] sm:h-[13.8rem] lg:h-[14rem]";
    const roleHeadingSize = isCompactLayout ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl lg:text-[4.1rem]";
    const roleTitleSize = isCompactLayout ? "text-[1rem] sm:text-[1.08rem]" : "text-[1.2rem] sm:text-[1.35rem]";
    const roleSubtitleSize = isCompactLayout ? "text-[11px] sm:text-[12px]" : "text-[12px] sm:text-[13px]";
    const roleCardPadding = isCompactLayout ? "p-2.5 sm:p-3" : "p-3.5 sm:p-4";
    const arrowSize = isCompactLayout ? "h-11 w-11" : "h-13 w-13";
    const arrowOffset = isCompactLayout ? "left-0" : "-left-1.5 sm:-left-2.5";
    const rightArrowOffset = isCompactLayout ? "right-0" : "-right-1.5 sm:-right-2.5";
    const stackNudgeX = isCompactLayout ? "0%" : "0%";

    return (
      <main
        className="relative min-h-[100dvh] overflow-x-hidden px-3 text-[#243025] sm:px-6 lg:px-8"
        style={{
          paddingTop: "max(0.7rem, env(safe-area-inset-top))",
          paddingBottom: "max(0.7rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_72%,rgba(98,129,96,0.22),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(255,252,245,0.55),transparent_36%),linear-gradient(180deg,#efe6d0_0%,#d8d8c3_36%,#bdd0b8_68%,#a7c197_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.10),transparent_62%)]" />

        <section className={`relative mx-auto flex h-full w-full max-w-7xl flex-col ${isCompactLayout ? "gap-2.5" : "gap-3 lg:gap-4"}`}>
          <header className={`flex gap-3 ${isCompactLayout ? "flex-col items-start" : "items-start justify-between gap-4"}`}>
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#6b7864] sm:text-[12px]">SwiftBite setup</p>
              <h1 className={`mt-1.5 font-black tracking-[-0.08em] text-[#182118] ${roleHeadingSize}`}>Choose your role</h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6a7463] sm:text-[15px]">Select the profile you want to use. The next screen will show login or register for that role.</p>
            </div>

            <div className={`flex shrink-0 items-center ${isCompactLayout ? "gap-2" : "gap-2.5 sm:gap-3"}`}>
              <PwaInstallButton />
              <div className="rounded-full border border-[#cfd9c7] bg-[#eef2e4] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.28em] text-[#425142] shadow-[0_8px_18px_rgba(37,46,34,0.06)]">
                Step 1 of 2
              </div>
            </div>
          </header>

          <div className={`flex min-h-0 flex-1 items-center justify-center ${isCompactLayout ? "py-0.5" : "py-1"}`}>
              <div className={`relative flex w-full ${roleShellMaxWidth} items-center justify-center ${roleShellPadding}`}>

                <div className="relative mx-auto mt-16 flex w-full max-w-[980px] items-center justify-center overflow-visible">

                  {/* LEFT BUTTON */}
                  <button
                    type="button"
                    onClick={() => cycleRole("left")}
                    className="absolute left-0 z-30 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-[#2d472c] to-[#1e301e] text-white shadow-[0_12px_28px_rgba(45,71,44,0.25)] transition duration-300 hover:scale-105 hover:shadow-[0_16px_34px_rgba(45,71,44,0.35)] focus:outline-none focus:ring-2 focus:ring-[#5c7a59]"
                    aria-label="Previous role"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6 stroke-[2.8]">
                      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* CAROUSEL */}
                  <div className="relative flex h-[340px] w-full items-center justify-center">

                    {roleWheelCards.map(({ card, offset }) => {
                      const isActive = offset === 0;

                      return (
                        <div
                          key={card.id}
                          className="absolute transition-all duration-500 ease-out"
                          style={{
                            transform: `
                              translateX(${offset * 240}px)
                              scale(${isActive ? 1 : 0.84})
                            `,
                            opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.55,
                            zIndex: 20 - Math.abs(offset),
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => chooseRole(card.id)}
                            className={`
                              relative h-[250px] w-[420px]
                              overflow-hidden rounded-[2rem]
                              border transition-all duration-500
                              transform-gpu will-change-transform
                              ${isActive
                                ? "border-[#88a07e] bg-[#eef5e7] shadow-[0_36px_96px_rgba(74,93,62,0.28)]"
                                : "border-[#d9dfd2] bg-[#f8f8f3] shadow-[0_16px_40px_rgba(0,0,0,0.10)]"}
                            `}
                          >

                            {/* TOP */}
                            <div className="flex items-start justify-between px-7 pt-7">
                              <div>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-[#cfd9c7] bg-white text-2xl shadow-[0_8px_18px_rgba(37,46,34,0.08)]">
                                    {card.icon}
                                  </div>
                                  <h3 className="text-[2rem] font-black tracking-[-0.04em] text-[#132819]">
                                    {card.title}
                                  </h3>
                                </div>

                                <p className="mt-2 text-[1rem] text-[#5d695d]">
                                  {card.subtitle}
                                </p>
                              </div>

                              {isActive && (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2d472c] bg-[#eef5e7] text-2xl shadow-[0_10px_22px_rgba(45,71,44,0.14)]">
                                  {card.icon}
                                </div>
                              )}
                            </div>

                            {/* MOCK CONTENT */}
                            <div className="mx-7 mt-7 rounded-[1.4rem] bg-white p-5 shadow-inner">

                              <div className="flex items-center justify-between">
                                <div className="space-y-3 w-[65%]">
                                  <div className="h-4 w-full rounded-full bg-[#e9f0e6]" />
                                  <div className="h-3 w-3/4 rounded-full bg-[#f0f5ef]" />
                                  <div className="h-3 w-5/6 rounded-full bg-[#e9f0e6]" />
                                </div>

                                <div className="flex items-center justify-center h-20 w-20 rounded-[1.2rem] bg-white shadow-inner">
                                  {card.id === "customer" && (
                                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#4f6b52]">
                                      <path d="M6 2h11l-1.2 6H7.2L6 2z" fill="#e9f4e9" stroke="#4f6b52" strokeWidth="0.8"/>
                                      <path d="M3 8h17v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8z" fill="#dfe9db" stroke="#4f6b52" strokeWidth="0.8"/>
                                    </svg>
                                  )}

                                  {card.id === "delivery" && (
                                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M3 13h11v4H3z" fill="#dfeee0" stroke="#46624b" strokeWidth="0.8"/>
                                      <path d="M16 11h4l1 3h-5z" fill="#e9f4e9" stroke="#46624b" strokeWidth="0.8"/>
                                      <circle cx="7" cy="18" r="1.8" fill="#46624b"/>
                                      <circle cx="19" cy="18" r="1.8" fill="#46624b"/>
                                    </svg>
                                  )}

                                  {card.id === "restaurant" && (
                                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M6 3c0 2.5-1 3.5-1 5 0 2 1 4 4 4s4-2 4-4c0-1.5-1-2.5-1-5H6z" fill="#f6f7ef" stroke="#58745b" strokeWidth="0.8"/>
                                      <path d="M4 15c0 1.7 2 3 4 3s4-1.3 4-3" stroke="#58745b" strokeWidth="0.8"/>
                                    </svg>
                                  )}

                                  {card.id === "platform" && (
                                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 8v2" stroke="#3f5a43" strokeWidth="1.2" strokeLinecap="round"/>
                                      <path d="M12 14v2" stroke="#3f5a43" strokeWidth="1.2" strokeLinecap="round"/>
                                      <circle cx="12" cy="11" r="5" fill="#eef4ea" stroke="#3f5a43" strokeWidth="0.8"/>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* BOTTOM */}

                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* RIGHT BUTTON */}
                  <button
                    type="button"
                    onClick={() => cycleRole("right")}
                    className="absolute right-0 z-30 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-[#2d472c] to-[#1e301e] text-white shadow-[0_12px_28px_rgba(45,71,44,0.25)] transition duration-300 hover:scale-105 hover:shadow-[0_16px_34px_rgba(45,71,44,0.35)] focus:outline-none focus:ring-2 focus:ring-[#5c7a59]"
                    aria-label="Next role"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6 stroke-[2.8]">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

              </div>
        </div>

          <footer className={`border-t border-[#dfe6d7] ${isCompactLayout ? "pt-2.5 pb-20" : "pt-3 pb-24 sm:pt-4"}`}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[14px] text-[#6a7463] sm:text-sm">Continue as <strong className="font-semibold text-[#243025]">{selectedRoleCard.title}</strong>.</p>

              <div className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setStage("login");
                    switchAuthMode("login");
                  }}
                  className="rounded-full bg-gradient-to-r from-[#2d472c] to-[#1e301e] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_28px_rgba(45,71,44,0.22)] transition-all duration-300 hover:scale-103 hover:shadow-[0_16px_34px_rgba(45,71,44,0.32)] focus:outline-none focus:ring-2 focus:ring-[#5c7a59]"
                >
                  Next
                </button>
              </div>
            </div>
          </footer>

        </section>
      </main>
    );
  }

  if (stage === "continue") {
    return (
      <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.20),_transparent_20%),radial-gradient(circle_at_22%_78%,_rgba(255,252,245,0.22),_transparent_36%),linear-gradient(180deg,_#f0f4e9_0%,_#d9e3d3_42%,_#bdd0bb_100%)]" />
        {globalBackButton}
        {appMenu}

        <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#5f7756]/55 bg-[rgba(225,212,193,0.92)] p-6 shadow-[0_24px_70px_rgba(45,61,44,0.14)] backdrop-blur-xl sm:p-8 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite • Step 2</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Welcome, {selectedRoleCard.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4d564a]">Your account is ready. The next app area can open from here.</p>

            <div className="mt-8 rounded-[1.5rem] border border-[#6a8160]/45 bg-[#dfe7d6] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Current role</p>
              <p className="mt-2 text-2xl font-black text-[#182118]">{selectedRoleCard.title}</p>
              <p className="mt-1 text-sm text-[#4d564a]">{selectedRoleCard.subtitle}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setStage("restaurants");
                }}
                className="rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f1e7]"
              >
                Browse restaurants
              </button>
            </div>
          </div>

          
        </section>
      </main>
    );
  }

  if (stage === "restaurants") {
    return (
      <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.20),_transparent_20%),radial-gradient(circle_at_22%_78%,_rgba(255,252,245,0.22),_transparent_36%),linear-gradient(180deg,_#f0f4e9_0%,_#d9e3d3_42%,_#bdd0bb_100%)]" />
        {globalBackButton}
        {appMenu}

        <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#6f7f68]/45 bg-[rgba(248,251,246,0.94)] p-6 shadow-[0_24px_70px_rgba(45,61,44,0.1)] backdrop-blur-xl sm:p-8 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite • Restaurants</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Pick a restaurant</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5e6b5a]">
              This page is the next step after login. It loads restaurant options from the backend
              and will use MySQL when the database is available.
            </p>

            

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStage("continue")}
                className="rounded-full border border-[#6f7f68]/45 bg-white/88 px-5 py-3 text-sm font-semibold text-[#4f5b47]"
              >
                Back
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#6f7f68]/45 bg-[rgba(248,251,246,0.94)] p-6 shadow-[0_24px_70px_rgba(45,61,44,0.1)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Available now</p>
                <h2 className="mt-2 text-2xl font-black text-[#1f2b21]">Featured restaurants</h2>
              </div>
              <span className="rounded-full border border-[#6f7f68]/45 bg-[#e7efdf] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#4f6750]">
                {restaurants.length} options
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  type="button"
                  onClick={() => openRestaurantMenu(restaurant.id)}
                  className="rounded-[1.35rem] border border-[#6f7f68]/45 bg-white/88 p-4 text-left shadow-[0_10px_24px_rgba(37,46,34,0.06)] transition hover:bg-[#fbfcf8]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black text-[#1f2b21]">{restaurant.name}</p>
                      <p className="mt-1 text-sm text-[#5e6b5a]">{restaurant.cuisine} • {restaurant.location}</p>
                    </div>
                    {restaurant.featured ? (
                      <span className="rounded-full bg-[#4f6b52] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5f8f1]">
                        Featured
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">{restaurant.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">
                    <span className="rounded-full bg-[#e7efdf] px-3 py-1">ETA {restaurant.etaMinutes} min</span>
                    <span className="rounded-full bg-[#e7efdf] px-3 py-1">Rating {restaurant.rating.toFixed(1)}</span>
                    <span className="rounded-full bg-[#e7efdf] px-3 py-1">Tap to open menu</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  const authBackButton = (
    <button
      type="button"
      onClick={() => {
        setStage("role");
        setStatusMessage("Select your role to continue.");
      }}
      className="fixed left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-[rgba(244,247,239,0.82)] text-[#2f452d] shadow-[0_12px_28px_rgba(35,49,34,0.14)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[rgba(238,243,231,0.92)] hover:shadow-[0_16px_34px_rgba(35,49,34,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7a4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f3e8] sm:left-[max(1.25rem,env(safe-area-inset-left))] sm:top-[max(1.25rem,env(safe-area-inset-top))]"
      aria-label="Back to role selection"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[2.5]">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );

  return (
    <main className="min-h-screen px-3 py-3 text-[#1f2b21] sm:px-4 sm:py-4 md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.2),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.18),_transparent_18%),radial-gradient(circle_at_50%_55%,_rgba(255,252,243,0.2),_transparent_42%),linear-gradient(180deg,_#f7f4ea_0%,_#ece6d6_48%,_#e2d9c5_100%)]" />

      {authBackButton}

      <section className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-4xl items-center justify-center">
        <div className="mx-auto flex w-full max-w-[34rem] flex-col gap-4 sm:gap-5">
          <header className="space-y-2 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite</p>
            <h1 className="text-3xl font-black tracking-tight text-[#172217] sm:text-4xl lg:text-[3.55rem]">Welcome back</h1>
            <p className="mx-auto max-w-[31rem] text-[13px] leading-6 text-[#5e6b5a] sm:mx-0 sm:text-sm">
              Use a calm, compact sign-in flow with email or phone login, or create a new account for the selected role.
            </p>
          </header>

          <div className="rounded-[2.1rem] border border-white/40 bg-[rgba(250,251,247,0.84)] p-3.5 shadow-[0_28px_90px_rgba(34,51,34,0.12)] backdrop-blur-2xl sm:p-4">
            <form className="space-y-3.5 sm:space-y-4" onSubmit={handleAuthSubmit}>
              <div className="rounded-[1.35rem] border border-white/45 bg-white/34 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#4f6750]">Selected role</p>
                    <p className="mt-1 text-base font-black text-[#1f2b21] sm:text-[1.05rem]">{selectedRoleCard.title}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">{selectedRoleCard.subtitle}</p>
                  </div>
                  <div className="hidden rounded-full border border-[#7a8d63]/45 bg-[#deebd0] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#2f452d] sm:block">
                    Login / Register
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 rounded-full border border-white/55 bg-white/38 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-md">
                {(["login", "register"] as const).map((mode) => {
                  const isActive = authMode === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => switchAuthMode(mode)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive ? "bg-[#1f3925] text-[#f5f8f1] shadow-[0_10px_20px_rgba(31,57,37,0.22)]" : "text-[#4f5b47] hover:bg-white/78"
                      }`}
                    >
                      {mode === "login" ? "Login" : "Register"}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[1.35rem] border border-white/45 bg-white/30 px-3 py-3 shadow-[0_10px_24px_rgba(37,46,34,0.07)] backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#4f6750]">Sign in method</p>
                    <p className="mt-1 text-[13px] text-[#5e6b5a]">Choose how this account is identified.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["email", "phone"] as const).map((mode) => {
                      const isActive = loginMode === mode;

                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setLoginMode(mode)}
                          className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                            isActive ? "bg-[#1f3925] text-[#f5f8f1] shadow-[0_10px_20px_rgba(31,57,37,0.22)]" : "border border-white/45 bg-white/72 text-[#4f5b47] hover:bg-white"
                          }`}
                        >
                          {mode === "email" ? "Email" : "Phone"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {authMode === "register" ? (
                  <label className="block space-y-1.5">
                    <span className="text-[13px] font-medium text-[#243025]">Full name</span>
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-[1.05rem] border border-white/55 bg-white/74 px-4 py-2 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#5f7a4a]/75 focus:ring-2 focus:ring-[#5f7a4a]/12 backdrop-blur-sm"
                    />
                  </label>
                ) : null}

                <label className="block space-y-1.5">
                  <span className="text-[13px] font-medium text-[#243025]">{loginMode === "email" ? "Email address" : "Mobile number"}</span>
                  <input
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder={helperText}
                    className="w-full rounded-[1.05rem] border border-white/55 bg-white/74 px-4 py-2 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#5f7a4a]/75 focus:ring-2 focus:ring-[#5f7a4a]/12 backdrop-blur-sm"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[13px] font-medium text-[#243025]">Password (min 6 characters needed)</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    minLength={6}
                    className="w-full rounded-[1.05rem] border border-white/55 bg-white/74 px-4 py-2 text-[#243025] outline-none placeholder:text-[#8a927f] focus:border-[#5f7a4a]/75 focus:ring-2 focus:ring-[#5f7a4a]/12 backdrop-blur-sm"
                  />
                </label>

                {authMode === "register" ? (
                  <label className="block space-y-1.5">
                    <span className="text-[13px] font-medium text-[#243025]">Confirm password</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat password"
                      minLength={6}
                      className="w-full rounded-[1.05rem] border border-white/55 bg-white/74 px-4 py-2 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#5f7a4a]/75 focus:ring-2 focus:ring-[#5f7a4a]/12 backdrop-blur-sm"
                    />
                  </label>
                ) : null}

                <label className="block space-y-1.5">
                  <span className="text-[13px] font-medium text-[#243025]">Captcha</span>
                  <input
                    value={captchaInput}
                    onChange={(event) => setCaptchaInput(event.target.value)}
                    placeholder="Answer"
                    className="w-full rounded-[1.05rem] border border-white/55 bg-white/74 px-4 py-2 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#5f7a4a]/75 focus:ring-2 focus:ring-[#5f7a4a]/12 backdrop-blur-sm"
                  />
                </label>

                <div className="rounded-[1.05rem] border border-white/45 bg-white/35 px-3.5 py-3 text-[#1f2b21] shadow-[0_10px_24px_rgba(37,46,34,0.07)] backdrop-blur-md">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#4f6750]">Check</p>
                      <p className="mt-1 text-lg font-black sm:text-xl">{captcha.left} {captcha.operator} {captcha.right}</p>
                    </div>
                    <button type="button" onClick={refreshCaptcha} className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#416332]">
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isBooting}
                className="w-full rounded-full bg-[#1f3925] px-5 py-3 text-sm font-semibold text-[#f5f8f1] shadow-[0_14px_30px_rgba(31,57,37,0.24)] transition hover:bg-[#314537] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Working..." : authMode === "login" ? "Sign in" : "Create account"}
              </button>

              <div className="pt-0.5">
                <StatusBanner message={statusMessage} />
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

