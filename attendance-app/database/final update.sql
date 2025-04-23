use college

select * from attendance

truncate table attendance;

select * from students

select * from teachers

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/attendance to sql.csv'
INTO TABLE attendance
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(ID, date, roll_number, name, department, class, attendance, lecture_time, teacher_name, subject);

SET SQL_SAFE_UPDATES = 1;
LOAD DATA LOCAL INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/attendance to sql.csv'
INTO TABLE attendance
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(ID, date, roll_number, name, department, class, attendance, lecture_time, teacher_name, subject);

GRANT FILE ON *.* TO 'root'@'Classhe@7494';
FLUSH PRIVILEGES;
SHOW VARIABLES LIKE 'local_infile';
SET GLOBAL local_infile = 1;
SET SESSION local_infile = 1;

SHOW VARIABLES LIKE 'secure_file_priv';
