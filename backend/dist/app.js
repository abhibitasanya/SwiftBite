import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createHash } from "crypto";
import helmet from "helmet";
import morgan from "morgan";
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
const chatbotSchema = z.object({
    message: z.string().min(1),
    role: z.enum(["customer", "delivery", "restaurant", "platform"]).optional(),
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
function buildDashboard(role, restaurants, users) {
    if (role === "delivery") {
        return {
            role,
            source: "fallback",
            stats: { activeTrips: fallbackDeliveryTasks.length, completedToday: 24, earningsToday: "₹1,240" },
            currentPosition: fallbackDeliveryTasks[0]?.currentLocation ?? "Unknown",
            nextDrop: fallbackDeliveryTasks[0]?.dropoff ?? "Unknown",
            timeToReach: `${fallbackDeliveryTasks[0]?.etaMinutes ?? 0} min`,
            activeTrips: fallbackDeliveryTasks,
        };
    }
    if (role === "restaurant") {
        return {
            role,
            source: "fallback",
            profile: {
                name: "Restaurant Owner",
                branch: "Market Road",
                ordersPending: 7,
                kitchenStatus: "Busy",
            },
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
    app.use(express.json());
    app.use(morgan("dev"));
    app.get("/health", async (_request, response) => {
        const timestamp = new Date().toISOString();
        try {
            await db.query("SELECT 1");
            response.json({
                service: "backend",
                api: "online",
                database: "connected",
                status: "ok",
                timestamp,
            });
        }
        catch {
            response.json({
                service: "backend",
                api: "online",
                database: "disconnected",
                status: "degraded",
                timestamp,
            });
        }
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
        response.json(buildDashboard(role, restaurantResult.restaurants, users));
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
        const rolePrefix = parsed.data.role ? `${parsed.data.role}: ` : "";
        response.json({
            reply: `${rolePrefix}I can help with login, orders, delivery status, restaurant setup, or platform support.`,
            intent: "starter-assistant",
        });
    });
    app.use((_request, response) => {
        response.status(404).json({ message: "Route not found" });
    });
    return app;
}
