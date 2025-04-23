use college

select distinct subject from teachers
where class='SY'

select * from teachers

select * from uploadhistory

ALTER TABLE UploadHistory
ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY;

CREATE TABLE Validrecords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_number VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    class VARCHAR(50) NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from Validrecords

CREATE TABLE Errorrecords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_number VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    class VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
select * from Errorrecords
