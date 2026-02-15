-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : dim. 15 fév. 2026 à 22:57
-- Version du serveur : 8.2.0
-- Version de PHP : 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `cosy_bobo`
--

-- --------------------------------------------------------

--
-- Structure de la table `discovered_recipes`
--

DROP TABLE IF EXISTS `discovered_recipes`;
CREATE TABLE IF NOT EXISTS `discovered_recipes` (
  `restaurant_id` bigint UNSIGNED NOT NULL,
  `recipe_id` bigint UNSIGNED NOT NULL,
  `discovered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`restaurant_id`,`recipe_id`),
  KEY `fk_dr_recipe` (`recipe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `discovered_recipes`
--

INSERT INTO `discovered_recipes` (`restaurant_id`, `recipe_id`, `discovered_at`) VALUES
(3, 4, '2026-02-15 21:59:55'),
(3, 5, '2026-02-15 22:12:57'),
(3, 8, '2026-02-15 21:58:58');

-- --------------------------------------------------------

--
-- Structure de la table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
CREATE TABLE IF NOT EXISTS `ingredients` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  `unit_cost` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `ingredients`
--

INSERT INTO `ingredients` (`id`, `name`, `icon_url`, `unit_cost`) VALUES
(5, 'Coffee', NULL, 2),
(6, 'Milk', NULL, 1),
(7, 'Water', NULL, 0),
(8, 'Sugar', NULL, 1),
(9, 'Chocolate', NULL, 2),
(10, 'Cinnamon ', NULL, 2),
(11, 'Tea', NULL, 2),
(12, 'Ice', NULL, 0);

-- --------------------------------------------------------

--
-- Structure de la table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
CREATE TABLE IF NOT EXISTS `inventory` (
  `restaurant_id` bigint UNSIGNED NOT NULL,
  `ingredient_id` bigint UNSIGNED NOT NULL,
  `qty` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`restaurant_id`,`ingredient_id`),
  KEY `fk_inv_ingredient` (`ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint UNSIGNED NOT NULL,
  `recipe_id` bigint UNSIGNED NOT NULL,
  `status` enum('pending','served','expired') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `served_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_recipe` (`recipe_id`),
  KEY `idx_orders_restaurant_status` (`restaurant_id`,`status`),
  KEY `idx_orders_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
CREATE TABLE IF NOT EXISTS `recipes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `sell_price` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `recipes`
--

INSERT INTO `recipes` (`id`, `name`, `image_url`, `sell_price`) VALUES
(3, 'Espresso', NULL, 5),
(4, 'Americano', NULL, 6),
(5, 'Latte', NULL, 7),
(6, 'Cappuccino', NULL, 7),
(7, 'Mocha', NULL, 8),
(8, 'Chai Latte', NULL, 8),
(9, 'Iced Coffee', NULL, 6);

-- --------------------------------------------------------

--
-- Structure de la table `recipe_ingredients`
--

DROP TABLE IF EXISTS `recipe_ingredients`;
CREATE TABLE IF NOT EXISTS `recipe_ingredients` (
  `recipe_id` bigint UNSIGNED NOT NULL,
  `ingredient_id` bigint UNSIGNED NOT NULL,
  `qty` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`recipe_id`,`ingredient_id`),
  KEY `fk_ri_ingredient` (`ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `recipe_ingredients`
--

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `qty`) VALUES
(3, 5, 1),
(4, 5, 1),
(4, 7, 1),
(5, 5, 1),
(5, 6, 1),
(6, 5, 1),
(6, 6, 1),
(6, 8, 1),
(7, 5, 1),
(7, 6, 1),
(7, 9, 1),
(8, 6, 1),
(8, 10, 1),
(8, 11, 1),
(9, 5, 1),
(9, 7, 1),
(9, 12, 1);

-- --------------------------------------------------------

--
-- Structure de la table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
CREATE TABLE IF NOT EXISTS `restaurants` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `name` varchar(80) NOT NULL,
  `satisfaction` int NOT NULL DEFAULT '20',
  `cash` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `restaurants`
--

INSERT INTO `restaurants` (`id`, `user_id`, `name`, `satisfaction`, `cash`, `created_at`) VALUES
(1, 1, 'La tour d\'émeraude', -230, 61, '2026-02-10 10:42:27'),
(2, 2, 'BOBO time', 20, 100, '2026-02-13 09:15:04'),
(3, 3, 'TEST', 20, 0, '2026-02-15 20:56:13'),
(4, 4, 'Marc is the best', 20, 100, '2026-02-15 22:55:42');

-- --------------------------------------------------------

--
-- Structure de la table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `restaurant_id` bigint UNSIGNED NOT NULL,
  `type` enum('buy','sale','penalty','bonus') NOT NULL,
  `amount` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `meta_json` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tx_restaurant_date` (`restaurant_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `created_at`) VALUES
(1, 'test1@mail.com', '$2b$10$bys6KNz6oLh4WEKNDUH.DeN14F0/w.8hmdfX4sfcqY2LnDSaq/.Q.', '2026-02-10 10:42:27'),
(2, 'test2@mail.com', '$2b$10$yrpUZD1vt.oce6MImXYysuW10WJ5qENKINdeq.QAIOThTO03dUO96', '2026-02-13 09:15:04'),
(3, 'sherazad.abdallah2005@gmail.com', '$2b$10$ofL0eN05/0OkqBR3jxWDbushZ.1FS/6Hj4t1MuBMm3bAAqKi9lKmW', '2026-02-15 20:56:13'),
(4, 'marc.best@gmail.com', '$2b$10$M.7ykYoY3qcfSbF1aCZ.4e5LIiFfoPB7/ZTMFKD/j7RrhxnncqgBO', '2026-02-15 22:55:42');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `discovered_recipes`
--
ALTER TABLE `discovered_recipes`
  ADD CONSTRAINT `fk_dr_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_dr_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `fk_inv_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_inv_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_order_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `recipe_ingredients`
--
ALTER TABLE `recipe_ingredients`
  ADD CONSTRAINT `fk_ri_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_ri_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `restaurants`
--
ALTER TABLE `restaurants`
  ADD CONSTRAINT `fk_restaurant_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_tx_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
