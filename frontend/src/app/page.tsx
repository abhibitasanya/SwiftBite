import React from "react";

export default function Home() {
  return (
    <>
      {/* Top Header */}
      <header className="header">
        <div className="header-top animate-fade-in">
          <div className="location-picker">
            <span className="location-icon">📍</span>
            <div className="location-text">
              <span className="location-title">
                Home <span style={{ fontSize: "12px", transform: "rotate(90deg)" }}>›</span>
              </span>
              <span className="location-subtitle">Connaught Place, New Delhi</span>
            </div>
          </div>
          <div className="profile-pic">S</div>
        </div>

        {/* Search Bar */}
        <div className="search-container animate-fade-in animate-delay-1">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Restaurant name, cuisine, or a dish..." 
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Quick Filters */}
        <div className="filters-scroll animate-fade-in animate-delay-2">
          <div className="filter-chip active">
            <span style={{ fontSize: "16px" }}>🛵</span> Delivery
          </div>
          <div className="filter-chip">
            <span style={{ fontSize: "16px" }}>🍽️</span> Dining Out
          </div>
          <div className="filter-chip">
            <span style={{ fontSize: "16px" }}>✨</span> Pro
          </div>
        </div>

        {/* Categories Grid */}
        <div className="section-title animate-fade-in animate-delay-2">
          Eat what makes you happy
        </div>
        <div className="categories-grid animate-fade-in animate-delay-2">
          {[
            { name: "Healthy", icon: "🥗" },
            { name: "Pizza", icon: "🍕" },
            { name: "Biryani", icon: "🥘" },
            { name: "Burger", icon: "🍔" },
            { name: "Rolls", icon: "🌯" },
            { name: "Desserts", icon: "🍰" },
            { name: "Noodles", icon: "🍜" },
            { name: "Chicken", icon: "🍗" }
          ].map((cat, i) => (
            <div key={i} className="category-item">
              <div className="category-icon-wrapper">
                {cat.icon}
              </div>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>

        {/* Restaurants Section */}
        <div className="section-title animate-fade-in animate-delay-3" style={{ marginTop: "32px" }}>
          <span>124 restaurants around you</span>
          <a href="#" className="see-all">See all</a>
        </div>
        
        <div className="restaurant-list animate-fade-in animate-delay-3">
          {/* Restaurant Card 1 */}
          <div className="restaurant-card">
            <div className="card-image-container">
              <div className="card-promo">PRO Extra 10% OFF</div>
              <img 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" 
                alt="Healthy Food" 
                className="card-image"
              />
              <div className="card-time">30 min</div>
            </div>
            <div className="card-content">
              <div className="card-header-row">
                <h3 className="card-title">Green Bowl Oasis</h3>
                <div className="card-rating">
                  4.4 <span>★</span>
                </div>
              </div>
              <div className="card-subtitle">
                <span>Healthy Food, Salads</span>
                <span>₹350 for one</span>
              </div>
              <div className="card-divider"></div>
              <div className="card-footer">
                <span className="card-footer-icon">📈</span>
                <span>9200+ orders placed from here recently</span>
              </div>
            </div>
          </div>

          {/* Restaurant Card 2 */}
          <div className="restaurant-card">
            <div className="card-image-container">
              <div className="card-promo" style={{ backgroundColor: "#1e293b" }}>Free Delivery</div>
              <img 
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" 
                alt="Burger" 
                className="card-image"
              />
              <div className="card-time">45 min</div>
            </div>
            <div className="card-content">
              <div className="card-header-row">
                <h3 className="card-title">Urban Burger Co.</h3>
                <div className="card-rating">
                  4.1 <span>★</span>
                </div>
              </div>
              <div className="card-subtitle">
                <span>Burger, American, Fast Food</span>
                <span>₹250 for one</span>
              </div>
              <div className="card-divider"></div>
              <div className="card-footer">
                <span className="card-footer-icon">🛵</span>
                <span>Free delivery on orders above ₹199</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <a href="#" className="nav-item active">
          <span className="nav-icon">🏠</span>
          Delivery
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">🍽️</span>
          Dining
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">💰</span>
          Money
        </a>
      </nav>
    </>
  );
}
