const inquirer = require('inquirer');
// promise interface of mysql2
const mysql = require('mysql2/promise');
const Table = require('cli-table');
require('dotenv').config();

async function connectToDatabase() {
    const db = await mysql.createConnection(
        {
            host: process.env.host,
            user: process.env.user,
            password: process.env.password,
            database: process.env.database,
            multipleStatements: true,
        });    

        console.log(`Connected to ${process.env.database}`);
        return db;
}

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
                // Exit the loop and close the database connection
                break;
            }

            await generateQuery(response, db);
        }

        // Close the database connection when done
        await db.end();

    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

async function generateQuery(response, db) {
    try {
        if (response.action === 'View all departments') {
            const [results, fields] = await db.query('SELECT * FROM department');
    
            // Extract column names from the fields array
            const columns = fields.map(field => field.name);
    
            // Create table in the CLI
            const table = new Table({
                head: columns
            });
    
            results.forEach(row => {
                // CLI-table throws error if data value is 'null', handles string output of 'null' if value is null in mysql
                table.push(columns.map(column => row[column] === null ? 'null' : row[column]));
            });
    
            // Display the table in the CLI
            console.log(table.toString());
    
        } else if (response.action === 'View all roles') {
            const [results, fields] = await db.query(
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
    
            const columns = fields.map(field => field.name);
    
            const table = new Table({
                head:columns
            });
    
            results.forEach(row => {
                table.push(columns.map(column => row[column] === null ? 'null' : row[column]));
            });
    
            console.log(table.toString());
    
    
        } else if (response.action === 'View all employees') {
            const [results, fields] = await db.query(
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
    
            const columns = fields.map(field => field.name);
    
            const table = new Table({
                head:columns
            });
    
            results.forEach(row => {
                table.push(columns.map(column => row[column] === null ? 'null' : row[column]));
            });
    
            console.log(table.toString());
        } else if (response.action === 'Add a department') {
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
    
            console.log('Department added successfully, select "View all departments" for the updated entry');
        } else if (response.action === 'Add a role') {
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

            const departmentId = departmentResults.insertId;

            const [roleResults, roleFields] = await db.query(
                'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
                [userInput.enterRole, userInput.enterSalary, departmentId]
            );

            console.log('Role added successfully, select "View all roles" for the updated entry');
        } else if (response.action === 'Add an employee') {
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
                    type: 'input',
                    name: 'enterEmployeeRole',
                    message: "Enter the employee's role"
                },
                {
                    type: 'input',
                    name: 'enterManagerFirstName',
                    message: "Enter the manager's first name"
                },
                {
                    type: 'input',
                    name: 'enterManagerLastName',
                    message: "Enter the manager's last name"
                }
            ]);

            await db.query('START TRANSACTION');

            const [roleResults, roleFields] = await db.query(
                'INSERT INTO role (title) VALUES (?)',
                [userInput.enterEmployeeRole]
            );

            const roleId = roleResults.insertId;

            const [managerResults, managerFields] = await db.query(
                'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, NULL)',
                [userInput.enterManagerFirstName, userInput.enterManagerLastName, roleId]
            );

            const managerId = managerResults.insertId;

            const [employeeResults, employeeFields] = await db.query(
                'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
                [userInput.enterFirstName, userInput.enterLastName, roleId, managerId]
            );

            console.log('Employee added successfully, select "View all employees" for the updated entry');
        }
    } catch (error) {
        console.error('Error executing query:', error);
    }
}

init();