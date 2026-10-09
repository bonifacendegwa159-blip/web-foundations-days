create table students (
       student_id integer primary key,
       name text not null,
       email text not null unique

);

create table courses (
        course id integer primary key,
        course name text not null unique

);

create table enrolments (
        enrolment_id integer primary key,
        student_id integer not null,
        course_id integer not null,
        grade text,

        foreign key (student_id)
             references students (student_id),
             
             foreign key (course_id),

             unique(student_id,course_id)
        
        );

insert into students (student_id, name, email)
values
      (1, 'Alice Kamau', 'alice@gmail.com'),
      (2, 'Brian Mwangi', 'brian@gmail.com');

insert into courses (course_id, course_name)
values 
     (1, 'mathematics'),
     (2, 'computer Science'),
     (3, 'English');

insert into enrolments
     (enrolment_id, student_id, course_id, grade)
values
       (1, 1, 1, 'A'),
       (2, 1, 2, 'B'),
       (3, 2, 1, 'B'),
       (4, 2, 3, 'A'),
       (5, 3, 2, 'A');

SELECT
      student.name,
      courses.course_name,
      enrolments.grade
FROM students
JOIN enrolments
    ON students.student_id = enrolment.student_id
JOIN courses
    ON enrolments.courses_id = courses.course_id
WHERE students.name = 'Alice Kamau';


SELECT
    students.name,
    courses.course_name,
    enrolments.grade
FROM students
JOIN enrolments
    ON students.student_id = enrolments.student_id
JOIN courses
    ON enrolments.course_id = courses.course_id
WHERE courses.course_name = 'Computer Science';


SELECT
    courses.course_name,
    COUNT(enrolments.student_id) AS number_of_students
FROM courses
LEFT JOIN enrolments
    ON courses.course_id = enrolments.course_id
GROUP BY
    courses.course_id,
    courses.course_name
ORDER BY courses.course_name;


INSERT INTO students (student_id, name, email)
VALUES (4, 'David Otieno', 'david@example.com');


SELECT
    students.student_id,
    students.name,
    students.email
FROM students
LEFT JOIN enrolments
    ON students.student_id = enrolments.student_id
WHERE enrolments.student_id IS NULL;


UPDATE enrolments
SET grade = 'A+'
WHERE enrolment_id = 1;


SELECT
    students.name,
    courses.course_name,
    enrolments.grade
FROM enrolments
JOIN students
    ON enrolments.student_id = students.student_id
JOIN courses
    ON enrolments.course_id = courses.course_id
WHERE enrolments.enrolment_id = 1;

