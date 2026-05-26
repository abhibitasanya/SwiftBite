"use client";

import { useEffect, useMemo, useState } from "react";

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

type CheckoutMethod = "cash" | "card" | "upi";

const roleCards: Array<{
  id: UserRole;
  title: string;
  subtitle: string;
  accent: string;
}> = [
  { id: "customer", title: "Order Maker", subtitle: "Browse and order", accent: "from-[#4f6b52] to-[#93a884]" },
  { id: "delivery", title: "Delivery Partner", subtitle: "Pick up and deliver", accent: "from-[#46624b] to-[#89a07a]" },
  { id: "restaurant", title: "Restaurant Owner", subtitle: "Manage menu and orders", accent: "from-[#58745b] to-[#a0b28f]" },
  { id: "platform", title: "Main Team", subtitle: "Support and control", accent: "from-[#3f5a43] to-[#7f9772]" },
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

function NotificationCard({
  title,
  message,
  tone = "neutral",
  compact = false,
}: {
  title: string;
  message: string;
  tone?: "neutral" | "success" | "warning" | "error";
  compact?: boolean;
}) {
  const styles = {
    neutral: "border-[#6f7f68]/55 bg-[#e8e4d9]/90 text-[#243025]",
    success: "border-[#4f6b52]/55 bg-[#dfe7d6] text-[#1f2b21]",
    warning: "border-[#7f8d60]/55 bg-[#ede3c9] text-[#2c2417]",
    error: "border-[#8b5a4d]/55 bg-[#edd6d0] text-[#381f1a]",
  } as const;

  return (
    <div className={`rounded-[1.35rem] border px-4 ${compact ? "py-3" : "py-4"} shadow-[0_10px_30px_rgba(37,46,34,0.12)] backdrop-blur-xl ${styles[tone]}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.26em] opacity-80">{title}</p>
      <p className={`mt-2 ${compact ? "text-sm" : "text-[0.95rem]"} leading-7 opacity-95`}>{message}</p>
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
    <div className={`rounded-[2.35rem] border border-[#edf1e7] bg-[#f9fbf5] p-3 shadow-[0_18px_44px_rgba(12,18,11,0.14)] ${className}`}>
      <div className="rounded-[1.7rem] border border-[#e4eadb] bg-white/96 px-4 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d8ded0]" />
        {children}
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
        { id: 1, customer: "Customer Demo", pickup: "Green Fork", dropoff: "Sector 12, Block C", status: "Heading to customer", etaMinutes: 14, currentLocation: "Near Lake Bridge" },
        { id: 2, customer: "Riya Sharma", pickup: "Spice Harbor", dropoff: "Market Heights", status: "Picked up", etaMinutes: 21, currentLocation: "Main Road checkpoint" },
      ],
    };
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
    },
    timeline: ["Restaurant accepted", "Order packed", "Picked up by rider", "Arriving soon"],
    restaurants,
  };
}

export function AuthLanding() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const [stage, setStage] = useState<Stage>("role");
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loginMode, setLoginMode] = useState<LoginMode>("email");
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
  const [restaurantMenuCart, setRestaurantMenuCart] = useState<MenuCartItem[]>([]);
  const [isRestaurantCartOpen, setIsRestaurantCartOpen] = useState(false);
  const [isRestaurantProfileOpen, setIsRestaurantProfileOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("Sector 12, Block C");
  const [deliveryLandmark, setDeliveryLandmark] = useState("Near Lake Bridge");
  const [riderNotes, setRiderNotes] = useState("Call on arrival and keep the order at the gate.");
  const [contactNumber, setContactNumber] = useState("9876543210");
  const [checkoutMethod, setCheckoutMethod] = useState<CheckoutMethod>("upi");
  const [restaurantFormStatus, setRestaurantFormStatus] = useState("");
  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [newRestaurantCuisine, setNewRestaurantCuisine] = useState("");
  const [newRestaurantLocation, setNewRestaurantLocation] = useState("");
  const [newRestaurantEta, setNewRestaurantEta] = useState("20");
  const [newRestaurantRating, setNewRestaurantRating] = useState("4.5");
  const [newRestaurantDescription, setNewRestaurantDescription] = useState("");
  const [newRestaurantFeatured, setNewRestaurantFeatured] = useState(true);
  const [isBooting, setIsBooting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
    let cancelled = false;

    async function boot() {
      try {
        const response = await fetch(`${apiBaseUrl}/health`);
        const data = (await response.json()) as { api?: string; database?: string };

        if (!cancelled) {
          setBackendState(`API ${data.api ?? (response.ok ? "online" : "offline")} · DB ${data.database ?? "unknown"}`);
        }
      } catch {
        if (!cancelled) setBackendState("API offline");
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

  function chooseRole(role: UserRole) {
    setSelectedRole(role);
  }

  function openRestaurantMenu(restaurantId: number) {
    setSelectedRestaurantId(restaurantId);
    setRestaurantMenuCart([]);
    setIsRestaurantCartOpen(false);
    setIsRestaurantProfileOpen(false);
    setStage("restaurant-menu");
  }

  function openRestaurantCheckout() {
    setIsRestaurantCartOpen(false);
    setIsRestaurantProfileOpen(false);
    setStage("checkout");
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

    try {
      const response = await fetch(`${apiBaseUrl}/api/restaurants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRestaurantName.trim(),
          cuisine: newRestaurantCuisine.trim(),
          location: newRestaurantLocation.trim(),
          etaMinutes: Number(newRestaurantEta),
          rating: Number(newRestaurantRating),
          description: newRestaurantDescription.trim(),
          featured: newRestaurantFeatured,
        }),
      });

      const payload = (await response.json()) as { message?: string; source?: string; restaurant?: RestaurantCard };

      if (!response.ok) {
        setRestaurantFormStatus(payload.message ?? "Unable to add restaurant.");
        return;
      }

      setRestaurantFormStatus(`${payload.message ?? "Restaurant added."} Source: ${payload.source ?? "backend"}.`);
      setDashboardData((current) => {
        if (!current || current.role !== "restaurant") {
          return current;
        }

        return {
          ...current,
          restaurantOptions: [payload.restaurant ?? {
            id: Date.now(),
            name: newRestaurantName.trim(),
            cuisine: newRestaurantCuisine.trim(),
            location: newRestaurantLocation.trim(),
            etaMinutes: Number(newRestaurantEta),
            rating: Number(newRestaurantRating),
            description: newRestaurantDescription.trim(),
            featured: newRestaurantFeatured,
            menu: ["Chef Special Bowl", "Daily Wrap", "Seasonal Plate", "House Drink"],
          }, ...current.restaurantOptions],
        };
      });
      setNewRestaurantName("");
      setNewRestaurantCuisine("");
      setNewRestaurantLocation("");
      setNewRestaurantEta("20");
      setNewRestaurantRating("4.5");
      setNewRestaurantDescription("");
      setNewRestaurantFeatured(true);
    } catch {
      setRestaurantFormStatus("Unable to reach the backend while adding the restaurant.");
    }
  }

  const dashboard = dashboardData ?? createFallbackDashboard(selectedRole, fallbackRestaurantsForUi);

  if (stage === "dashboard") {
    if (selectedRole === "delivery") {
      const deliveryDashboard = (dashboard.role === "delivery" ? dashboard : createFallbackDashboard("delivery", fallbackRestaurantsForUi)) as Extract<DashboardData, { role: "delivery" }>;
      const selectedTrip = deliveryDashboard.activeTrips.find((trip) => trip.id === selectedDeliveryTripId) ?? deliveryDashboard.activeTrips[0] ?? null;

      return (
        <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.22),_transparent_18%),linear-gradient(180deg,_#f4f8ef_0%,_#e5ede0_100%)]" />
          <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <SoftScreen>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite · Delivery</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Where you are right now</h1>
              <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">Track your active trips, current position, and ETA to the next drop.</p>
              <div className="mt-6 rounded-[1.5rem] border border-[#dfe7d6] bg-[#eef3e8] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Route status</p>
                <p className="mt-2 text-sm text-[#5e6b5a]">Current location: {deliveryDashboard.currentPosition}</p>
                <p className="mt-1 text-sm text-[#5e6b5a]">Next drop: {deliveryDashboard.nextDrop}</p>
                <p className="mt-1 text-sm text-[#5e6b5a]">Time to reach: {deliveryDashboard.timeToReach}</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.1rem] border border-[#dfe7d6] bg-white/90 px-4 py-3"><span className="block text-2xl font-black text-[#1f2b21]">{deliveryDashboard.stats.activeTrips}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Active trips</span></div>
                <div className="rounded-[1.1rem] border border-[#dfe7d6] bg-white/90 px-4 py-3"><span className="block text-2xl font-black text-[#1f2b21]">{deliveryDashboard.stats.completedToday}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Delivered today</span></div>
                <div className="rounded-[1.1rem] border border-[#dfe7d6] bg-white/90 px-4 py-3"><span className="block text-2xl font-black text-[#1f2b21]">{deliveryDashboard.stats.earningsToday}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Today</span></div>
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
                    className={`rounded-[1.35rem] border p-4 text-left shadow-[0_10px_24px_rgba(37,46,34,0.06)] transition ${
                      selectedTrip?.id === trip.id
                        ? "border-[#4f6b52]/70 bg-[#eef3e8]"
                        : "border-[#dfe7d6] bg-[#fbfcf8] hover:bg-[#f7faf4]"
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

              <div className="mt-5 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4 shadow-[0_10px_24px_rgba(37,46,34,0.06)]">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Selected trip</p>
                {selectedTrip ? (
                  <>
                    <p className="mt-2 text-2xl font-black text-[#1f2b21]">{selectedTrip.customer}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">{selectedTrip.pickup} → {selectedTrip.dropoff}</p>
                    <p className="mt-3 text-sm text-[#5e6b5a]">{selectedTrip.status}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">Current location: {selectedTrip.currentLocation}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">ETA {selectedTrip.etaMinutes} min</span>
                      <span className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">Trip {selectedTrip.id}</span>
                    </div>
                  </>
                ) : null}
              </div>
            </SoftScreen>
          </section>
        </main>
      );
    }

    if (selectedRole === "restaurant") {
      const restaurantDashboard = (dashboard.role === "restaurant" ? dashboard : createFallbackDashboard("restaurant", fallbackRestaurantsForUi)) as Extract<DashboardData, { role: "restaurant" }>;
      const selectedRestaurantOption = restaurantDashboard.restaurantOptions.find((restaurant) => restaurant.id === selectedRestaurantOptionId) ?? restaurantDashboard.restaurantOptions[0] ?? null;

      return (
        <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.22),_transparent_18%),linear-gradient(180deg,_#f4f8ef_0%,_#e5ede0_100%)]" />
          <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[1fr_1fr]">
            <SoftScreen>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite · Restaurant Owner</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Manage your restaurant</h1>
              <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">Add a restaurant, edit your profile, and keep the kitchen queue moving.</p>

              <form className="mt-6 grid gap-3" onSubmit={handleRestaurantCreate}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={newRestaurantName} onChange={(event) => setNewRestaurantName(event.target.value)} placeholder="Restaurant name" className="rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={newRestaurantCuisine} onChange={(event) => setNewRestaurantCuisine(event.target.value)} placeholder="Cuisine" className="rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={newRestaurantLocation} onChange={(event) => setNewRestaurantLocation(event.target.value)} placeholder="Location" className="rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={newRestaurantEta} onChange={(event) => setNewRestaurantEta(event.target.value)} placeholder="ETA minutes" className="rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <input value={newRestaurantRating} onChange={(event) => setNewRestaurantRating(event.target.value)} placeholder="Rating" className="rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                  <label className="flex items-center gap-2 rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 text-sm text-[#4f5b47]"><input type="checkbox" checked={newRestaurantFeatured} onChange={(event) => setNewRestaurantFeatured(event.target.checked)} /> Featured</label>
                </div>
                <textarea value={newRestaurantDescription} onChange={(event) => setNewRestaurantDescription(event.target.value)} placeholder="Short description" className="min-h-24 rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-3 outline-none focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
                <button type="submit" className="rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f8f1] shadow-[0_10px_24px_rgba(63,90,61,0.18)]">Add restaurant</button>
              </form>

              <div className="mt-4">
                <NotificationCard
                  title="Kitchen status"
                  message={restaurantFormStatus || `${restaurantDashboard.profile.ordersPending} orders pending · ${restaurantDashboard.profile.kitchenStatus} kitchen`}
                  tone={restaurantFormStatus ? toneFromText(restaurantFormStatus) : "warning"}
                />
              </div>
            </SoftScreen>

            <SoftScreen>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Current restaurants</p>
              <div className="mt-4 grid gap-3">
                {restaurantDashboard.restaurantOptions.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => setSelectedRestaurantOptionId(restaurant.id)}
                    className={`rounded-[1.35rem] border p-4 text-left shadow-[0_10px_24px_rgba(37,46,34,0.06)] transition ${
                      selectedRestaurantOption?.id === restaurant.id
                        ? "border-[#4f6b52]/70 bg-[#eef3e8]"
                        : "border-[#dfe7d6] bg-[#fbfcf8] hover:bg-[#f7faf4]"
                    }`}
                  >
                    <p className="text-lg font-black text-[#1f2b21]">{restaurant.name}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">{restaurant.cuisine} · {restaurant.location}</p>
                    <p className="mt-2 text-sm text-[#5e6b5a]">{restaurant.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4 shadow-[0_10px_24px_rgba(37,46,34,0.06)]">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Selected restaurant</p>
                {selectedRestaurantOption ? (
                  <>
                    <p className="mt-2 text-2xl font-black text-[#1f2b21]">{selectedRestaurantOption.name}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">{selectedRestaurantOption.cuisine} · {selectedRestaurantOption.location}</p>
                    <p className="mt-3 text-sm text-[#5e6b5a]">{selectedRestaurantOption.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedRestaurantOption.menu.map((dish) => (
                        <span key={dish} className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">{dish}</span>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4 shadow-[0_10px_24px_rgba(37,46,34,0.06)]">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Pending orders</p>
                <div className="mt-3 grid gap-2">
                  {restaurantDashboard.pendingOrders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2 text-sm text-[#5e6b5a]">{order.id} · {order.customer} · {order.items} · {order.status} · {order.due}</div>
                  ))}
                </div>
              </div>
            </SoftScreen>
          </section>
        </main>
      );
    }

    if (selectedRole === "platform") {
      const platformDashboard = (dashboard.role === "platform" ? dashboard : createFallbackDashboard("platform", fallbackRestaurantsForUi)) as Extract<DashboardData, { role: "platform" }>;
      const selectedPlatformUser = platformDashboard.recentUsers.find((user) => user.identifier === selectedPlatformUserIdentifier) ?? platformDashboard.recentUsers[0] ?? null;
      const selectedPlatformRestaurant = platformDashboard.recentRestaurants.find((restaurant) => restaurant.id === selectedPlatformRestaurantId) ?? platformDashboard.recentRestaurants[0] ?? null;

      return (
        <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.22),_transparent_18%),linear-gradient(180deg,_#f4f8ef_0%,_#e5ede0_100%)]" />
          <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[1fr_1fr]">
            <SoftScreen>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite · Main Team</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Everything in one view</h1>
              <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">See who is using the app, how many restaurants are live, and what is happening right now.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.1rem] border border-[#dfe7d6] bg-white/92 px-4 py-3"><span className="block text-2xl font-black text-[#1f2b21]">{platformDashboard.totals.users}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Users</span></div>
                <div className="rounded-[1.1rem] border border-[#dfe7d6] bg-white/92 px-4 py-3"><span className="block text-2xl font-black text-[#1f2b21]">{platformDashboard.totals.restaurants}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Restaurants</span></div>
                <div className="rounded-[1.1rem] border border-[#dfe7d6] bg-white/92 px-4 py-3"><span className="block text-2xl font-black text-[#1f2b21]">{platformDashboard.totals.activeOrders}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Active orders</span></div>
                <div className="rounded-[1.1rem] border border-[#dfe7d6] bg-white/92 px-4 py-3"><span className="block text-2xl font-black text-[#1f2b21]">{platformDashboard.totals.deliveries}</span><span className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">Deliveries</span></div>
              </div>
            </SoftScreen>

            <SoftScreen>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Activity stream</p>
              <div className="mt-4 grid gap-3">
                {platformDashboard.activity.map((item) => (
                  <div key={item} className="rounded-[1.1rem] border border-[#dfe7d6] bg-white/92 px-4 py-3 text-sm text-[#5e6b5a]">{item}</div>
                ))}
              </div>
              <div className="mt-5 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Recent users</p>
                <div className="mt-3 grid gap-2">
                  {platformDashboard.recentUsers.map((user) => (
                    <button
                      key={`${user.identifier}-${user.role}`}
                      type="button"
                      onClick={() => setSelectedPlatformUserIdentifier(user.identifier)}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                        selectedPlatformUser?.identifier === user.identifier
                          ? "border-[#4f6b52]/70 bg-[#f9fcf5] text-[#1f2b21]"
                          : "border-[#dfe7d6] bg-white/92 text-[#5e6b5a] hover:bg-[#f7faf4]"
                      }`}
                    >
                      {user.fullName} · {user.role} · {user.identifier}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Selected user</p>
                {selectedPlatformUser ? (
                  <>
                    <p className="mt-2 text-2xl font-black text-[#1f2b21]">{selectedPlatformUser.fullName}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">{selectedPlatformUser.role} · {selectedPlatformUser.identifier}</p>
                  </>
                ) : null}
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Selected restaurant</p>
                {selectedPlatformRestaurant ? (
                  <>
                    <p className="mt-2 text-2xl font-black text-[#1f2b21]">{selectedPlatformRestaurant.name}</p>
                    <p className="mt-1 text-sm text-[#5e6b5a]">{selectedPlatformRestaurant.cuisine} · {selectedPlatformRestaurant.location}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedPlatformRestaurant.menu.map((dish) => (
                        <span key={dish} className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6750]">{dish}</span>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </SoftScreen>
          </section>
        </main>
      );
    }

    const customerDashboard = (dashboard.role === "customer" ? dashboard : createFallbackDashboard("customer", fallbackRestaurantsForUi)) as Extract<DashboardData, { role: "customer" }>;

    return (
      <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.22),_transparent_18%),linear-gradient(180deg,_#f4f8ef_0%,_#e5ede0_100%)]" />
        <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SoftScreen>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite · Customer</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Track your order</h1>
            <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">See your active order, rider ETA, and the restaurants available right now.</p>
            <div className="mt-6 rounded-[1.5rem] border border-[#dfe7d6] bg-[#eef3e8] p-5 shadow-[0_10px_24px_rgba(37,46,34,0.05)]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Active order</p>
              <p className="mt-2 text-2xl font-black text-[#1f2b21]">{customerDashboard.activeOrder.restaurant}</p>
              <p className="mt-1 text-sm text-[#5e6b5a]">{customerDashboard.activeOrder.status} · Rider {customerDashboard.activeOrder.rider}</p>
              <p className="mt-1 text-sm text-[#5e6b5a]">ETA {customerDashboard.activeOrder.etaMinutes} min · {customerDashboard.activeOrder.address}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setStage("role")} className="rounded-full border border-[#dfe7d6] bg-[#f8faf4] px-5 py-3 text-sm font-semibold text-[#4f5b47] shadow-[0_8px_18px_rgba(37,46,34,0.06)]">Change role</button>
              <button type="button" onClick={() => setStage("login")} className="rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f8f1]">Sign out</button>
            </div>
          </SoftScreen>

          <SoftScreen>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Live options</p>
            <div className="mt-4 grid gap-3">
              {customerDashboard.restaurants.map((restaurant) => (
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
                      <p className="mt-1 text-sm text-[#5e6b5a]">{restaurant.cuisine} · {restaurant.location}</p>
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.22),_transparent_18%),linear-gradient(180deg,_#f4f8ef_0%,_#e5ede0_100%)]" />
        <button type="button" onClick={() => setIsRestaurantProfileOpen((current) => !current)} className="fixed left-4 top-4 z-30 rounded-full border border-[#6f7f68]/45 bg-white/95 p-3 shadow-[0_14px_30px_rgba(37,46,34,0.14)] backdrop-blur-xl" aria-label="Open profile settings">
          <span className="block text-xl font-black text-[#4f6750]">☰</span>
        </button>

        <button type="button" onClick={() => setIsRestaurantCartOpen((current) => !current)} className="fixed right-3 top-1/2 z-30 -translate-y-1/2 rounded-full border border-[#6f7f68]/45 bg-[#223326] p-3 shadow-[0_14px_30px_rgba(37,46,34,0.14)]" aria-label="Open cart">
          <span className="block text-xl font-black text-[#f5f8f1]">🛒</span>
          {restaurantMenuItemCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d6e2c2] px-1 text-[10px] font-black text-[#1f2b21]">{restaurantMenuItemCount}</span>
          ) : null}
        </button>

        <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SoftScreen>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite · Menu</p>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{selectedRestaurant.name}</h1>
                <p className="mt-2 text-sm text-[#5e6b5a]">{selectedRestaurant.cuisine} · {selectedRestaurant.location}</p>
              </div>
              <button type="button" onClick={() => setStage("restaurants")} className="rounded-full border border-[#6f7f68]/45 bg-[#f8faf4] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#4f5b47]">
                Back
              </button>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#5e6b5a]">{selectedRestaurant.description}</p>
            <div className="mt-6 grid gap-3 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4">
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
              <span className="rounded-full bg-[#e7efdf] px-3 py-1">Use + / − to change quantity</span>
            </div>
            <div className="mt-6 grid gap-3">
              {selectedRestaurant.menu.map((dish, index) => {
                const price = getMenuPrice(selectedRestaurant.id, index);
                const cartItem = restaurantMenuCart.find((item) => item.name === dish);

                return (
                  <div key={dish} className="rounded-[1.35rem] border border-[#dfe7d6] bg-[#fbfcf8] p-4 shadow-[0_10px_24px_rgba(37,46,34,0.06)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-[#1f2b21]">{dish}</p>
                        <p className="mt-1 text-sm text-[#5e6b5a]">Freshly prepared and easy to customize.</p>
                        <p className="mt-2 text-sm font-semibold text-[#4f6750]">₹{price}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-[#dfe7d6] bg-white px-2 py-2">
                        <button type="button" onClick={() => updateRestaurantMenuCart(dish, price, -1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef3e8] text-lg font-black text-[#4f6750]">−</button>
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
            <div className="mt-4 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Address</p>
              <p className="mt-2 text-sm text-[#1f2b21]">{deliveryAddress || "No address added yet"}</p>
            </div>
            <div className="mt-4 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4">
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
                  <div key={item.name} className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#1f2b21]">{item.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#4f6750]">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateRestaurantMenuCart(item.name, item.price, -1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef3e8] text-lg font-black text-[#4f6750]">−</button>
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
            <div className={`fixed left-16 top-24 z-30 w-[min(92vw,20rem)] rounded-[1.6rem] border border-[#dfe7d6] bg-[#fbfcf8] p-4 shadow-[0_20px_60px_rgba(37,46,34,0.18)] transition ${isRestaurantProfileOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-6 opacity-0"}`}>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Profile & settings</p>
              <p className="mt-3 text-sm font-black text-[#1f2b21]">{selectedRoleCard.title}</p>
              <p className="mt-1 text-sm text-[#5e6b5a]">Manage your profile, saved addresses, and menu preferences.</p>
              <div className="mt-4 grid gap-2 text-sm text-[#5e6b5a]">
                <button type="button" onClick={() => setStage("dashboard")} className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2 text-left">Account details</button>
                <button type="button" onClick={() => setStage("login")} className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2 text-left">Switch account</button>
                <button type="button" onClick={() => setStage("restaurants")} className="rounded-xl border border-[#dfe7d6] bg-white/92 px-3 py-2 text-left">Back to restaurants</button>
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.22),_transparent_18%),linear-gradient(180deg,_#f4f8ef_0%,_#e5ede0_100%)]" />

        <button type="button" onClick={() => setStage("restaurant-menu")} className="fixed left-4 top-4 z-30 rounded-full border border-[#6f7f68]/45 bg-white/95 p-3 shadow-[0_14px_30px_rgba(37,46,34,0.14)] backdrop-blur-xl" aria-label="Open menu">
          <span className="block text-xl font-black text-[#4f6750]">☰</span>
        </button>

        <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SoftScreen>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite · Checkout</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Delivery details</h1>
            <p className="mt-3 text-sm leading-7 text-[#5e6b5a]">Add the rider instructions, landmark, and contact details before placing the order.</p>

            <div className="mt-6 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Delivering to</p>
              <input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Delivery address" className="mt-3 w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
              <input value={deliveryLandmark} onChange={(event) => setDeliveryLandmark(event.target.value)} placeholder="Landmark / area" className="mt-3 w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
              <input value={contactNumber} onChange={(event) => setContactNumber(event.target.value)} placeholder="Contact number" className="mt-3 w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
              <textarea value={riderNotes} onChange={(event) => setRiderNotes(event.target.value)} placeholder="Rider instructions" className="mt-3 min-h-28 w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10" />
            </div>

            <div className="mt-6 rounded-[1.35rem] border border-[#dfe7d6] bg-[#eef3e8] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Payment method</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {(["upi", "card", "cash"] as CheckoutMethod[]).map((method) => (
                  <button key={method} type="button" onClick={() => setCheckoutMethod(method)} className={`rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition ${checkoutMethod === method ? "border-[#4f6b52]/70 bg-[#223326] text-[#f5f8f1]" : "border-[#dfe7d6] bg-white/92 text-[#4f5b47] hover:bg-[#f7faf4]"}`}>
                    {method === "upi" ? "UPI" : method}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setStage("restaurant-menu")} className="rounded-full border border-[#6a8160]/45 bg-[#f4efe4] px-5 py-3 text-sm font-semibold text-[#354033]">
                Edit cart
              </button>
              <button type="button" onClick={() => setStage("dashboard")} className="rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f1e7]">
                Place order
              </button>
            </div>
          </SoftScreen>

          <SoftScreen>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Order summary</p>
            <div className="mt-4 rounded-[1.35rem] border border-[#dfe7d6] bg-[#fbfcf8] p-4">
              <p className="text-sm font-bold text-[#1f2b21]">{selectedRestaurant.name}</p>
              <p className="mt-1 text-sm text-[#5e6b5a]">{selectedRestaurant.cuisine} · {selectedRestaurant.location}</p>
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

            <div className="mt-5 rounded-[1.35rem] border border-[#dfe7d6] bg-[#fbfcf8] p-4 shadow-[0_10px_24px_rgba(37,46,34,0.06)]">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#4f6750]">Total</p>
                <span className="text-lg font-black text-[#1f2b21]">₹{restaurantMenuSubtotal.toFixed(0)}</span>
              </div>
              <button type="button" className="mt-4 w-full rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f8f1]">
                Confirm and send to rider
              </button>
            </div>
          </SoftScreen>
        </section>
      </main>
    );
  }

  if (stage === "role") {
    return (
      <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.22),_transparent_18%),linear-gradient(180deg,_#f4f8ef_0%,_#e5ede0_100%)]" />

        <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-7xl items-start gap-6">
          <div className="space-y-6">
            <div className="origin-top scale-[0.9] rounded-[2.4rem] border border-[#6d7c63]/55 bg-[#5f7258] p-3 shadow-[0_28px_80px_rgba(19,28,16,0.34)] sm:scale-[0.92] sm:p-4 lg:p-4.5">
              <div className="mb-4 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ebf0e4]/85">
                <span>SwiftBite mood board</span>
                <span>sage edition</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <MoodBoardPhone variant="bag" />
                <MoodBoardPhone variant="tracking" />
                <MoodBoardPhone variant="rewards" />
              </div>
            </div>

            <div className="space-y-6 rounded-[2rem] border border-[#6f7f68]/45 bg-[rgba(248,251,246,0.95)] p-6 shadow-[0_24px_70px_rgba(45,61,44,0.1)] backdrop-blur-xl sm:p-7 lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Choose your role</h1>
              </div>
              <span className="rounded-full border border-[#6a8160]/55 bg-[#dfe7d6] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#243025]">
                Step 1 of 2
              </span>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-[#4d564a]">Select the profile you want to use. The next screen will show login or register for that role.</p>

            <div className="mt-2 flex items-center justify-center gap-3 sm:gap-5">
              <button
                type="button"
                onClick={() => cycleRole("left")}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-[#dfe7d6] bg-[#f7faf2] text-2xl font-black text-[#4f5b47] shadow-[0_14px_32px_rgba(37,46,34,0.12)] transition hover:-translate-y-0.5 hover:bg-white sm:h-18 sm:w-18"
                aria-label="Previous role"
              >
                ◀
              </button>

              <div className="relative flex min-h-[30rem] w-full max-w-[60rem] items-center justify-center overflow-visible px-2 sm:min-h-[32rem] sm:px-6" style={{ perspective: "1200px" }}>
                {roleWheelCards.map(({ card, offset }) => {
                  const isActive = offset === 0;
                  const absOffset = Math.abs(offset);
                  const isRearCard = absOffset === 2;
                  const translateX = isRearCard ? 0 : offset * 66;
                  const translateY = isActive ? 0 : absOffset === 1 ? 14 : -92;
                  const scale = isActive ? 1.08 : absOffset === 1 ? 0.92 : 0.84;
                  const rotateY = isRearCard ? 0 : offset * -20;
                  const rotateX = isRearCard ? 8 : 0;
                  const opacity = isActive ? 1 : absOffset === 1 ? 0.98 : 0.56;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => chooseRole(card.id)}
                      className={`absolute left-1/2 top-1/2 w-[min(84vw,24rem)] rounded-[1.95rem] border p-4 text-left transition-[transform,opacity,box-shadow] duration-500 ease-out sm:w-[21rem] ${
                        isActive
                          ? "border-[#4f6b52]/70 bg-[#dbe3d1] shadow-[0_18px_42px_rgba(63,90,61,0.16)]"
                          : "border-[#6f7f68]/45 bg-[#f4efe4]/94 shadow-[0_10px_24px_rgba(37,46,34,0.08)]"
                      }`}
                      style={{
                        opacity,
                        zIndex: isActive ? 50 : absOffset === 1 ? 40 : 32,
                        transform: `translate(-50%, -50%) translateX(${translateX}%) translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                      }}
                    >
                      <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accent}`} />
                      <div className="mt-4 rounded-[1.35rem] border border-[#dfe7d6] bg-[#f8fbf4] px-4 py-4 shadow-[0_10px_24px_rgba(37,46,34,0.06)]">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-black text-[#1c271d]">{card.title}</p>
                            <p className="mt-1 text-sm text-[#4d564a]">{card.subtitle}</p>
                          </div>
                          {isActive ? (
                            <span className="rounded-full bg-[#314a32] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4eee3]">
                              Selected
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-4 grid grid-cols-[1fr_auto] gap-3 rounded-[1.1rem] border border-[#dfe7d6] bg-white/92 p-3">
                          <div className="space-y-2">
                            <div className="h-2.5 w-3/4 rounded-full bg-[#d7ddcf]" />
                            <div className="h-2.5 w-1/2 rounded-full bg-[#e3e6dc]" />
                            <div className="h-2.5 w-5/6 rounded-full bg-[#d7ddcf]" />
                          </div>
                          <div className="h-16 w-16 rounded-[1rem] bg-[radial-gradient(circle_at_30%_30%,#d9dfcd,#8b9c72)]" />
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#66745c]">
                          <span>Preview</span>
                          <span className="rounded-full bg-[#e7efdf] px-3 py-1 text-[#4f6750]">Swipe card</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => cycleRole("right")}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-[#dfe7d6] bg-[#f7faf2] text-2xl font-black text-[#4f5b47] shadow-[0_14px_32px_rgba(37,46,34,0.12)] transition hover:-translate-y-0.5 hover:bg-white sm:h-18 sm:w-18"
                aria-label="Next role"
              >
                ▶
              </button>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#6f7f68]/55 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#4d564a]">
                Continue as <span className="font-semibold text-[#1c271d]">{selectedRoleCard.title}</span>.
              </p>
              <button
                type="button"
                onClick={() => setStage("login")}
                className="inline-flex items-center justify-center rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f1e7] transition hover:bg-[#314537]"
              >
                Next
              </button>
            </div>
            </div>
          </div>

        </section>
      </main>
    );
  }

  if (stage === "continue") {
    return (
      <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.22),_transparent_18%),linear-gradient(180deg,_#f4f8ef_0%,_#e5ede0_100%)]" />

        <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#5f7756]/55 bg-[rgba(225,212,193,0.92)] p-6 shadow-[0_24px_70px_rgba(45,61,44,0.14)] backdrop-blur-xl sm:p-8 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite · Step 2</p>
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
                onClick={() => setStage("role")}
                className="rounded-full border border-[#6a8160]/45 bg-[#f4efe4] px-5 py-3 text-sm font-semibold text-[#354033]"
              >
                Change role
              </button>
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

          <div className="rounded-[2rem] border border-[#5f7756]/55 bg-[rgba(225,212,193,0.92)] p-6 shadow-[0_24px_70px_rgba(45,61,44,0.14)] backdrop-blur-xl sm:p-8 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Status</p>
            <div className="mt-4">
              <NotificationCard title="Login confirmed" message="Signed in successfully. The dashboard is ready." tone="success" />
            </div>
            <div className="mt-4">
              <NotificationCard title="Backend" message={backendState} tone={toneFromText(backendState)} compact />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (stage === "restaurants") {
    return (
      <main className="min-h-screen px-4 py-4 text-[#243025] sm:px-6 sm:py-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.22),_transparent_18%),linear-gradient(180deg,_#f4f8ef_0%,_#e5ede0_100%)]" />

        <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#6f7f68]/45 bg-[rgba(248,251,246,0.94)] p-6 shadow-[0_24px_70px_rgba(45,61,44,0.1)] backdrop-blur-xl sm:p-8 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite · Restaurants</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Pick a restaurant</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5e6b5a]">
              This page is the next step after login. It loads restaurant options from the backend
              and will use MySQL when the database is available.
            </p>

            <div className="mt-8 grid gap-3">
              <NotificationCard title="Backend source" message={backendState} tone={toneFromText(backendState)} />
              <NotificationCard title="Restaurant feed" message={restaurantSource} tone={toneFromText(restaurantSource)} compact />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStage("continue")}
                className="rounded-full border border-[#6f7f68]/45 bg-white/88 px-5 py-3 text-sm font-semibold text-[#4f5b47]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage("login");
                  switchAuthMode("login");
                }}
                className="rounded-full bg-[#223326] px-5 py-3 text-sm font-semibold text-[#f5f8f1]"
              >
                Sign in again
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
                      <p className="mt-1 text-sm text-[#5e6b5a]">{restaurant.cuisine} · {restaurant.location}</p>
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

  return (
    <main className="min-h-screen px-4 py-4 text-[#1f2b21] sm:px-6 sm:py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(63,90,61,0.24),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(111,135,92,0.22),_transparent_18%),linear-gradient(180deg,_#f4f8ef_0%,_#e5ede0_100%)]" />

      <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#6f7f68]/45 bg-[rgba(248,251,246,0.94)] p-6 shadow-[0_24px_70px_rgba(45,61,44,0.1)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">SwiftBite</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Welcome back</h1>
            </div>
            <div className="hidden rounded-full border border-[#6f7f68]/45 bg-[#e7efdf] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#4f6750] sm:block">
              Login / Register
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5e6b5a]">Use a clean sign-in flow with email or phone login, or create a new account for the selected role.</p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-full border border-[#6f7f68]/45 bg-[#e7efdf] p-1.5">
            {(["login", "register"] as const).map((mode) => {
              const isActive = authMode === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => switchAuthMode(mode)}
                  className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-[#223326] text-[#f5f8f1] shadow-sm" : "text-[#4f5b47] hover:bg-white/78"
                  }`}
                >
                  {mode === "login" ? "Login" : "Register"}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-[1.25rem] border border-[#6f7f68]/45 bg-[#e7efdf] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#4f6750]">Sign in method</p>
                <p className="mt-1 text-sm text-[#5e6b5a]">Pick how you want to identify this account.</p>
              </div>
              <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
                {(["email", "phone"] as const).map((mode) => {
                  const isActive = loginMode === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setLoginMode(mode)}
                      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                        isActive ? "bg-[#223326] text-[#f5f8f1] shadow-sm" : "border border-[#6f7f68]/45 bg-white/88 text-[#4f5b47] hover:bg-white"
                      }`}
                    >
                      {mode === "email" ? "Email" : "Phone"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleAuthSubmit}>
            {authMode === "register" ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#243025]">Full name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10"
                />
              </label>
            ) : null}

            <div className="grid gap-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#243025]">{loginMode === "email" ? "Email address" : "Mobile number"}</span>
                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder={helperText}
                  className="w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#243025]">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#243025] outline-none placeholder:text-[#8a927f] focus:border-[#7a8e63]/70 focus:ring-2 focus:ring-[#7a8e63]/10"
                />
              </label>

              {authMode === "register" ? (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[#243025]">Confirm password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10"
                  />
                </label>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#243025]">Captcha</span>
                <input
                  value={captchaInput}
                  onChange={(event) => setCaptchaInput(event.target.value)}
                  placeholder="Answer"
                  className="w-full rounded-[1.15rem] border border-[#6f7f68]/45 bg-white px-4 py-3 text-[#1f2b21] outline-none placeholder:text-[#7f8a7a] focus:border-[#4f6b52]/70 focus:ring-2 focus:ring-[#4f6b52]/10"
                />
              </label>

              <div className="rounded-[1.15rem] border border-[#6f7f68]/45 bg-[#e7efdf] px-4 py-3 text-[#1f2b21]">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#4f6750]">Check</p>
                <p className="mt-2 text-2xl font-black">{captcha.left} {captcha.operator} {captcha.right}</p>
                <button type="button" onClick={refreshCaptcha} className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-[#4f6750]">
                  Refresh
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isBooting}
              className="w-full rounded-full bg-[#223326] px-5 py-3.5 text-sm font-semibold text-[#f5f8f1] transition hover:bg-[#314537] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Working..." : authMode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-5">
            <NotificationCard title={authMode === "login" ? "Login status" : "Register status"} message={statusMessage} tone={toneFromText(statusMessage)} />
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[#5f7756]/55 bg-[rgba(225,212,193,0.92)] p-6 shadow-[0_24px_70px_rgba(45,61,44,0.14)] backdrop-blur-xl sm:p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4f6750]">Status</p>
          <div className="mt-4">
            <NotificationCard title="Backend health" message={backendState} tone={toneFromText(backendState)} />
          </div>

            <div className="mt-5 grid gap-3 text-sm text-[#4d564a]">
            <div className="rounded-[1.1rem] border border-[#6f7f68]/45 bg-[#f4efe4]/92 px-4 py-3 shadow-[0_8px_24px_rgba(37,46,34,0.08)]">Login and register now both connect to the backend.</div>
            <div className="rounded-[1.1rem] border border-[#6f7f68]/45 bg-[#f4efe4]/92 px-4 py-3 shadow-[0_8px_24px_rgba(37,46,34,0.08)]">Register creates a real user row in MySQL.</div>
            <div className="rounded-[1.1rem] border border-[#6f7f68]/45 bg-[#f4efe4]/92 px-4 py-3 shadow-[0_8px_24px_rgba(37,46,34,0.08)]">Errors now say exactly what failed.</div>
          </div>
        </aside>
      </section>
    </main>
  );
}