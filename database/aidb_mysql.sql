/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `aidb` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `aidb`;

CREATE TABLE IF NOT EXISTS `tattachfile` (
  `attachid` varchar(50) NOT NULL,
  `attachno` varchar(50) NOT NULL,
  `attachtype` varchar(10) NOT NULL,
  `attachfile` varchar(150) NOT NULL,
  `sourcefile` varchar(150) NOT NULL,
  `attachdate` date NOT NULL,
  `attachtime` time NOT NULL,
  `attachmillis` bigint NOT NULL,
  `attachuser` varchar(50) DEFAULT NULL,
  `attachremark` varchar(250) DEFAULT NULL,
  `mimetype` varchar(50) DEFAULT NULL,
  `attachgroup` varchar(50) DEFAULT NULL,
  `attachpath` varchar(350) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `attachurl` varchar(250) DEFAULT NULL,
  `attachsize` bigint DEFAULT NULL,
  `attachstream` longtext,
  PRIMARY KEY (`attachid`),
  KEY `attachno` (`attachno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep attach file';


CREATE TABLE IF NOT EXISTS `tdialect` (
  `dialectid` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `dialectalias` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `dialecttitle` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `dialectname` varchar(50) NOT NULL,
  `providedflag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '0',
  `urlflag` varchar(1) NOT NULL DEFAULT '1',
  `seqno` int NOT NULL DEFAULT (0),
  `dialectoptions` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  PRIMARY KEY (`dialectid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep database dialect info';

INSERT INTO `tdialect` (`dialectid`, `dialectalias`, `dialecttitle`, `dialectname`, `providedflag`, `urlflag`, `seqno`, `dialectoptions`) VALUES
	('INFORMIX', 'ODBC', 'INFORMIX', 'INFORMIX', '0', '1', 4, NULL),
	('MSSQL', 'MSSQL', 'Microsoft SQL Server', 'SQL Server', '1', '1', 2, NULL),
	('MYSQL', 'MYSQL2', 'MySQL', 'MySQL', '1', '0', 1, '{ "charset": "utf8", "connectionLimit": 100 }'),
	('ORACLE', 'ORACLE', 'ORACLE Database', 'ORACLE', '0', '1', 5, NULL),
	('POSTGRES', 'POSTGRES', 'PostgreSQL', 'PostgreSQL', '0', '1', 3, NULL);

CREATE TABLE IF NOT EXISTS `tforum` (
  `forumid` varchar(50) NOT NULL,
  `forumcode` varchar(50) NOT NULL,
  `forumtitle` varchar(50) NOT NULL,
  `forumtype` enum('DB','API') NOT NULL DEFAULT 'DB' COMMENT 'DB=Direct Access Database, API=API Service',
  `forumdialect` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'tdialect.dialectid',
  `forumapi` varchar(200) DEFAULT NULL,
  `forumurl` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `forumuser` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `forumpassword` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `forumdatabase` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `forumhost` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `forumport` int DEFAULT '0',
  `forumselected` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0',
  `forumsetting` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `forumtable` text,
  `forumremark` text,
  `forumprompt` text,
  `inactive` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '0' COMMENT '1=Inactive',
  `createdate` date DEFAULT NULL,
  `createtime` time DEFAULT NULL,
  `createmillis` bigint DEFAULT NULL,
  `createuser` varchar(50) DEFAULT NULL,
  `editflag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '1' COMMENT '1=Can Edit',
  `editdate` date DEFAULT NULL,
  `edittime` time DEFAULT NULL,
  `editmillis` bigint DEFAULT NULL,
  `edituser` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`forumid`),
  KEY `forumcode` (`forumcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep forum information';

INSERT INTO `tforum` (`forumid`, `forumcode`, `forumtitle`, `forumtype`, `forumdialect`, `forumapi`, `forumurl`, `forumuser`, `forumpassword`, `forumdatabase`, `forumhost`, `forumport`, `forumselected`, `forumsetting`, `forumtable`, `forumremark`, `inactive`, `createdate`, `createtime`, `createmillis`, `createuser`, `editflag`, `editdate`, `edittime`, `editmillis`, `edituser`) VALUES
	('AIDB1', 'AIDB1', 'Product Selling', 'DB', 'MYSQL', NULL, '', 'root', 'root', 'aidb1', 'localhost', 3306, '1', NULL, 'CREATE TABLE IF NOT EXISTS `cust_info` (\r\n  `customer_id` varchar(50) NOT NULL COMMENT \'customer id\',\r\n  `customer_name` varchar(50) NOT NULL COMMENT \'customer name\',\r\n  `customer_surname` varchar(50) NOT NULL COMMENT \'customer surname\',\r\n  PRIMARY KEY (`customer_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep customer information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_order` (\r\n  `order_id` varchar(50) NOT NULL COMMENT \'order id\',\r\n  `customer_id` varchar(50) NOT NULL COMMENT \'customer id from table cust_info.customer_id\',\r\n  `order_date` date NOT NULL COMMENT \'order date\',\r\n  `order_time` time NOT NULL COMMENT \'order time\',\r\n  `order_status` varchar(50) DEFAULT NULL,\r\n  `order_total_unit` bigint NOT NULL DEFAULT (0) COMMENT \'order total unit\',\r\n  `order_total_amount` decimal(20,2) NOT NULL COMMENT \'order total amount\',\r\n  PRIMARY KEY (`order_id`,`customer_id`) USING BTREE\r\n) ENGINE=InnoDB COMMENT=\'table keep order master\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_order_detail` (\r\n  `order_id` varchar(50) NOT NULL COMMENT \'order id from table cust_order.order_id\',\r\n  `product_id` varchar(50) NOT NULL COMMENT \'product id from table cust_product.product_id\',\r\n  `order_date` date NOT NULL COMMENT \'order date\',\r\n  `order_time` time NOT NULL COMMENT \'order time\',\r\n  `order_unit` bigint NOT NULL COMMENT \'order unit\',\r\n  `order_price` decimal(20,2) NOT NULL COMMENT \'order price\',\r\n  `order_discount` decimal(20,2) NOT NULL,\r\n  `order_amount` decimal(20,2) NOT NULL COMMENT \'order amount\',\r\n  PRIMARY KEY (`order_id`,`product_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep product under order from table torder\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_product` (\r\n  `product_id` varchar(50) NOT NULL COMMENT \'product id\',\r\n  `product_name` varchar(50) DEFAULT NULL COMMENT \'product name\',\r\n  `product_price` decimal(16,2) DEFAULT NULL COMMENT \'product price\',\r\n  `product_index` int DEFAULT NULL,\r\n  PRIMARY KEY (`product_id`) USING BTREE\r\n) ENGINE=InnoDB COMMENT=\'table keep product information\';\r\n\r\n\r\nUse the following tables relationship:\r\n\r\ncust_order.customer_id = cust_info.customer_id\r\ncust_order_detail.order_id = cust_order.order_id\r\ncust_order_detail.product_id = cust_product.product_id\r\n', NULL, '0', '2024-03-26', '13:14:31', 1711433671399, NULL, '0', '2024-03-26', '13:14:38', 1711433678111, NULL),
	('AIDB2', 'AIDB2', 'Course Training', 'DB', 'MYSQL', NULL, '', 'root', 'root', 'aidb2', 'localhost', 3306, '0', NULL, 'CREATE TABLE IF NOT EXISTS `train_course` (\r\n  `course_id` varchar(50) NOT NULL,\r\n  `course_name` varchar(100) NOT NULL,\r\n  PRIMARY KEY (`course_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep course information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_register` (\r\n  `schedule_id` varchar(50) NOT NULL COMMENT \'train_schedule.schedule_id\',\r\n  `trainee_id` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT \'train_trainee.trainee_id\',\r\n  `register_date` date NOT NULL,\r\n  `register_time` time NOT NULL,\r\n  `train_amount` decimal(20,2) NOT NULL DEFAULT \'0.00\',\r\n  PRIMARY KEY (`schedule_id`,`trainee_id`) USING BTREE,\r\n  KEY `FK_train_register_train_trainee` (`trainee_id`),\r\n  CONSTRAINT `FK_train_register_train_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `train_schedule` (`schedule_id`),\r\n  CONSTRAINT `FK_train_register_train_trainee` FOREIGN KEY (`trainee_id`) REFERENCES `train_trainee` (`trainee_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep training registeration\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_schedule` (\r\n  `schedule_id` varchar(50) NOT NULL,\r\n  `course_id` varchar(50) NOT NULL COMMENT \'train_course.course_id\',\r\n  `trainer_id` varchar(50) NOT NULL COMMENT \'train_trainer.trainer_id\',\r\n  `start_date` date NOT NULL,\r\n  `start_time` time NOT NULL,\r\n  `end_date` date NOT NULL,\r\n  `end_time` time NOT NULL,\r\n  `train_days` int NOT NULL DEFAULT (0),\r\n  `train_cost` decimal(20,2) NOT NULL DEFAULT \'0.00\',\r\n  PRIMARY KEY (`schedule_id`),\r\n  KEY `course_id_trainer_id` (`course_id`,`trainer_id`),\r\n  KEY `FK_train_schedule_train_trainer` (`trainer_id`),\r\n  CONSTRAINT `FK_train_schedule_train_course` FOREIGN KEY (`course_id`) REFERENCES `train_course` (`course_id`),\r\n  CONSTRAINT `FK_train_schedule_train_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `train_trainer` (`trainer_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep training scheduler\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_trainee` (\r\n  `trainee_id` varchar(50) NOT NULL,\r\n  `email` varchar(100) NOT NULL,\r\n  `trainee_name` varchar(100) NOT NULL,\r\n  PRIMARY KEY (`trainee_id`),\r\n  KEY `email` (`email`)\r\n) ENGINE=InnoDB COMMENT=\'table keep trainee information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_trainer` (\r\n  `trainer_id` varchar(50) NOT NULL,\r\n  `trainer_name` varchar(100) NOT NULL,\r\n  PRIMARY KEY (`trainer_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep trainer information\';\r\n', NULL, '0', '2024-03-26', '31:31:39', 1711434691399, NULL, '0', '2024-03-26', '31:31:39', 1711434691399, NULL),
	('API1', 'API1', 'API Inquiry', 'API', 'MYSQL', 'http://localhost:8080/api/inquiry/inquire', '', '', '', '', '', 0, '0', NULL, 'CREATE TABLE IF NOT EXISTS `cust_info` (\r\n  `customer_id` varchar(50) NOT NULL COMMENT \'customer id\',\r\n  `customer_name` varchar(50) NOT NULL COMMENT \'customer name\',\r\n  `customer_surname` varchar(50) NOT NULL COMMENT \'customer surname\',\r\n  PRIMARY KEY (`customer_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep customer information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_order` (\r\n  `order_id` varchar(50) NOT NULL COMMENT \'order id\',\r\n  `customer_id` varchar(50) NOT NULL COMMENT \'customer id from table cust_info.customer_id\',\r\n  `order_date` date NOT NULL COMMENT \'order date\',\r\n  `order_time` time NOT NULL COMMENT \'order time\',\r\n  `order_status` varchar(50) DEFAULT NULL,\r\n  `order_total_unit` bigint NOT NULL DEFAULT (0) COMMENT \'order total unit\',\r\n  `order_total_amount` decimal(20,2) NOT NULL COMMENT \'order total amount\',\r\n  PRIMARY KEY (`order_id`,`customer_id`) USING BTREE\r\n) ENGINE=InnoDB COMMENT=\'table keep order master\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_order_detail` (\r\n  `order_id` varchar(50) NOT NULL COMMENT \'order id from table cust_order.order_id\',\r\n  `product_id` varchar(50) NOT NULL COMMENT \'product id from table cust_product.product_id\',\r\n  `order_date` date NOT NULL COMMENT \'order date\',\r\n  `order_time` time NOT NULL COMMENT \'order time\',\r\n  `order_unit` bigint NOT NULL COMMENT \'order unit\',\r\n  `order_price` decimal(20,2) NOT NULL COMMENT \'order price\',\r\n  `order_discount` decimal(20,2) NOT NULL,\r\n  `order_amount` decimal(20,2) NOT NULL COMMENT \'order amount\',\r\n  PRIMARY KEY (`order_id`,`product_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep product under order from table torder\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_product` (\r\n  `product_id` varchar(50) NOT NULL COMMENT \'product id\',\r\n  `product_name` varchar(50) DEFAULT NULL COMMENT \'product name\',\r\n  `product_price` decimal(16,2) DEFAULT NULL COMMENT \'product price\',\r\n  `product_index` int DEFAULT NULL,\r\n  PRIMARY KEY (`product_id`) USING BTREE\r\n) ENGINE=InnoDB COMMENT=\'table keep product information\';\r\n\r\n\r\nUse the following tables relationship:\r\n\r\ncust_order.customer_id = cust_info.customer_id\r\ncust_order_detail.order_id = cust_order.order_id\r\ncust_order_detail.product_id = cust_product.product_id\r\n', NULL, '0', '2024-03-27', '08:28:14', 1711502893995, NULL, '0', '2024-03-27', '08:43:54', 1711503834241, NULL);

CREATE TABLE IF NOT EXISTS `tforumquest` (
  `forumid` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'tforum.forumid',
  `questid` varchar(50) NOT NULL,
  `question` varchar(200) NOT NULL,
  `seqno` int NOT NULL DEFAULT (0),
  PRIMARY KEY (`questid`),
  KEY `forumid` (`forumid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep example question';

INSERT INTO `tforumquest` (`forumid`, `questid`, `question`, `seqno`) VALUES
	('AIDB2', '70b18528-ea7f-11ee-867f-04e8b9b1b867', 'List all tranee', 6),
	('AIDB1', '751d4a62-ea7f-11ee-867f-04e8b9b1b867', 'List all product', 6),
	('API1', 'acbd8ea7-6a9a-45f7-ba18-8609452fc29b', 'List all customer', 2),
	('API1', 'd8a80f57-d1be-43c2-a2bf-566cd744d144', 'List all product name and price', 1),
	('AIDB1', 'e3069f5c-e9b8-11ee-867f-04e8b9b1b867', 'What is the cheapest product name', 1),
	('AIDB1', 'e54911ba-e9b8-11ee-867f-04e8b9b1b867', 'What is the most expensive product name', 2),
	('AIDB1', 'e76f2b3e-e9b8-11ee-867f-04e8b9b1b867', 'List product with name and price then order by price descending', 3),
	('AIDB1', 'e94a5686-e9b8-11ee-867f-04e8b9b1b867', 'Find out best seller 5 product\'s name of unit in March,2024', 4),
	('AIDB1', 'ea9a2e74-e9b8-11ee-867f-04e8b9b1b867', 'Find out top 5 customer\'s name of order amount in March,2024', 5),
	('AIDB2', 'ec1bc590-e9b8-11ee-867f-04e8b9b1b867', 'What is the cheapest course in training schedule', 1),
	('AIDB2', 'edaed779-e9b8-11ee-867f-04e8b9b1b867', 'What is the most expensive course in training schedule', 2),
	('AIDB2', 'ef194d34-e9b8-11ee-867f-04e8b9b1b867', 'List all course name and cost from training schedule', 3),
	('AIDB2', 'f0938e83-e9b8-11ee-867f-04e8b9b1b867', 'Find out registered trainee\'s name in March,2024', 4),
	('AIDB2', 'f3dcb55a-e9b8-11ee-867f-04e8b9b1b867', 'Find out top most training days from training schedule', 5);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
