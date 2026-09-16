export interface SqlExample {
  title: string;
  category: "Basic SQL" | "Intermediate SQL" | "Joins" | "Advanced SQL";
  description: string;
  sql: string;
  setup?: boolean;
}

export const SQL_EXAMPLES: SqlExample[] = [
  { title: "Create students table", category: "Basic SQL", description: "Setup a table used by the learning examples.", setup: true, sql: "CREATE TABLE students (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  age INT CHECK (age > 0)\n);" },
  { title: "Insert students", category: "Basic SQL", description: "Add sample rows to the students table.", setup: true, sql: "INSERT INTO students (name, age)\nVALUES ('Alice', 22), ('Bob', 25), ('Cara', 19);" },
  { title: "Select all rows", category: "Basic SQL", description: "Read every column and row.", sql: "SELECT * FROM students;" },
  { title: "Select specific columns", category: "Basic SQL", description: "Return only the fields you need.", sql: "SELECT name, age\nFROM students;" },
  { title: "Filter with WHERE", category: "Basic SQL", description: "Keep students older than twenty.", sql: "SELECT * FROM students\nWHERE age > 20;" },
  { title: "Combine AND / OR", category: "Basic SQL", description: "Combine multiple conditions.", sql: "SELECT * FROM students\nWHERE age >= 20 AND (name LIKE 'A%' OR name LIKE 'B%');" },
  { title: "Order and limit", category: "Basic SQL", description: "Sort results and return the first five.", sql: "SELECT name, age\nFROM students\nORDER BY age DESC\nLIMIT 5;" },
  { title: "Distinct values", category: "Basic SQL", description: "Remove duplicate values from a result.", sql: "SELECT DISTINCT age\nFROM students\nORDER BY age;" },
  { title: "Update a row", category: "Basic SQL", description: "Change existing data.", sql: "UPDATE students\nSET age = age + 1\nWHERE name = 'Alice';" },
  { title: "Delete a row", category: "Basic SQL", description: "Remove matching data.", sql: "DELETE FROM students\nWHERE name = 'Cara';" },
  { title: "Search with LIKE", category: "Intermediate SQL", description: "Find names beginning with a letter.", sql: "SELECT * FROM students\nWHERE name ILIKE 'a%';" },
  { title: "IN and BETWEEN", category: "Intermediate SQL", description: "Match a list or an inclusive range.", sql: "SELECT * FROM students\nWHERE age IN (19, 22, 25)\n  AND age BETWEEN 18 AND 30;" },
  { title: "NULL checks and aliases", category: "Intermediate SQL", description: "Handle missing values and readable labels.", sql: "SELECT s.name AS student_name, s.age AS years_old\nFROM students AS s\nWHERE s.name IS NOT NULL;" },
  { title: "Aggregate functions", category: "Intermediate SQL", description: "Count and summarize numeric values.", sql: "SELECT COUNT(*) AS total,\n       SUM(age) AS age_total,\n       AVG(age) AS average_age,\n       MIN(age) AS youngest,\n       MAX(age) AS oldest\nFROM students;" },
  { title: "GROUP BY and HAVING", category: "Intermediate SQL", description: "Group rows and filter groups.", sql: "SELECT age, COUNT(*) AS students\nFROM students\nGROUP BY age\nHAVING COUNT(*) >= 1\nORDER BY age;" },
  { title: "CASE expression", category: "Intermediate SQL", description: "Create a value based on conditions.", sql: "SELECT name,\n  CASE WHEN age >= 21 THEN 'adult' ELSE 'minor' END AS age_group\nFROM students;" },
  { title: "String and date functions", category: "Intermediate SQL", description: "Transform text and work with dates.", sql: "SELECT UPPER(name) AS display_name,\n       LENGTH(name) AS name_length,\n       CURRENT_DATE AS today,\n       CURRENT_DATE + INTERVAL '7 days' AS next_week\nFROM students;" },
  { title: "Arithmetic expressions", category: "Intermediate SQL", description: "Calculate values in a query.", sql: "SELECT name, age, age * 12 AS age_in_months\nFROM students;" },
  { title: "Create course relationships", category: "Joins", description: "Setup related tables for join examples.", setup: true, sql: "CREATE TABLE courses (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) UNIQUE NOT NULL\n);\nCREATE TABLE enrollments (\n  student_id INT REFERENCES students(id),\n  course_id INT REFERENCES courses(id),\n  PRIMARY KEY (student_id, course_id)\n);" },
  { title: "Inner join", category: "Joins", description: "Combine rows with matching relationships.", sql: "SELECT s.name AS student, c.name AS course\nFROM students s\nINNER JOIN enrollments e ON e.student_id = s.id\nINNER JOIN courses c ON c.id = e.course_id;" },
  { title: "Left join", category: "Joins", description: "Keep every student, even without a course.", sql: "SELECT s.name, c.name AS course\nFROM students s\nLEFT JOIN enrollments e ON e.student_id = s.id\nLEFT JOIN courses c ON c.id = e.course_id;" },
  { title: "Right and full outer joins", category: "Joins", description: "Keep unmatched rows from the right or both sides.", sql: "SELECT s.name, c.name AS course\nFROM students s\nFULL OUTER JOIN enrollments e ON e.student_id = s.id\nFULL OUTER JOIN courses c ON c.id = e.course_id;" },
  { title: "Cross join", category: "Joins", description: "Generate every possible pair.", sql: "SELECT s.name, c.name\nFROM students s\nCROSS JOIN courses c;" },
  { title: "Self join", category: "Joins", description: "Join a table to itself to compare rows.", sql: "SELECT younger.name, older.name\nFROM students younger\nJOIN students older ON younger.age < older.age;" },
  { title: "Subquery and EXISTS", category: "Advanced SQL", description: "Filter using another query.", sql: "SELECT * FROM students s\nWHERE EXISTS (\n  SELECT 1 FROM enrollments e WHERE e.student_id = s.id\n);" },
  { title: "Correlated subquery", category: "Advanced SQL", description: "Run a related subquery for each outer row.", sql: "SELECT s.name\nFROM students s\nWHERE s.age > (SELECT AVG(s2.age) FROM students s2);" },
  { title: "CTE / WITH", category: "Advanced SQL", description: "Name an intermediate result for clarity.", sql: "WITH adult_students AS (\n  SELECT * FROM students WHERE age >= 18\n)\nSELECT COUNT(*) FROM adult_students;" },
  { title: "Recursive CTE", category: "Advanced SQL", description: "Generate a sequence recursively.", sql: "WITH RECURSIVE numbers AS (\n  SELECT 1 AS n\n  UNION ALL SELECT n + 1 FROM numbers WHERE n < 5\n)\nSELECT * FROM numbers;" },
  { title: "Window rankings", category: "Advanced SQL", description: "Rank rows without collapsing them.", sql: "SELECT name, age,\n  ROW_NUMBER() OVER (ORDER BY age DESC) AS row_number,\n  RANK() OVER (ORDER BY age DESC) AS rank,\n  DENSE_RANK() OVER (ORDER BY age DESC) AS dense_rank\nFROM students;" },
  { title: "Partitioned window", category: "Advanced SQL", description: "Calculate values within groups.", sql: "SELECT name, age,\n  AVG(age) OVER (PARTITION BY age) AS group_average\nFROM students;" },
  { title: "Set operations", category: "Advanced SQL", description: "Combine compatible result sets.", sql: "SELECT name FROM students WHERE age >= 21\nUNION\nSELECT name FROM students WHERE name LIKE 'A%';\n-- UNION ALL, INTERSECT, and EXCEPT work the same way." },
  { title: "Constraints and defaults", category: "Advanced SQL", description: "Protect data quality at the table boundary.", setup: true, sql: "CREATE TABLE departments (\n  id SERIAL PRIMARY KEY,\n  code TEXT UNIQUE NOT NULL,\n  active BOOLEAN NOT NULL DEFAULT TRUE,\n  budget NUMERIC CHECK (budget >= 0)\n);" },
  { title: "Index, alter, and view", category: "Advanced SQL", description: "Add an index, evolve a table, and save a query.", setup: true, sql: "CREATE INDEX students_age_idx ON students(age);\nALTER TABLE students ADD COLUMN email TEXT;\nCREATE VIEW adult_students AS SELECT * FROM students WHERE age >= 18;" },
  { title: "Safe NULL handling", category: "Advanced SQL", description: "Use PostgreSQL helpers for NULL and type conversion.", sql: "SELECT name,\n  COALESCE(email, 'no email') AS email,\n  NULLIF(age, 0) AS nonzero_age,\n  CAST(age AS TEXT) AS age_text\nFROM students;" },
];
