CREATE DATABASE IF NOT EXISTS vehicle_qr_system;
USE vehicle_qr_system;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  vehicle_number VARCHAR(30) NOT NULL,
  vehicle_type VARCHAR(30) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  emergency_contact VARCHAR(20) NOT NULL,
  qr_code_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  scan_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(100) NOT NULL,
  device VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  CONSTRAINT fk_scan_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_scans_vehicle_id ON scans(vehicle_id);
CREATE INDEX idx_scans_scan_time ON scans(scan_time);
