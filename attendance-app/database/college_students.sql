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
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roll_number` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roll_number` (`roll_number`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'IT0001','Student 1','IT'),(2,'CS0002','Student 2','CS'),(3,'CS0003','Student 3','CS'),(4,'IT0004','Student 4','IT'),(5,'IT0005','Student 5','IT'),(6,'IT0006','Student 6','IT'),(7,'CS0007','Student 7','CS'),(8,'IT0008','Student 8','IT'),(9,'CS0009','Student 9','CS'),(10,'CS0010','Student 10','CS'),(11,'CS0011','Student 11','CS'),(12,'IT0012','Student 12','IT'),(13,'CS0013','Student 13','CS'),(14,'IT0014','Student 14','IT'),(15,'IT0015','Student 15','IT'),(16,'CS0016','Student 16','CS'),(17,'IT0017','Student 17','IT'),(18,'CS0018','Student 18','CS'),(19,'IT0019','Student 19','IT'),(20,'IT0020','Student 20','IT'),(21,'CS0021','Student 21','CS'),(22,'CS0022','Student 22','CS'),(23,'CS0023','Student 23','CS'),(24,'IT0024','Student 24','IT'),(25,'CS0025','Student 25','CS'),(26,'IT0026','Student 26','IT'),(27,'CS0027','Student 27','CS'),(28,'CS0028','Student 28','CS'),(29,'IT0029','Student 29','IT'),(30,'CS0030','Student 30','CS'),(31,'CS0031','Student 31','CS'),(32,'IT0032','Student 32','IT'),(33,'CS0033','Student 33','CS'),(34,'IT0034','Student 34','IT'),(35,'IT0035','Student 35','IT'),(36,'CS0036','Student 36','CS'),(37,'IT0037','Student 37','IT'),(38,'CS0038','Student 38','CS'),(39,'IT0039','Student 39','IT'),(40,'IT0040','Student 40','IT'),(41,'CS0041','Student 41','CS'),(42,'CS0042','Student 42','CS'),(43,'CS0043','Student 43','CS'),(44,'IT0044','Student 44','IT'),(45,'CS0045','Student 45','CS'),(46,'IT0046','Student 46','IT'),(47,'CS0047','Student 47','CS'),(48,'CS0048','Student 48','CS'),(49,'IT0049','Student 49','IT'),(50,'CS0050','Student 50','CS'),(51,'CS0051','Student 51','CS'),(52,'IT0052','Student 52','IT'),(53,'CS0053','Student 53','CS'),(54,'IT0054','Student 54','IT'),(55,'CS0055','Student 55','CS'),(56,'CS0056','Student 56','CS'),(57,'IT0057','Student 57','IT'),(58,'CS0058','Student 58','CS'),(59,'CS0059','Student 59','CS'),(60,'IT0060','Student 60','IT'),(61,'CS0061','Student 61','CS'),(62,'IT0062','Student 62','IT'),(63,'CS0063','Student 63','CS'),(64,'CS0064','Student 64','CS'),(65,'IT0065','Student 65','IT'),(66,'CS0066','Student 66','CS'),(67,'IT0067','Student 67','IT'),(68,'IT0068','Student 68','IT'),(69,'CS0069','Student 69','CS'),(70,'IT0070','Student 70','IT'),(71,'CS0071','Student 71','CS'),(72,'IT0072','Student 72','IT'),(73,'CS0073','Student 73','CS'),(74,'CS0074','Student 74','CS'),(75,'IT0075','Student 75','IT'),(76,'CS0076','Student 76','CS'),(77,'IT0077','Student 77','IT'),(78,'CS0078','Student 78','CS'),(79,'CS0079','Student 79','CS'),(80,'CS0080','Student 80','CS');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
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
