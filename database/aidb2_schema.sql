CREATE TABLE IF NOT EXISTS `train_course` (
  `course_id` varchar(50) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB COMMENT='table keep course information';

CREATE TABLE IF NOT EXISTS `train_register` (
  `schedule_id` varchar(50) NOT NULL COMMENT 'train_schedule.schedule_id',
  `trainee_id` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'train_trainee.trainee_id',
  `register_date` date NOT NULL,
  `register_time` time NOT NULL,
  `train_amount` decimal(20,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`schedule_id`,`trainee_id`) USING BTREE,
  KEY `FK_train_register_train_trainee` (`trainee_id`),
  CONSTRAINT `FK_train_register_train_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `train_schedule` (`schedule_id`),
  CONSTRAINT `FK_train_register_train_trainee` FOREIGN KEY (`trainee_id`) REFERENCES `train_trainee` (`trainee_id`)
) ENGINE=InnoDB COMMENT='table keep training registeration';

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
) ENGINE=InnoDB COMMENT='table keep training scheduler';

CREATE TABLE IF NOT EXISTS `train_trainee` (
  `trainee_id` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `trainee_name` varchar(100) NOT NULL,
  PRIMARY KEY (`trainee_id`),
  KEY `email` (`email`)
) ENGINE=InnoDB COMMENT='table keep trainee information';

CREATE TABLE IF NOT EXISTS `train_trainer` (
  `trainer_id` varchar(50) NOT NULL,
  `trainer_name` varchar(100) NOT NULL,
  PRIMARY KEY (`trainer_id`)
) ENGINE=InnoDB COMMENT='table keep trainer information';
