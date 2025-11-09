CREATE TABLE `priceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardId` int NOT NULL,
	`retailer` varchar(50) NOT NULL,
	`price` varchar(20) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`url` text,
	`condition` varchar(50),
	`inStock` boolean DEFAULT true,
	`scrapedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
