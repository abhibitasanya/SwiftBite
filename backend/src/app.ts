import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { createHash, randomUUID } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "./db.js";
import { z } from "zod";

dotenv.config();

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["customer", "delivery", "restaurant", "platform"]),
  loginMode: z.enum(["email", "phone"]),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2),
  identifier: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["customer", "delivery", "restaurant", "platform"]),
  loginMode: z.enum(["email", "phone"]),
});

const chatbotMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().trim().min(1).max(4000),
  timestamp: z.string().optional(),
});

const chatbotSchema = z.object({
  sessionId: z.string().trim().min(8).optional(),
  role: z.enum(["customer", "delivery", "restaurant", "platform"]).optional(),
  messages: z.array(chatbotMessageSchema).min(1).max(20),
});

const riderProfileSchema = z.object({
  userIdentifier: z.string().trim().min(1),
  fullName: z.string().trim().min(2),
  profileImageUrl: z.string().trim().optional().default(""),
  age: z.coerce.number().int().min(18).max(75),
  gender: z.string().trim().min(1),
  phoneNumber: z.string().trim().min(6),
  alternatePhoneNumber: z.string().trim().optional().default(""),
  email: z.string().trim().email().optional().default(""),
  residentialAddress: z.string().trim().min(6),
  cityState: z.string().trim().min(2),
  emergencyContact: z.string().trim().min(6),
  vehicleType: z.string().trim().min(2),
  vehicleNumber: z.string().trim().min(2),
  drivingLicenseNumber: z.string().trim().min(4),
  availabilityStatus: z.enum(["available", "busy", "offline"]),
  isOnline: z.coerce.boolean().default(false),
  deliveryZone: z.string().trim().min(2),
  joiningDate: z.string().trim().min(4),
  completedOrdersCount: z.coerce.number().int().min(0).default(0),
  activeDeliveries: z.coerce.number().int().min(0).default(0),
  earningsToday: z.string().trim().default("₹0"),
  verificationStatus: z.enum(["pending", "verified", "rejected"]).default("pending"),
  idProofUrl: z.string().trim().optional().default(""),
  drivingLicenseUrl: z.string().trim().optional().default(""),
  profilePhotoUrl: z.string().trim().optional().default(""),
});

const restaurantProfileSchema = z.object({
  userIdentifier: z.string().trim().min(1),
  restaurantName: z.string().trim().min(2),
  restaurantLogoUrl: z.string().trim().optional().default(""),
  coverImageUrl: z.string().trim().optional().default(""),
  ownerName: z.string().trim().min(2),
  contactNumber: z.string().trim().min(6),
  email: z.string().trim().email().optional().default(""),
  restaurantAddress: z.string().trim().min(6),
  cityState: z.string().trim().min(2),
  cuisineType: z.string().trim().min(2),
  gstLicenseNumber: z.string().trim().min(4),
  openingHours: z.string().trim().min(3),
  deliveryRadius: z.coerce.number().int().min(1).max(100),
  description: z.string().trim().min(6),
  verificationStatus: z.enum(["pending", "verified", "rejected"]).default("pending"),
});

const menuItemSchema = z.object({
  restaurantIdentifier: z.string().trim().min(1),
  dishName: z.string().trim().min(2),
  dishImageUrl: z.string().trim().optional().default(""),
  price: z.coerce.number().min(0),
  category: z.string().trim().min(2),
  description: z.string().trim().min(4),
  spiceLevel: z.enum(["mild", "medium", "hot", "extra-hot"]).default("medium"),
  vegType: z.enum(["veg", "non-veg"]).default("veg"),
  isAvailable: z.coerce.boolean().default(true),
  preparationTimeMinutes: z.coerce.number().int().min(1).max(180),
  isFeatured: z.coerce.boolean().default(false),
  isBestseller: z.coerce.boolean().default(false),
  isRecommended: z.coerce.boolean().default(false),
});

const uploadMetaSchema = z.object({
  ownerType: z.enum(["rider", "restaurant", "menu-item"]),
  ownerIdentifier: z.string().trim().min(1),
  purpose: z.string().trim().min(2),
  fileName: z.string().trim().min(1),
  mimeType: z.string().trim().min(1).default("image/png"),
  dataUrl: z.string().trim().min(1),
});

type RiderProfileRecord = z.infer<typeof riderProfileSchema> & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

type RestaurantProfileRecord = z.infer<typeof restaurantProfileSchema> & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

type MenuItemRecord = z.infer<typeof menuItemSchema> & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

type UploadedImageRecord = {
  id: number;
  ownerType: "rider" | "restaurant" | "menu-item";
  ownerIdentifier: string;
  purpose: string;
  fileName: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

type RestaurantCategoryRecord = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
};

const restaurantSchema = z.object({
  name: z.string().trim().min(2),
  cuisine: z.string().trim().min(2),
  location: z.string().trim().min(2),
  etaMinutes: z.coerce.number().int().min(1).max(180),
  rating: z.coerce.number().min(0).max(5),
  description: z.string().trim().min(6),
  featured: z.coerce.boolean().optional().default(false),
});

type AuthRecord = {
  id: number;
  fullName: string;
  identifier: string;
  role: "customer" | "delivery" | "restaurant" | "platform";
  passwordHash: string;
};

type RestaurantRecord = {
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

type DashboardRole = AuthRecord["role"];

type DeliveryTask = {
  id: number;
  customer: string;
  pickup: string;
  dropoff: string;
  status: string;
  etaMinutes: number;
  currentLocation: string;
};

type OrderRecord = {
  id: number;
  restaurantId: number;
  restaurantName: string;
  customerIdentifier: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  address: string;
  contactNumber: string;
  notes?: string;
  createdAt: string;
};

type PlatformUser = {
  fullName: string;
  identifier: string;
  role: DashboardRole;
};

type ChatbotMessage = {
  role: "user" | "assistant";
  text: string;
  timestamp?: string;
};

type ChatbotSession = {
  messages: ChatbotMessage[];
  updatedAt: number;
};

type ChatbotPrompt = {
  messages: ChatbotMessage[];
  role?: DashboardRole;
};

type ChatbotProvider = {
  respond: (prompt: ChatbotPrompt) => string;
};

type HealthStatus = {
  api: "online" | "offline";
  database: "connected" | "disconnected" | "not-configured";
  message: string;
};

const uploadDirectory = path.resolve(process.cwd(), "uploads");
mkdirSync(uploadDirectory, { recursive: true });

const fallbackUsers = new Map<string, AuthRecord>(
  [
    ["customer@example.com::customer", { id: 1, fullName: "Customer Demo", identifier: "customer@example.com", role: "customer", passwordHash: sha256Hex("Password123") }],
    ["9876543210::delivery", { id: 2, fullName: "Delivery Demo", identifier: "9876543210", role: "delivery", passwordHash: sha256Hex("Password123") }],
    ["restaurant@example.com::restaurant", { id: 3, fullName: "Restaurant Demo", identifier: "restaurant@example.com", role: "restaurant", passwordHash: sha256Hex("Password123") }],
    ["platform@example.com::platform", { id: 4, fullName: "Platform Demo", identifier: "platform@example.com", role: "platform", passwordHash: sha256Hex("Password123") }],
  ]
);

let fallbackRestaurants: RestaurantRecord[] = [
  {
    id: 1,
    name: "Green Fork",
    cuisine: "Healthy bowls",
    location: "City Center",
    etaMinutes: 18,
    rating: 4.8,
    description: "Fresh bowls, wraps, and grain plates for quick lunch orders.",
    featured: true,
    menu: buildMenuForRestaurant("Green Fork", "Healthy bowls"),
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
    menu: buildMenuForRestaurant("Spice Harbor", "North Indian"),
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
    menu: buildMenuForRestaurant("Ocean Bites", "Seafood"),
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
    menu: buildMenuForRestaurant("Brick Oven House", "Pizza & Pasta"),
  },
];

const fallbackDeliveryTasks: DeliveryTask[] = [
  {
    id: 1,
    customer: "Customer Demo",
    pickup: "Green Fork",
    dropoff: "Sector 12, Block C",
    status: "Heading to customer",
    etaMinutes: 14,
    currentLocation: "Near Lake Bridge",
  },
  {
    id: 2,
    customer: "Riya Sharma",
    pickup: "Spice Harbor",
    dropoff: "Market Heights",
    status: "Picked up",
    etaMinutes: 21,
    currentLocation: "Main Road checkpoint",
  },
];

let fallbackOrders: OrderRecord[] = [];

const fallbackPlatformUsers: PlatformUser[] = [
  { fullName: "Customer Demo", identifier: "customer@example.com", role: "customer" },
  { fullName: "Delivery Demo", identifier: "9876543210", role: "delivery" },
  { fullName: "Restaurant Demo", identifier: "restaurant@example.com", role: "restaurant" },
  { fullName: "Platform Demo", identifier: "platform@example.com", role: "platform" },
];

const fallbackRiderProfiles: RiderProfileRecord[] = [
  {
    id: 1,
    userIdentifier: "9876543210",
    fullName: "Delivery Demo",
    profileImageUrl: "/message-icon.svg",
    age: 29,
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
    completedOrdersCount: 284,
    activeDeliveries: 2,
    earningsToday: "₹1,240",
    verificationStatus: "verified",
    idProofUrl: "",
    drivingLicenseUrl: "",
    profilePhotoUrl: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const fallbackRestaurantProfiles: RestaurantProfileRecord[] = [
  {
    id: 1,
    userIdentifier: "restaurant@example.com",
    restaurantName: "Restaurant Demo Kitchen",
    restaurantLogoUrl: "/message-icon.svg",
    coverImageUrl: "",
    ownerName: "Restaurant Demo",
    contactNumber: "9876543211",
    email: "restaurant@example.com",
    restaurantAddress: "Market Road, Kolkata",
    cityState: "Kolkata, West Bengal",
    cuisineType: "North Indian",
    gstLicenseNumber: "GST-DEMO-001",
    openingHours: "10:00 AM - 11:30 PM",
    deliveryRadius: 8,
    description: "Comfort meals, curries, and tandoor plates for dinner.",
    verificationStatus: "verified",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const fallbackMenuItems: MenuItemRecord[] = [
  {
    id: 1,
    restaurantIdentifier: "restaurant@example.com",
    dishName: "Paneer Tikka Bowl",
    dishImageUrl: "",
    price: 189,
    category: "Featured",
    description: "Spicy grilled paneer with rice and fresh salad.",
    spiceLevel: "medium",
    vegType: "veg",
    isAvailable: true,
    preparationTimeMinutes: 18,
    isFeatured: true,
    isBestseller: true,
    isRecommended: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    restaurantIdentifier: "restaurant@example.com",
    dishName: "Butter Naan Combo",
    dishImageUrl: "",
    price: 159,
    category: "Combos",
    description: "Soft naan with rich curry and house salad.",
    spiceLevel: "mild",
    vegType: "veg",
    isAvailable: true,
    preparationTimeMinutes: 14,
    isFeatured: false,
    isBestseller: true,
    isRecommended: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const fallbackRestaurantCategories: RestaurantCategoryRecord[] = [
  { id: 1, name: "Featured", slug: "featured", sortOrder: 1 },
  { id: 2, name: "Combos", slug: "combos", sortOrder: 2 },
  { id: 3, name: "Bestsellers", slug: "bestsellers", sortOrder: 3 },
  { id: 4, name: "Recommended", slug: "recommended", sortOrder: 4 },
];

const fallbackUploadedImages: UploadedImageRecord[] = [];

const chatbotSessionStore = new Map<string, ChatbotSession>();

// Replace this local provider with OpenAI/Gemini integration later if you want a cloud AI assistant.
const chatbotProvider: ChatbotProvider = {
  respond: (prompt) => createLocalChatbotReply(prompt),
};

function trimChatbotMessages(messages: ChatbotMessage[]) {
  return messages.filter((message) => message.text.trim().length > 0).slice(-16);
}

function normalizeChatbotInput(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function createLocalChatbotReply(prompt: ChatbotPrompt) {
  const messages = prompt.messages;
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.text ?? "";
  const normalizedMessage = normalizeChatbotInput(latestUserMessage);
  const previousContext = normalizeChatbotInput([...messages].slice(0, -1).reverse().find((message) => message.role === "user")?.text ?? "");
  const roleName = prompt.role === "delivery"
    ? "Delivery Partner"
    : prompt.role === "restaurant"
      ? "Restaurant Owner"
      : prompt.role === "platform"
        ? "Main Team"
        : "Order Maker";

  function lines(items: string[]) {
    return items.join("\n");
  }

  function mentionRoleHint() {
    if (prompt.role === "delivery") {
      return "In Delivery Partner mode I can guide active trips, ETA, current location, online status, rider profile fields, and delivery flow.";
    }

    if (prompt.role === "restaurant") {
      return "In Restaurant Owner mode I can guide profile details, logo uploads, menu items, dish availability, pending orders, and kitchen workflow.";
    }

    if (prompt.role === "platform") {
      return "In Main Team mode I can guide users, restaurant lists, rider profiles, restaurant profiles, activity, and admin views.";
    }

    return "In Order Maker mode I can guide restaurant browsing, adding food to cart, checkout, order tracking, and account actions.";
  }

  if (!normalizedMessage) {
    return "Tell me what you want to do in SwiftBite, and I will point you to the right screen and button.";
  }

  if (hasAny(normalizedMessage, ["api key", "apikey", "openai", "gemini", "internet", "offline", "local chatbot", "locally"])) {
    return "This assistant is local. It does not need API keys. It answers from SwiftBite's built-in app help, role rules, and troubleshooting notes.";
  }

  if (hasAny(normalizedMessage, ["hello", "hi", "hey"])) {
    return `Hi. You are in ${roleName} mode. Ask me where to tap for ordering, checkout, tracking, menus, roles, or signing out.`;
  }

  if (hasAny(normalizedMessage, ["what can you do", "help", "guide me", "options", "how can you help"])) {
    return lines([
      mentionRoleHint(),
      "You can ask things like: how do I order food, where is sign out, how do I change role, how do I add a menu item, why login failed, or where is my order.",
    ]);
  }

  if (hasAny(normalizedMessage, ["which role", "role should", "choose role", "all roles", "order maker", "delivery partner", "restaurant owner", "main team"])) {
    return lines([
      "SwiftBite has four roles:",
      "1. Order Maker: browse restaurants, order food, checkout, and track orders.",
      "2. Delivery Partner: see active trips, route status, ETA, and rider profile.",
      "3. Restaurant Owner: manage profile, menu items, availability, and pending orders.",
      "4. Main Team: view users, restaurants, riders, activity, and admin data.",
    ]);
  }

  if (hasAny(normalizedMessage, ["demo account", "demo login", "demo password", "test account", "sample login", "credentials"])) {
    return lines([
      "Demo password: Password123",
      "Order Maker: customer@example.com",
      "Delivery Partner: 9876543210",
      "Restaurant Owner: restaurant@example.com",
      "Main Team: platform@example.com",
      "Use the matching role when you log in.",
    ]);
  }

  if (hasAny(normalizedMessage, ["register", "sign up", "signup", "create account", "new account"])) {
    return lines([
      "To register:",
      "1. Choose your role on the first screen.",
      "2. Tap Next.",
      "3. Switch the form from Login to Register.",
      "4. Enter name, email or phone, password, confirm password, and captcha.",
      "5. Tap Create account, then log in with the same role.",
    ]);
  }

  if (hasAny(normalizedMessage, ["captcha", "wrong answer", "captcha fails", "captcha failed"])) {
    return "If captcha fails, solve the small math question exactly, type only the number, or tap Refresh for a new captcha.";
  }

  if (hasAny(normalizedMessage, ["login failed", "cannot login", "cant login", "invalid credentials", "not logging", "why login"])) {
    return "If login fails, check three things: the selected role must match the account, email or phone must be the same one used during registration, and the password/captcha must be correct.";
  }

  if (hasAny(normalizedMessage, ["forgot password", "reset password", "change password"])) {
    return "Password reset is not built yet. For now, create a new account or use the demo accounts. A real reset flow would need email/SMS verification later.";
  }

  if (hasAny(normalizedMessage, ["login", "log in", "signin", "sign in"])) {
    return lines([
      "To log in:",
      "1. Choose the same role you registered with.",
      "2. Tap Next.",
      "3. Select Email or Phone.",
      "4. Enter identifier, password, and captcha.",
      "5. Tap Sign in.",
    ]);
  }

  if (hasAny(normalizedMessage, ["sign out", "logout", "log out", "switch account"])) {
    return "To sign out, open the menu button in the top right and tap Sign out. Pressing the phone back button from Home will not sign you out.";
  }

  if (hasAny(normalizedMessage, ["change role", "switch role", "different role"])) {
    return "To change role, open the menu button in the top right and tap Change role. Then choose Order Maker, Delivery Partner, Restaurant Owner, or Main Team.";
  }

  if (hasAny(normalizedMessage, ["burger", "hamburger", "menu button", "three line", "three lines"])) {
    return "The menu button is the three-line button at the top right after login. It contains Home, Browse restaurants, Change role, and Sign out.";
  }

  if (hasAny(normalizedMessage, ["back button", "phone back", "back arrow", "goes back", "logged out by back"])) {
    return "The back button should move inside the app flow only. On the role home screen it should not log you out; use the top-right menu if you actually want Sign out or Change role.";
  }

  if (hasAny(normalizedMessage, ["home page", "home screen", "dashboard", "go home"])) {
    return "Use the top-right menu and tap Home. That returns you to the current role's main screen without logging out.";
  }

  if (hasAny(normalizedMessage, ["cart", "add item", "add items", "add food", "plus button", "quantity", "remove item", "minus button"])) {
    return lines([
      "To manage cart:",
      "1. Open Browse restaurants.",
      "2. Tap a restaurant card.",
      "3. Tap + beside a dish to add it.",
      "4. Tap - to reduce quantity.",
      "5. Tap the cart button on the right or use the checkout preview to review items.",
    ]);
  }

  if (hasAny(normalizedMessage, ["checkout", "payment", "pay", "upi", "cash", "card", "place order", "address", "landmark", "contact number"])) {
    return lines([
      "To checkout:",
      "1. Add items from a restaurant menu.",
      "2. Tap Proceed to checkout.",
      "3. Confirm delivery address, landmark, contact number, and rider notes.",
      "4. Choose UPI, card, or cash.",
      "5. Tap Place order.",
    ]);
  }

  if (hasAny(normalizedMessage, ["track", "tracking", "where is my order", "order status", "rider", "eta", "active order"])) {
    if (prompt.role === "delivery") {
      return "As a Delivery Partner, your home screen shows Route status, active deliveries, selected trip details, customer dropoff, current location, and ETA.";
    }

    return "To track your order, go to Home after placing it. The Track your order card shows restaurant, order status, rider name, ETA, and delivery address.";
  }

  if (hasAny(normalizedMessage, ["order food", "food order", "make order", "order", "browse restaurant", "restaurants", "open menu"])) {
    if (prompt.role === "restaurant" && !hasAny(normalizedMessage, ["order food", "customer order"])) {
      return "As a Restaurant Owner, use your home screen to view pending orders and manage the menu. Customer food ordering is in Order Maker mode.";
    }

    return lines([
      "To order food:",
      "1. Open Browse restaurants.",
      "2. Tap a restaurant card.",
      "3. Add dishes with the + button.",
      "4. Review the cart or checkout preview.",
      "5. Tap Proceed to checkout and Place order.",
    ]);
  }

  if (hasAny(normalizedMessage, ["rider profile", "delivery profile", "online", "offline", "availability", "vehicle", "license", "earnings", "active trips"])) {
    return "In Delivery Partner mode, use the home screen to edit rider profile fields, toggle Online, update vehicle/license details, check earnings, and select active trips.";
  }

  if (hasAny(normalizedMessage, ["restaurant profile", "owner profile", "logo", "cover image", "gst", "opening hours", "delivery radius"])) {
    return "In Restaurant Owner mode, the profile section lets you edit restaurant name, logo, cover image, owner details, address, cuisine, GST/license, opening hours, delivery radius, and description.";
  }

  if (hasAny(normalizedMessage, ["menu item", "dish", "add dish", "edit dish", "delete dish", "price", "spice", "veg", "non veg", "available", "bestseller", "recommended"])) {
    return "To manage dishes, use Restaurant Owner mode. Fill dish name, price, category, prep time, spice level, veg type, description, availability, and tags, then tap Add item or Update item.";
  }

  if (hasAny(normalizedMessage, ["pending order", "pending orders", "kitchen", "restaurant orders"])) {
    return "Restaurant pending orders appear on the Restaurant Owner home screen. Use that area to see customer name, ordered items, status, and due time.";
  }

  if (hasAny(normalizedMessage, ["admin", "main team", "platform", "users", "activity", "rider profiles", "restaurant profiles"])) {
    return "In Main Team mode, use the dashboard to review totals, activity stream, recent users, rider profiles, restaurant profiles, and selected restaurant details.";
  }

  if (hasAny(normalizedMessage, ["database", "mysql", "saved", "stored", "backend", "api offline", "server offline", "data online"])) {
    return "SwiftBite tries the backend/MySQL first. If MySQL is not available, it uses fallback demo data so the app still works locally. Real persistent data needs the backend and database running.";
  }

  if (hasAny(normalizedMessage, ["install", "pwa", "app install", "mobile app", "add to home screen"])) {
    return "To install SwiftBite, use the install button if it appears, or use your browser's Add to Home Screen option. It works like a PWA on mobile.";
  }

  if (hasAny(normalizedMessage, ["spicy", "hot food", "masala", "chilli", "chili"])) {
    const noChicken = hasAny(normalizedMessage, ["no chicken", "not chicken", "without chicken"]) || hasAny(previousContext, ["no chicken", "not chicken", "without chicken"]);
    return noChicken
      ? "For spicy food without chicken, open restaurant menus and look for paneer, chili potato, masala veg bowls, or spicy seafood options."
      : "For spicy food, open a restaurant menu and look for masala, chili, tandoori, pepper, or hot dishes. Add the item with the + button.";
  }

  if (hasAny(normalizedMessage, ["no chicken", "not chicken", "without chicken", "veg", "vegetarian"])) {
    return "For non-chicken or veg orders, browse menus for paneer, veg bowls, rice boxes, seafood, egg, or salad/wrap options. Add your choice with the + button.";
  }

  if (hasAny(normalizedMessage, ["budget", "cheap", "affordable", "low price", "less money"])) {
    return "For a budget-friendly order, choose wraps, bowls, or combo meals. Check the price beside each dish before adding it to cart.";
  }

  if (hasAny(normalizedMessage, ["thank", "thanks", "ok", "okay"])) {
    return "Anytime. Ask me the screen or action you are stuck on, and I will guide you inside SwiftBite.";
  }

  return lines([
    "I can answer SwiftBite app questions locally.",
    mentionRoleHint(),
    "Try asking: how do I order food, where is sign out, how do I add items, how do I track my order, or how do I manage menu items.",
  ]);
}

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function fallbackKey(identifier: string, role: AuthRecord["role"]) {
  return `${identifier}::${role}`;
}

function buildMenuForRestaurant(name: string, cuisine: string) {
  const lookup = `${name} ${cuisine}`.toLowerCase();

  if (lookup.includes("green fork") || lookup.includes("healthy")) {
    return ["Quinoa Power Bowl", "Avocado Wrap", "Seasonal Smoothie", "Chia Parfait"];
  }

  if (lookup.includes("spice") || lookup.includes("indian") || lookup.includes("tandoor")) {
    return ["Paneer Tikka Platter", "Butter Naan Combo", "Dal Tadka Bowl", "Mango Lassi"];
  }

  if (lookup.includes("ocean") || lookup.includes("seafood") || lookup.includes("fish")) {
    return ["Grilled Fish Bowl", "Prawn Rice Box", "Lemon Herb Fries", "Coastal Soup"];
  }

  if (lookup.includes("brick") || lookup.includes("pizza") || lookup.includes("pasta")) {
    return ["Margherita Slice Box", "Creamy Alfredo", "Garlic Bread", "Cheese Dip"];
  }

  return ["Chef Special Bowl", "Daily Wrap", "Seasonal Plate", "House Drink"];
}

function normalizeEmpty(value: string | undefined | null) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : "";
}

function normalizeRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function loadRiderProfiles() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, user_identifier, full_name, profile_image_url, age, gender, phone_number, alternate_phone_number, email, residential_address, city_state, emergency_contact, vehicle_type, vehicle_number, driving_license_number, availability_status, is_online, delivery_zone, joining_date, completed_orders_count, active_deliveries, earnings_today, verification_status, id_proof_url, driving_license_url, profile_photo_url, created_at, updated_at FROM rider_profiles ORDER BY updated_at DESC"
    );

    return {
      profiles: rows.map((row) => ({
        id: Number(row.id),
        userIdentifier: String(row.user_identifier),
        fullName: String(row.full_name),
        profileImageUrl: normalizeEmpty(row.profile_image_url ? String(row.profile_image_url) : ""),
        age: Number(row.age),
        gender: String(row.gender),
        phoneNumber: String(row.phone_number),
        alternatePhoneNumber: normalizeEmpty(row.alternate_phone_number ? String(row.alternate_phone_number) : ""),
        email: normalizeEmpty(row.email ? String(row.email) : ""),
        residentialAddress: String(row.residential_address),
        cityState: String(row.city_state),
        emergencyContact: String(row.emergency_contact),
        vehicleType: String(row.vehicle_type),
        vehicleNumber: String(row.vehicle_number),
        drivingLicenseNumber: String(row.driving_license_number),
        availabilityStatus: String(row.availability_status) as RiderProfileRecord["availabilityStatus"],
        isOnline: Boolean(row.is_online),
        deliveryZone: String(row.delivery_zone),
        joiningDate: String(row.joining_date),
        completedOrdersCount: Number(row.completed_orders_count),
        activeDeliveries: Number(row.active_deliveries),
        earningsToday: String(row.earnings_today),
        verificationStatus: String(row.verification_status) as RiderProfileRecord["verificationStatus"],
        idProofUrl: normalizeEmpty(row.id_proof_url ? String(row.id_proof_url) : ""),
        drivingLicenseUrl: normalizeEmpty(row.driving_license_url ? String(row.driving_license_url) : ""),
        profilePhotoUrl: normalizeEmpty(row.profile_photo_url ? String(row.profile_photo_url) : ""),
        createdAt: new Date(row.created_at as string).toISOString(),
        updatedAt: new Date(row.updated_at as string).toISOString(),
      })) as RiderProfileRecord[],
      source: "mysql" as const,
    };
  } catch {
    return { profiles: fallbackRiderProfiles, source: "fallback" as const };
  }
}

async function saveRiderProfile(profile: RiderProfileRecord) {
  try {
    await db.query(
      `INSERT INTO rider_profiles
        (user_identifier, full_name, profile_image_url, age, gender, phone_number, alternate_phone_number, email, residential_address, city_state, emergency_contact, vehicle_type, vehicle_number, driving_license_number, availability_status, is_online, delivery_zone, joining_date, completed_orders_count, active_deliveries, earnings_today, verification_status, id_proof_url, driving_license_url, profile_photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name), profile_image_url = VALUES(profile_image_url), age = VALUES(age), gender = VALUES(gender), phone_number = VALUES(phone_number), alternate_phone_number = VALUES(alternate_phone_number), email = VALUES(email), residential_address = VALUES(residential_address), city_state = VALUES(city_state), emergency_contact = VALUES(emergency_contact), vehicle_type = VALUES(vehicle_type), vehicle_number = VALUES(vehicle_number), driving_license_number = VALUES(driving_license_number), availability_status = VALUES(availability_status), is_online = VALUES(is_online), delivery_zone = VALUES(delivery_zone), joining_date = VALUES(joining_date), completed_orders_count = VALUES(completed_orders_count), active_deliveries = VALUES(active_deliveries), earnings_today = VALUES(earnings_today), verification_status = VALUES(verification_status), id_proof_url = VALUES(id_proof_url), driving_license_url = VALUES(driving_license_url), profile_photo_url = VALUES(profile_photo_url), updated_at = CURRENT_TIMESTAMP`,
      [
        profile.userIdentifier,
        profile.fullName,
        profile.profileImageUrl || null,
        profile.age,
        profile.gender,
        profile.phoneNumber,
        profile.alternatePhoneNumber || null,
        profile.email || null,
        profile.residentialAddress,
        profile.cityState,
        profile.emergencyContact,
        profile.vehicleType,
        profile.vehicleNumber,
        profile.drivingLicenseNumber,
        profile.availabilityStatus,
        profile.isOnline ? 1 : 0,
        profile.deliveryZone,
        profile.joiningDate,
        profile.completedOrdersCount,
        profile.activeDeliveries,
        profile.earningsToday,
        profile.verificationStatus,
        profile.idProofUrl || null,
        profile.drivingLicenseUrl || null,
        profile.profilePhotoUrl || null,
      ]
    );

    return { source: "mysql" as const };
  } catch {
    const index = fallbackRiderProfiles.findIndex((item) => item.userIdentifier === profile.userIdentifier);
    if (index >= 0) {
      fallbackRiderProfiles[index] = profile;
    } else {
      fallbackRiderProfiles.push(profile);
    }
    return { source: "fallback" as const };
  }
}

async function loadRestaurantProfiles() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, user_identifier, restaurant_name, restaurant_logo_url, cover_image_url, owner_name, contact_number, email, restaurant_address, city_state, cuisine_type, gst_license_number, opening_hours, delivery_radius, description, verification_status, created_at, updated_at FROM restaurant_profiles ORDER BY updated_at DESC"
    );

    return {
      profiles: rows.map((row) => ({
        id: Number(row.id),
        userIdentifier: String(row.user_identifier),
        restaurantName: String(row.restaurant_name),
        restaurantLogoUrl: normalizeEmpty(row.restaurant_logo_url ? String(row.restaurant_logo_url) : ""),
        coverImageUrl: normalizeEmpty(row.cover_image_url ? String(row.cover_image_url) : ""),
        ownerName: String(row.owner_name),
        contactNumber: String(row.contact_number),
        email: normalizeEmpty(row.email ? String(row.email) : ""),
        restaurantAddress: String(row.restaurant_address),
        cityState: String(row.city_state),
        cuisineType: String(row.cuisine_type),
        gstLicenseNumber: String(row.gst_license_number),
        openingHours: String(row.opening_hours),
        deliveryRadius: Number(row.delivery_radius),
        description: String(row.description),
        verificationStatus: String(row.verification_status) as RestaurantProfileRecord["verificationStatus"],
        createdAt: new Date(row.created_at as string).toISOString(),
        updatedAt: new Date(row.updated_at as string).toISOString(),
      })) as RestaurantProfileRecord[],
      source: "mysql" as const,
    };
  } catch {
    return { profiles: fallbackRestaurantProfiles, source: "fallback" as const };
  }
}

async function saveRestaurantProfile(profile: RestaurantProfileRecord) {
  try {
    await db.query(
      `INSERT INTO restaurant_profiles
        (user_identifier, restaurant_name, restaurant_logo_url, cover_image_url, owner_name, contact_number, email, restaurant_address, city_state, cuisine_type, gst_license_number, opening_hours, delivery_radius, description, verification_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        restaurant_name = VALUES(restaurant_name), restaurant_logo_url = VALUES(restaurant_logo_url), cover_image_url = VALUES(cover_image_url), owner_name = VALUES(owner_name), contact_number = VALUES(contact_number), email = VALUES(email), restaurant_address = VALUES(restaurant_address), city_state = VALUES(city_state), cuisine_type = VALUES(cuisine_type), gst_license_number = VALUES(gst_license_number), opening_hours = VALUES(opening_hours), delivery_radius = VALUES(delivery_radius), description = VALUES(description), verification_status = VALUES(verification_status), updated_at = CURRENT_TIMESTAMP`,
      [
        profile.userIdentifier,
        profile.restaurantName,
        profile.restaurantLogoUrl || null,
        profile.coverImageUrl || null,
        profile.ownerName,
        profile.contactNumber,
        profile.email || null,
        profile.restaurantAddress,
        profile.cityState,
        profile.cuisineType,
        profile.gstLicenseNumber,
        profile.openingHours,
        profile.deliveryRadius,
        profile.description,
        profile.verificationStatus,
      ]
    );

    return { source: "mysql" as const };
  } catch {
    const index = fallbackRestaurantProfiles.findIndex((item) => item.userIdentifier === profile.userIdentifier);
    if (index >= 0) {
      fallbackRestaurantProfiles[index] = profile;
    } else {
      fallbackRestaurantProfiles.push(profile);
    }
    return { source: "fallback" as const };
  }
}

async function loadMenuItems(restaurantIdentifier?: string) {
  try {
    const query = restaurantIdentifier
      ? "SELECT id, restaurant_identifier, dish_name, dish_image_url, price, category, description, spice_level, veg_type, is_available, preparation_time_minutes, is_featured, is_bestseller, is_recommended, created_at, updated_at FROM menu_items WHERE restaurant_identifier = ? ORDER BY is_featured DESC, is_bestseller DESC, dish_name ASC"
      : "SELECT id, restaurant_identifier, dish_name, dish_image_url, price, category, description, spice_level, veg_type, is_available, preparation_time_minutes, is_featured, is_bestseller, is_recommended, created_at, updated_at FROM menu_items ORDER BY is_featured DESC, is_bestseller DESC, dish_name ASC";

    const [rows] = await db.query<RowDataPacket[]>(query, restaurantIdentifier ? [restaurantIdentifier] : []);

    return {
      items: rows.map((row) => ({
        id: Number(row.id),
        restaurantIdentifier: String(row.restaurant_identifier),
        dishName: String(row.dish_name),
        dishImageUrl: normalizeEmpty(row.dish_image_url ? String(row.dish_image_url) : ""),
        price: Number(row.price),
        category: String(row.category),
        description: String(row.description),
        spiceLevel: String(row.spice_level) as MenuItemRecord["spiceLevel"],
        vegType: String(row.veg_type) as MenuItemRecord["vegType"],
        isAvailable: Boolean(row.is_available),
        preparationTimeMinutes: Number(row.preparation_time_minutes),
        isFeatured: Boolean(row.is_featured),
        isBestseller: Boolean(row.is_bestseller),
        isRecommended: Boolean(row.is_recommended),
        createdAt: new Date(row.created_at as string).toISOString(),
        updatedAt: new Date(row.updated_at as string).toISOString(),
      })) as MenuItemRecord[],
      source: "mysql" as const,
    };
  } catch {
    const items = restaurantIdentifier ? fallbackMenuItems.filter((item) => item.restaurantIdentifier === restaurantIdentifier) : fallbackMenuItems;
    return { items, source: "fallback" as const };
  }
}

async function saveMenuItem(menuItem: MenuItemRecord) {
  try {
    await db.query(
      `INSERT INTO menu_items
        (restaurant_identifier, dish_name, dish_image_url, price, category, description, spice_level, veg_type, is_available, preparation_time_minutes, is_featured, is_bestseller, is_recommended)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        dish_name = VALUES(dish_name), dish_image_url = VALUES(dish_image_url), price = VALUES(price), category = VALUES(category), description = VALUES(description), spice_level = VALUES(spice_level), veg_type = VALUES(veg_type), is_available = VALUES(is_available), preparation_time_minutes = VALUES(preparation_time_minutes), is_featured = VALUES(is_featured), is_bestseller = VALUES(is_bestseller), is_recommended = VALUES(is_recommended), updated_at = CURRENT_TIMESTAMP`,
      [
        menuItem.restaurantIdentifier,
        menuItem.dishName,
        menuItem.dishImageUrl || null,
        menuItem.price,
        menuItem.category,
        menuItem.description,
        menuItem.spiceLevel,
        menuItem.vegType,
        menuItem.isAvailable ? 1 : 0,
        menuItem.preparationTimeMinutes,
        menuItem.isFeatured ? 1 : 0,
        menuItem.isBestseller ? 1 : 0,
        menuItem.isRecommended ? 1 : 0,
      ]
    );

    return { source: "mysql" as const };
  } catch {
    const index = fallbackMenuItems.findIndex((item) => item.id === menuItem.id || (item.restaurantIdentifier === menuItem.restaurantIdentifier && item.dishName.toLowerCase() === menuItem.dishName.toLowerCase()));
    if (index >= 0) {
      fallbackMenuItems[index] = menuItem;
    } else {
      fallbackMenuItems.push(menuItem);
    }
    return { source: "fallback" as const };
  }
}

async function deleteMenuItem(menuItemId: number) {
  try {
    await db.query("DELETE FROM menu_items WHERE id = ?", [menuItemId]);
    return { source: "mysql" as const };
  } catch {
    const nextItems = fallbackMenuItems.filter((item) => item.id !== menuItemId);
    fallbackMenuItems.splice(0, fallbackMenuItems.length, ...nextItems);
    return { source: "fallback" as const };
  }
}

async function saveUploadedImage(image: UploadedImageRecord) {
  try {
    await db.query(
      `INSERT INTO uploaded_images (owner_type, owner_identifier, purpose, file_name, public_url, mime_type, size_bytes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [image.ownerType, image.ownerIdentifier, image.purpose, image.fileName, image.publicUrl, image.mimeType, image.size]
    );
    return { source: "mysql" as const };
  } catch {
    fallbackUploadedImages.push(image);
    return { source: "fallback" as const };
  }
}

async function loadRestaurants() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, name, cuisine, location, eta_minutes, rating, description, featured FROM restaurants ORDER BY featured DESC, rating DESC, name ASC"
    );

    return {
      restaurants: rows.map((row) => ({
        id: Number(row.id),
        name: String(row.name),
        cuisine: String(row.cuisine),
        location: String(row.location),
        etaMinutes: Number(row.eta_minutes),
        rating: Number(row.rating),
        description: String(row.description),
        featured: Boolean(row.featured),
        menu: buildMenuForRestaurant(String(row.name), String(row.cuisine)),
      })) as RestaurantRecord[],
      source: "mysql" as const,
    };
  } catch {
    return { restaurants: fallbackRestaurants, source: "fallback" as const };
  }
}

async function loadOrders() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT o.id, o.restaurant_id, r.name as restaurant_name, o.customer_identifier, o.items_json, o.total_amount, o.status, o.address, o.contact_number, o.notes, o.created_at FROM orders o LEFT JOIN restaurants r ON r.id = o.restaurant_id ORDER BY o.created_at DESC"
    );

    return {
      orders: rows.map((row) => ({
        id: Number(row.id),
        restaurantId: Number(row.restaurant_id),
        restaurantName: String(row.restaurant_name || ""),
        customerIdentifier: String(row.customer_identifier),
        items: JSON.parse(String(row.items_json || "[]")),
        total: Number(row.total_amount),
        status: String(row.status),
        address: String(row.address),
        contactNumber: String(row.contact_number),
        notes: normalizeEmpty(row.notes ? String(row.notes) : ""),
        createdAt: new Date(row.created_at as string).toISOString(),
      })),
      source: "mysql" as const,
    };
  } catch {
    return { orders: fallbackOrders, source: "fallback" as const };
  }
}

function mapOrderToLiveOrder(order: OrderRecord, index = 0) {
  return {
    id: order.id,
    restaurantId: order.restaurantId,
    restaurantName: order.restaurantName || `Restaurant #${order.restaurantId}`,
    customerIdentifier: order.customerIdentifier,
    status: order.status,
    rider: order.status === "completed" ? "Delivered" : "Delivery partner",
    etaMinutes: Math.max(8, 18 + index * 4),
    address: order.address,
    total: order.total,
    items: order.items,
  };
}

function mapOrderToDeliveryTrip(order: OrderRecord, index = 0) {
  return {
    id: order.id,
    customer: order.customerIdentifier,
    pickup: order.restaurantName || `Restaurant #${order.restaurantId}`,
    dropoff: order.address,
    status: order.status === "completed" ? "Completed" : order.status === "placed" ? "Preparing" : order.status,
    etaMinutes: Math.max(8, 18 + index * 4),
    currentLocation: order.status === "completed" ? "Delivered" : index === 0 ? "On the way" : "Assigned",
    restaurantName: order.restaurantName || `Restaurant #${order.restaurantId}`,
    total: order.total,
    items: order.items,
  };
}

async function saveOrder(order: OrderRecord) {
  try {
    await db.query(
      "INSERT INTO orders (restaurant_id, customer_identifier, items_json, total_amount, status, address, contact_number, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        order.restaurantId,
        order.customerIdentifier,
        JSON.stringify(order.items),
        order.total,
        order.status,
        order.address,
        order.contactNumber,
        order.notes || null,
      ]
    );

    return { source: "mysql" as const };
  } catch {
    fallbackOrders.unshift(order);
    return { source: "fallback" as const };
  }
}

function buildDashboard(
  role: DashboardRole,
  restaurants: RestaurantRecord[],
  users: PlatformUser[],
  riderProfiles: RiderProfileRecord[] = fallbackRiderProfiles,
  restaurantProfiles: RestaurantProfileRecord[] = fallbackRestaurantProfiles,
  menuItems: MenuItemRecord[] = fallbackMenuItems,
  categories: RestaurantCategoryRecord[] = fallbackRestaurantCategories
) {
  if (role === "delivery") {
    const riderProfile = riderProfiles[0] ?? fallbackRiderProfiles[0];

    return {
      role,
      source: "fallback",
      stats: { activeTrips: fallbackDeliveryTasks.length, completedToday: 24, earningsToday: "₹1,240" },
      currentPosition: fallbackDeliveryTasks[0]?.currentLocation ?? "Unknown",
      nextDrop: fallbackDeliveryTasks[0]?.dropoff ?? "Unknown",
      timeToReach: `${fallbackDeliveryTasks[0]?.etaMinutes ?? 0} min`,
      activeTrips: fallbackDeliveryTasks,
      riderProfile,
      deliveryHistory: fallbackDeliveryTasks.map((trip) => ({
        id: trip.id,
        title: `${trip.customer} • ${trip.pickup}`,
        status: trip.status,
        etaMinutes: trip.etaMinutes,
      })),
    };
  }

  if (role === "restaurant") {
    const restaurantProfile = restaurantProfiles[0] ?? fallbackRestaurantProfiles[0];
    const restaurantIdentifier = restaurantProfile?.userIdentifier ?? fallbackRestaurantProfiles[0]!.userIdentifier;

    return {
      role,
      source: "fallback",
      profile: {
        name: "Restaurant Owner",
        branch: "Market Road",
        ordersPending: 7,
        kitchenStatus: "Busy",
      },
      restaurantProfile,
      menuItems: menuItems.filter((item) => item.restaurantIdentifier === restaurantIdentifier),
      categories,
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
      totals: {
        users: users.length,
        restaurants: restaurants.length,
        activeOrders: 39,
        deliveries: 52,
      },
      recentUsers: users,
      recentRestaurants: restaurants,
      riderProfiles,
      restaurantProfiles,
      categories,
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

export function createApp() {
  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

  app.use(helmet());
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use("/uploads", express.static(uploadDirectory));

  async function getHealthStatus(): Promise<HealthStatus> {
    const mysqlConfigured = Boolean(
      process.env.MYSQL_HOST &&
        process.env.MYSQL_USER &&
        process.env.MYSQL_DATABASE
    );

    if (!mysqlConfigured) {
      return {
        api: "online",
        database: "not-configured",
        message: "API online · please connect MySQL",
      };
    }

    try {
      await db.query("SELECT 1");

      return {
        api: "online",
        database: "connected",
        message: "API online · DB connected",
      };
    } catch {
      return {
        api: "online",
        database: "disconnected",
        message: "API online · please connect MySQL",
      };
    }
  }

  app.get("/health", async (_request: Request, response: Response) => {
    const timestamp = new Date().toISOString();
    const healthStatus = await getHealthStatus();

    response.json({
      service: "backend",
      ...healthStatus,
      status: healthStatus.database === "connected" ? "ok" : "degraded",
      timestamp,
    });
  });

  app.get("/api/roles", (_request: Request, response: Response) => {
    response.json({
      roles: [
        { id: "customer", label: "Order Maker" },
        { id: "delivery", label: "Delivery Partner" },
        { id: "restaurant", label: "Restaurant Owner" },
        { id: "platform", label: "Main Team" },
      ],
    });
  });

  app.get("/api/restaurants", async (_request: Request, response: Response) => {
    const result = await loadRestaurants();
    response.json(result);
  });

  app.get("/api/rider-profiles", async (_request: Request, response: Response) => {
    const result = await loadRiderProfiles();
    response.json(result);
  });

  app.get("/api/rider-profiles/:identifier", async (request: Request, response: Response) => {
    const identifier = request.params.identifier;
    const result = await loadRiderProfiles();
    const riderProfile = result.profiles.find((profile) => profile.userIdentifier === identifier);

    if (!riderProfile) {
      response.status(404).json({ message: "Rider profile not found." });
      return;
    }

    response.json({ profile: riderProfile, source: result.source });
  });

  app.put("/api/rider-profiles/:identifier", async (request: Request, response: Response) => {
    const identifier = request.params.identifier;
    const parsed = riderProfileSchema.safeParse({ ...request.body, userIdentifier: identifier });

    if (!parsed.success) {
      response.status(400).json({ message: "Invalid rider profile payload.", issues: parsed.error.flatten() });
      return;
    }

    const payload = parsed.data;
    const nextProfile: RiderProfileRecord = {
      id: fallbackRiderProfiles.find((profile) => profile.userIdentifier === identifier)?.id ?? Date.now(),
      ...payload,
      profileImageUrl: normalizeEmpty(payload.profileImageUrl),
      alternatePhoneNumber: normalizeEmpty(payload.alternatePhoneNumber),
      email: normalizeEmpty(payload.email),
      idProofUrl: normalizeEmpty(payload.idProofUrl),
      drivingLicenseUrl: normalizeEmpty(payload.drivingLicenseUrl),
      profilePhotoUrl: normalizeEmpty(payload.profilePhotoUrl),
      createdAt: fallbackRiderProfiles.find((profile) => profile.userIdentifier === identifier)?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await saveRiderProfile(nextProfile);
    response.json({ message: "Rider profile saved.", profile: nextProfile, source: result.source });
  });

  app.get("/api/restaurant-profiles", async (_request: Request, response: Response) => {
    const result = await loadRestaurantProfiles();
    response.json(result);
  });

  app.get("/api/restaurant-profiles/:identifier", async (request: Request, response: Response) => {
    const identifier = request.params.identifier;
    const result = await loadRestaurantProfiles();
    const profile = result.profiles.find((item) => item.userIdentifier === identifier);

    if (!profile) {
      response.status(404).json({ message: "Restaurant profile not found." });
      return;
    }

    response.json({ profile, source: result.source });
  });

  app.put("/api/restaurant-profiles/:identifier", async (request: Request, response: Response) => {
    const identifier = request.params.identifier;
    const parsed = restaurantProfileSchema.safeParse({ ...request.body, userIdentifier: identifier });

    if (!parsed.success) {
      response.status(400).json({ message: "Invalid restaurant profile payload.", issues: parsed.error.flatten() });
      return;
    }

    const payload = parsed.data;
    const nextProfile: RestaurantProfileRecord = {
      id: fallbackRestaurantProfiles.find((profile) => profile.userIdentifier === identifier)?.id ?? Date.now(),
      ...payload,
      restaurantLogoUrl: normalizeEmpty(payload.restaurantLogoUrl),
      coverImageUrl: normalizeEmpty(payload.coverImageUrl),
      email: normalizeEmpty(payload.email),
      createdAt: fallbackRestaurantProfiles.find((profile) => profile.userIdentifier === identifier)?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await saveRestaurantProfile(nextProfile);
    response.json({ message: "Restaurant profile saved.", profile: nextProfile, source: result.source });
  });

  app.get("/api/restaurant-profiles/:identifier/menu-items", async (request: Request, response: Response) => {
    const identifier = normalizeRouteParam(request.params.identifier);
    const result = await loadMenuItems(identifier);
    response.json(result);
  });

  app.post("/api/restaurant-profiles/:identifier/menu-items", async (request: Request, response: Response) => {
    const identifier = request.params.identifier;
    const parsed = menuItemSchema.safeParse({ ...request.body, restaurantIdentifier: identifier });

    if (!parsed.success) {
      response.status(400).json({ message: "Invalid menu item payload.", issues: parsed.error.flatten() });
      return;
    }

    const payload = parsed.data;
    const nextItem: MenuItemRecord = {
      id: Date.now(),
      restaurantIdentifier: payload.restaurantIdentifier,
      dishName: payload.dishName,
      dishImageUrl: normalizeEmpty(payload.dishImageUrl),
      price: payload.price,
      category: payload.category,
      description: payload.description,
      spiceLevel: payload.spiceLevel,
      vegType: payload.vegType,
      isAvailable: payload.isAvailable,
      preparationTimeMinutes: payload.preparationTimeMinutes,
      isFeatured: payload.isFeatured,
      isBestseller: payload.isBestseller,
      isRecommended: payload.isRecommended,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await saveMenuItem(nextItem);
    response.status(201).json({ message: "Menu item saved.", item: nextItem, source: result.source });
  });

  app.put("/api/menu-items/:id", async (request: Request, response: Response) => {
    const itemId = Number(request.params.id);
    const parsed = menuItemSchema.partial().safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ message: "Invalid menu item payload.", issues: parsed.error.flatten() });
      return;
    }

    const existing = (await loadMenuItems()).items.find((item) => item.id === itemId);

    if (!existing) {
      response.status(404).json({ message: "Menu item not found." });
      return;
    }

    const nextItem: MenuItemRecord = {
      id: existing.id,
      restaurantIdentifier: parsed.data.restaurantIdentifier ?? existing.restaurantIdentifier,
      dishName: parsed.data.dishName ?? existing.dishName,
      dishImageUrl: normalizeEmpty(parsed.data.dishImageUrl ?? existing.dishImageUrl),
      price: parsed.data.price ?? existing.price,
      category: parsed.data.category ?? existing.category,
      description: parsed.data.description ?? existing.description,
      spiceLevel: parsed.data.spiceLevel ?? existing.spiceLevel,
      vegType: parsed.data.vegType ?? existing.vegType,
      isAvailable: parsed.data.isAvailable ?? existing.isAvailable,
      preparationTimeMinutes: parsed.data.preparationTimeMinutes ?? existing.preparationTimeMinutes,
      isFeatured: parsed.data.isFeatured ?? existing.isFeatured,
      isBestseller: parsed.data.isBestseller ?? existing.isBestseller,
      isRecommended: parsed.data.isRecommended ?? existing.isRecommended,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    const result = await saveMenuItem(nextItem);
    response.json({ message: "Menu item updated.", item: nextItem, source: result.source });
  });

  app.delete("/api/menu-items/:id", async (request: Request, response: Response) => {
    const itemId = Number(request.params.id);
    const result = await deleteMenuItem(itemId);
    response.json({ message: "Menu item deleted.", source: result.source });
  });

  app.get("/api/admin/riders", async (_request: Request, response: Response) => {
    const result = await loadRiderProfiles();
    response.json(result);
  });

  app.get("/api/admin/restaurants", async (_request: Request, response: Response) => {
    const result = await loadRestaurantProfiles();
    response.json(result);
  });

  app.get("/api/admin/categories", (_request: Request, response: Response) => {
    response.json({ categories: fallbackRestaurantCategories, source: "fallback" as const });
  });

  app.post("/api/uploads/image", async (request: Request, response: Response) => {
    const metadata = uploadMetaSchema.safeParse(request.body);

    if (!metadata.success) {
      response.status(400).json({ message: "Invalid upload metadata.", issues: metadata.error.flatten() });
      return;
    }

    const safeName = metadata.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedFileName = `${Date.now()}-${randomUUID()}-${safeName}`;
    const base64Data = metadata.data.dataUrl.includes(",") ? metadata.data.dataUrl.split(",", 2)[1] : metadata.data.dataUrl;

    if (!base64Data) {
      response.status(400).json({ message: "Invalid image data." });
      return;
    }

    const fileBuffer = Buffer.from(base64Data, "base64");
    writeFileSync(path.join(uploadDirectory, storedFileName), fileBuffer);

    const publicUrl = `/uploads/${storedFileName}`;
    const record: UploadedImageRecord = {
      id: Date.now(),
      ownerType: metadata.data.ownerType,
      ownerIdentifier: metadata.data.ownerIdentifier,
      purpose: metadata.data.purpose,
      fileName: storedFileName,
      publicUrl,
      mimeType: metadata.data.mimeType,
      size: fileBuffer.length,
      createdAt: new Date().toISOString(),
    };

    const result = await saveUploadedImage(record);
    response.status(201).json({ message: "Image uploaded.", image: record, source: result.source });
  });

  app.post("/api/restaurants", async (request: Request, response: Response) => {
    const parsed = restaurantSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Invalid restaurant payload.",
        issues: parsed.error.flatten(),
      });
      return;
    }

    const nextRestaurant: RestaurantRecord = {
      id: fallbackRestaurants.length + 1,
      name: parsed.data.name,
      cuisine: parsed.data.cuisine,
      location: parsed.data.location,
      etaMinutes: parsed.data.etaMinutes,
      rating: parsed.data.rating,
      description: parsed.data.description,
      featured: parsed.data.featured,
      menu: buildMenuForRestaurant(parsed.data.name, parsed.data.cuisine),
    };

    try {
      await db.query(
        "INSERT INTO restaurants (name, cuisine, location, eta_minutes, rating, description, featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          parsed.data.name,
          parsed.data.cuisine,
          parsed.data.location,
          parsed.data.etaMinutes,
          parsed.data.rating,
          parsed.data.description,
          parsed.data.featured ? 1 : 0,
        ]
      );

      response.status(201).json({ message: "Restaurant added.", restaurant: nextRestaurant, source: "mysql" });
      return;
    } catch {
      fallbackRestaurants = [nextRestaurant, ...fallbackRestaurants];
      response.status(201).json({ message: "Restaurant added.", restaurant: nextRestaurant, source: "fallback" });
    }
  });

  app.post("/api/orders", async (request: Request, response: Response) => {
    try {
      const body = request.body as {
        restaurantId: number;
        restaurantName?: string;
        customerIdentifier?: string;
        items: Array<{ name: string; quantity: number; price: number }>;
        address: string;
        contactNumber: string;
        notes?: string;
      };

      if (!body || !Array.isArray(body.items) || body.items.length === 0) {
        response.status(400).json({ message: "Invalid order payload." });
        return;
      }

      const total = body.items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
      const nextOrder: OrderRecord = {
        id: Date.now(),
        restaurantId: Number(body.restaurantId || 0),
        restaurantName: body.restaurantName || "",
        customerIdentifier: normalizeEmpty(body.customerIdentifier) || "guest",
        items: body.items.map((it) => ({ name: it.name, quantity: Number(it.quantity || 1), price: Number(it.price || 0) })),
        total,
        status: "placed",
        address: normalizeEmpty(body.address),
        contactNumber: normalizeEmpty(body.contactNumber),
        notes: normalizeEmpty(body.notes),
        createdAt: new Date().toISOString(),
      };

      const result = await saveOrder(nextOrder);
      response.status(201).json({ message: "Order placed.", order: nextOrder, source: result.source });
    } catch (err) {
      response.status(500).json({ message: "Unable to place order right now." });
    }
  });

  app.patch("/api/orders/:id/status", async (request: Request, response: Response) => {
    const orderId = Number(request.params.id);
    const parsed = z.object({ status: z.enum(["placed", "completed"]) }).safeParse(request.body);

    if (!Number.isFinite(orderId) || !parsed.success) {
      response.status(400).json({ message: "Invalid order status payload." });
      return;
    }

    try {
      await db.query("UPDATE orders SET status = ? WHERE id = ?", [parsed.data.status, orderId]);
      response.json({ message: `Order marked ${parsed.data.status}.`, order: { id: orderId, status: parsed.data.status }, source: "mysql" });
    } catch {
      const fallbackOrder = fallbackOrders.find((order) => order.id === orderId);

      if (!fallbackOrder) {
        response.status(404).json({ message: "Order not found." });
        return;
      }

      fallbackOrder.status = parsed.data.status;
      response.json({ message: `Order marked ${parsed.data.status}.`, order: fallbackOrder, source: "fallback" });
    }
  });

  app.get("/api/dashboard/:role", async (request: Request, response: Response) => {
    const role = request.params.role as DashboardRole;

    if (!["customer", "delivery", "restaurant", "platform"].includes(role)) {
      response.status(400).json({ message: "Invalid dashboard role." });
      return;
    }

    const restaurantResult = await loadRestaurants();
    let users = fallbackPlatformUsers;

    if (role === "platform") {
      try {
        const [rows] = await db.query<RowDataPacket[]>("SELECT full_name, identifier, role FROM users ORDER BY created_at DESC LIMIT 8");

        users = rows.map((row) => ({
          fullName: String(row.full_name),
          identifier: String(row.identifier),
          role: String(row.role) as DashboardRole,
        }));
      } catch {
        users = fallbackPlatformUsers;
      }
    }
    // include active orders count when available
    let ordersCount = 0;
    let orderResult = { orders: fallbackOrders, source: "fallback" as const };
    try {
      orderResult = await loadOrders();
      ordersCount = orderResult.orders.length;
    } catch {
      ordersCount = fallbackOrders.length;
    }

    const riderResult = role === "delivery" || role === "platform" ? await loadRiderProfiles() : { profiles: fallbackRiderProfiles, source: "fallback" as const };
    const restaurantProfileResult = role === "restaurant" || role === "platform" ? await loadRestaurantProfiles() : { profiles: fallbackRestaurantProfiles, source: "fallback" as const };
    const menuResult = role === "restaurant" || role === "platform" ? await loadMenuItems() : { items: fallbackMenuItems, source: "fallback" as const };

    const dashboard = buildDashboard(role, restaurantResult.restaurants, users, riderResult.profiles, restaurantProfileResult.profiles, menuResult.items, fallbackRestaurantCategories);
    if ((dashboard as any).totals) {
      (dashboard as any).totals.activeOrders = orderResult.orders.filter((order) => order.status !== "completed").length;
    }

    if (role === "customer" && orderResult.orders.length > 0) {
      const liveOrders = orderResult.orders.map((order, index) => mapOrderToLiveOrder(order, index));
      (dashboard as any).liveOrders = liveOrders;
      const firstOrder = liveOrders[0];

      if (firstOrder) {
        (dashboard as any).activeOrder = {
          id: String(firstOrder.id),
          restaurant: firstOrder.restaurantName,
          status: firstOrder.status,
          rider: firstOrder.rider,
          etaMinutes: firstOrder.etaMinutes,
          address: firstOrder.address,
          total: firstOrder.total,
          items: firstOrder.items,
        };
      }
    }

    if (role === "delivery" && orderResult.orders.length > 0) {
      const activeTrips = orderResult.orders.map((order, index) => mapOrderToDeliveryTrip(order, index));
      (dashboard as any).activeTrips = activeTrips;
      (dashboard as any).stats.activeTrips = activeTrips.filter((trip) => trip.status.toLowerCase() !== "completed").length;
      if (activeTrips[0]) {
        (dashboard as any).currentPosition = activeTrips[0].currentLocation;
        (dashboard as any).nextDrop = activeTrips[0].dropoff;
        (dashboard as any).timeToReach = `${activeTrips[0].etaMinutes} min`;
      }
    }

    response.json(dashboard);
  });

  app.post("/api/auth/login", async (request: Request, response: Response) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Invalid login payload.",
        issues: parsed.error.flatten(),
      });
      return;
    }

    try {
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT id, full_name, identifier, role FROM users WHERE identifier = ? AND role = ? AND password_hash = SHA2(?, 256) LIMIT 1",
        [parsed.data.identifier, parsed.data.role, parsed.data.password]
      );

      const user = rows[0] as
        | (RowDataPacket & {
            id: number;
            full_name: string;
            identifier: string;
            role: string;
          })
        | undefined;

      if (!user) {
        response.status(401).json({
          message: "Invalid credentials.",
          nextStep: "check identifier, role, and password against the MySQL users table",
        });
        return;
      }

      response.json({
        message: "Login successful.",
        nextStep: "issue session or JWT in the next step",
        user: {
          id: user.id,
          fullName: user.full_name,
          identifier: user.identifier,
          role: user.role,
          loginMode: parsed.data.loginMode,
        },
      });
    } catch {
      const fallbackUser = fallbackUsers.get(fallbackKey(parsed.data.identifier, parsed.data.role));

      if (!fallbackUser || fallbackUser.passwordHash !== sha256Hex(parsed.data.password)) {
        response.status(401).json({
          message: "Invalid credentials.",
          nextStep: "use the demo account or start MySQL to use persistent accounts",
        });
        return;
      }

      response.json({
        message: "Login successful.",
        nextStep: "issue session or JWT in the next step",
        user: {
          id: fallbackUser.id,
          fullName: fallbackUser.fullName,
          identifier: fallbackUser.identifier,
          role: fallbackUser.role,
          loginMode: parsed.data.loginMode,
        },
      });
    }
  });

  app.post("/api/auth/register", async (request: Request, response: Response) => {
    const parsed = registerSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Invalid register payload.",
        issues: parsed.error.flatten(),
      });
      return;
    }

    try {
      await db.query(
        "INSERT INTO users (full_name, identifier, role, password_hash) VALUES (?, ?, ?, SHA2(?, 256))",
        [parsed.data.fullName, parsed.data.identifier, parsed.data.role, parsed.data.password]
      );

      response.status(201).json({
        message: "Account created.",
        nextStep: "sign in with the same role and identifier",
        user: {
          fullName: parsed.data.fullName,
          identifier: parsed.data.identifier,
          role: parsed.data.role,
          loginMode: parsed.data.loginMode,
        },
      });
    } catch (error) {
      const dbError = error as { code?: unknown };
      const code = typeof dbError.code === "string" ? dbError.code : "";

      if (code === "ER_DUP_ENTRY") {
        response.status(409).json({
          message: "An account already exists for this identifier and role.",
          nextStep: "try logging in instead",
        });
        return;
      }

      const fallbackKeyValue = fallbackKey(parsed.data.identifier, parsed.data.role);

      if (fallbackUsers.has(fallbackKeyValue)) {
        response.status(409).json({
          message: "An account already exists for this identifier and role.",
          nextStep: "try logging in instead",
        });
        return;
      }

      const fallbackUser: AuthRecord = {
        id: fallbackUsers.size + 1,
        fullName: parsed.data.fullName,
        identifier: parsed.data.identifier,
        role: parsed.data.role,
        passwordHash: sha256Hex(parsed.data.password),
      };

      fallbackUsers.set(fallbackKeyValue, fallbackUser);

      response.status(201).json({
        message: "Account created.",
        nextStep: "sign in with the same role and identifier",
        user: {
          fullName: parsed.data.fullName,
          identifier: parsed.data.identifier,
          role: parsed.data.role,
          loginMode: parsed.data.loginMode,
        },
      });
    }
  });

  app.post("/api/chatbot/assist", (request: Request, response: Response) => {
    const parsed = chatbotSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Invalid chatbot payload.",
        issues: parsed.error.flatten(),
      });
      return;
    }

    const sessionId = parsed.data.sessionId ?? randomUUID();
    const incomingMessages = trimChatbotMessages(
      parsed.data.messages.map((message) =>
        message.timestamp
          ? { role: message.role, text: message.text, timestamp: message.timestamp }
          : { role: message.role, text: message.text }
      )
    );

    if (incomingMessages.length === 0 || incomingMessages[incomingMessages.length - 1]?.role !== "user") {
      response.status(400).json({
        message: "The chatbot conversation must end with a user message.",
      });
      return;
    }

    const storedConversation = chatbotSessionStore.get(sessionId)?.messages ?? [];
    const conversation = trimChatbotMessages([...storedConversation, ...incomingMessages]);
    const assistantReply = chatbotProvider.respond({
      messages: conversation,
      ...(parsed.data.role ? { role: parsed.data.role } : {}),
    });

    chatbotSessionStore.set(sessionId, {
      messages: trimChatbotMessages([
        ...conversation,
        { role: "assistant", text: assistantReply, timestamp: new Date().toISOString() },
      ]),
      updatedAt: Date.now(),
    });

    response.status(200);
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("X-Chatbot-Session-Id", sessionId);
    response.end(assistantReply);
  });

  app.use((_request: Request, response: Response) => {
    response.status(404).json({ message: "Route not found" });
  });

  return app;
}
