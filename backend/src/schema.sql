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