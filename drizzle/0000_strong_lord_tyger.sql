CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'custom' NOT NULL,
	`color` text DEFAULT '#2F5D50' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fixed_incomes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`frequency` text NOT NULL,
	`pay_day` integer NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`gross_amount` real,
	`take_home_amount` real NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recurring_expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`category_id` integer NOT NULL,
	`frequency` text NOT NULL,
	`pay_day` integer NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`week_start` integer DEFAULT 1 NOT NULL,
	`display_name` text DEFAULT 'My Finances' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`amount` real NOT NULL,
	`category_id` integer NOT NULL,
	`note` text,
	`merchant` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
