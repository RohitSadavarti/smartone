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
-- Table structure for table `uploadhistory`
--

DROP TABLE IF EXISTS `uploadhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uploadhistory` (
  `uploader_name` varchar(255) DEFAULT NULL,
  `total_records` int DEFAULT NULL,
  `valid_records` int DEFAULT NULL,
  `error_records` int DEFAULT NULL,
  `upload_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uploadhistory`
--

LOCK TABLES `uploadhistory` WRITE;
/*!40000 ALTER TABLE `uploadhistory` DISABLE KEYS */;
INSERT INTO `uploadhistory` VALUES ('Admin',100,90,10,'2024-12-08 19:54:16'),('Admin',100,90,10,'2024-12-08 20:00:36'),('Admin',100,90,10,'2024-12-08 21:44:12'),('Admin',100,90,10,'2024-12-08 21:45:25'),('Admin',100,90,10,'2024-12-08 21:54:38'),('Admin',100,90,10,'2024-12-08 22:08:07'),('Admin',1,0,1,'2024-12-08 22:10:35'),('Admin',1,0,1,'2024-12-08 22:11:44'),('Admin',1,0,1,'2024-12-08 22:12:47'),('Admin',1,1,0,'2024-12-08 22:16:06'),('Admin',1,0,1,'2024-12-09 10:00:12'),('Admin',1,0,1,'2024-12-09 11:04:02'),('Admin',1,0,1,'2024-12-09 22:37:27'),('Admin',300,299,1,'2024-12-09 23:41:48'),('Admin',300,300,0,'2024-12-09 23:46:00');
/*!40000 ALTER TABLE `uploadhistory` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-10  6:50:04
