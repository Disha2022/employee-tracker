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
  }).catch((e) => console.log(e));
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
          "Update employee role",
          "Update employee manager"
        ],
      },
    ])
    .then(async (answers) => {
      if (answers.main === "View all departments") {
        const [rows] = await connection.execute(
          "SELECT name FROM `department`"
        );
        console.table(rows.map((department) => department.name));
      }
      if (answers.main === "View all roles") {
        const [rows] = await connection.execute(
          "SELECT *, role.id as role_id FROM `role` INNER JOIN department ON role.department_id = department.id;"
        );
        const table = rows.map((row) => {
          delete row.department_id;

          row.id = row.role_id;
          delete row.role_id;
          return row;
        });
        console.table(table);
      }
      if (answers.main === "View all employees") {
        const [allEmployees] = await connection.execute(
          "SELECT *, employee.id as employee_id FROM `employee` INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id ;"
        );

        const table = allEmployees.map((row) => {
          delete row.department_id;
          delete row.role_id;
          delete row.id;

          row.department = row.name;
          delete row.name;

          const manager = allEmployees.find(
            (employee) => employee.employee_id === row.manager_id
          );
          row.managerName = manager.first_name + " " + manager.last_name;
          delete row.manager_id;
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
      if (answers.main === "Update employee role") {
        const [employeeResults] = await connection.execute(
          "SELECT first_name, last_name FROM `employee`"
        );
        const employeeNames = employeeResults.map(
          (res) => res.first_name + " " + res.last_name
        );
        const [roleResults] = await connection.execute(
          "SELECT title FROM `role`"
        );
        const roleNames = roleResults.map((res) => res.title);

        await inquirer
          .prompt([
            {
              type: "list",
              name: "name",
              message: "What employee?",
              choices: employeeNames,
            },
            {
              type: "list",
              name: "role",
              message: "What is their new role?",
              choices: roleNames,
            }
          ])
          .then(async (answers) => {
            const [results] = await connection
              .execute("SELECT id FROM `role` WHERE `title` = ?", [
                answers.role,
              ])
              .catch((e) => console.log(e));
            const id = results[0].id;

            const firstName = answers.name.split(" ")[0];
            const lastName = answers.name.split(" ")[1];
            await connection
              .execute(
                `UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?`,
                [id, firstName, lastName]
              )
              .catch((e) => console.log(e));

            console.log(
              `Updated ${answers.name} ${answers.lastName} role in the database.`
            );
          });
      }
      if (answers.main === "Update employee manager") {
        const [employeeResults] = await connection.execute(
          "SELECT first_name, last_name FROM `employee`"
        );
        const employeeNames = employeeResults.map(
          (res) => res.first_name + " " + res.last_name
        );

        const [managerResults] = await connection.execute(
          "SELECT first_name, last_name FROM `employee`"
        );
        const managerNames = managerResults.map(
          (res) => res.first_name + " " + res.last_name
        );
        await inquirer
          .prompt([
            {
              type: "list",
              name: "name",
              message: "What employee?",
              choices: employeeNames,
            },
            {
              type: "list",
              name: "role",
              message: "Who is their new manager?",
              choices: managerNames,
            },
          ])
          .then(async (answers) => {
            const managerFirstName = answers.manager.split(" ")[0];
            const managerLastName = answers.manager.split(" ")[1];
            const [managerResults] = await connection
              .execute(
                "SELECT id FROM `employee` WHERE `first_name` = ? AND `last_name` = ?",
                [managerFirstName, managerLastName]
              )
              .catch((e) => console.log(e));
            const managerId = managerResults[0].id;

            const firstName = answers.name.split(" ")[0];
            const lastName = answers.name.split(" ")[1];
            await connection
              .execute(
                `UPDATE employee SET manager_id = ? WHERE first_name = ? AND last_name = ?`,
                [managerId, firstName, lastName]
              )
              .catch((e) => console.log(e));

            console.log(
              `Updated ${answers.name} ${answers.lastName} manager in the database.`
            );
          });
      }
      mainQuestion();
    })
    .catch((error) => {
      console.log(error);
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
}

init();
