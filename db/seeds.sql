-- Insert data into the department table
INSERT INTO department (id, name) VALUES
(1, 'HR'),
(2, 'Engineering'),
(3, 'Marketing'),
(4, 'Finance'),
(5, 'Sales');

-- Insert data into the role table
INSERT INTO role (id, title, salary, department_id) VALUES
-- HR Department
(1, 'HR Manager', 60000.00, 1),
(2, 'Recruiter', 50000.00, 1),
(3, 'Training Specialist', 55000.00, 1),

-- Engineering Department
(4, 'Software Engineer', 80000.00, 2),
(5, 'Senior Software Engineer', 100000.00, 2),
(6, 'Systems Architect', 120000.00, 2),

-- Marketing Department
(7, 'Marketing Specialist', 55000.00, 3),
(8, 'Marketing Manager', 70000.00, 3),
(9, 'Social Media Coordinator', 48000.00, 3),

-- Finance Department
(10, 'Financial Analyst', 65000.00, 4),
(11, 'Controller', 90000.00, 4),
(12, 'Auditor', 75000.00, 4),

-- Sales Department
(13, 'Sales Representative', 60000.00, 5),
(14, 'Account Executive', 75000.00, 5),
(15, 'Sales Manager', 85000.00, 5);

-- Insert data into the employee table
INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES
-- HR Department
(1, 'John', 'Doe', 1, NULL),
(2, 'Jane', 'Smith', 2, 1),
(3, 'Bob', 'Johnson', 3, 1),

-- Engineering Department
(4, 'Alice', 'Williams', 4, 1),
(5, 'Charlie', 'Brown', 5, 1),
(6, 'David', 'Miller', 6, 1),

-- Marketing Department
(7, 'Eva', 'Jones', 7, 1),
(8, 'Frank', 'Davis', 8, 1),
(9, 'Grace', 'Moore', 9, 1),

-- Finance Department
(10, 'Henry', 'Martin', 10, 1),
(11, 'Ivy', 'Taylor', 11, 10),
(12, 'Jack', 'Anderson', 12, 10),

-- Sales Department
(13, 'Karen', 'White', 13, 1),
(14, 'Liam', 'Clark', 14, 13),
(15, 'Mia', 'Wilson', 15, 13);
