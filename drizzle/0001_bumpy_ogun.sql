CREATE TABLE `cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scryfallId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`manaCost` varchar(100),
	`cmc` int,
	`typeLine` text,
	`oracleText` text,
	`power` varchar(10),
	`toughness` varchar(10),
	`colors` varchar(50),
	`colorIdentity` varchar(50),
	`rarity` varchar(20),
	`setCode` varchar(10),
	`setName` varchar(255),
	`collectorNumber` varchar(20),
	`releaseDate` varchar(20),
	`imageUrl` text,
	`priceUsd` varchar(20),
	`priceEur` varchar(20),
	`priceFoil` varchar(20),
	`costBenefitScore` varchar(20),
	`edhrecRank` int,
	`keywords` text,
	`legalities` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cards_id` PRIMARY KEY(`id`),
	CONSTRAINT `cards_scryfallId_unique` UNIQUE(`scryfallId`)
);
--> statement-breakpoint
CREATE TABLE `cartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cardId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`priceAtAddTime` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`cardId` int NOT NULL,
	`quantity` int NOT NULL,
	`pricePerCard` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`totalAmount` varchar(20) NOT NULL,
	`status` enum('pending','paid','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`shippingAddress` text,
	`shippingMethod` varchar(50),
	`trackingNumber` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `wishlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cardId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlist_id` PRIMARY KEY(`id`)
);
