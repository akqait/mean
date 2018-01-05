create database `mydb`;
use mydb;
CREATE TABLE `dc_user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `status` enum('Active','Archived') DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(60) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,

  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_id` (`user_id`),
) ENGINE=InnoDB ;