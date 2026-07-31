"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type RoleKey = "customer" | "restaurant" | "delivery" | "admin";

type RoleCard = {
  key: RoleKey;
  label: string;
  subtitle: string;
  accent: string;
  icon: string;
};

type RoleDetail = {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  chips: string[];
  metrics: Array<{ value: string; label: string }>;
  features: Array<{ title: string; description: string }>;
  workflow: string[];
  previewTitle: string;
  previewSubtitle: string;
  previewCards: Array<{ title: string; meta: string; value: string }>;
};

const roleCards: RoleCard[] = [
  { key: "customer", label: "Customer App", subtitle: "Order, track, repeat", accent: "#6b7c2a", icon: "🍽️" },
  { key: "restaurant", label: "Restaurant Portal", subtitle: "Menu, orders, fulfillment", accent: "#2d5016", icon: "🏪" },
  { key: "delivery", label: "Delivery App", subtitle: "Routes, handoff, earnings", accent: "#556322", icon: "🛵" },
  { key: "admin", label: "Admin Dashboard", subtitle: "Analytics, control, growth", accent: "#404a1a", icon: "📊" },
];

const roleDetails: Record<RoleKey, RoleDetail> = {
  customer: {
    eyebrow: "Customer experience",
    title: "A premium ordering flow that feels fast, calm, and effortless.",
    description:
      "Built for discovery, checkout, and real-time tracking with a warm olive palette and generous spacing that scales cleanly from mobile to desktop.",
    accent: "#6b7c2a",
    chips: ["Live tracking", "One-tap reorder", "Smart offers"],
    metrics: [
      { value: "18 min", label: "avg delivery" },
      { value: "4.8/5", label: "rating" },
      { value: "92%", label: "repeat orders" },
    ],
    features: [
      { title: "Concise discovery", description: "Visual restaurant cards, cuisine chips, and a short path to checkout." },
      { title: "Confidence at checkout", description: "Clear pricing, coupons, and delivery status reduce friction." },
      { title: "Track in real time", description: "Progress updates, ETA cues, and clear handoff details keep users informed." },
    ],
    workflow: ["Discover", "Customize", "Pay", "Track"],
    previewTitle: "Suggested for you",
    previewSubtitle: "Fresh picks based on your recent orders",
    previewCards: [
      { title: "Green Bowl Oasis", meta: "Healthy bowls", value: "30 min" },
      { title: "Urban Burger Co.", meta: "Free delivery over ₹199", value: "4.4★" },
      { title: "Sweet Crumb Atelier", meta: "Desserts and coffee", value: "Trending" },
    ],
  },
  restaurant: {
    eyebrow: "Restaurant partner",
    title: "A focused operations view that keeps the kitchen moving.",
    description:
      "Menu control, queue management, and order states are presented with high contrast and compact density so teams can act quickly on any device.",
    accent: "#2d5016",
    chips: ["Menu control", "Busy mode", "Order queue"],
    metrics: [
      { value: "24/7", label: "visibility" },
      { value: "3 taps", label: "to update menu" },
      { value: "+21%", label: "faster prep" },
    ],
    features: [
      { title: "Order triage", description: "Statuses and priority states stay visible without feeling cluttered." },
      { title: "Menu intelligence", description: "Low-stock items and out-of-hours controls are easy to surface." },
      { title: "Growth signals", description: "Top dishes, repeat customers, and promo performance are close at hand." },
    ],
    workflow: ["Accept", "Prep", "Hand over", "Review"],
    previewTitle: "Live kitchen board",
    previewSubtitle: "Compact, readable, and action-oriented",
    previewCards: [
      { title: "12 orders ready", meta: "Peak hour", value: "High" },
      { title: "Bestseller mix", meta: "Updated 4 mins ago", value: "Dal bowls" },
      { title: "New offer", meta: "Lunch boost", value: "+14%" },
    ],
  },
  delivery: {
    eyebrow: "Delivery partner",
    title: "A route-first interface for speed, clarity, and low distraction.",
    description:
      "The delivery view prioritizes the next action, shows the most important route details first, and keeps the handoff flow easy to read outdoors.",
    accent: "#556322",
    chips: ["Route guidance", "Earnings", "Pickup priority"],
    metrics: [
      { value: "2.1 km", label: "next pickup" },
      { value: "₹1,240", label: "today earned" },
      { value: "97%", label: "on-time" },
    ],
    features: [
      { title: "Single focus", description: "One primary route card, one primary action, and no visual noise." },
      { title: "Navigation clarity", description: "Pickup, drop, and earnings are segmented for quick glanceability." },
      { title: "Handoff proof", description: "Delivery completion, notes, and verification live in one flow." },
    ],
    workflow: ["Pickup", "Navigate", "Drop", "Confirm"],
    previewTitle: "Next delivery",
    previewSubtitle: "Fast routing with a clear earnings snapshot",
    previewCards: [
      { title: "Connaught Place", meta: "Pickup zone", value: "8 min" },
      { title: "Customer verified", meta: "Drop point ready", value: "Ready" },
      { title: "Trip earnings", meta: "Including peak pay", value: "₹180" },
    ],
  },
  admin: {
    eyebrow: "Administrator",
    title: "A quiet control center for oversight, reporting, and decisions.",
    description:
      "Metrics, health checks, and moderation tools are presented in a crisp dashboard language that feels premium rather than noisy.",
    accent: "#404a1a",
    chips: ["Analytics", "Moderation", "Operations"],
    metrics: [
      { value: "1.9M", label: "orders" },
      { value: "98.4%", label: "uptime" },
      { value: "312", label: "partners" },
    ],
    features: [
      { title: "Executive overview", description: "Clear revenue, fulfillment, and retention signals in one place." },
      { title: "Governed access", description: "Roles and controls stay separated from public customer surfaces." },
      { title: "Actionable insight", description: "Alerts, exceptions, and growth opportunities are easy to scan." },
    ],
    workflow: ["Monitor", "Investigate", "Act", "Report"],
    previewTitle: "Live platform health",
    previewSubtitle: "A restrained, high-trust admin surface",
    previewCards: [
      { title: "Delivery SLA", meta: "Today", value: "96.2%" },
      { title: "Partner growth", meta: "Last 30 days", value: "+18%" },
      { title: "Open incidents", meta: "Requires review", value: "3" },
    ],
  },
};

function LogoMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-[linear-gradient(145deg,#6b7c2a,#2d5016)] shadow-[0_18px_40px_rgba(45,80,22,0.22)]">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 3 7l9 5 9-5-9-5Z" />
        <path d="m3 17 9 5 9-5" />
        <path d="m3 12 9 5 9-5" />
      </svg>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-olive-200/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-olive-700 shadow-[0_10px_30px_rgba(45,80,22,0.08)] backdrop-blur">{children}</span>;
}

export default function Home() {
  const [activeRole, setActiveRole] = useState<RoleKey>("customer");
  const activeDetail = roleDetails[activeRole];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(214,223,181,0.45),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(201,162,39,0.14),_transparent_26%),linear-gradient(180deg,#faf9f5_0%,#f4f2ea_55%,#ede8da_100%)] text-[#171810]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(20,36,10,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,36,10,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-45" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-olive-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-gold-400/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="sticky top-4 z-30 rounded-[28px] border border-white/70 bg-white/75 px-4 py-4 shadow-[0_24px_80px_rgba(20,36,10,0.10)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <LogoMark />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-olive-500">SwiftBite</p>
                <p className="text-sm text-stone-500">Fast. Fresh. Delivered.</p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-stone-600">
              <a className="rounded-full px-4 py-2 transition hover:bg-olive-50 hover:text-olive-700" href="#platform">Platform</a>
              <a className="rounded-full px-4 py-2 transition hover:bg-olive-50 hover:text-olive-700" href="#experiences">Experiences</a>
              <a className="rounded-full px-4 py-2 transition hover:bg-olive-50 hover:text-olive-700" href="#design-system">Design system</a>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <section className="grid gap-8 py-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-10 lg:py-10">
            <div className="space-y-8">
              <div className="space-y-5">
                <SectionLabel>Premium food delivery ecosystem</SectionLabel>
                <div className="space-y-5">
                  <h1 className="font-display max-w-3xl text-[clamp(2.7rem,7vw,5.7rem)] leading-[0.94] tracking-tight text-olive-900">A polished SwiftBite experience for every screen, every role, and every step.</h1>
                  <p className="max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
                    Designed from the new SwiftBite visual language, with adaptable layouts, warm olive surfaces, and a premium calm that scales from mobile checkout to desktop operations.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a href="#experiences" className="inline-flex items-center justify-center rounded-full bg-olive-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(107,124,42,0.28)] transition hover:-translate-y-0.5 hover:bg-olive-700">Explore the experiences</a>
                <a href="#design-system" className="inline-flex items-center justify-center rounded-full border border-olive-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-olive-700 shadow-[0_14px_40px_rgba(20,36,10,0.08)] transition hover:-translate-y-0.5 hover:border-olive-300 hover:bg-white">Review the design system</a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { value: "4", label: "role-specific surfaces" },
                  { value: "100%", label: "responsive by design" },
                  { value: "1", label: "shared visual language" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[24px] border border-white/70 bg-white/75 p-4 shadow-[0_16px_50px_rgba(20,36,10,0.08)] backdrop-blur">
                    <div className="text-2xl font-semibold text-olive-900">{stat.value}</div>
                    <div className="mt-1 text-sm text-stone-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: "Adaptive layout system", text: "Cards, grids, and navigation collapse cleanly for mobile while staying expansive on larger screens." },
                  { title: "Premium component language", text: "Buttons, chips, inputs, and dashboards all share the same olive, forest, and gold palette." },
                ].map((item) => (
                  <div key={item.title} className="rounded-[28px] border border-olive-100 bg-white/80 p-5 shadow-[0_18px_60px_rgba(20,36,10,0.08)] backdrop-blur">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-olive-500">SwiftBite UI</p>
                    <h2 className="mt-3 text-xl font-semibold text-olive-900">{item.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:sticky lg:top-28">
              <div className="rounded-[34px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,249,245,0.82))] p-4 shadow-[0_26px_80px_rgba(20,36,10,0.12)] backdrop-blur-xl sm:p-6">
                <div className="flex flex-wrap gap-2">
                  {roleCards.map((role) => {
                    const selected = role.key === activeRole;

                    return (
                      <button
                        key={role.key}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setActiveRole(role.key)}
                        className="group flex min-w-[calc(50%-0.25rem)] flex-1 items-start gap-3 rounded-[24px] border p-4 text-left transition duration-200 hover:-translate-y-0.5 sm:min-w-0"
                        style={{
                          borderColor: selected ? role.accent : "rgba(215, 224, 199, 0.9)",
                          background: selected ? "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(240, 244, 228, 0.96))" : "rgba(255,255,255,0.7)",
                          boxShadow: selected ? "0 18px 50px rgba(20, 36, 10, 0.1)" : "none",
                        }}
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg shadow-[0_12px_30px_rgba(20,36,10,0.12)]" style={{ backgroundColor: role.accent, color: "white" }}>
                          {role.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-olive-900">{role.label}</span>
                          <span className="mt-1 block text-xs leading-5 text-stone-500">{role.subtitle}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 overflow-hidden rounded-[30px] border border-olive-100 bg-[linear-gradient(160deg,#ffffff_0%,#faf8f0_52%,#f2ebd8_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-olive-500">{activeDetail.eyebrow}</p>
                      <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-olive-900 sm:text-3xl">{activeDetail.title}</h2>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${activeDetail.accent}14`, color: activeDetail.accent }}>Live</span>
                  </div>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">{activeDetail.description}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {activeDetail.chips.map((chip) => (
                      <span key={chip} className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-stone-600 shadow-[0_10px_24px_rgba(20,36,10,0.06)]">{chip}</span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {activeDetail.metrics.map((metric) => (
                      <div key={metric.label} className="rounded-[22px] border border-white/80 bg-white/90 p-4 shadow-[0_16px_40px_rgba(20,36,10,0.08)]">
                        <div className="text-2xl font-semibold text-olive-900">{metric.value}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[26px] border border-olive-100 bg-white p-4 shadow-[0_20px_50px_rgba(20,36,10,0.08)] sm:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-olive-500">{activeDetail.previewTitle}</p>
                        <p className="mt-1 text-sm text-stone-500">{activeDetail.previewSubtitle}</p>
                      </div>
                      <div className="h-10 w-10 rounded-2xl bg-[linear-gradient(145deg,#6b7c2a,#2d5016)]" />
                    </div>

                    <div className="mt-4 grid gap-3">
                      {activeDetail.previewCards.map((card, index) => (
                        <div key={card.title} className="flex items-center justify-between rounded-[20px] border border-olive-100 bg-cream-50 px-4 py-3" style={{ animationDelay: `${index * 80}ms` }}>
                          <div>
                            <div className="text-sm font-semibold text-olive-900">{card.title}</div>
                            <div className="text-xs text-stone-500">{card.meta}</div>
                          </div>
                          <div className="text-sm font-semibold text-olive-700">{card.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-[22px] border border-dashed border-olive-200 bg-olive-50 px-4 py-4 text-sm text-olive-700">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-base shadow-sm">✓</span>
                      Built to adapt across compact mobile layouts, tablet density, and wide desktop dashboards.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="platform" className="py-4 sm:py-6 lg:py-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl space-y-3">
                <SectionLabel>Platform language</SectionLabel>
                <h2 className="font-display text-3xl tracking-tight text-olive-900 sm:text-4xl">One visual system, four tailored experiences.</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
                The same material language carries through every surface, but each role gets a layout that matches its task density and decision style.
              </p>
            </div>

            <div id="experiences" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {roleCards.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => setActiveRole(role.key)}
                  className="group rounded-[28px] border border-white/80 bg-white/75 p-5 text-left shadow-[0_18px_60px_rgba(20,36,10,0.08)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(20,36,10,0.12)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg text-white shadow-[0_12px_30px_rgba(20,36,10,0.15)]" style={{ backgroundColor: role.accent }}>
                        {role.icon}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-olive-900">{role.label}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">{role.subtitle}</div>
                      </div>
                    </div>
                    <div className="rounded-full border border-olive-100 bg-olive-50 px-3 py-1 text-xs font-semibold text-olive-700">Role {role.key === activeRole ? "active" : "preview"}</div>
                  </div>

                  <div className="mt-5 h-px bg-gradient-to-r from-transparent via-olive-200 to-transparent" />

                  <div className="mt-5 space-y-3">
                    {roleDetails[role.key].features.slice(0, 2).map((feature) => (
                      <div key={feature.title} className="rounded-[20px] bg-cream-50 p-4">
                        <div className="text-sm font-semibold text-olive-900">{feature.title}</div>
                        <div className="mt-1 text-sm leading-6 text-stone-500">{feature.description}</div>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section id="design-system" className="py-8 lg:py-12">
            <div className="max-w-2xl space-y-3">
              <SectionLabel>Design system</SectionLabel>
              <h2 className="font-display text-3xl tracking-tight text-olive-900 sm:text-4xl">Built to stay calm, legible, and premium at every scale.</h2>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr_0.95fr]">
              {activeDetail.features.map((feature) => (
                <div key={feature.title} className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_18px_60px_rgba(20,36,10,0.08)] backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-olive-500">Design principle</p>
                  <h3 className="mt-3 text-2xl font-semibold text-olive-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{feature.description}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-olive-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-gold-400" />
                    Responsive by default
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {activeDetail.workflow.map((step, index) => (
                <div key={step} className="rounded-[24px] border border-olive-100 bg-olive-50/70 p-5 shadow-[0_14px_40px_rgba(20,36,10,0.06)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-olive-500">Step {index + 1}</div>
                  <div className="mt-3 text-xl font-semibold text-olive-900">{step}</div>
                  <div className="mt-2 text-sm leading-6 text-stone-600">A compact interaction stage that works equally well on narrow and wide screens.</div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="pb-4 pt-2 text-center text-sm text-stone-500 sm:pb-6">
          SwiftBite is tuned for a premium mobile-first experience, then expands cleanly for tablet and desktop workflows.
        </footer>
      </div>
    </div>
  );
}
