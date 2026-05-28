import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createHash, randomUUID } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
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
const restaurantSchema = z.object({
    name: z.string().trim().min(2),
    cuisine: z.string().trim().min(2),
    location: z.string().trim().min(2),
    etaMinutes: z.coerce.number().int().min(1).max(180),
    rating: z.coerce.number().min(0).max(5),
    description: z.string().trim().min(6),
    featured: z.coerce.boolean().optional().default(false),
});
const uploadDirectory = path.resolve(process.cwd(), "uploads");
mkdirSync(uploadDirectory, { recursive: true });
const fallbackUsers = new Map([
    ["customer@example.com::customer", { id: 1, fullName: "Customer Demo", identifier: "customer@example.com", role: "customer", passwordHash: sha256Hex("Password123") }],
    ["9876543210::delivery", { id: 2, fullName: "Delivery Demo", identifier: "9876543210", role: "delivery", passwordHash: sha256Hex("Password123") }],
    ["restaurant@example.com::restaurant", { id: 3, fullName: "Restaurant Demo", identifier: "restaurant@example.com", role: "restaurant", passwordHash: sha256Hex("Password123") }],
    ["platform@example.com::platform", { id: 4, fullName: "Platform Demo", identifier: "platform@example.com", role: "platform", passwordHash: sha256Hex("Password123") }],
]);
let fallbackRestaurants = [
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
const fallbackDeliveryTasks = [
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
const fallbackPlatformUsers = [
    { fullName: "Customer Demo", identifier: "customer@example.com", role: "customer" },
    { fullName: "Delivery Demo", identifier: "9876543210", role: "delivery" },
    { fullName: "Restaurant Demo", identifier: "restaurant@example.com", role: "restaurant" },
    { fullName: "Platform Demo", identifier: "platform@example.com", role: "platform" },
];
const fallbackRiderProfiles = [
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
const fallbackRestaurantProfiles = [
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
const fallbackMenuItems = [
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
const fallbackRestaurantCategories = [
    { id: 1, name: "Featured", slug: "featured", sortOrder: 1 },
    { id: 2, name: "Combos", slug: "combos", sortOrder: 2 },
    { id: 3, name: "Bestsellers", slug: "bestsellers", sortOrder: 3 },
    { id: 4, name: "Recommended", slug: "recommended", sortOrder: 4 },
];
const fallbackUploadedImages = [];
const chatbotSessionStore = new Map();
// Replace this local provider with OpenAI/Gemini integration later if you want a cloud AI assistant.
const chatbotProvider = {
    respond: (prompt) => createLocalChatbotReply(prompt),
};
function trimChatbotMessages(messages) {
    return messages.filter((message) => message.text.trim().length > 0).slice(-16);
}
function createLocalChatbotReply(prompt) {
    const messages = prompt.messages;
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.text ?? "";
    const previousAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant")?.text ?? "";
    const normalizedMessage = latestUserMessage.toLowerCase();
    const previousContext = [...messages].slice(0, -1).reverse().find((message) => message.role === "user")?.text.toLowerCase() ?? "";
    const rolePrefix = prompt.role ? `${prompt.role}: ` : "";
    const foodOpeners = [
        "Sure, here’s a good option",
        "I’d try this",
        "A solid pick would be",
        "Here’s a friendly suggestion",
    ];
    const helpOpeners = [
        "Absolutely",
        "Yep",
        "Of course",
        "I can help with that",
    ];
    function pickVariant(options) {
        const index = Math.abs([...latestUserMessage].reduce((sum, character) => sum + character.charCodeAt(0), 0)) % options.length;
        return options[index];
    }
    function mentionRoleHint() {
        if (prompt.role === "delivery") {
            return "I can help with trip status, ETA, delivery flow, or app navigation.";
        }
        if (prompt.role === "restaurant") {
            return "I can help with menu management, orders, and kitchen workflow.";
        }
        if (prompt.role === "platform") {
            return "I can help with admin screens, users, restaurants, and system views.";
        }
        return "I can help with ordering, restaurant choices, checkout, delivery tracking, or account questions.";
    }
    if (!normalizedMessage) {
        return `${rolePrefix}${pickVariant(helpOpeners)} — tell me what you want to do in SwiftBite.`;
    }
    if (normalizedMessage.includes("register") || normalizedMessage.includes("sign up") || normalizedMessage.includes("create account")) {
        return `${rolePrefix}${pickVariant(helpOpeners)}. Choose your role, pick email or phone, fill in your details, and submit the form.`;
    }
    if (normalizedMessage.includes("login") || normalizedMessage.includes("sign in")) {
        return `${rolePrefix}${pickVariant(helpOpeners)}. Select your role, use the same email or phone you registered with, and sign in.`;
    }
    if (normalizedMessage.includes("restaurant") || normalizedMessage.includes("menu") || normalizedMessage.includes("order")) {
        return `${rolePrefix}${pickVariant(foodOpeners)}: browse the restaurant cards, open a menu, add items to the cart, then continue to checkout.`;
    }
    if (normalizedMessage.includes("delivery") || normalizedMessage.includes("track") || normalizedMessage.includes("eta")) {
        return `${rolePrefix}${pickVariant(helpOpeners)}. Open the delivery view to see the current location, next drop, and ETA.`;
    }
    if (normalizedMessage.includes("spicy")) {
        const restriction = normalizedMessage.includes("not chicken") || previousContext.includes("not chicken") ? "without chicken" : "";
        return `${rolePrefix}${pickVariant(foodOpeners)}${restriction ? ` ${restriction}` : ""}: try a spicy paneer bowl, a peppery wrap, or a masala platter.`;
    }
    if (normalizedMessage.includes("not chicken") || normalizedMessage.includes("no chicken")) {
        if (previousAssistantMessage.toLowerCase().includes("spicy") || previousContext.includes("spicy")) {
            return `${rolePrefix}Got it. Keep the spicy vibe, but skip chicken. I’d suggest spicy paneer, chili potato, or a masala veg bowl.`;
        }
        return `${rolePrefix}No chicken noted. I can steer you toward paneer, veg, seafood, or egg-based options instead.`;
    }
    if (normalizedMessage.includes("budget") || normalizedMessage.includes("cheap") || normalizedMessage.includes("affordable")) {
        return `${rolePrefix}For a budget-friendly order, go for wraps, bowls, or combo meals. They’re usually the best value.`;
    }
    if (normalizedMessage.includes("what can you do") || normalizedMessage.includes("help")) {
        return `${rolePrefix}${mentionRoleHint()}`;
    }
    if (normalizedMessage.includes("hello") || normalizedMessage.includes("hi") || normalizedMessage.includes("hey")) {
        return `${rolePrefix}Hi. Tell me what you’re trying to do in SwiftBite, and I’ll guide you.`;
    }
    return `${rolePrefix}${pickVariant(helpOpeners)} — ${mentionRoleHint()}`;
}
function sha256Hex(value) {
    return createHash("sha256").update(value).digest("hex");
}
function fallbackKey(identifier, role) {
    return `${identifier}::${role}`;
}
function buildMenuForRestaurant(name, cuisine) {
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
function normalizeEmpty(value) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    return trimmed.length > 0 ? trimmed : "";
}
function normalizeRouteParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
async function loadRiderProfiles() {
    try {
        const [rows] = await db.query("SELECT id, user_identifier, full_name, profile_image_url, age, gender, phone_number, alternate_phone_number, email, residential_address, city_state, emergency_contact, vehicle_type, vehicle_number, driving_license_number, availability_status, is_online, delivery_zone, joining_date, completed_orders_count, active_deliveries, earnings_today, verification_status, id_proof_url, driving_license_url, profile_photo_url, created_at, updated_at FROM rider_profiles ORDER BY updated_at DESC");
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
                availabilityStatus: String(row.availability_status),
                isOnline: Boolean(row.is_online),
                deliveryZone: String(row.delivery_zone),
                joiningDate: String(row.joining_date),
                completedOrdersCount: Number(row.completed_orders_count),
                activeDeliveries: Number(row.active_deliveries),
                earningsToday: String(row.earnings_today),
                verificationStatus: String(row.verification_status),
                idProofUrl: normalizeEmpty(row.id_proof_url ? String(row.id_proof_url) : ""),
                drivingLicenseUrl: normalizeEmpty(row.driving_license_url ? String(row.driving_license_url) : ""),
                profilePhotoUrl: normalizeEmpty(row.profile_photo_url ? String(row.profile_photo_url) : ""),
                createdAt: new Date(row.created_at).toISOString(),
                updatedAt: new Date(row.updated_at).toISOString(),
            })),
            source: "mysql",
        };
    }
    catch {
        return { profiles: fallbackRiderProfiles, source: "fallback" };
    }
}
async function saveRiderProfile(profile) {
    try {
        await db.query(`INSERT INTO rider_profiles
        (user_identifier, full_name, profile_image_url, age, gender, phone_number, alternate_phone_number, email, residential_address, city_state, emergency_contact, vehicle_type, vehicle_number, driving_license_number, availability_status, is_online, delivery_zone, joining_date, completed_orders_count, active_deliveries, earnings_today, verification_status, id_proof_url, driving_license_url, profile_photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name), profile_image_url = VALUES(profile_image_url), age = VALUES(age), gender = VALUES(gender), phone_number = VALUES(phone_number), alternate_phone_number = VALUES(alternate_phone_number), email = VALUES(email), residential_address = VALUES(residential_address), city_state = VALUES(city_state), emergency_contact = VALUES(emergency_contact), vehicle_type = VALUES(vehicle_type), vehicle_number = VALUES(vehicle_number), driving_license_number = VALUES(driving_license_number), availability_status = VALUES(availability_status), is_online = VALUES(is_online), delivery_zone = VALUES(delivery_zone), joining_date = VALUES(joining_date), completed_orders_count = VALUES(completed_orders_count), active_deliveries = VALUES(active_deliveries), earnings_today = VALUES(earnings_today), verification_status = VALUES(verification_status), id_proof_url = VALUES(id_proof_url), driving_license_url = VALUES(driving_license_url), profile_photo_url = VALUES(profile_photo_url), updated_at = CURRENT_TIMESTAMP`, [
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
        ]);
        return { source: "mysql" };
    }
    catch {
        const index = fallbackRiderProfiles.findIndex((item) => item.userIdentifier === profile.userIdentifier);
        if (index >= 0) {
            fallbackRiderProfiles[index] = profile;
        }
        else {
            fallbackRiderProfiles.push(profile);
        }
        return { source: "fallback" };
    }
}
async function loadRestaurantProfiles() {
    try {
        const [rows] = await db.query("SELECT id, user_identifier, restaurant_name, restaurant_logo_url, cover_image_url, owner_name, contact_number, email, restaurant_address, city_state, cuisine_type, gst_license_number, opening_hours, delivery_radius, description, verification_status, created_at, updated_at FROM restaurant_profiles ORDER BY updated_at DESC");
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
                verificationStatus: String(row.verification_status),
                createdAt: new Date(row.created_at).toISOString(),
                updatedAt: new Date(row.updated_at).toISOString(),
            })),
            source: "mysql",
        };
    }
    catch {
        return { profiles: fallbackRestaurantProfiles, source: "fallback" };
    }
}
async function saveRestaurantProfile(profile) {
    try {
        await db.query(`INSERT INTO restaurant_profiles
        (user_identifier, restaurant_name, restaurant_logo_url, cover_image_url, owner_name, contact_number, email, restaurant_address, city_state, cuisine_type, gst_license_number, opening_hours, delivery_radius, description, verification_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        restaurant_name = VALUES(restaurant_name), restaurant_logo_url = VALUES(restaurant_logo_url), cover_image_url = VALUES(cover_image_url), owner_name = VALUES(owner_name), contact_number = VALUES(contact_number), email = VALUES(email), restaurant_address = VALUES(restaurant_address), city_state = VALUES(city_state), cuisine_type = VALUES(cuisine_type), gst_license_number = VALUES(gst_license_number), opening_hours = VALUES(opening_hours), delivery_radius = VALUES(delivery_radius), description = VALUES(description), verification_status = VALUES(verification_status), updated_at = CURRENT_TIMESTAMP`, [
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
        ]);
        return { source: "mysql" };
    }
    catch {
        const index = fallbackRestaurantProfiles.findIndex((item) => item.userIdentifier === profile.userIdentifier);
        if (index >= 0) {
            fallbackRestaurantProfiles[index] = profile;
        }
        else {
            fallbackRestaurantProfiles.push(profile);
        }
        return { source: "fallback" };
    }
}
async function loadMenuItems(restaurantIdentifier) {
    try {
        const query = restaurantIdentifier
            ? "SELECT id, restaurant_identifier, dish_name, dish_image_url, price, category, description, spice_level, veg_type, is_available, preparation_time_minutes, is_featured, is_bestseller, is_recommended, created_at, updated_at FROM menu_items WHERE restaurant_identifier = ? ORDER BY is_featured DESC, is_bestseller DESC, dish_name ASC"
            : "SELECT id, restaurant_identifier, dish_name, dish_image_url, price, category, description, spice_level, veg_type, is_available, preparation_time_minutes, is_featured, is_bestseller, is_recommended, created_at, updated_at FROM menu_items ORDER BY is_featured DESC, is_bestseller DESC, dish_name ASC";
        const [rows] = await db.query(query, restaurantIdentifier ? [restaurantIdentifier] : []);
        return {
            items: rows.map((row) => ({
                id: Number(row.id),
                restaurantIdentifier: String(row.restaurant_identifier),
                dishName: String(row.dish_name),
                dishImageUrl: normalizeEmpty(row.dish_image_url ? String(row.dish_image_url) : ""),
                price: Number(row.price),
                category: String(row.category),
                description: String(row.description),
                spiceLevel: String(row.spice_level),
                vegType: String(row.veg_type),
                isAvailable: Boolean(row.is_available),
                preparationTimeMinutes: Number(row.preparation_time_minutes),
                isFeatured: Boolean(row.is_featured),
                isBestseller: Boolean(row.is_bestseller),
                isRecommended: Boolean(row.is_recommended),
                createdAt: new Date(row.created_at).toISOString(),
                updatedAt: new Date(row.updated_at).toISOString(),
            })),
            source: "mysql",
        };
    }
    catch {
        const items = restaurantIdentifier ? fallbackMenuItems.filter((item) => item.restaurantIdentifier === restaurantIdentifier) : fallbackMenuItems;
        return { items, source: "fallback" };
    }
}
async function saveMenuItem(menuItem) {
    try {
        await db.query(`INSERT INTO menu_items
        (restaurant_identifier, dish_name, dish_image_url, price, category, description, spice_level, veg_type, is_available, preparation_time_minutes, is_featured, is_bestseller, is_recommended)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        dish_name = VALUES(dish_name), dish_image_url = VALUES(dish_image_url), price = VALUES(price), category = VALUES(category), description = VALUES(description), spice_level = VALUES(spice_level), veg_type = VALUES(veg_type), is_available = VALUES(is_available), preparation_time_minutes = VALUES(preparation_time_minutes), is_featured = VALUES(is_featured), is_bestseller = VALUES(is_bestseller), is_recommended = VALUES(is_recommended), updated_at = CURRENT_TIMESTAMP`, [
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
        ]);
        return { source: "mysql" };
    }
    catch {
        const index = fallbackMenuItems.findIndex((item) => item.id === menuItem.id || (item.restaurantIdentifier === menuItem.restaurantIdentifier && item.dishName.toLowerCase() === menuItem.dishName.toLowerCase()));
        if (index >= 0) {
            fallbackMenuItems[index] = menuItem;
        }
        else {
            fallbackMenuItems.push(menuItem);
        }
        return { source: "fallback" };
    }
}
async function deleteMenuItem(menuItemId) {
    try {
        await db.query("DELETE FROM menu_items WHERE id = ?", [menuItemId]);
        return { source: "mysql" };
    }
    catch {
        const nextItems = fallbackMenuItems.filter((item) => item.id !== menuItemId);
        fallbackMenuItems.splice(0, fallbackMenuItems.length, ...nextItems);
        return { source: "fallback" };
    }
}
async function saveUploadedImage(image) {
    try {
        await db.query(`INSERT INTO uploaded_images (owner_type, owner_identifier, purpose, file_name, public_url, mime_type, size_bytes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [image.ownerType, image.ownerIdentifier, image.purpose, image.fileName, image.publicUrl, image.mimeType, image.size]);
        return { source: "mysql" };
    }
    catch {
        fallbackUploadedImages.push(image);
        return { source: "fallback" };
    }
}
async function loadRestaurants() {
    try {
        const [rows] = await db.query("SELECT id, name, cuisine, location, eta_minutes, rating, description, featured FROM restaurants ORDER BY featured DESC, rating DESC, name ASC");
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
            })),
            source: "mysql",
        };
    }
    catch {
        return { restaurants: fallbackRestaurants, source: "fallback" };
    }
}
function buildDashboard(role, restaurants, users, riderProfiles = fallbackRiderProfiles, restaurantProfiles = fallbackRestaurantProfiles, menuItems = fallbackMenuItems, categories = fallbackRestaurantCategories) {
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
        const restaurantIdentifier = restaurantProfile?.userIdentifier ?? fallbackRestaurantProfiles[0].userIdentifier;
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
    async function getHealthStatus() {
        const mysqlConfigured = Boolean(process.env.MYSQL_HOST &&
            process.env.MYSQL_USER &&
            process.env.MYSQL_DATABASE);
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
        }
        catch {
            return {
                api: "online",
                database: "disconnected",
                message: "API online · please connect MySQL",
            };
        }
    }
    app.get("/health", async (_request, response) => {
        const timestamp = new Date().toISOString();
        const healthStatus = await getHealthStatus();
        response.json({
            service: "backend",
            ...healthStatus,
            status: healthStatus.database === "connected" ? "ok" : "degraded",
            timestamp,
        });
    });
    app.get("/api/roles", (_request, response) => {
        response.json({
            roles: [
                { id: "customer", label: "Order Maker" },
                { id: "delivery", label: "Delivery Partner" },
                { id: "restaurant", label: "Restaurant Owner" },
                { id: "platform", label: "Main Team" },
            ],
        });
    });
    app.get("/api/restaurants", async (_request, response) => {
        const result = await loadRestaurants();
        response.json(result);
    });
    app.get("/api/rider-profiles", async (_request, response) => {
        const result = await loadRiderProfiles();
        response.json(result);
    });
    app.get("/api/rider-profiles/:identifier", async (request, response) => {
        const identifier = request.params.identifier;
        const result = await loadRiderProfiles();
        const riderProfile = result.profiles.find((profile) => profile.userIdentifier === identifier);
        if (!riderProfile) {
            response.status(404).json({ message: "Rider profile not found." });
            return;
        }
        response.json({ profile: riderProfile, source: result.source });
    });
    app.put("/api/rider-profiles/:identifier", async (request, response) => {
        const identifier = request.params.identifier;
        const parsed = riderProfileSchema.safeParse({ ...request.body, userIdentifier: identifier });
        if (!parsed.success) {
            response.status(400).json({ message: "Invalid rider profile payload.", issues: parsed.error.flatten() });
            return;
        }
        const payload = parsed.data;
        const nextProfile = {
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
    app.get("/api/restaurant-profiles", async (_request, response) => {
        const result = await loadRestaurantProfiles();
        response.json(result);
    });
    app.get("/api/restaurant-profiles/:identifier", async (request, response) => {
        const identifier = request.params.identifier;
        const result = await loadRestaurantProfiles();
        const profile = result.profiles.find((item) => item.userIdentifier === identifier);
        if (!profile) {
            response.status(404).json({ message: "Restaurant profile not found." });
            return;
        }
        response.json({ profile, source: result.source });
    });
    app.put("/api/restaurant-profiles/:identifier", async (request, response) => {
        const identifier = request.params.identifier;
        const parsed = restaurantProfileSchema.safeParse({ ...request.body, userIdentifier: identifier });
        if (!parsed.success) {
            response.status(400).json({ message: "Invalid restaurant profile payload.", issues: parsed.error.flatten() });
            return;
        }
        const payload = parsed.data;
        const nextProfile = {
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
    app.get("/api/restaurant-profiles/:identifier/menu-items", async (request, response) => {
        const identifier = normalizeRouteParam(request.params.identifier);
        const result = await loadMenuItems(identifier);
        response.json(result);
    });
    app.post("/api/restaurant-profiles/:identifier/menu-items", async (request, response) => {
        const identifier = request.params.identifier;
        const parsed = menuItemSchema.safeParse({ ...request.body, restaurantIdentifier: identifier });
        if (!parsed.success) {
            response.status(400).json({ message: "Invalid menu item payload.", issues: parsed.error.flatten() });
            return;
        }
        const payload = parsed.data;
        const nextItem = {
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
    app.put("/api/menu-items/:id", async (request, response) => {
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
        const nextItem = {
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
    app.delete("/api/menu-items/:id", async (request, response) => {
        const itemId = Number(request.params.id);
        const result = await deleteMenuItem(itemId);
        response.json({ message: "Menu item deleted.", source: result.source });
    });
    app.get("/api/admin/riders", async (_request, response) => {
        const result = await loadRiderProfiles();
        response.json(result);
    });
    app.get("/api/admin/restaurants", async (_request, response) => {
        const result = await loadRestaurantProfiles();
        response.json(result);
    });
    app.get("/api/admin/categories", (_request, response) => {
        response.json({ categories: fallbackRestaurantCategories, source: "fallback" });
    });
    app.post("/api/uploads/image", async (request, response) => {
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
        const record = {
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
    app.post("/api/restaurants", async (request, response) => {
        const parsed = restaurantSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid restaurant payload.",
                issues: parsed.error.flatten(),
            });
            return;
        }
        const nextRestaurant = {
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
            await db.query("INSERT INTO restaurants (name, cuisine, location, eta_minutes, rating, description, featured) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                parsed.data.name,
                parsed.data.cuisine,
                parsed.data.location,
                parsed.data.etaMinutes,
                parsed.data.rating,
                parsed.data.description,
                parsed.data.featured ? 1 : 0,
            ]);
            response.status(201).json({ message: "Restaurant added.", restaurant: nextRestaurant, source: "mysql" });
            return;
        }
        catch {
            fallbackRestaurants = [nextRestaurant, ...fallbackRestaurants];
            response.status(201).json({ message: "Restaurant added.", restaurant: nextRestaurant, source: "fallback" });
        }
    });
    app.get("/api/dashboard/:role", async (request, response) => {
        const role = request.params.role;
        if (!["customer", "delivery", "restaurant", "platform"].includes(role)) {
            response.status(400).json({ message: "Invalid dashboard role." });
            return;
        }
        const restaurantResult = await loadRestaurants();
        let users = fallbackPlatformUsers;
        if (role === "platform") {
            try {
                const [rows] = await db.query("SELECT full_name, identifier, role FROM users ORDER BY created_at DESC LIMIT 8");
                users = rows.map((row) => ({
                    fullName: String(row.full_name),
                    identifier: String(row.identifier),
                    role: String(row.role),
                }));
            }
            catch {
                users = fallbackPlatformUsers;
            }
        }
        const riderResult = role === "delivery" || role === "platform" ? await loadRiderProfiles() : { profiles: fallbackRiderProfiles, source: "fallback" };
        const restaurantProfileResult = role === "restaurant" || role === "platform" ? await loadRestaurantProfiles() : { profiles: fallbackRestaurantProfiles, source: "fallback" };
        const menuResult = role === "restaurant" || role === "platform" ? await loadMenuItems() : { items: fallbackMenuItems, source: "fallback" };
        response.json(buildDashboard(role, restaurantResult.restaurants, users, riderResult.profiles, restaurantProfileResult.profiles, menuResult.items, fallbackRestaurantCategories));
    });
    app.post("/api/auth/login", async (request, response) => {
        const parsed = loginSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid login payload.",
                issues: parsed.error.flatten(),
            });
            return;
        }
        try {
            const [rows] = await db.query("SELECT id, full_name, identifier, role FROM users WHERE identifier = ? AND role = ? AND password_hash = SHA2(?, 256) LIMIT 1", [parsed.data.identifier, parsed.data.role, parsed.data.password]);
            const user = rows[0];
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
        }
        catch {
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
    app.post("/api/auth/register", async (request, response) => {
        const parsed = registerSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid register payload.",
                issues: parsed.error.flatten(),
            });
            return;
        }
        try {
            await db.query("INSERT INTO users (full_name, identifier, role, password_hash) VALUES (?, ?, ?, SHA2(?, 256))", [parsed.data.fullName, parsed.data.identifier, parsed.data.role, parsed.data.password]);
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
        catch (error) {
            const dbError = error;
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
            const fallbackUser = {
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
    app.post("/api/chatbot/assist", (request, response) => {
        const parsed = chatbotSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({
                message: "Invalid chatbot payload.",
                issues: parsed.error.flatten(),
            });
            return;
        }
        const sessionId = parsed.data.sessionId ?? randomUUID();
        const incomingMessages = trimChatbotMessages(parsed.data.messages.map((message) => message.timestamp
            ? { role: message.role, text: message.text, timestamp: message.timestamp }
            : { role: message.role, text: message.text }));
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
    app.use((_request, response) => {
        response.status(404).json({ message: "Route not found" });
    });
    return app;
}
