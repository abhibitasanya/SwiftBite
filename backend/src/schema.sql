CREATE DATABASE IF NOT EXISTS swiftdb;
USE swiftdb;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  identifier VARCHAR(191) NOT NULL,
  role ENUM('customer', 'delivery', 'restaurant', 'platform') NOT NULL,
  password_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_users_identifier_role (identifier, role)
);

INSERT INTO users (full_name, identifier, role, password_hash)
VALUES
  ('Customer Demo', 'customer@example.com', 'customer', SHA2('Password123', 256)),
  ('Delivery Demo', '9876543210', 'delivery', SHA2('Password123', 256)),
  ('Restaurant Demo', 'restaurant@example.com', 'restaurant', SHA2('Password123', 256)),
  ('Platform Demo', 'platform@example.com', 'platform', SHA2('Password123', 256))
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  password_hash = VALUES(password_hash),
  updated_at = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS restaurants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(140) NOT NULL,
  cuisine VARCHAR(120) NOT NULL,
  location VARCHAR(160) NOT NULL,
  eta_minutes INT NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  description VARCHAR(255) NOT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

INSERT INTO restaurants (name, cuisine, location, eta_minutes, rating, description, featured)
VALUES
  ('Green Fork', 'Healthy bowls', 'City Center', 18, 4.8, 'Fresh bowls, wraps, and grain plates for quick lunch orders.', 1),
  ('Spice Harbor', 'North Indian', 'Market Road', 24, 4.6, 'Comfort meals, curries, and tandoor plates for dinner.', 1),
  ('Ocean Bites', 'Seafood', 'Harbor View', 32, 4.5, 'Grilled seafood and coastal specials with house sauces.', 0),
  ('Brick Oven House', 'Pizza & Pasta', 'Lake District', 20, 4.7, 'Wood-fired pizzas, pasta bowls, and cheesy sides.', 1)
ON DUPLICATE KEY UPDATE
  cuisine = VALUES(cuisine),
  location = VALUES(location),
  eta_minutes = VALUES(eta_minutes),
  rating = VALUES(rating),
  description = VALUES(description),
  featured = VALUES(featured);

CREATE TABLE IF NOT EXISTS rider_profiles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_identifier VARCHAR(191) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  profile_image_url VARCHAR(255) DEFAULT NULL,
  age INT NOT NULL,
  gender VARCHAR(32) NOT NULL,
  phone_number VARCHAR(32) NOT NULL,
  alternate_phone_number VARCHAR(32) DEFAULT NULL,
  email VARCHAR(191) DEFAULT NULL,
  residential_address VARCHAR(255) NOT NULL,
  city_state VARCHAR(160) NOT NULL,
  emergency_contact VARCHAR(160) NOT NULL,
  vehicle_type VARCHAR(80) NOT NULL,
  vehicle_number VARCHAR(40) NOT NULL,
  driving_license_number VARCHAR(80) NOT NULL,
  availability_status ENUM('available', 'busy', 'offline') NOT NULL DEFAULT 'offline',
  is_online TINYINT(1) NOT NULL DEFAULT 0,
  delivery_zone VARCHAR(120) NOT NULL,
  joining_date DATE NOT NULL,
  completed_orders_count INT NOT NULL DEFAULT 0,
  active_deliveries INT NOT NULL DEFAULT 0,
  earnings_today VARCHAR(32) NOT NULL DEFAULT '₹0',
  verification_status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  id_proof_url VARCHAR(255) DEFAULT NULL,
  driving_license_url VARCHAR(255) DEFAULT NULL,
  profile_photo_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_rider_profiles_user_identifier (user_identifier),
  KEY idx_rider_profiles_status (availability_status, is_online),
  CONSTRAINT fk_rider_profiles_user_identifier FOREIGN KEY (user_identifier) REFERENCES users(identifier) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO rider_profiles (
  user_identifier, full_name, profile_image_url, age, gender, phone_number, alternate_phone_number, email,
  residential_address, city_state, emergency_contact, vehicle_type, vehicle_number, driving_license_number,
  availability_status, is_online, delivery_zone, joining_date, completed_orders_count, active_deliveries,
  earnings_today, verification_status, id_proof_url, driving_license_url, profile_photo_url
)
VALUES
  ('9876543210', 'Delivery Demo', '/message-icon.svg', 29, 'Male', '9876543210', '9876500000', 'delivery@example.com', 'Sector 12, Block C', 'Kolkata, West Bengal', 'Ravi: 9876501234', 'Scooter', 'WB20AB1234', 'DL-DEL-123456', 'available', 1, 'Central Kolkata', '2024-01-12', 284, 2, '₹1,240', 'verified', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name), profile_image_url = VALUES(profile_image_url), age = VALUES(age), gender = VALUES(gender), phone_number = VALUES(phone_number), alternate_phone_number = VALUES(alternate_phone_number), email = VALUES(email), residential_address = VALUES(residential_address), city_state = VALUES(city_state), emergency_contact = VALUES(emergency_contact), vehicle_type = VALUES(vehicle_type), vehicle_number = VALUES(vehicle_number), driving_license_number = VALUES(driving_license_number), availability_status = VALUES(availability_status), is_online = VALUES(is_online), delivery_zone = VALUES(delivery_zone), joining_date = VALUES(joining_date), completed_orders_count = VALUES(completed_orders_count), active_deliveries = VALUES(active_deliveries), earnings_today = VALUES(earnings_today), verification_status = VALUES(verification_status), id_proof_url = VALUES(id_proof_url), driving_license_url = VALUES(driving_license_url), profile_photo_url = VALUES(profile_photo_url), updated_at = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS restaurant_profiles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_identifier VARCHAR(191) NOT NULL,
  restaurant_name VARCHAR(160) NOT NULL,
  restaurant_logo_url VARCHAR(255) DEFAULT NULL,
  cover_image_url VARCHAR(255) DEFAULT NULL,
  owner_name VARCHAR(120) NOT NULL,
  contact_number VARCHAR(32) NOT NULL,
  email VARCHAR(191) DEFAULT NULL,
  restaurant_address VARCHAR(255) NOT NULL,
  city_state VARCHAR(160) NOT NULL,
  cuisine_type VARCHAR(120) NOT NULL,
  gst_license_number VARCHAR(80) NOT NULL,
  opening_hours VARCHAR(80) NOT NULL,
  delivery_radius INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  verification_status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_restaurant_profiles_user_identifier (user_identifier),
  KEY idx_restaurant_profiles_cuisine (cuisine_type),
  CONSTRAINT fk_restaurant_profiles_user_identifier FOREIGN KEY (user_identifier) REFERENCES users(identifier) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO restaurant_profiles (
  user_identifier, restaurant_name, restaurant_logo_url, cover_image_url, owner_name, contact_number, email, restaurant_address, city_state, cuisine_type, gst_license_number, opening_hours, delivery_radius, description, verification_status
)
VALUES
  ('restaurant@example.com', 'Restaurant Demo Kitchen', '/message-icon.svg', NULL, 'Restaurant Demo', '9876543211', 'restaurant@example.com', 'Market Road, Kolkata', 'Kolkata, West Bengal', 'North Indian', 'GST-DEMO-001', '10:00 AM - 11:30 PM', 8, 'Comfort meals, curries, and tandoor plates for dinner.', 'verified')
ON DUPLICATE KEY UPDATE
  restaurant_name = VALUES(restaurant_name), restaurant_logo_url = VALUES(restaurant_logo_url), cover_image_url = VALUES(cover_image_url), owner_name = VALUES(owner_name), contact_number = VALUES(contact_number), email = VALUES(email), restaurant_address = VALUES(restaurant_address), city_state = VALUES(city_state), cuisine_type = VALUES(cuisine_type), gst_license_number = VALUES(gst_license_number), opening_hours = VALUES(opening_hours), delivery_radius = VALUES(delivery_radius), description = VALUES(description), verification_status = VALUES(verification_status), updated_at = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS restaurant_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_restaurant_categories_slug (slug)
);

INSERT INTO restaurant_categories (name, slug, sort_order)
VALUES
  ('Featured', 'featured', 1),
  ('Combos', 'combos', 2),
  ('Bestsellers', 'bestsellers', 3),
  ('Recommended', 'recommended', 4)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sort_order = VALUES(sort_order),
  updated_at = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS menu_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  restaurant_identifier VARCHAR(191) NOT NULL,
  dish_name VARCHAR(160) NOT NULL,
  dish_image_url VARCHAR(255) DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  spice_level ENUM('mild', 'medium', 'hot', 'extra-hot') NOT NULL DEFAULT 'medium',
  veg_type ENUM('veg', 'non-veg') NOT NULL DEFAULT 'veg',
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  preparation_time_minutes INT NOT NULL DEFAULT 15,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_bestseller TINYINT(1) NOT NULL DEFAULT 0,
  is_recommended TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_menu_items_restaurant_identifier (restaurant_identifier),
  KEY idx_menu_items_featured (is_featured, is_bestseller, is_recommended),
  CONSTRAINT fk_menu_items_restaurant_identifier FOREIGN KEY (restaurant_identifier) REFERENCES users(identifier) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO menu_items (
  restaurant_identifier, dish_name, dish_image_url, price, category, description, spice_level, veg_type, is_available, preparation_time_minutes, is_featured, is_bestseller, is_recommended
)
VALUES
  ('restaurant@example.com', 'Paneer Tikka Bowl', NULL, 189, 'Featured', 'Spicy grilled paneer with rice and fresh salad.', 'medium', 'veg', 1, 18, 1, 1, 1),
  ('restaurant@example.com', 'Butter Naan Combo', NULL, 159, 'Combos', 'Soft naan with rich curry and house salad.', 'mild', 'veg', 1, 14, 0, 1, 0)
ON DUPLICATE KEY UPDATE
  dish_name = VALUES(dish_name), dish_image_url = VALUES(dish_image_url), price = VALUES(price), category = VALUES(category), description = VALUES(description), spice_level = VALUES(spice_level), veg_type = VALUES(veg_type), is_available = VALUES(is_available), preparation_time_minutes = VALUES(preparation_time_minutes), is_featured = VALUES(is_featured), is_bestseller = VALUES(is_bestseller), is_recommended = VALUES(is_recommended), updated_at = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS uploaded_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_type ENUM('rider', 'restaurant', 'menu-item') NOT NULL,
  owner_identifier VARCHAR(191) NOT NULL,
  purpose VARCHAR(120) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  public_url VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_uploaded_images_owner (owner_type, owner_identifier),
  KEY idx_uploaded_images_purpose (purpose)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  restaurant_id BIGINT UNSIGNED NOT NULL,
  customer_identifier VARCHAR(191) NOT NULL,
  items_json JSON NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'placed',
  address VARCHAR(255) NOT NULL,
  contact_number VARCHAR(32) NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_restaurant_id (restaurant_id),
  KEY idx_orders_status (status),
  CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE ON UPDATE CASCADE
);