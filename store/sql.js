const sql = {

  // DDL to create the Employee table.
  createEmployeeTable: `
    CREATE TABLE IF NOT EXISTS Employee (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      wage INTEGER NOT NULL,
      is_current_employee INTEGER NOT NULL DEFAULT 1
    )
  `,

  // DDL to create the Timesheet table.
  createTimesheetTable: `
    CREATE TABLE IF NOT EXISTS Timesheet (
      id INTEGER PRIMARY KEY,
      hours INTEGER NOT NULL,
      rate INTEGER NOT NULL,
      date INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      FOREIGN KEY(employee_id) REFERENCES Employee(id)
    )
  `,

  // DDL to create the Menu table.
  createMenuTable: `
    CREATE TABLE IF NOT EXISTS Menu (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL
    )
  `,

  // DDL to create the MenuItem table.
  createMenuItemTable: `
    CREATE TABLE IF NOT EXISTS MenuItem (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      inventory INTEGER NOT NULL,
      price INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      FOREIGN KEY(menu_id) REFERENCES Menu(id)
    )
  `,

  // DML to create a new Employee record.
  createEmployee: `
    INSERT INTO Employee (
      name,
      position,
      wage,
      is_current_employee
    )
    VALUES (
      $name,
      $position,
      $wage,
      $isCurrentEmployee
    )
  `,

  // DML to create a new Timesheet record.
  createTimesheet: `
    INSERT INTO Timesheet (
      hours,
      rate,
      date,
      employee_id
    )
    VALUES (
      $hours,
      $rate,
      $date,
      $employeeId
    )
  `,

  // DML to create a new Menu record.
  createMenu: `
    INSERT INTO Menu (
      title
    )
    VALUES (
      $title
    )
  `,

  // DML to create a new MenuItem record.
  createMenuItem: `
    INSERT INTO MenuItem (
      name,
      description,
      inventory,
      price,
      menu_id
    )
    VALUES (
      $name,
      $description,
      $inventory,
      $price,
      $menuId
    )
  `,

  // SQL to retrieve a specific Employee identified by Employee ID.
  getEmployee: `
    SELECT *
    FROM Employee
    WHERE id = $employeeId
  `,

  // SQL to retrieve all Employees who are currently employed.
  getEmployees: `
    SELECT *
    FROM Employee
    WHERE is_current_employee = 1
  `,

  // SQL to retrieve a specific Timesheet identified by Timesheet ID.
  getTimesheet: `
    SELECT *
    FROM Timesheet
    WHERE id = $timesheetId
  `,

  // SQL to retrieve all Timesheets associated with a specific Employee.
  getTimesheets: `
    SELECT *
    FROM Timesheet
    WHERE employee_id = $employeeId
  `,

  // SQL to retrieve a specific Menu identified by Menu ID.
  getMenu: `
    SELECT *
    FROM Menu
    WHERE id = $menuId
  `,

  // SQL to retrieve all Menus.
  getMenus: `
    SELECT *
    FROM Menu
  `,

  // SQL to retrieve a specific MenuItem identified by MenuItem ID
  getMenuItem: `
    SELECT *
    FROM MenuItem
    WHERE id = $menuItemId
  `,

  // SQL to retrieve all MenuItems associated with a specific Menu ID.
  getMenuItems: `
    SELECT *
    FROM MenuItem
    WHERE menu_id = $menuId
  `,

  // DML to modify an existing Employee identified by Employee ID.
  updateEmployee: `
    UPDATE Employee
    SET
      name = $name,
      position = $position,
      wage = $wage,
      is_current_employee = $isCurrentEmployee
    WHERE id = $employeeId
  `,

  // DML to modify an existing Timesheet identified by Timesheet ID.
  updateTimesheet: `
    UPDATE Timesheet
    SET
      hours = $hours,
      rate = $rate,
      date = $date,
      employee_id = $employeeId
    WHERE id = $timesheetId
  `,

  // DML to modify an existing Menu identified by Menu ID.
  updateMenu: `
    UPDATE Menu
    SET
      title = $title
    WHERE id = $menuId
  `,

  // DML to modify an existing MenuItem identified by MenuItem ID.
  updateMenuItem: `
    UPDATE MenuItem
    SET
      name = $name,
      description = $description,
      inventory = $inventory,
      price = $price,
      menu_id = $menuId
    WHERE id = $menuItemId
  `,

  // DML to delete an existing Employee identified by Employee ID.
  deleteEmployee: `
    UPDATE Employee
    SET is_current_employee = 0
    WHERE id = $employeeId
  `,

  // DML to delete an existing Timesheet identified by Timesheet ID.
  deleteTimesheet: `
    DELETE FROM Timesheet
    WHERE id = $timesheetId
  `,

  // DML to delete an existing Menu identified by Menu ID.
  deleteMenu: `
    DELETE FROM Menu
    WHERE id = $menuId
  `,

  // DML to delete an existing MenuItem identified by MenuItem ID.
  deleteMenuItem: `
    DELETE FROM MenuItem
    WHERE id = $menuItemId
  `
};

module.exports = sql;
