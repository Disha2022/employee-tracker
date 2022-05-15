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
      if (answers.main === "View all roles") {
        const [rows] = await connection.execute(
          "SELECT * FROM `role` INNER JOIN department ON role.department_id = department.id;"
        );
        const table = rows.map((row) => {
          delete row.department_id;
          return row;
        });
        console.table(table);
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
          .then(async (answers) => {
            const [results] = await connection
              .execute(`INSERT INTO department (name) VALUES(?)`, [
                answers.department,
              ])
              .catch((e) => console.log(e));
            console.log("Added " + answers.department + " to the database.");
          });
      }

      if (answers.main === "Add a role") {
        const [departmentResults] = await connection.execute(
          "SELECT name FROM `department`"
        );
        const departmentNames = departmentResults.map((res) => res.name);
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
              type: "list",
              name: "department",
              message: "What department does the role belong to?",
              choices: departmentNames,
            },
          ])
          .then(async (answers) => {
            const [results] = await connection
              .execute("SELECT id FROM `department` WHERE `name` = ?", [
                answers.department,
              ])
              .catch((e) => console.log(e));
            const id = results[0].id;

            await connection
              .execute(
                `INSERT INTO role(title, salary, department_id) VALUES (?,?,?)`,
                [answers.name, answers.salary, id]
              )
              .catch((e) => console.log(e));

            console.log("Added " + answers.name + " to the database.");
          });
      }
      if (answers.main === "Add an employee") {
        const [roleResults] = await connection.execute(
          "SELECT title FROM `role`"
        );
        const roleNames = roleResults.map((res) => res.title);

        const [managerResults] = await connection.execute(
          "SELECT first_name, last_name FROM `employee`"
        );
        const managerNames = managerResults.map(
          (res) => res.first_name + " " + res.last_name
        );
        await inquirer
          .prompt([
            {
              type: "input",
              name: "name",
              message: "What is first name of the employee?",
            },
            {
              type: "input",
              name: "lastName",
              message: "What is last name of the employee?",
            },
            {
              type: "list",
              name: "role",
              message: "What is the employee's role?",
              choices: roleNames,
            },
            {
              type: "list",
              name: "manager",
              message: "Who is the employee's manager?",
              choices: managerNames,
            },
          ])
          .then(async (answers) => {
            const [results] = await connection
              .execute("SELECT id FROM `role` WHERE `title` = ?", [
                answers.role,
              ])
              .catch((e) => console.log(e));
            const id = results[0].id;

            const managerFirstName = answers.manager.split(" ")[0];
            const managerLastName = answers.manager.split(" ")[1];
            const [managerResults] = await connection
              .execute(
                "SELECT id FROM `employee` WHERE `first_name` = ? AND `last_name` = ?",
                [managerFirstName, managerLastName]
              )
              .catch((e) => console.log(e));
            const managerId = managerResults[0].id;
            
            await connection
              .execute(
                `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`,
                [answers.name, answers.lastName, id, managerId]
              )
              .catch((e) => console.log(e));

            console.log(
              `Added ${answers.name} ${answers.lastName} to the database.`
            );
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
