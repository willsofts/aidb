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

CREATE TABLE IF NOT EXISTS `tagent` (
  `agentid` varchar(10) NOT NULL,
  `nameen` varchar(50) NOT NULL,
  `nameth` varchar(50) NOT NULL,
  `seqno` int NOT NULL,
  PRIMARY KEY (`agentid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep ai agent';

INSERT INTO `tagent` (`agentid`, `nameen`, `nameth`, `seqno`) VALUES
	('CLAUDE', 'CLAUDE', 'CLAUDE', 2),
	('GEMINI', 'GEMINI', 'GEMINI', 1),
	('LLAMA', 'LLAMA', 'LLAMA', 3);

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
	('MYSQL', 'MYSQL2', 'MySQL', 'MySQL', '1', '0', 1, '{ "charset": "utf8", "connectionLimit": 100, "dateStrings": true }'),
	('ORACLE', 'ORACLE', 'ORACLE Database', 'ORACLE', '0', '1', 5, NULL),
	('POSTGRES', 'POSTGRES', 'PostgreSQL', 'PostgreSQL', '0', '1', 3, NULL);

CREATE TABLE IF NOT EXISTS `tfiltercategory` (
  `categoryid` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `categorycode` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `categoryname` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `categoryprompt` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `categoryremark` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `createdate` date DEFAULT NULL,
  `createtime` time DEFAULT NULL,
  `createmillis` bigint DEFAULT NULL,
  `createuser` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `editdate` date DEFAULT NULL,
  `edittime` time DEFAULT NULL,
  `editmillis` bigint DEFAULT NULL,
  `edituser` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`categoryid`) USING BTREE,
  UNIQUE KEY `categorycode` (`categorycode`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep category of filtering';

INSERT INTO `tfiltercategory` (`categoryid`, `categorycode`, `categoryname`, `categoryprompt`, `categoryremark`, `createdate`, `createtime`, `createmillis`, `createuser`, `editdate`, `edittime`, `editmillis`, `edituser`) VALUES
	('C++', 'C++', 'C++', 'This category candidate must known or experience of C or C++ programming language.', NULL, '2024-09-26', '13:10:52', NULL, NULL, '2024-09-26', '13:11:06', NULL, NULL),
	('CS', 'CS', 'C#', 'This category candidate must known or experience of CSharp programming language.', NULL, '2024-09-26', '13:10:51', NULL, NULL, '2024-09-26', '13:11:05', NULL, NULL),
	('DB', 'DB', 'Database', 'This category candidate must known or experience some of relational database management.', NULL, '2024-09-26', '13:10:51', NULL, NULL, '2024-09-26', '13:11:04', NULL, NULL),
	('HTML', 'HTML', 'HTML', 'This category candidate must known html, css for web application.', NULL, '2024-09-26', '13:10:50', NULL, NULL, '2024-09-26', '13:11:04', NULL, NULL),
	('JAVA', 'JAVA', 'Java', 'This category candidate must known or experience of java programming language or related field such as Servlet, JSP or Spring Boot framework.', NULL, '2024-09-26', '13:10:50', NULL, NULL, '2024-09-26', '13:11:03', NULL, NULL),
	('JS', 'JS', 'JavaScript', 'This category candidate must known or experience of java script language.', NULL, '2024-09-26', '13:10:49', NULL, NULL, '2024-09-26', '13:11:03', NULL, NULL),
	('PHP', 'PHP', 'PHP', 'This category candidate must known or experience of PHP programming language.', NULL, '2024-09-26', '13:10:49', NULL, NULL, '2024-09-26', '13:11:02', NULL, NULL),
	('PYTHON', 'PYTHON', 'Python', 'This category candidate must known or experience of python programming language.', NULL, '2024-09-26', '13:10:48', NULL, NULL, '2024-09-26', '13:11:01', NULL, NULL),
	('TESTTOOL', 'TESTTOOL', 'Test Tools', 'This category candidate must known or experience in automated testing tools such as Selenium, JUnit or TestNG is high valuable.\r\nAnd have ability to perform both manual and automated tests to identify bugs and ensure functionality.', NULL, '2024-09-26', '13:10:47', NULL, NULL, '2024-09-26', '13:11:01', NULL, NULL),
	('WEBSECURITY', 'WEBSECURITY', 'Web Security', 'This category candidate must known or familiarity with security tools such as Burp Suite, OWASP ZAP or Metasploit.\r\nUnderstanding of security protocols of SSL/TLS, HTTPS and other security protocols.\r\nAnd have ability to perform penetration tests to identify vulnerabilities.', NULL, '2024-09-26', '13:10:46', NULL, NULL, '2024-09-26', '13:11:00', NULL, NULL);

CREATE TABLE IF NOT EXISTS `tfiltercategorygroup` (
  `categoryid` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'tfiltercategory.categoryid',
  `groupid` varchar(50) NOT NULL COMMENT 'tfiltergroup.groupid',
  PRIMARY KEY (`categoryid`,`groupid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep filter category in group';

INSERT INTO `tfiltercategorygroup` (`categoryid`, `groupid`) VALUES
	('C++', 'DEVELOPER'),
	('CS', 'DEVELOPER'),
	('DB', 'DEVELOPER'),
	('DB', 'TESTER'),
	('HTML', 'DEVELOPER'),
	('HTML', 'TESTER'),
	('JAVA', 'DEVELOPER'),
	('JS', 'DEVELOPER'),
	('JS', 'TESTER'),
	('PHP', 'DEVELOPER'),
	('TESTTOOL', 'TESTER'),
	('WEBSECURITY', 'TESTER');

CREATE TABLE IF NOT EXISTS `tfilterdocument` (
  `filterid` varchar(50) NOT NULL,
  `attachid` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'tattachfile.attachid',
  `groupid` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'tfiltergroup.groupid',
  `filtertitle` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `filtername` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `filterplace` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `filterprofile` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `filtercategory` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `filterremark` text,
  `filterdate` date DEFAULT NULL,
  `filterfile` varchar(250) DEFAULT NULL,
  `createdate` date DEFAULT NULL,
  `createtime` time DEFAULT NULL,
  `createmillis` bigint DEFAULT NULL,
  `createuser` varchar(50) DEFAULT NULL,
  `editdate` date DEFAULT NULL,
  `edittime` time DEFAULT NULL,
  `editmillis` bigint DEFAULT NULL,
  `edituser` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`filterid`),
  KEY `attachid` (`attachid`),
  KEY `filtertype` (`groupid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep filter documents';


CREATE TABLE IF NOT EXISTS `tfiltergroup` (
  `groupid` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `groupname` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `prefixprompt` text,
  `suffixprompt` text,
  `jsonprompt` text,
  `createdate` date DEFAULT NULL,
  `createtime` time DEFAULT NULL,
  `createmillis` bigint DEFAULT NULL,
  `createuser` varchar(50) DEFAULT NULL,
  `editdate` date DEFAULT NULL,
  `edittime` time DEFAULT NULL,
  `editmillis` bigint DEFAULT NULL,
  `edituser` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`groupid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep filter group';

INSERT INTO `tfiltergroup` (`groupid`, `groupname`, `prefixprompt`, `suffixprompt`, `jsonprompt`, `createdate`, `createtime`, `createmillis`, `createuser`, `editdate`, `edittime`, `editmillis`, `edituser`) VALUES
	('DEVELOPER', 'Developer', NULL, NULL, NULL, '2024-09-26', '13:10:10', NULL, NULL, '2024-09-27', '12:37:43', 1727415462843, NULL),
	('TESTER', 'Tester', NULL, NULL, NULL, '2024-09-26', '13:10:10', NULL, NULL, '2024-09-26', '13:10:10', NULL, NULL);

CREATE TABLE IF NOT EXISTS `tfilterincategory` (
  `filterid` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'tfilterdocument.filterid',
  `categoryid` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'tfiltercategory.categoryid',
  PRIMARY KEY (`filterid`,`categoryid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep filter in categories';


CREATE TABLE IF NOT EXISTS `tforum` (
  `forumid` varchar(50) NOT NULL,
  `forumcode` varchar(50) NOT NULL,
  `forumtitle` varchar(50) NOT NULL,
  `forumgroup` enum('DB','DOC','NOTE') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'DB' COMMENT 'DB=Database,DOC=Document',
  `forumtype` enum('DB','API') NOT NULL DEFAULT 'DB' COMMENT 'DB=Direct Access Database, API=API Service',
  `forumdialect` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'tdialect.dialectid',
  `forumapi` varchar(200) DEFAULT NULL,
  `forumurl` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `forumuser` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `forumpassword` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `forumdatabase` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `forumdbversion` varchar(250) DEFAULT NULL,
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

INSERT INTO `tforum` (`forumid`, `forumcode`, `forumtitle`, `forumgroup`, `forumtype`, `forumdialect`, `forumapi`, `forumurl`, `forumuser`, `forumpassword`, `forumdatabase`, `forumdbversion`, `forumhost`, `forumport`, `forumselected`, `forumsetting`, `forumtable`, `forumremark`, `forumprompt`, `inactive`, `createdate`, `createtime`, `createmillis`, `createuser`, `editflag`, `editdate`, `edittime`, `editmillis`, `edituser`) VALUES
	('24a19ca4-7b0a-4eda-a469-c2232ebbc705', '24a19ca4-7b0a-4eda-a469-c2232ebbc705', 'TAS Testing', 'DB', 'DB', 'MYSQL', '', '', 'root', 'root', 'aidb2', NULL, 'localhost', 3306, '0', NULL, 'CREATE TABLE IF NOT EXISTS `train_course` (\r\n  `course_id` varchar(50) NOT NULL,\r\n  `course_name` varchar(100) NOT NULL,\r\n  PRIMARY KEY (`course_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep course information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_register` (\r\n  `schedule_id` varchar(50) NOT NULL COMMENT \'train_schedule.schedule_id\',\r\n  `trainee_id` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT \'train_trainee.trainee_id\',\r\n  `register_date` date NOT NULL,\r\n  `register_time` time NOT NULL,\r\n  `train_amount` decimal(20,2) NOT NULL DEFAULT \'0.00\',\r\n  PRIMARY KEY (`schedule_id`,`trainee_id`) USING BTREE,\r\n  KEY `FK_train_register_train_trainee` (`trainee_id`),\r\n  CONSTRAINT `FK_train_register_train_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `train_schedule` (`schedule_id`),\r\n  CONSTRAINT `FK_train_register_train_trainee` FOREIGN KEY (`trainee_id`) REFERENCES `train_trainee` (`trainee_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep training registeration\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_schedule` (\r\n  `schedule_id` varchar(50) NOT NULL,\r\n  `course_id` varchar(50) NOT NULL COMMENT \'train_course.course_id\',\r\n  `trainer_id` varchar(50) NOT NULL COMMENT \'train_trainer.trainer_id\',\r\n  `start_date` date NOT NULL,\r\n  `start_time` time NOT NULL,\r\n  `end_date` date NOT NULL,\r\n  `end_time` time NOT NULL,\r\n  `train_days` int NOT NULL DEFAULT (0),\r\n  `train_cost` decimal(20,2) NOT NULL DEFAULT \'0.00\',\r\n  PRIMARY KEY (`schedule_id`),\r\n  KEY `course_id_trainer_id` (`course_id`,`trainer_id`),\r\n  KEY `FK_train_schedule_train_trainer` (`trainer_id`),\r\n  CONSTRAINT `FK_train_schedule_train_course` FOREIGN KEY (`course_id`) REFERENCES `train_course` (`course_id`),\r\n  CONSTRAINT `FK_train_schedule_train_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `train_trainer` (`trainer_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep training scheduler\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_trainee` (\r\n  `trainee_id` varchar(50) NOT NULL,\r\n  `email` varchar(100) NOT NULL,\r\n  `trainee_name` varchar(100) NOT NULL,\r\n  PRIMARY KEY (`trainee_id`),\r\n  KEY `email` (`email`)\r\n) ENGINE=InnoDB COMMENT=\'table keep trainee information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_trainer` (\r\n  `trainer_id` varchar(50) NOT NULL,\r\n  `trainer_name` varchar(100) NOT NULL,\r\n  PRIMARY KEY (`trainer_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep trainer information\';\r\n', NULL, NULL, '0', '2024-03-27', '08:28:14', 1711502893995, NULL, '1', '2024-03-27', '08:31:27', 1711503086970, NULL),
	('4d8cceea-4239-45c0-9351-738225d06f67', '4d8cceea-4239-45c0-9351-738225d06f67', 'TSO Testing', 'DB', 'DB', 'MYSQL', '', '', 'root', 'root', 'aidb1', NULL, 'localhost', 3306, '0', NULL, 'CREATE TABLE IF NOT EXISTS `cust_info` (\r\n  `customer_id` varchar(50) NOT NULL COMMENT \'customer id\',\r\n  `customer_name` varchar(50) NOT NULL COMMENT \'customer name\',\r\n  `customer_surname` varchar(50) NOT NULL COMMENT \'customer surname\',\r\n  PRIMARY KEY (`customer_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep customer information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_order` (\r\n  `order_id` varchar(50) NOT NULL COMMENT \'order id\',\r\n  `customer_id` varchar(50) NOT NULL COMMENT \'customer id from table cust_info.customer_id\',\r\n  `order_date` date NOT NULL COMMENT \'order date\',\r\n  `order_time` time NOT NULL COMMENT \'order time\',\r\n  `order_status` varchar(50) DEFAULT NULL,\r\n  `order_total_unit` bigint NOT NULL DEFAULT (0) COMMENT \'order total unit\',\r\n  `order_total_amount` decimal(20,2) NOT NULL COMMENT \'order total amount\',\r\n  PRIMARY KEY (`order_id`,`customer_id`) USING BTREE\r\n) ENGINE=InnoDB COMMENT=\'table keep order master\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_order_detail` (\r\n  `order_id` varchar(50) NOT NULL COMMENT \'order id from table cust_order.order_id\',\r\n  `product_id` varchar(50) NOT NULL COMMENT \'product id from table cust_product.product_id\',\r\n  `order_date` date NOT NULL COMMENT \'order date\',\r\n  `order_time` time NOT NULL COMMENT \'order time\',\r\n  `order_unit` bigint NOT NULL COMMENT \'order unit\',\r\n  `order_price` decimal(20,2) NOT NULL COMMENT \'order price\',\r\n  `order_discount` decimal(20,2) NOT NULL,\r\n  `order_amount` decimal(20,2) NOT NULL COMMENT \'order amount\',\r\n  PRIMARY KEY (`order_id`,`product_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep product under order from table torder\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_product` (\r\n  `product_id` varchar(50) NOT NULL COMMENT \'product id\',\r\n  `product_name` varchar(50) DEFAULT NULL COMMENT \'product name\',\r\n  `product_price` decimal(16,2) DEFAULT NULL COMMENT \'product price\',\r\n  `product_index` int DEFAULT NULL,\r\n  PRIMARY KEY (`product_id`) USING BTREE\r\n) ENGINE=InnoDB COMMENT=\'table keep product information\';\r\n\r\n\r\nUse the following tables relationship:\r\n\r\ncust_order.customer_id = cust_info.customer_id\r\ncust_order_detail.order_id = cust_order.order_id\r\ncust_order_detail.product_id = cust_product.product_id\r\n', NULL, 'If result not found then return No result.\r\nwhen the question ask about the object, use the object name not object id', '0', '2024-04-02', '11:21:36', 1712031696151, NULL, '1', '2024-04-02', '11:27:01', 1712032021221, NULL),
	('856d741f-9e43-4d10-bcbc-0f540385a2e8', '856d741f-9e43-4d10-bcbc-0f540385a2e8', 'JAVA API', 'DB', 'API', 'MYSQL', 'http://localhost:8081/api/inquiry/inquire', '', '', '', '', NULL, '', 0, '0', '{ "Fs-Key": "testing", "Fs-Track": "tracking" }', 'CREATE TABLE IF NOT EXISTS `sample` (\r\n  `fieldchar` char(20) NOT NULL,\r\n  `fielddecimal` decimal(22,6) DEFAULT NULL,\r\n  `fielddate` date DEFAULT NULL,\r\n  `fieldtime` time DEFAULT NULL,\r\n  `fieldinteger` bigint unsigned DEFAULT NULL,\r\n  `fieldvarchar` varchar(15) DEFAULT NULL,\r\n  `fieldflag` char(1) DEFAULT NULL,\r\n  `fieldbox` varchar(50) DEFAULT NULL,\r\n  `fieldtext` text,\r\n  `fielddatetime` datetime DEFAULT NULL,\r\n  `fieldtimestamp` timestamp NULL DEFAULT NULL,\r\n  PRIMARY KEY (`fieldchar`)\r\n) ENGINE=InnoDB;\r\n\r\nCREATE TABLE IF NOT EXISTS `tconfig` (\r\n  `category` varchar(50) NOT NULL,\r\n  `colname` varchar(50) NOT NULL,\r\n  `colvalue` varchar(200) DEFAULT NULL,\r\n  `seqno` int DEFAULT \'0\',\r\n  PRIMARY KEY (`category`,`colname`)\r\n) ENGINE=InnoDB COMMENT=\'keep program custom configuration\';\r\n\r\nCREATE TABLE IF NOT EXISTS `tprog` (\r\n  `product` varchar(30) NOT NULL DEFAULT \'\' COMMENT \'tprod.product\',\r\n  `programid` varchar(20) NOT NULL,\r\n  `progname` varchar(100) DEFAULT NULL,\r\n  `prognameth` varchar(100) DEFAULT NULL,\r\n  `progtype` varchar(2) DEFAULT NULL,\r\n  `appstype` varchar(2) DEFAULT \'W\' COMMENT \'W=Web,M=Mobile\',\r\n  `description` varchar(100) DEFAULT NULL,\r\n  `parameters` varchar(80) DEFAULT NULL,\r\n  `progsystem` varchar(10) DEFAULT NULL,\r\n  `iconfile` varchar(50) DEFAULT NULL,\r\n  `iconstyle` varchar(50) DEFAULT NULL,\r\n  `shortname` varchar(50) DEFAULT NULL,\r\n  `shortnameth` varchar(50) DEFAULT NULL,\r\n  `progpath` varchar(150) DEFAULT NULL,\r\n  `editdate` date DEFAULT NULL,\r\n  `edittime` time DEFAULT NULL,\r\n  `edituser` varchar(60) DEFAULT NULL,\r\n  PRIMARY KEY (`programid`)\r\n) ENGINE=InnoDB COMMENT=\'table keep program information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `trole` (\r\n  `site` varchar(50) NOT NULL COMMENT \'tcomp.site\',\r\n  `roleid` varchar(50) NOT NULL,\r\n  `nameen` varchar(100) NOT NULL,\r\n  `nameth` varchar(100) NOT NULL,\r\n  `headroleid` varchar(50) DEFAULT NULL,\r\n  `inactive` varchar(1) DEFAULT \'0\' COMMENT \'1=Inactive\',\r\n  `actionflag` varchar(1) DEFAULT NULL COMMENT \'1=Action Role (User Role)\',\r\n  `approveflag` varchar(1) DEFAULT NULL COMMENT \'1=Approve Role\',\r\n  `effectdate` date DEFAULT NULL,\r\n  `editdate` date DEFAULT NULL,\r\n  `edittime` time DEFAULT NULL,\r\n  `edituser` varchar(50) DEFAULT NULL,\r\n  PRIMARY KEY (`roleid`)\r\n) ENGINE=InnoDB COMMENT=\'table keep role name\';\r\n', NULL, NULL, '0', '2024-03-27', '11:46:10', 1711514769631, NULL, '1', '2024-03-27', '12:14:18', 1711516457683, NULL),
	('AIDB1', 'AIDB1', 'Product Selling', 'DB', 'DB', 'MYSQL', NULL, '', 'root', 'root', 'aidb1', NULL, 'localhost', 3306, '1', NULL, 'CREATE TABLE IF NOT EXISTS `cust_info` (\r\n  `customer_id` varchar(50) NOT NULL COMMENT \'customer id\',\r\n  `customer_name` varchar(50) NOT NULL COMMENT \'customer name\',\r\n  `customer_surname` varchar(50) NOT NULL COMMENT \'customer surname\',\r\n  PRIMARY KEY (`customer_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep customer information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_order` (\r\n  `order_id` varchar(50) NOT NULL COMMENT \'order id\',\r\n  `customer_id` varchar(50) NOT NULL COMMENT \'customer id from table cust_info.customer_id\',\r\n  `order_date` date NOT NULL COMMENT \'order date\',\r\n  `order_time` time NOT NULL COMMENT \'order time\',\r\n  `order_status` varchar(50) DEFAULT NULL,\r\n  `order_total_unit` bigint NOT NULL DEFAULT (0) COMMENT \'order total unit\',\r\n  `order_total_amount` decimal(20,2) NOT NULL COMMENT \'order total amount\',\r\n  PRIMARY KEY (`order_id`,`customer_id`) USING BTREE\r\n) ENGINE=InnoDB COMMENT=\'table keep order master\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_order_detail` (\r\n  `order_id` varchar(50) NOT NULL COMMENT \'order id from table cust_order.order_id\',\r\n  `product_id` varchar(50) NOT NULL COMMENT \'product id from table cust_product.product_id\',\r\n  `order_date` date NOT NULL COMMENT \'order date\',\r\n  `order_time` time NOT NULL COMMENT \'order time\',\r\n  `order_unit` bigint NOT NULL COMMENT \'order unit\',\r\n  `order_price` decimal(20,2) NOT NULL COMMENT \'order price\',\r\n  `order_discount` decimal(20,2) NOT NULL,\r\n  `order_amount` decimal(20,2) NOT NULL COMMENT \'order amount\',\r\n  PRIMARY KEY (`order_id`,`product_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep product under order from table torder\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_product` (\r\n  `product_id` varchar(50) NOT NULL COMMENT \'product id\',\r\n  `product_name` varchar(50) DEFAULT NULL COMMENT \'product name\',\r\n  `product_price` decimal(16,2) DEFAULT NULL COMMENT \'product price\',\r\n  `product_index` int DEFAULT NULL,\r\n  PRIMARY KEY (`product_id`) USING BTREE\r\n) ENGINE=InnoDB COMMENT=\'table keep product information\';\r\n\r\n\r\nUse the following tables relationship:\r\n\r\ncust_order.customer_id = cust_info.customer_id\r\ncust_order_detail.order_id = cust_order.order_id\r\ncust_order_detail.product_id = cust_product.product_id\r\n', NULL, NULL, '0', '2024-03-26', '13:14:31', 1711433671399, NULL, '0', '2024-03-26', '13:14:38', 1711433678111, NULL),
	('AIDB2', 'AIDB2', 'Course Training', 'DB', 'DB', 'MYSQL', NULL, '', 'root', 'root', 'aidb2', NULL, 'localhost', 3306, '0', NULL, 'CREATE TABLE IF NOT EXISTS `train_course` (\r\n  `course_id` varchar(50) NOT NULL,\r\n  `course_name` varchar(100) NOT NULL,\r\n  PRIMARY KEY (`course_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep course information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_register` (\r\n  `schedule_id` varchar(50) NOT NULL COMMENT \'train_schedule.schedule_id\',\r\n  `trainee_id` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT \'train_trainee.trainee_id\',\r\n  `register_date` date NOT NULL,\r\n  `register_time` time NOT NULL,\r\n  `train_amount` decimal(20,2) NOT NULL DEFAULT \'0.00\',\r\n  PRIMARY KEY (`schedule_id`,`trainee_id`) USING BTREE,\r\n  KEY `FK_train_register_train_trainee` (`trainee_id`),\r\n  CONSTRAINT `FK_train_register_train_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `train_schedule` (`schedule_id`),\r\n  CONSTRAINT `FK_train_register_train_trainee` FOREIGN KEY (`trainee_id`) REFERENCES `train_trainee` (`trainee_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep training registeration\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_schedule` (\r\n  `schedule_id` varchar(50) NOT NULL,\r\n  `course_id` varchar(50) NOT NULL COMMENT \'train_course.course_id\',\r\n  `trainer_id` varchar(50) NOT NULL COMMENT \'train_trainer.trainer_id\',\r\n  `start_date` date NOT NULL,\r\n  `start_time` time NOT NULL,\r\n  `end_date` date NOT NULL,\r\n  `end_time` time NOT NULL,\r\n  `train_days` int NOT NULL DEFAULT (0),\r\n  `train_cost` decimal(20,2) NOT NULL DEFAULT \'0.00\',\r\n  PRIMARY KEY (`schedule_id`),\r\n  KEY `course_id_trainer_id` (`course_id`,`trainer_id`),\r\n  KEY `FK_train_schedule_train_trainer` (`trainer_id`),\r\n  CONSTRAINT `FK_train_schedule_train_course` FOREIGN KEY (`course_id`) REFERENCES `train_course` (`course_id`),\r\n  CONSTRAINT `FK_train_schedule_train_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `train_trainer` (`trainer_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep training scheduler\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_trainee` (\r\n  `trainee_id` varchar(50) NOT NULL,\r\n  `email` varchar(100) NOT NULL,\r\n  `trainee_name` varchar(100) NOT NULL,\r\n  PRIMARY KEY (`trainee_id`),\r\n  KEY `email` (`email`)\r\n) ENGINE=InnoDB COMMENT=\'table keep trainee information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `train_trainer` (\r\n  `trainer_id` varchar(50) NOT NULL,\r\n  `trainer_name` varchar(100) NOT NULL,\r\n  PRIMARY KEY (`trainer_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep trainer information\';\r\n', NULL, NULL, '0', '2024-03-26', '31:31:39', 1711434691399, NULL, '0', '2024-03-26', '31:31:39', 1711434691399, NULL),
	('API1', 'API1', 'API Inquiry', 'DB', 'API', 'MYSQL', 'http://localhost:8080/api/inquiry/inquire', '', '', '', '', NULL, '', 0, '0', NULL, 'CREATE TABLE IF NOT EXISTS `cust_info` (\r\n  `customer_id` varchar(50) NOT NULL COMMENT \'customer id\',\r\n  `customer_name` varchar(50) NOT NULL COMMENT \'customer name\',\r\n  `customer_surname` varchar(50) NOT NULL COMMENT \'customer surname\',\r\n  PRIMARY KEY (`customer_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep customer information\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_order` (\r\n  `order_id` varchar(50) NOT NULL COMMENT \'order id\',\r\n  `customer_id` varchar(50) NOT NULL COMMENT \'customer id from table cust_info.customer_id\',\r\n  `order_date` date NOT NULL COMMENT \'order date\',\r\n  `order_time` time NOT NULL COMMENT \'order time\',\r\n  `order_status` varchar(50) DEFAULT NULL,\r\n  `order_total_unit` bigint NOT NULL DEFAULT (0) COMMENT \'order total unit\',\r\n  `order_total_amount` decimal(20,2) NOT NULL COMMENT \'order total amount\',\r\n  PRIMARY KEY (`order_id`,`customer_id`) USING BTREE\r\n) ENGINE=InnoDB COMMENT=\'table keep order master\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_order_detail` (\r\n  `order_id` varchar(50) NOT NULL COMMENT \'order id from table cust_order.order_id\',\r\n  `product_id` varchar(50) NOT NULL COMMENT \'product id from table cust_product.product_id\',\r\n  `order_date` date NOT NULL COMMENT \'order date\',\r\n  `order_time` time NOT NULL COMMENT \'order time\',\r\n  `order_unit` bigint NOT NULL COMMENT \'order unit\',\r\n  `order_price` decimal(20,2) NOT NULL COMMENT \'order price\',\r\n  `order_discount` decimal(20,2) NOT NULL,\r\n  `order_amount` decimal(20,2) NOT NULL COMMENT \'order amount\',\r\n  PRIMARY KEY (`order_id`,`product_id`)\r\n) ENGINE=InnoDB COMMENT=\'table keep product under order from table torder\';\r\n\r\nCREATE TABLE IF NOT EXISTS `cust_product` (\r\n  `product_id` varchar(50) NOT NULL COMMENT \'product id\',\r\n  `product_name` varchar(50) DEFAULT NULL COMMENT \'product name\',\r\n  `product_price` decimal(16,2) DEFAULT NULL COMMENT \'product price\',\r\n  `product_index` int DEFAULT NULL,\r\n  PRIMARY KEY (`product_id`) USING BTREE\r\n) ENGINE=InnoDB COMMENT=\'table keep product information\';\r\n\r\n\r\nUse the following tables relationship:\r\n\r\ncust_order.customer_id = cust_info.customer_id\r\ncust_order_detail.order_id = cust_order.order_id\r\ncust_order_detail.product_id = cust_product.product_id\r\n', NULL, NULL, '0', '2024-03-27', '08:28:14', 1711502893995, NULL, '0', '2024-03-27', '08:43:54', 1711503834241, NULL),
	('DOCFILE', 'DOCFILE', 'Chat Document', 'DOC', 'DB', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '0', NULL, 'In case of Thai message, please answer in Thai message too.', NULL, NULL, '0', '2024-05-17', '08:55:38', 1715910937624, NULL, '0', '2024-05-17', '08:55:38', 1715910937624, NULL),
	('NOTEFILE', 'NOTEFILE', 'Chat Note', 'NOTE', 'DB', NULL, 'holiday_securities.txt', NULL, NULL, NULL, NULL, NULL, NULL, 0, '0', NULL, 'In case of Thai message, please answer in Thai message too.', NULL, 'ประกาศวันหยุดตามประเพณีของทีมหลักทรัพย์ (Securities) ประจำปี 2567\r\n\r\nทีมหลักทรัพย์ขอประกาศวันหยุดประจำปีของทีม โดยอิงกับประกาศวันหยุดของธนาคารแห่งประเทศไทย และ\r\nวันหยุดประจำปีของกลุ่มบริษัทฟรีวิลล์ ประจำปี 2567 ดังนี้\r\n \r\nวันที่(Date) 															หยุด (Holiday)\r\nวันจันทร์ 1 มกราคม 			วันขึ้นปีใหม่ 										1 วัน (Day)\r\nวันจันทร์ 26 กุมภาพันธ์ 		ชดเชยวันมาฆบูชา 									1 วัน (Day)\r\nวันจันทร์ 8 เมษายน 			ชดเชยวันพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช 			1 วัน (Day)\r\n			และวันที่ระลึกมหาจักรีบรมราชวงศ์\r\nวันจันทร์ 15 เมษายน 		วันสงกรานต์ 										1 วัน (Day)\r\nวันอังคาร 16 เมษายน 		ชดเชยวันสงกรานต์ 									1 วัน (Day)\r\nวันพุธ 1 พฤษภาคม 			วันแรงงานแห่งชาติ 									1 วัน (Day)\r\nวันจันทร์ 6 พฤษภาคม 		ชดเชยวันฉัตรมงคล 									1 วัน (Day)\r\nวันพุธ 22 พฤษภาคม 		วันวิสาขบูชา 										1 วัน (Day)\r\nวันจันทร์ 3 มิถุนายน 			วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสุทิดา 				1 วัน (Day)\r\n			พัชรสุธาพิมลลักษณ พระบรมราชินี\r\nวันจันทร์ 22 กรกฎาคม 		ชดเชยวันอาสาฬหบูชา 								1 วัน (Day)\r\nวันจันทร์ 29 กรกฎาคม 		ชดเชยวันเฉลิมพระชนมพรรษา 										\r\n			สมเด็จพระเจ้าอยู่หัวมหาวชิราลงกรณ บดินทรเทพยวรางกูร		1 วัน (Day)\r\nวันจันทร์ 12 สิงหาคม 		วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าสิริกิติ 				1 วัน (Day)\r\n			พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง และ \r\n			วันแม่แห่งชาติ (วันเสาร์ 12 สิงหาคม)\r\nวันจันทร์ 14 ตุลาคม 			ชดเชยวันคล้ายวันสวรรคต พระบาทสมเด็จ							\r\n			พระปรมินทรมหาภูมิพลอดุลยเดช บรมนาถบพิตร		1 วัน (Day)\r\nวันพุธ 23 ตุลาคม 			วันปิยมหาราช 										1 วัน (Day)\r\nวันพฤหัสบดี 5 ธันวาคม 		วันคล้ายวันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระปรมินทรมหาภูมิพลอดุลยเดช\r\n			บรมนาถบพิตร วันชาติ และวันพ่อแห่งชาติ 			1 วัน (Day)\r\nวันอังคาร 10 ธันวาคม 		วันรัฐธรรมนูญ 										1 วัน (Day)\r\nวันอังคาร 31 ธันวาคม 		วันสิ้นปี 											1 วัน (Day)\r\n\r\n\r\n							รวมวันหยุด (Total) 17 วัน (Days)\r\n									\r\n									\r\nแต่เนื่องจากจำนวนวันหยุดของกลุ่มบริษัทฟรีวิลล์ ประจำปี 2567 มีจำนวนทั้งสิ้น 18 วัน ตามประกาศของ HR\r\nดังนั้นทางทีมหลักทรัพย์จึงขอประกาศวันหยุดเพิ่มเติมจากวันหยุดของบริษัทข้างต้น ดังนี้\r\n\r\nลำดับ 	วันทำงานของทีมหลักทรัพย์ 								วันที่กำหนดให้หยุดทดแทน\r\n1 	ทำงานในวันหยุดชดเชยวันตรุษจีน 				ให้เลือกหยุด 1 วัน ในช่วงครึ่ง ปีแรก \r\n	(วันที่ 12 กุมภาพันธ์ 2567)				(วันที่ 1 มกราคม 2567 – วันที่ 30 มิถุนายม 2567)\r\n\r\n\r\n						รวมวันหยุดของทีมหลักทรัพย์ (Total) 18 วัน (Days)\r\n\r\n\r\nหมายเหตุ\r\nกรณีหยุดทดแทนวันหยุดชดเชยวันตรุษจีน (12 กุมภาพันธ์ 2567) ให้เลือกหยุดในช่วงวันที่กำหนดให้หยุดทดแทน\r\nตามตารางข้างต้น โดยต้องได้รับการอนุมัติล่วงหน้าจากหัวหน้างานตามความเหมาะสมในระบบ EZWOW แบบ\r\nGeneral Leave (Paid) (ไม่สามารถเก็บสะสมข้ามปีได้)\r\n\r\n', '0', '2024-05-22', '10:08:52', 1716347332486, NULL, '0', '2024-05-22', '10:08:53', 1716347332510, NULL);

CREATE TABLE IF NOT EXISTS `tforumagent` (
  `forumid` varchar(50) NOT NULL,
  `agentid` varchar(10) NOT NULL,
  `forumtable` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `forumprompt` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `forumremark` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `createdate` date DEFAULT NULL,
  `createtime` time DEFAULT NULL,
  `createmillis` bigint DEFAULT NULL,
  `createuser` varchar(50) DEFAULT NULL,
  `editdate` date DEFAULT NULL,
  `edittime` time DEFAULT NULL,
  `editmillis` bigint DEFAULT NULL,
  `edituser` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`forumid`,`agentid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep forum setting by agent';


CREATE TABLE IF NOT EXISTS `tforumquest` (
  `forumid` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'tforum.forumid',
  `questid` varchar(50) NOT NULL,
  `question` varchar(200) NOT NULL,
  `seqno` int NOT NULL DEFAULT (0),
  PRIMARY KEY (`questid`),
  KEY `forumid` (`forumid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep example question';

INSERT INTO `tforumquest` (`forumid`, `questid`, `question`, `seqno`) VALUES
	('24a19ca4-7b0a-4eda-a469-c2232ebbc705', '05e78128-ee60-46cc-8276-d0afa6b2f368', 'What is the most expensive course in training schedule', 2),
	('NOTEFILE', '33c3e27c-15ab-4520-a46a-15a165e02a31', 'Summarize text from info', 1),
	('24a19ca4-7b0a-4eda-a469-c2232ebbc705', '5d8bbffc-7fb8-4ac2-b91d-e1dab28f1e03', 'List all course name and cost from training schedule', 3),
	('4d8cceea-4239-45c0-9351-738225d06f67', '625a8ca0-b61f-4d4d-82b6-761225d0ec7e', 'What is the cheapest product name', 1),
	('DOCFILE', '6ecf0d3f-d7db-4e38-b5c4-3b55a79837e7', 'Summarize text from info', 0),
	('AIDB2', '70b18528-ea7f-11ee-867f-04e8b9b1b867', 'List all tranee', 6),
	('AIDB1', '751d4a62-ea7f-11ee-867f-04e8b9b1b867', 'List all product', 6),
	('856d741f-9e43-4d10-bcbc-0f540385a2e8', '7f8a86c9-544a-48a0-876e-403d2b95add3', 'List all role', 3),
	('4d8cceea-4239-45c0-9351-738225d06f67', '8ef6a690-5d00-4322-b262-de749406e65f', 'What is the most expensive product name', 2),
	('API1', 'acbd8ea7-6a9a-45f7-ba18-8609452fc29b', 'List all customer', 2),
	('856d741f-9e43-4d10-bcbc-0f540385a2e8', 'bc6c032a-13f4-405c-b434-db31a653e7f7', 'List all config', 1),
	('4d8cceea-4239-45c0-9351-738225d06f67', 'c2dd8ce2-05a7-43cf-bc07-e012128542ac', 'List product with name and price then order by price descending', 3),
	('API1', 'd8a80f57-d1be-43c2-a2bf-566cd744d144', 'List all product name and price', 1),
	('856d741f-9e43-4d10-bcbc-0f540385a2e8', 'dd59237a-29dc-4d62-8c24-c1e5a6ad97f9', 'List all sample', 2),
	('AIDB1', 'e3069f5c-e9b8-11ee-867f-04e8b9b1b867', 'What is the cheapest product name', 1),
	('AIDB1', 'e54911ba-e9b8-11ee-867f-04e8b9b1b867', 'What is the most expensive product name', 2),
	('AIDB1', 'e76f2b3e-e9b8-11ee-867f-04e8b9b1b867', 'List product with name and price then order by price descending', 3),
	('AIDB1', 'e94a5686-e9b8-11ee-867f-04e8b9b1b867', 'Find out best seller 5 product\'s name of unit in March,2024', 4),
	('AIDB1', 'ea9a2e74-e9b8-11ee-867f-04e8b9b1b867', 'Find out top 5 customer\'s name of order amount in March,2024', 5),
	('AIDB2', 'ec1bc590-e9b8-11ee-867f-04e8b9b1b867', 'What is the cheapest course in training schedule', 1),
	('AIDB2', 'edaed779-e9b8-11ee-867f-04e8b9b1b867', 'What is the most expensive course in training schedule', 2),
	('24a19ca4-7b0a-4eda-a469-c2232ebbc705', 'ee08e79b-e528-4db2-9053-2254d03346c6', 'What is the cheapest course in training schedule', 1),
	('AIDB2', 'ef194d34-e9b8-11ee-867f-04e8b9b1b867', 'List all course name and cost from training schedule', 3),
	('AIDB2', 'f0938e83-e9b8-11ee-867f-04e8b9b1b867', 'Find out registered trainee\'s name in March,2024', 4),
	('AIDB2', 'f3dcb55a-e9b8-11ee-867f-04e8b9b1b867', 'Find out top most training days from training schedule', 5);

CREATE TABLE IF NOT EXISTS `ttextconfig` (
  `docid` varchar(50) NOT NULL,
  `doctitle` varchar(100) NOT NULL,
  `docfile` varchar(50) DEFAULT NULL,
  `inactive` varchar(1) DEFAULT '0' COMMENT '1=Inactive',
  `captions` text,
  `createdate` date DEFAULT NULL,
  `createtime` time DEFAULT NULL,
  `createmillis` bigint DEFAULT NULL,
  `createuser` varchar(50) DEFAULT NULL,
  `editdate` date DEFAULT NULL,
  `edittime` time DEFAULT NULL,
  `editmillis` bigint DEFAULT NULL,
  `edituser` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`docid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table text document configuration';

INSERT INTO `ttextconfig` (`docid`, `doctitle`, `docfile`, `inactive`, `captions`, `createdate`, `createtime`, `createmillis`, `createuser`, `editdate`, `edittime`, `editmillis`, `edituser`) VALUES
	('CARBOOK', 'Car Book', 'good.jpg', '0', '[\r\n  {\r\n    "code": "LBL001",\r\n    "labels": [\r\n      "รายการจดทะเบียน"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": "",\r\n    "type": "title"\r\n  },\r\n  {\r\n    "code": "LBL002",\r\n    "labels": [\r\n      "วันจดทะเบียน"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL003",\r\n    "labels": [\r\n      "เลขทะเบียน"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL004",\r\n    "labels": [\r\n      "จังหวัด"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL005",\r\n    "labels": [\r\n      "ประเภท"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL006",\r\n    "labels": [\r\n      "(รย. 12 )"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": "",\r\n    "type": "suffix"\r\n  },\r\n  {\r\n    "code": "LBL007",\r\n    "labels": [\r\n      "ลักษณะ"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL008",\r\n    "labels": [\r\n      "ยี่ห้อรถ"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL009",\r\n    "labels": [\r\n      "แบบ"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL010",\r\n    "labels": [\r\n      "รุ่นปี ค.ศ."\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL011",\r\n    "labels": [\r\n      "สี"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL012",\r\n    "labels": [\r\n      "เลขตัวรถ"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL013",\r\n    "labels": [\r\n      "อยู่ที่",\r\n      "อยู่ที"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL014",\r\n    "labels": [\r\n      "ยี่ห้อเครื่องยนต์/มอเตอร์"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL015",\r\n    "labels": [\r\n      "เลขเครื่องยนต์/มอเตอร์"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL016",\r\n    "labels": [\r\n      "อยู่ที่",\r\n      "อยู่ที"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL017",\r\n    "labels": [\r\n      "เชื้อเพลิง"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL018",\r\n    "labels": [\r\n      "เลขถังแก๊ส"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL019",\r\n    "labels": [\r\n      "จํานวน"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL020",\r\n    "labels": [\r\n      "สูบ",\r\n      "สบ"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL021",\r\n    "labels": [\r\n      "ซีซี"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": "",\r\n    "type": "suffix"\r\n  },\r\n  {\r\n    "code": "LBL022",\r\n    "labels": [\r\n      "แรงม้า/กิโลวัตต์"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL023",\r\n    "labels": [\r\n      "น้ำหนักรถ"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL024",\r\n    "labels": [\r\n      "น้ำหนักบรรทุก/น้ำหนักลงเพลา"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL025",\r\n    "labels": [\r\n      "น้ำหนักรวม"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL026",\r\n    "labels": [\r\n      "ที่นั่ง",\r\n      "ทีนั่ง"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL027",\r\n    "labels": [\r\n      "กก.",\r\n      "nn.",\r\n      "ทท.",\r\n      ".ทท."\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": "",\r\n    "type": "title"\r\n  },\r\n  {\r\n    "code": "LBL028",\r\n    "labels": [\r\n      "คน"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": "",\r\n    "type": "suffix"\r\n  },\r\n  {\r\n    "code": "LBL029",\r\n    "labels": [\r\n      "เจ้าของรถ"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": "",\r\n    "type": "title"\r\n  },\r\n  {\r\n    "code": "LBL030",\r\n    "labels": [\r\n      "ลำาดับที่",\r\n      "ลำดับที่",\r\n      "ลาดับที"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL031",\r\n    "labels": [\r\n      "วันที่ครอบครองรถ"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL032",\r\n    "labels": [\r\n      "ผู้ถือกรรมสิทธิ์"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL033",\r\n    "labels": [\r\n      "เลขที่บัตร"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL034",\r\n    "labels": [\r\n      "วันเกิด"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL035",\r\n    "labels": [\r\n      "สัญชาติ",\r\n      "สัญชา"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL036",\r\n    "labels": [\r\n      "ที่อยู่"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": "",\r\n    "lines": 2\r\n  },\r\n  {\r\n    "code": "LBL037",\r\n    "labels": [\r\n      "โทร."\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": "",\r\n    "type": "suffix"\r\n  },\r\n  {\r\n    "code": "LBL038",\r\n    "labels": [\r\n      "ผู้ครอบครอง"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL039",\r\n    "labels": [\r\n      "เลขที่บัตร"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL040",\r\n    "labels": [\r\n      "วันเกิด"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL041",\r\n    "labels": [\r\n      "สัญชาติ",\r\n      "สัญชา"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL042",\r\n    "labels": [\r\n      "ที่อยู่"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": "",\r\n    "lines": 2\r\n  },\r\n  {\r\n    "code": "LBL043",\r\n    "labels": [\r\n      "สัญญาเช่าซื้อเลขที่"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL044",\r\n    "labels": [\r\n      "ลงวันที",\r\n      "ลงวันที่"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  }\r\n]', '2024-04-10', '09:19:58', 1712715598000, 'tso', '2024-04-24', '14:37:43', 1713944262675, NULL),
	('POLICYINFO', 'Policy Info', 'po.jpg', '0', '[\r\n  {\r\n    "code": "LBL001",\r\n    "labels": [\r\n      "Policy NO.:"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL002",\r\n    "labels": [\r\n      "Policy Amount:"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL003",\r\n    "labels": [\r\n      "Policy Date:"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  },\r\n  {\r\n    "code": "LBL004",\r\n    "labels": [\r\n      "Payment Type:"\r\n    ],\r\n    "correct": false,\r\n    "correctPrompt": ""\r\n  }\r\n]', '2024-04-10', '11:54:56', 1712724896579, NULL, '2024-04-24', '14:37:10', 1713944229964, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
