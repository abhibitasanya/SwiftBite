<div align="center">
  <img src="app_logo.png" alt="SwiftBite Logo" width="120" />
  <h1>🍔 SwiftBite</h1>
  <p><strong>The modern, lightning-fast food delivery experience—powered by AI.</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Click_Here-red?style=for-the-badge)](https://swiftbite-ryf2.onrender.com)
</div>

<br />

Welcome to **SwiftBite**, a premium food delivery platform designed to seamlessly bridge the gap between a stunning web marketing presence and a lightning-fast Progressive Web App (PWA) mobile experience.

---

## 🤖 Meet Your AI Food Assistant

SwiftBite includes a chatbot for general questions about using the app. When `GEMINI_API_KEY` is configured on the backend, it uses Gemini to generate responses; otherwise, it uses a local set of guided replies. The chatbot does not read user profiles, menu inventory, carts, or live order and delivery data, and it cannot place orders or apply dietary filters.

---

## ✨ Key Features

- **Premium Web Landing Page**: A visually stunning, desktop-first landing page with modern glassmorphism, micro-animations, and vibrant culinary aesthetics.
- **Mobile-First PWA Core**: Once users click "Let's Get Started", the app seamlessly transitions into a highly responsive, app-like mobile view.
- **Interactive UI/UX**: Includes a dynamic cart system, favorite restaurant tracking, category filtering, and real-time order history.
- **Three-Tier Portals**: Built-in support for Customer, Admin, Delivery Partner, and Restaurant Owner portals.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + Vite
- **Backend and Database**: Node.js, Express, and MySQL
- **AI Assistant**: Google Gemini API (optional backend environment variable)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Type Safety**: TypeScript
- **Deployment**: Vercel / Render *(update as needed)*

### Admin account provisioning

Public signup cannot create administrator accounts. To provision the initial admin, set `ADMIN_BOOTSTRAP_PASSWORD` as a backend environment secret with at least 16 characters, then start the backend after the MySQL schema is installed. On startup, the backend creates the `Admin` platform account for `admin@gmail.com` only if that account does not already exist; it will never replace an existing password. Remove the environment variable after provisioning. The password is not hardcoded or logged.

## 🚀 Getting Started

To run the SwiftBite frontend locally on your machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SwiftBite.git
   cd SwiftBite
   ```

2. **Navigate to the frontend**
   ```bash
   cd frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   *The app will instantly launch on your local host with the premium web landing page!*

---
<div align="center">
  <i>Built with ❤️ for food lovers everywhere.</i>
</div>