-- قم باستيراد هذا الملف في قاعدة بيانات MySQL الخاصة بك عبر phpMyAdmin

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` varchar(255) NOT NULL,
  `invoiceNumber` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `type` varchar(20) NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `customerName` varchar(255) DEFAULT NULL,
  `isPaid` tinyint(1) NOT NULL DEFAULT 0,
  `currency` varchar(10) NOT NULL,
  `exchangeRate` decimal(15,2) NOT NULL DEFAULT 1.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
  `key_name` varchar(50) NOT NULL,
  `value` text NOT NULL,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدخال إعدادات العملات الافتراضية
INSERT INTO `settings` (`key_name`, `value`) VALUES
('rates', '{"USD": 1, "TRY": 32, "SYP": 14000, "SAR": 3.75}')
ON DUPLICATE KEY UPDATE `value`=`value`;

-- إضافة مستخدم افتراضي (admin / 123456) - يمكنك تغييره لاحقاً
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
('admin_init', 'Admin', 'admin@story.com', '123456', 'SUPER_ADMIN')
ON DUPLICATE KEY UPDATE `id`=`id`;
