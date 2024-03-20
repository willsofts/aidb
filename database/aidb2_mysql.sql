/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `aidb2` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `aidb2`;

CREATE TABLE IF NOT EXISTS `train_course` (
  `course_id` varchar(50) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep course information';

INSERT INTO `train_course` (`course_id`, `course_name`) VALUES
	('CS-0001', 'Machine Learning with Python'),
	('CS-0002', 'Agile Business Analysis'),
	('CS-0003', 'API Gateway with Kong'),
	('CS-0004', 'Apply AI for Business'),
	('CS-0005', 'AWS for Developer'),
	('CS-0006', 'Azure for Developer'),
	('CS-0007', 'Blockchain Programming with Python'),
	('CS-0008', 'Prompt Engineering for Developer'),
	('CS-0009', 'Best Practice Secured Coding for Developer'),
	('CS-0010', 'Cloud Native for Management');

CREATE TABLE IF NOT EXISTS `train_register` (
  `schedule_id` varchar(50) NOT NULL COMMENT 'train_schedule.schedule_id',
  `trainee_id` varchar(50) NOT NULL COMMENT 'train_trainee.trainee_id',
  `register_date` date NOT NULL,
  `register_time` time NOT NULL,
  `train_amount` decimal(20,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`schedule_id`,`trainee_id`) USING BTREE,
  KEY `FK_train_register_train_trainee` (`trainee_id`),
  CONSTRAINT `FK_train_register_train_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `train_schedule` (`schedule_id`),
  CONSTRAINT `FK_train_register_train_trainee` FOREIGN KEY (`trainee_id`) REFERENCES `train_trainee` (`trainee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep training registeration';

INSERT INTO `train_register` (`schedule_id`, `trainee_id`, `register_date`, `register_time`, `train_amount`) VALUES
	('SC-0001', 'TN-0001', '2024-03-01', '11:37:54', 12000.00),
	('SC-0001', 'TN-0002', '2024-03-01', '11:37:53', 12000.00),
	('SC-0001', 'TN-0003', '2024-03-02', '11:37:53', 12000.00),
	('SC-0001', 'TN-0004', '2024-03-03', '11:37:52', 12000.00),
	('SC-0001', 'TN-0005', '2024-03-10', '11:37:51', 12000.00),
	('SC-0002', 'TN-0006', '2024-03-11', '11:37:51', 15000.00),
	('SC-0002', 'TN-0007', '2024-03-11', '11:37:50', 15000.00),
	('SC-0002', 'TN-0008', '2024-03-12', '11:37:49', 15000.00),
	('SC-0002', 'TN-0009', '2024-03-12', '11:37:49', 15000.00),
	('SC-0003', 'TN-0010', '2024-03-12', '11:37:48', 8000.00),
	('SC-0003', 'TN-0011', '2024-03-13', '11:37:47', 8000.00),
	('SC-0003', 'TN-0012', '2024-03-14', '11:37:47', 8000.00),
	('SC-0003', 'TN-0013', '2024-03-15', '11:37:46', 8000.00),
	('SC-0003', 'TN-0014', '2024-03-15', '11:37:44', 8000.00),
	('SC-0004', 'TN-0015', '2024-03-15', '11:37:45', 8000.00),
	('SC-0004', 'TN-0016', '2024-03-16', '11:37:43', 8000.00),
	('SC-0004', 'TN-0017', '2024-03-16', '11:37:43', 8000.00),
	('SC-0004', 'TN-0018', '2024-03-17', '11:37:42', 8000.00),
	('SC-0004', 'TN-0019', '2024-03-18', '11:37:41', 8000.00),
	('SC-0004', 'TN-0020', '2024-03-18', '11:37:40', 8000.00);

CREATE TABLE IF NOT EXISTS `train_schedule` (
  `schedule_id` varchar(50) NOT NULL,
  `course_id` varchar(50) NOT NULL COMMENT 'train_course.course_id',
  `trainer_id` varchar(50) NOT NULL COMMENT 'train_trainer.trainer_id',
  `start_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_date` date NOT NULL,
  `end_time` time NOT NULL,
  `train_days` int NOT NULL DEFAULT (0),
  `train_cost` decimal(20,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`schedule_id`),
  KEY `course_id_trainer_id` (`course_id`,`trainer_id`),
  KEY `FK_train_schedule_train_trainer` (`trainer_id`),
  CONSTRAINT `FK_train_schedule_train_course` FOREIGN KEY (`course_id`) REFERENCES `train_course` (`course_id`),
  CONSTRAINT `FK_train_schedule_train_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `train_trainer` (`trainer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep training scheduler';

INSERT INTO `train_schedule` (`schedule_id`, `course_id`, `trainer_id`, `start_date`, `start_time`, `end_date`, `end_time`, `train_days`, `train_cost`) VALUES
	('SC-0001', 'CS-0001', 'TRN-001', '2024-04-01', '09:00:00', '2024-04-03', '16:00:00', 3, 12000.00),
	('SC-0002', 'CS-0002', 'TRN-002', '2024-03-25', '09:00:00', '2024-03-26', '16:00:00', 2, 15000.00),
	('SC-0003', 'CS-0003', 'TRN-003', '2024-03-28', '90:00:00', '2024-03-29', '16:00:00', 2, 8000.00),
	('SC-0004', 'CS-0004', 'TRN-004', '2024-03-22', '09:00:00', '2024-03-23', '16:00:00', 2, 8000.00),
	('SC-0005', 'CS-0005', 'TRN-005', '2024-04-29', '90:00:00', '2024-04-30', '16:00:00', 2, 8000.00),
	('SC-0006', 'CS-0006', 'TRN-005', '2024-05-27', '90:00:00', '2024-05-28', '16:00:00', 2, 8000.00),
	('SC-0007', 'CS-0007', 'TRN-006', '2024-05-27', '90:00:00', '2024-05-30', '16:00:00', 4, 13000.00),
	('SC-0008', 'CS-0008', 'TRN-007', '2024-06-06', '90:00:00', '2024-06-07', '16:00:00', 2, 10000.00),
	('SC-0009', 'CS-0009', 'TRN-008', '2024-06-12', '09:00:00', '2024-06-14', '16:00:00', 3, 12000.00),
	('SC-0010', 'CS-0010', 'TRN-003', '2024-06-07', '09:00:00', '2024-06-07', '16:00:00', 1, 4000.00);

CREATE TABLE IF NOT EXISTS `train_trainee` (
  `trainee_id` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `trainee_name` varchar(100) NOT NULL,
  PRIMARY KEY (`trainee_id`),
  KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep trainee information';

INSERT INTO `train_trainee` (`trainee_id`, `email`, `trainee_name`) VALUES
	('TN-0001', 'densel_washington@hotmail.com', 'Denzel Washington'),
	('TN-0002', 'dustin_hoffman@hotmail.com', 'Dustin Hoffman'),
	('TN-0003', 'gene_hackman@gmail.com', 'Gene Hackman'),
	('TN-0004', 'paul_newman@gmail.com', 'Paul Newman'),
	('TN-0005', 'tom_hanks@gmail.com', 'Tom Hanks'),
	('TN-0006', 'leonardo_dicaprio@gmail.com', 'Leonardo Dicaprio'),
	('TN-0007', 'meryl_streep@hotmail.com', 'Meryl Streep'),
	('TN-0008', 'morgan_freeman@gmail.com', 'Morgan Freeman'),
	('TN-0009', 'robert_deniro@hotmail.com', 'Robert De Niro'),
	('TN-0010', 'gary_cooper@hotmail.com', 'Gary Cooper'),
	('TN-0011', 'jack_black@hotmail.com', 'Jack Black'),
	('TN-0012', 'jack_nicholson@hotmail.com', 'Jack Nicholson'),
	('TN-0013', 'james_stewart@gmail.com', 'James Stewart'),
	('TN-0014', 'marlon_brando@gmail.com', 'Marlon Brando'),
	('TN-0015', 'al_pacino@hotmail.com', 'Al Pacino'),
	('TN-0016', 'anthony_hopkins@gmail.com', 'Anthony Hopkins'),
	('TN-0017', 'daniel_daylewis@gmail.com', 'Daniel Day Lewis'),
	('TN-0018', 'laurence_olivier@gmail.com', 'Laurence Olivier'),
	('TN-0019', 'sidney_poitier@gmail.com', 'Sidney Poitier'),
	('TN-0020', 'spencer_tracy@hotmail.com', 'Spencer Tracy');

CREATE TABLE IF NOT EXISTS `train_trainer` (
  `trainer_id` varchar(50) NOT NULL,
  `trainer_name` varchar(100) NOT NULL,
  PRIMARY KEY (`trainer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep trainer information';

INSERT INTO `train_trainer` (`trainer_id`, `trainer_name`) VALUES
	('TRN-001', 'Dr. Walisa Romsaiyud'),
	('TRN-002', 'Mr. Phil Robinson'),
	('TRN-003', 'Mr. Sommai Krangpanich'),
	('TRN-004', 'Mr. Narong Chansoi'),
	('TRN-005', 'Mr. Phanupoing Permpimol'),
	('TRN-006', 'Dr. Werasak Suengtaworn'),
	('TRN-007', 'Dr. Veerasak Krisanapraphan'),
	('TRN-008', 'Mr. Paiboon Panusbordee');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
