const fs = require("fs");
const mysql = require("mysql2/promise");

/**
 * Recupera tutti gli assalti di tipo "Girone" di un torneo
 * @param {*} idTorneo
 * @returns elenco di assalti con atleti e punteggi
 */
const recuperaAssaltiGirone = async (idTorneo) => {
  let connection;
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    connection = await mysql.createConnection({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
    });

    const sql = `
      SELECT 
        Id AS idAssalto,
        IdAtleta1,
        IdAtleta2,
        Risultato
      FROM assalto
      WHERE IdTorneo = ? 
        AND Tipo = 'Girone'
      ORDER BY Id
    `;

    const [rows] = await connection.execute(sql, [idTorneo]);

    return rows;
  } catch (error) {
    console.error("Errore recuperaAssaltiGirone:", error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = recuperaAssaltiGirone;
