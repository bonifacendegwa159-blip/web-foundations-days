# School Database Design

## 1. Tables

### Students Table

The `students` table stores information about students, including their student ID, name, and email address. The student ID is the primary key and uniquely identifies each student. The name and email are required fields, and the email address must be unique to prevent two students from using the same email.

### Courses Table

The `courses` table stores information about the courses offered by the school. It contains a course ID and course name. The course ID is the primary key, while the course name is required and unique.

### Enrolments Table

The `enrolments` table records the courses taken by students and the grades they receive. It contains an enrolment ID, student ID, course ID, and grade. The student ID and course ID are foreign keys that reference the students and courses tables. The grade can be NULL because a student may enrol before receiving a grade. A UNIQUE constraint on student ID and course ID prevents the same student from enrolling in the same course more than once.

## 2. Relationships

The relationship between students and enrolments is one-to-many because one student can have several enrolment records, while each enrolment belongs to one student. The relationship between courses and enrolments is also one-to-many because one course can have several enrolment records, while each enrolment refers to one course.

Students and courses have a many-to-many relationship because one student can take several courses, and one course can have several students. The enrolments table acts as a join table between students and courses. It is needed to connect the two tables, prevent duplicate enrolments, and store information specific to each enrolment, such as the student's grade.

## 3. Recommended Index

I would add an index on `enrolments(course_id)` to help the database find enrolments for a particular course more efficiently. This would be useful when listing students enrolled in a course or counting the number of students per course. The existing UNIQUE constraint on `(student_id, course_id)` already supports lookups beginning with `student_id`, but a separate index beginning with `course_id` would help queries that search by course.

## 4. SQL or NoSQL

I would choose a relational SQL database for this school system. The data has clear relationships between students, courses, and enrolments, and each enrolment must reference an existing student and course. SQL supports primary keys, foreign keys, unique constraints, and queries using JOIN and GROUP BY. These features help maintain data accuracy and make it easier to retrieve information such as course lists, student lists, enrolment totals, and grades. A NoSQL database could be useful for some systems with highly flexible data structures, but a relational database is a suitable choice for this structured school database.
