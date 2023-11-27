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
            database: process.env.database
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
    }
}


init();