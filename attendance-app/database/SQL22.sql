use college

select * from teachers

update teachers
set subject = 'Database Management'
where teacher_name = 'Meena Das'
and department = 'IT'
and class = 'SY'
select * from teachers
where teacher_name = 'Meena Das'
and department = 'IT'
and class = 'SY'

select distinct teacher_name from teachers
select distinct subject from teachers

SELECT DISTINCT teacher_name, subject, department, class
FROM teachers;
 
 
 SELECT *
FROM teachers
WHERE teacher_name LIKE '%Meena Das%'
and department = 'IT'
and class = 'SY'

update teachers
set time_slot = '02:00-03:00'
where time_slot = '02:00-3:00'

SELECT * FROM teachers
where time_slot = '9:00-10:00'
