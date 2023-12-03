const inquirer = require('inquirer');
// promise interface of mysql2
const mysql = require('mysql2/promise');
// build tables in the CLI
const Table = require('cli-table');
require('dotenv').config();

// connection pool for connection stability as there are several functional queries in this file
const pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});

// variable to hold the database connection
let db;

async function connectToDatabase() {
    if (!db || db.state === 'disconnected') {
        db = await pool.getConnection();
        console.log(`Connected to ${process.env.database}`);
    }
    
    return db;
}

// start program and logic to keep inquirer prompts going while the user doesn't select 'Exit'
async function init() {
    try {
        const db = await connectToDatabase();

        while (true) {
            const response = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: [
                        'View all departments',
                        'View all roles',
                        'View all employees',
                        'Add a department',
                        'Add a role',
                        'Add an employee',
                        'Update an employee role',
                        'Exit'
                    ]
                }
            ]);

            if (response.action === 'Exit') {

                break;
            }

            await generateQueries(response, db);
        }

    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

// functional query to view departments
async function viewDepartments() {
    try {
        const db = await connectToDatabase();
        const [departmentResults, departmentFields] = await db.query('SELECT * FROM department');
        const columns = departmentFields.map(departmentField => departmentField.name);
        
        const table = new Table({
            head: columns
        });

        // CLI-table throws error if data value is 'null', places string 'null' if data is null in database
        departmentResults.forEach(row => {
            table.push(columns.map(column => row[column] === null ? 'null' : row[column]));
        });

        console.log(table.toString());

    } catch (err) {
        console.error(err);   

    } finally {
        db.release();
    }
}

// functional query to view roles
async function viewRoles() {
    try {
        const db = await connectToDatabase();
        const [roleResults, roleFields] = await db.query(
            `SELECT
                role.title AS job_title, 
                role.id,
                department.name AS department, 
                role.salary
            FROM 
                role
            JOIN 
                department ON role.department_id = department.id`
            );

        const columns = roleFields.map(roleField => roleField.name);
        
        const table = new Table({
            head: columns
        });

        roleResults.forEach(row => {
            table.push(columns.map(column => row[column] === null ? 'null' : row[column]));
        })

        console.log(table.toString());

    } catch (err) {
        console.error(err);
    } finally {
        db.release();
    }
}

// functional query to view employees
async function  viewEmployees() {
    try {
        const db = await connectToDatabase();
        const [employeeResults, employeeFields] = await db.query(
         `SELECT
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
             employee AS manager ON employee.manager_id = manager.id`
     );
     
         const columns = employeeFields.map(employeeField => employeeField.name);
     
         const table = new Table({
             head: columns
         });
     
         employeeResults.forEach(row => {
             table.push(columns.map(column =>row[column] === null ? 'null' : row[column]));
         });
     
         console.log(table.toString());
    } catch (err) {
        console.error(err);
    } finally {
        db.release();
    }

}

// functional query to add department
async function addDepartmnet() {
    try {
        const db = await connectToDatabase();
        const userInput = await inquirer.prompt([
            {
                type: 'input',
                name: 'enterDepartment',
                message: 'Enter the department name'
            }
        ]);
    
        const [results, fields] = await db.query(
            'INSERT INTO department (name) VALUES (?)',
            [userInput.enterDepartment]
        );
    
        console.log('Department added successfully');
    } catch (err) {
        console.error(err);
    } finally {
        db.release();
    }
}

// functional query to add role
async function addRole() {
    try {
        const db = await connectToDatabase();
        const userInput = await inquirer.prompt([
            {
                type: 'input',
                name: 'enterRole',
                message: 'Enter the role name'
            },
            {
                type: 'input',
                name: 'enterSalary',
                message: 'Enter the role salary'  
            },
            {
                type: 'input',
                name: 'enterRoleDepartment',
                message: 'Enter the department for the role'
            }
        ]);

        const [departmentResults, departmentFields] = await db.query(
            'INSERT INTO department (name) VALUES (?)',
            [userInput.enterRoleDepartment]
        );

        // grab the id of the newly created department
        const departmentId = departmentResults.insertId;

        const [roleResults, roleFields] = await db.query(
            'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
            [userInput.enterRole, userInput.enterSalary, departmentId]
        );

        console.log('Role added successfully');

    } catch (err) {
        console.error(err);
    } finally {
        db.release();
    }
}

// functional query to add employee
async function addEmployee() {
    try {
        const db = await connectToDatabase();

        // array of role objects to later map a user selected role ID
        const roles = [
              {
                "id": 1,
                "name": "HR Manager"
              },
              {
                "id": 2,
                "name": "Recruiter"
              },
              {
                "id": 3,
                "name": "Training Specialist"
              },
              {
                "id": 4,
                "name": "Software Engineer"
              },
              {
                "id": 5,
                "name": "Senior Software Engineer"
              },
              {
                "id": 6,
                "name": "Systems Architect"
              },
              {
                "id": 7,
                "name": "Marketing Specialist"
              },
              {
                "id": 8,
                "name": "Marketing Manager"
              },
              {
                "id": 9,
                "name": "Social Media Coordinator"
              },
              {
                "id": 10,
                "name": "Financial Analyst"
              },
              {
                "id": 11,
                "name": "Controller"
              },
              {
                "id": 12,
                "name": "Auditor"
              },
              {
                "id": 13,
                "name": "Sales Representative"
              },
              {
                "id": 14,
                "name": "Account Executive"
              },
              {
                "id": 15,
                "name": "Sales Manager"
              }
        ];

        const managers = await getManagers(db);

        const roleChoices = roles.map(role => role.name);
        managerChoices = managers.map(manager => manager.full_name);

        const userInput = await inquirer.prompt([
            {
                type: 'input',
                name: 'enterFirstName',
                message: "Enter the employee's first name"
            },
            {
                type: 'input',
                name: 'enterLastName',
                message: "Enter the employee's last name"
            },
            {
                type: 'list',
                name: 'employeeRole',
                message: "Choose the employee's role",
                choices: roleChoices
            },
            {
                type: 'list',
                name: 'enterManager',
                message: "Who is the employee's manager?",
                choices: managerChoices
            }
        ]);

        const selectedRole = roles.find(role => role.name === userInput.employeeRole);
        const selectedManager = managers.find(manager => manager.full_name === userInput.enterManager);
        
        const roleId = selectedRole.id;
        const managerId = selectedManager.id;

        const [employeeResults, employeeFields] = await db.query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
            [userInput.enterFirstName, userInput.enterLastName, roleId, managerId]
        );

        console.log('Employee added successfully');

    } catch (err) {
        console.error(err);
    } finally {
        db.release();
    }
}

// to produce an array of manager choices for use when adding a new employee
async function getManagers(db) {
    const [managers, managerFields] = await db.query(
        'SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee WHERE manager_id IS NOT NULL'
    );

    return managers;
}

async function generateQueries(response, db) {
    try {
        if (response.action === 'View all departments') {
        await viewDepartments();

        } else if (response.action === 'View all roles') {
            await viewRoles();

        } else if (response.action === 'View all employees') {
            await viewEmployees();

        } else if (response.action === 'Add a department') {
            await addDepartmnet();

        } else if (response.action === 'Add a role') {
            await addRole();

        } else if (response.action === 'Add an employee') {
            await addEmployee();
        } 
    } catch (err) {
        console.error('Error executing query:', err);
    } finally {
        db.release();
    }
}

init();