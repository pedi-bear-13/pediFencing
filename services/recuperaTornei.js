const fs = require("fs");
const mysql = require("mysql2/promise");

/**
 * Modulo contenente la funzione per recuperare i tornei dal db
 * @returns
 */
const recuperaTornei = async () => {
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    const connection = await mysql.createConnection({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
      dateStrings: true,
    });
    const [rows, fields] = await connection.execute("SELECT * FROM torneo");
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

module.exports = recuperaTornei;
