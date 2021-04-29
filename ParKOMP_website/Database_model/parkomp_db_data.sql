-- MySQL dump 10.17  Distrib 10.3.23-MariaDB, for debian-linux-gnueabihf (armv7l)
--
-- Host: localhost    Database: parkomp_db
-- ------------------------------------------------------
-- Server version	10.3.23-MariaDB-0+deb10u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cars`
--

DROP TABLE IF EXISTS `cars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cars` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(45) NOT NULL,
  `lic_plate` varchar(15) NOT NULL,
  PRIMARY KEY (`id`,`user_id`),
  UNIQUE KEY `lic_plate_UNIQUE` (`lic_plate`),
  KEY `fk_cars_users_idx` (`user_id`),
  CONSTRAINT `fk_cars_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cars`
--

LOCK TABLES `cars` WRITE;
/*!40000 ALTER TABLE `cars` DISABLE KEYS */;
INSERT INTO `cars` VALUES (2,2,'VW Passat','P2061AK'),(3,2,'Audi','PP0335BA'),(7,3,'Personal Car','CB4923AA'),(8,1,'Corvette','CA5381AK'),(9,1,'Mercedes','P333333'),(10,4,'Opel','PB2321CM'),(11,1,'new car','BA105923');
/*!40000 ALTER TABLE `cars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `car_id` int(11) NOT NULL,
  `car_user_id` int(11) NOT NULL,
  `time_arrival` datetime NOT NULL,
  `time_exit` datetime DEFAULT NULL,
  `parking_name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_logs_cars1_idx` (`car_id`,`car_user_id`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`car_id`, `car_user_id`) REFERENCES `cars` (`id`, `user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
INSERT INTO `logs` VALUES (1,2,2,'2020-11-21 05:54:14','2020-11-21 05:55:26','Ruse-borisova'),(2,2,2,'2020-11-21 08:35:14','2020-11-21 09:13:52','Ruse-borisova'),(3,2,2,'2020-11-21 09:34:20','2020-11-21 10:04:15','Ruse-borisova'),(4,3,2,'2020-11-21 10:04:40','2020-11-21 10:05:54','Ruse-borisova'),(5,2,2,'2020-11-21 10:05:20','2020-11-21 10:08:21','Ruse-borisova'),(6,3,2,'2020-11-21 10:08:30','2020-11-21 10:11:12','Ruse-borisova'),(7,2,2,'2020-11-21 10:10:31','2020-11-21 10:10:46','Ruse-borisova'),(8,2,2,'2020-11-21 10:11:07','2020-11-21 10:13:16','Ruse-borisova'),(9,2,2,'2020-11-21 10:16:44','2020-11-21 10:18:00','Ruse-borisova'),(10,3,2,'2020-11-21 10:17:54','2020-11-21 10:19:00','Ruse-borisova'),(11,2,2,'2020-11-21 10:19:28','2020-11-21 10:26:50','Ruse-borisova'),(12,3,2,'2020-11-21 10:22:56','2020-11-21 10:31:12','Ruse-borisova'),(13,2,2,'2020-11-21 10:30:49','2020-11-21 10:31:29','Ruse-borisova'),(14,3,2,'2020-11-21 10:31:47','2020-11-21 10:32:21','Ruse-borisova'),(15,2,2,'2020-11-21 10:32:02','2020-11-21 10:32:38','Ruse-borisova'),(16,3,2,'2020-11-21 10:32:42','2020-11-21 10:33:15','Ruse-borisova'),(17,2,2,'2020-11-21 10:33:21','2020-11-21 10:33:45','Ruse-borisova'),(18,2,2,'2020-11-21 10:35:56','2020-11-21 10:37:49','Ruse-borisova'),(19,2,2,'2020-11-22 08:21:31','2020-11-22 08:32:31','Ruse-borisova'),(20,2,2,'2020-11-21 23:27:26','2020-11-21 23:27:38','Ruse-borisova'),(21,3,2,'2020-11-21 23:28:01','2020-11-21 23:28:18','Ruse-borisova'),(22,3,2,'2020-11-21 23:29:01','2020-11-21 23:29:11','Ruse-borisova'),(23,2,2,'2020-11-22 00:09:12','2020-11-22 00:09:27','Ruse-borisova'),(24,2,2,'2020-11-21 23:37:27','2020-11-21 23:40:40','Ruse-borisova'),(25,3,2,'2020-11-21 23:44:42','2020-11-21 23:48:34','Ruse-borisova'),(155,8,1,'2020-11-28 12:30:47','2020-11-28 12:32:52','Ruse-borisova'),(156,9,1,'2020-11-28 12:32:09','2020-11-28 12:33:15','Ruse-borisova');
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ident` varchar(65) NOT NULL,
  `name` varchar(45) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` char(65) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'1605960741184','Yordan','jormil1@abv.bg','$2b$10$wvSE8ujTyYr3DcpH4kgZVuF8rvoLCbPgCAvAINpMqt0ReEjoe/Gy2'),(2,'1605960968997','Test','test@test.com','$2b$10$8cCxJZ18O4ElkNujHad9GO6E6sK.0E.2pE/O0iWqnLiVPa9NAhwp.'),(3,'1606559010249','tester','test@example.com','$2b$10$OdX0hsxKm0PxhuOyoC6SneK4uUu3.kmTYfFLo3qOWRmmMliyXZuNm'),(4,'1606559210677','Християн Ташев','hristiyantashev03@schoolmath.eu','$2b$10$1H9vEIBwJPLMH/q5auRyDuIh0jhz3ICMhrQP74PQzH4CGolGg/mjO'),(5,'1606657440529','hello','hello@hello.bg','$2b$10$FaYaba2X1bRLPZVo.Vd6du2CvgtPqs.kk0EVZEKtyrYCTZTdpEQY6');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-02-20 22:29:53
