var inquirer = require("inquirer");
const mysql = require("mysql2");

process.env.pw = process.env.pw || "";

// create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "employee_db",
  password: process.env.pw,
});

inquirer
  .prompt([
    {
      type: "list",
      name: "main",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
      ],
    },
  ])
  .then((answers) => {
    if (answers.main === "View all departments") {
      connection.query(
        "SELECT * FROM `department` WHERE `name` = ?",
        ["corporate"],
        function (err, results) {
          if (err) {
            console.log("err: " + err);
          }
          console.log(results);
        }
      );
    }
    if (answers.main === "Add a department") {
      inquirer
        .prompt([
          {
            type: "input",
            name: "department",
            message: "What is name of department?",
          },
        ])
        .then((answers) => {
          connection.query(
            `INSERT INTO department(name) VALUES ${answers.name}`,
            function (err, results, fields) {
              console.log("Added " + results + " to the database.");
              console.log(results); // results contains rows returned by server
              console.log(fields); // fields contains extra meta data about results, if available
            }
          );
        });
    }

    if (answers.main === "Add a role") {
      inquirer
        .prompt([
          {
            type: "input",
            name: "name",
            message: "What is name of the role?",
          },
          {
            type: "input",
            name: "salary",
            message: "What is salary of the role?",
          },
          {
            type: "input",
            name: "department",
            message: "What department does the role belong to?",
          },
        ])
        .then((answers) => {
          let id;
          connection.query(
            "SELECT id FROM `department` WHERE `name` = ?",
            [answers.department],
            function (err, results) {
              console.log(results);
            }
          );

          connection.query(
            `INSERT INTO role(title, salary, department_id) VALUES ${answers.name}`,
            "INSERT INTO department(name) VALUES ?, ? , ?",
            [answers.name, answers.salary, id],
            function (err, results) {
              console.log("Added " + answers.name + " to the database.");
              console.log(results);
            }
          );
        });
    }
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
