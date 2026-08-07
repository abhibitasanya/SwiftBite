export type ChatbotRole = 'customer' | 'delivery' | 'restaurant' | 'platform'

export type ChatbotApiMessage = {
  role: 'user' | 'assistant'
  text: string
  timestamp?: string
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

function normalizeInput(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

function roleHint(role: ChatbotRole | undefined) {
  if (role === 'delivery') {
    return 'In Delivery Partner mode I can guide active trips, ETA, online status, and delivery flow.'
  }
  if (role === 'restaurant') {
    return 'In Restaurant Owner mode I can guide menu items, availability, and pending orders.'
  }
  if (role === 'platform') {
    return 'In Main Team mode I can guide users, restaurants, riders, and admin views.'
  }
  return 'In Order Maker mode I can guide restaurant browsing, cart, checkout, and order tracking.'
}

export function localChatbotReply(messages: ChatbotApiMessage[], role: ChatbotRole = 'customer') {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.text ?? ''
  const normalizedMessage = normalizeInput(latestUserMessage)

  if (!normalizedMessage) {
    return 'Tell me what you want to do in SwiftBite, and I will point you to the right screen.'
  }

  if (hasAny(normalizedMessage, ['hello', 'hi', 'hey'])) {
    const roleName = role === 'delivery' ? 'Delivery Partner' : role === 'restaurant' ? 'Restaurant Owner' : role === 'platform' ? 'Main Team' : 'Order Maker'
    return `Hi. You are in ${roleName} mode. Ask me about ordering, checkout, tracking, restaurants, or app help.`
  }

  if (hasAny(normalizedMessage, ['what can you help', 'help', 'guide me', 'options'])) {
    return `${roleHint(role)} Try asking: how do I order food, where is my order, or show me popular restaurants.`
  }

  if (hasAny(normalizedMessage, ['track', 'tracking', 'where is my order', 'order status', 'eta'])) {
    return 'To track your order, go to Home after placing it. The Track your order card shows status, rider name, ETA, and delivery address.'
  }

  if (hasAny(normalizedMessage, ['order food', 'food order', 'make order', 'how do i order', 'order'])) {
    return 'To order food: open Browse restaurants, tap a restaurant, add dishes with +, review your cart, then tap Proceed to checkout and Place order.'
  }

  if (hasAny(normalizedMessage, ['popular restaurant', 'restaurant', 'browse restaurant', 'show me'])) {
    return 'Open Browse restaurants from the bottom navigation or home screen. You can filter by cuisine, rating, and delivery time, then tap a restaurant to view its menu.'
  }

  if (hasAny(normalizedMessage, ['cart', 'checkout', 'payment', 'place order'])) {
    return 'Add dishes with the + button, open the cart, confirm your address and payment method, then tap Place order.'
  }

  if (hasAny(normalizedMessage, ['spicy', 'burger', 'pizza', 'sushi', 'veg', 'vegetarian', 'budget', 'cheap'])) {
    return 'Browse restaurant menus and use search or categories to find dishes that match your craving. Tap + to add items to your cart.'
  }

  if (hasAny(normalizedMessage, ['thank', 'thanks', 'ok', 'okay'])) {
    return 'Anytime. Ask me the screen or action you are stuck on, and I will guide you inside SwiftBite.'
  }

  return `${roleHint(role)} Try asking: how do I order food, where is my order, or what can you help with?`
}

export async function askChatbot(params: {
  messages: ChatbotApiMessage[]
  sessionId?: string
  role?: ChatbotRole
}): Promise<{ reply: string; sessionId: string; offline: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/api/chatbot/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: params.sessionId,
        role: params.role,
        messages: params.messages.map((message) => ({
          role: message.role,
          text: message.text,
          timestamp: message.timestamp ?? new Date().toISOString(),
        })),
      }),
    })

    if (!response.ok) {
      throw new Error(`Chatbot request failed (${response.status})`)
    }

    const reply = await response.text()
    const sessionId = response.headers.get('X-Chatbot-Session-Id') ?? params.sessionId ?? ''

    return { reply, sessionId, offline: false }
  } catch {
    return {
      reply: localChatbotReply(params.messages, params.role ?? 'customer'),
      sessionId: params.sessionId ?? '',
      offline: true,
    }
  }
}
