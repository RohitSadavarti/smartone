-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: college
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_name` varchar(225) NOT NULL,
  `day` varchar(50) NOT NULL,
  `subject` varchar(225) NOT NULL,
  `time_slot` varchar(50) NOT NULL,
  `department` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,'Teacher A','Monday','Math','09:00-10:00','IT'),(2,'Teacher A','Monday','Physics','10:00-11:00','IT'),(3,'Teacher B','Monday','Math','09:00-10:00','Science'),(4,'Teacher B','Monday','Physics','10:00-11:00','Science'),(5,'Teacher C','Monday','Math','09:00-10:00','IT'),(6,'Teacher A','Tuesday','Chemistry','09:00-10:00','IT'),(7,'Teacher A','Tuesday','Biology','10:00-11:00','IT'),(8,'Teacher B','Tuesday','Math','09:00-10:00','Science'),(9,'Teacher B','Tuesday','Physics','10:00-11:00','Science'),(10,'Teacher C','Tuesday','Computer Science','11:00-12:00','IT'),(11,'Teacher C','Tuesday','Statistics','12:00-01:00','IT'),(12,'Teacher A','Wednesday','Math','09:00-10:00','IT'),(13,'Teacher B','Wednesday','Physics','10:00-11:00','Science'),(14,'Teacher C','Wednesday','Data Structures','11:00-12:00','IT'),(15,'Teacher D','Wednesday','Networking','12:00-01:00','IT'),(16,'Teacher E','Wednesday','Economics','02:00-03:00','Commerce'),(17,'Teacher A','Thursday','Math','09:00-10:00','IT'),(18,'Teacher B','Thursday','Chemistry','10:00-11:00','Science'),(19,'Teacher C','Thursday','Machine Learning','11:00-12:00','IT'),(20,'Teacher D','Thursday','Database Management','12:00-01:00','IT'),(21,'Teacher E','Thursday','Accounting','02:00-03:00','Commerce'),(22,'Teacher A','Friday','Physics','09:00-10:00','IT'),(23,'Teacher B','Friday','Biology','10:00-11:00','Science'),(24,'Teacher C','Friday','Artificial Intelligence','11:00-12:00','IT'),(25,'Teacher D','Friday','Cyber Security','12:00-01:00','IT'),(26,'Teacher E','Friday','Business Studies','02:00-03:00','Commerce');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-30  7:48:45
