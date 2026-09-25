CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` varchar(64) NOT NULL,
	`senderKey` varchar(128) NOT NULL,
	`kind` enum('text','image','voice') NOT NULL,
	`text` text,
	`mediaKey` varchar(512),
	`mediaName` varchar(255),
	`mimeType` varchar(128),
	`byteSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
