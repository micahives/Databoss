-- view all departments
SELECT * from department;

-- view all roles
SELECT
    role.title AS job_title, 
    role.id,
    department.name AS department, 
    role.salary
FROM 
    role
JOIN 
    department ON role.department_id = department.id;

-- view all employees
SELECT
    employee.id AS employee_id, 
    employee.first_name, 
    employee.last_name,
    role.title AS job_title,
    department.name AS department,
    role.salary,
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
FROM 
    employee
JOIN 
    role ON employee.role_id = role.id
JOIN 
    department ON role.department_id = department.id
LEFT JOIN 
    employee AS manager ON employee.manager_id = manager.id;