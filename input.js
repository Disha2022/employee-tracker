var inquirer = require('inquirer');
const mysql = require('mysql2');


// create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'test'
  });

inquirer
  .prompt([
    {
        type: 'list',
        name: 'size',
        message: 'What size do you need?',
        choices: ['View all departments', 'View all roles', 'View all employees','add a department', 'add a role', 'add an employee', 'update an employee role']
    },
    {
        type: 'input',
        name: 'department',
        message: 'What is name of department?',
      },
  ])
  .then((answers) => {
    // Use user feedback for... whatever!!
    
    console.log(answers.size)

    connection.query(
        `INSERT INTO departments(d_name) VALUES ${answers.name}`,
        function(err, results, fields) {
          console.log(results); // results contains rows returned by server
          console.log(fields); // fields contains extra meta data about results, if available
        }
      );
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });