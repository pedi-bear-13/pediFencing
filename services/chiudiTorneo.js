const fs = require("fs");
const mysql = require("mysql2/promise");
/**
 * Modulo contenente la funzione per recuperare gli atleti da db
 * @param {*} nomeTorneo
 * @param {*} data
 * @returns
 */
const chiudiTorneo = async (nomeTorneo, data) => {
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    const connection = await mysql.createConnection({
      "host": conf.host,
      "user": conf.user,
      "password": conf.password,
      "database": conf.database
  }
  );
    const sql =
      "SELECT * FROM torneo WHERE data='" +
      data +
      "' AND nome='" +
      nomeTorneo +
      "'";
    const [rows, fields] = await connection.execute(sql);
    if (rows.length > 0) {
      const sql2 =
        "UPDATE `torneo` SET `svolto`='1' WHERE `nome`='" +
        nomeTorneo +
        "' AND `data`='" +
        data +
        "'";
      const [rows2, fields2] = await connection.execute(sql2);
      const sql3 =
        "UPDATE `fase` SET `svolta`='1' WHERE `tipologia`='Girone' AND `nomeTorneo`='" +
        nomeTorneo +
        "' AND `dataTorneo`='" +
        data +
        "'";
      const [rows3, fields3] = await connection.execute(sql3);
      const sql4 =
        "INSERT INTO fase (`tipologia`, `nomeTorneo`, `dataTorneo`, `luogo`, `data`, `svolta`) VALUES ('ClassificaGirone','" +
        nomeTorneo +
        "','" +
        data +
        "','" +
        rows[0].luogo +
        "','" +
        rows[0].data +
        "','1')";
    const [rows4, fields4] = await connection.execute(sql4);
      return rows4;
    } else {
      await connection.end();
      return [];
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = chiudiTorneo;
