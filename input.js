var inquirer = require("inquirer");
const mysql = require("mysql2/promise");

// create the connection to database
process.env.pw = process.env.pw || "";
let connection;
async function init() {
  connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "employee_db",
    password: process.env.pw,
  });
  mainQuestion();
}

function mainQuestion() {
  return inquirer
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
    .then(async (answers) => {
      if (answers.main === "View all departments") {
        const [rows] = await connection.execute(
          "SELECT name FROM `department`"
        );
        console.log(rows.map((department) => department.name));
      }
      if (answers.main === "Add a department") {
        await inquirer
          .prompt([
            {
              type: "input",
              name: "department",
              message: "What is name of department?",
            },
          ])
          .then((answers) => {
            const [results] = await connection.execute(
              `INSERT INTO department(name) VALUES ${answers.department}`)
                console.log(
                  "Added " + answers.department + " to the database."
                );
          });
      }

      if (answers.main === "Add a role") {
        await inquirer
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
            const [results] = await connection.execute(
              "SELECT id FROM `department` WHERE `name` = ?",
              [answers.department]);
                console.log(results);

            await connection.execute(
              `INSERT INTO role(title, salary, department_id) VALUES ${answers.name}`,
              "INSERT INTO department(name) VALUES ?, ? , ?",
              [answers.name, answers.salary, id]);

                console.log("Added " + answers.name + " to the database.");
          });
      }
      mainQuestion();
    })
    .catch((error) => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
}

init();
