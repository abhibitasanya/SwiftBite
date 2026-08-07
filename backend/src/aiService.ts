import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY not set in environment variables. AI features will be disabled.");
}

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

if (API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error) {
    console.error("Failed to initialize Gemini AI:", error);
  }
}

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  timestamp?: string;
};

// Reuse the same types from app.ts for consistency
type ChatbotMessage = {
  role: "user" | "assistant";
  text: string;
  timestamp?: string | undefined;
};

type ChatRole = "customer" | "delivery" | "restaurant" | "platform";

function getSystemPrompt(role: ChatRole): string {
  const basePrompt = `You are a helpful AI assistant for SwiftBite, a food delivery platform. 
Your role is to help users navigate the app and answer questions about food ordering, delivery, restaurants, and account management.
Keep responses concise (under 150 words), friendly, and action-oriented.
If you don't know something specific about the user's account or order, guide them to the right screen in the app.`;

  const roleSpecificPrompts: Record<ChatRole, string> = {
    customer: `${basePrompt}
You are in Order Maker mode. You can help with:
- Browsing restaurants and menus
- Adding items to cart and checkout
- Order tracking and status
- Account settings and preferences
- Restaurant recommendations based on preferences
- Dietary restrictions and allergen information`,
    
    delivery: `${basePrompt}
You are in Delivery Partner mode. You can help with:
- Active delivery trips and route optimization
- Current location and ETA updates
- Online/offline status management
- Rider profile and earnings
- Delivery zone and availability
- Order pickup and dropoff procedures`,
    
    restaurant: `${basePrompt}
You are in Restaurant Owner mode. You can help with:
- Restaurant profile and details
- Menu item management and pricing
- Order status and kitchen workflow
- Availability and operating hours
- Customer reviews and ratings
- Sales and performance analytics`,
    
    platform: `${basePrompt}
You are in Main Team (Admin) mode. You can help with:
- User management and verification
- Restaurant onboarding and approval
- Delivery partner management
- Platform analytics and reports
- System configuration and settings
- Troubleshooting and support`
  };

  return roleSpecificPrompts[role] || basePrompt;
}

export async function getAIResponse(
  messages: ChatbotMessage[],
  role: ChatRole = "customer"
): Promise<string> {
  if (!model) {
    throw new Error("AI model not initialized. Check GEMINI_API_KEY environment variable.");
  }

  try {
    const systemPrompt = getSystemPrompt(role);
    
    // Convert messages to Gemini format
    const chatHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== "user") {
      throw new Error("Latest message must be from user");
    }

    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: systemPrompt
    });

    const result = await chat.sendMessage(latestMessage.text);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw error;
  }
}

export function isAIInitialized(): boolean {
  return model !== null;
}