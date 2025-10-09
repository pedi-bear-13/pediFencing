const fs = require("fs");
const mysql = require("mysql2/promise");

const accessLogin = async () => {
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    const connection = await mysql.createConnection({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
    });

    const [rows, fields] = await connection.execute(
      "SELECT amministratore.Utente AS Email, amministratore.Password AS Password FROM amministratore"
    );
    await connection.end();
    if (rows.length > 0) {
      return rows;
    } else {
      return [];
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = accessLogin;
