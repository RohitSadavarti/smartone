USE college;

CREATE TABLE Teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_name VARCHAR(225) NOT NULL,
    day VARCHAR(50) NOT NULL,
    subject VARCHAR(225) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL
);
INSERT INTO Teachers (teacher_name, day, subject, time_slot, department)
VALUES
-- Monday Schedule
('Teacher A', 'Monday', 'Math', '09:00-10:00', 'IT'),
('Teacher A', 'Monday', 'Physics', '10:00-11:00', 'IT'),
('Teacher B', 'Monday', 'Math', '09:00-10:00', 'Science'),
('Teacher B', 'Monday', 'Physics', '10:00-11:00', 'Science'),
('Teacher C', 'Monday', 'Math', '09:00-10:00', 'IT'),

-- Tuesday Schedule
('Teacher A', 'Tuesday', 'Chemistry', '09:00-10:00', 'IT'),
('Teacher A', 'Tuesday', 'Biology', '10:00-11:00', 'IT'),
('Teacher B', 'Tuesday', 'Math', '09:00-10:00', 'Science'),
('Teacher B', 'Tuesday', 'Physics', '10:00-11:00', 'Science'),
('Teacher C', 'Tuesday', 'Computer Science', '11:00-12:00', 'IT'),
('Teacher C', 'Tuesday', 'Statistics', '12:00-01:00', 'IT'),

-- Wednesday Schedule
('Teacher A', 'Wednesday', 'Math', '09:00-10:00', 'IT'),
('Teacher B', 'Wednesday', 'Physics', '10:00-11:00', 'Science'),
('Teacher C', 'Wednesday', 'Data Structures', '11:00-12:00', 'IT'),
('Teacher D', 'Wednesday', 'Networking', '12:00-01:00', 'IT'),
('Teacher E', 'Wednesday', 'Economics', '02:00-03:00', 'Commerce'),

-- Thursday Schedule
('Teacher A', 'Thursday', 'Math', '09:00-10:00', 'IT'),
('Teacher B', 'Thursday', 'Chemistry', '10:00-11:00', 'Science'),
('Teacher C', 'Thursday', 'Machine Learning', '11:00-12:00', 'IT'),
('Teacher D', 'Thursday', 'Database Management', '12:00-01:00', 'IT'),
('Teacher E', 'Thursday', 'Accounting', '02:00-03:00', 'Commerce'),

-- Friday Schedule
('Teacher A', 'Friday', 'Physics', '09:00-10:00', 'IT'),
('Teacher B', 'Friday', 'Biology', '10:00-11:00', 'Science'),
('Teacher C', 'Friday', 'Artificial Intelligence', '11:00-12:00', 'IT'),
('Teacher D', 'Friday', 'Cyber Security', '12:00-01:00', 'IT'),
('Teacher E', 'Friday', 'Business Studies', '02:00-03:00', 'Commerce');

select * from Teachers;
CREATE TABLE Students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL
);

INSERT INTO Students (roll_number, name, department) VALUES ('IT0001', 'Student 1', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0002', 'Student 2', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0003', 'Student 3', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0004', 'Student 4', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0005', 'Student 5', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0006', 'Student 6', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0007', 'Student 7', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0008', 'Student 8', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0009', 'Student 9', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0010', 'Student 10', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0011', 'Student 11', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0012', 'Student 12', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0013', 'Student 13', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0014', 'Student 14', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0015', 'Student 15', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0016', 'Student 16', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0017', 'Student 17', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0018', 'Student 18', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0019', 'Student 19', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0020', 'Student 20', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0021', 'Student 21', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0022', 'Student 22', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0023', 'Student 23', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0024', 'Student 24', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0025', 'Student 25', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0026', 'Student 26', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0027', 'Student 27', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0028', 'Student 28', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0029', 'Student 29', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0030', 'Student 30', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0031', 'Student 31', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0032', 'Student 32', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0033', 'Student 33', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0034', 'Student 34', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0035', 'Student 35', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0036', 'Student 36', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0037', 'Student 37', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0038', 'Student 38', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0039', 'Student 39', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0040', 'Student 40', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0041', 'Student 41', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0042', 'Student 42', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0043', 'Student 43', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0044', 'Student 44', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0045', 'Student 45', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0046', 'Student 46', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0047', 'Student 47', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0048', 'Student 48', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0049', 'Student 49', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0050', 'Student 50', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0051', 'Student 51', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0052', 'Student 52', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0053', 'Student 53', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0054', 'Student 54', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0055', 'Student 55', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0056', 'Student 56', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0057', 'Student 57', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0058', 'Student 58', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0059', 'Student 59', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0060', 'Student 60', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0061', 'Student 61', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0062', 'Student 62', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0063', 'Student 63', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0064', 'Student 64', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0065', 'Student 65', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0066', 'Student 66', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0067', 'Student 67', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0068', 'Student 68', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0069', 'Student 69', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0070', 'Student 70', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0071', 'Student 71', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0072', 'Student 72', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0073', 'Student 73', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0074', 'Student 74', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0075', 'Student 75', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0076', 'Student 76', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('IT0077', 'Student 77', 'IT');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0078', 'Student 78', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0079', 'Student 79', 'CS');
INSERT INTO Students (roll_number, name, department) VALUES ('CS0080', 'Student 80', 'CS');

select * from Students;

CREATE TABLE Attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    class VARCHAR(255) NOT NULL,
    attendance CHAR(1) NOT NULL,
    FOREIGN KEY (roll_number) REFERENCES Students(roll_number)
);
UPDATE Teachers
SET department = 'CS'
WHERE department = 'Commerce' AND id IS NOT NULL;
select * from Teachers;

SET SQL_SAFE_UPDATES = 1;
SET SQL_SAFE_UPDATES = 0;

select * from Teachers;
