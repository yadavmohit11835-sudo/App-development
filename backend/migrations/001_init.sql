-- KeyPrime Sales Management Schema
CREATE DATABASE IF NOT EXISTS `keyprime_sales_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `keyprime_sales_db`;

-- 1. Users Table (Admin & Salespersons)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'salesperson') NOT NULL DEFAULT 'salesperson',
  `phone` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `shop_name` VARCHAR(200) NOT NULL,
  `owner_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL DEFAULT 'Gujarat',
  `pincode` VARCHAR(10) DEFAULT NULL,
  `assigned_salesperson_id` INT NULL,
  `status` ENUM('lead', 'contacted', 'demo_scheduled', 'active', 'inactive') NOT NULL DEFAULT 'lead',
  `notes` TEXT DEFAULT NULL,
  `follow_up_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`assigned_salesperson_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_cust_salesperson` (`assigned_salesperson_id`),
  INDEX `idx_cust_status` (`status`)
) ENGINE=InnoDB;

-- 3. Demos Table
CREATE TABLE IF NOT EXISTS `demos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `salesperson_id` INT NOT NULL,
  `demo_date` DATE NOT NULL,
  `demo_time` VARCHAR(20) NOT NULL,
  `location` TEXT NOT NULL,
  `status` ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  `notes` TEXT DEFAULT NULL,
  `outcome` TEXT DEFAULT NULL,
  `follow_up_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`salesperson_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_demo_salesperson_date` (`salesperson_id`, `demo_date`),
  INDEX `idx_demo_status` (`status`)
) ENGINE=InnoDB;

-- 4. Subscriptions Table
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `plan_name` VARCHAR(100) NOT NULL,
  `duration_months` INT NOT NULL DEFAULT 12,
  `start_date` DATE NOT NULL,
  `expiry_date` DATE NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('active', 'expiring_soon', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  `reminder_sent` BOOLEAN NOT NULL DEFAULT FALSE,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  INDEX `idx_sub_customer` (`customer_id`),
  INDEX `idx_sub_expiry` (`expiry_date`),
  INDEX `idx_sub_status` (`status`)
) ENGINE=InnoDB;

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `subscription_id` INT NULL,
  `recorded_by_user_id` INT NOT NULL,
  `amount_paid` DECIMAL(10, 2) NOT NULL,
  `payment_date` DATE NOT NULL,
  `payment_method` ENUM('upi', 'cash', 'bank_transfer', 'cheque', 'other') NOT NULL DEFAULT 'upi',
  `reference_number` VARCHAR(100) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `status` ENUM('verified', 'pending', 'cancelled') NOT NULL DEFAULT 'verified',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_pay_customer` (`customer_id`),
  INDEX `idx_pay_date` (`payment_date`)
) ENGINE=InnoDB;

-- 6. Activity Logs Table
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` INT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'info',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
