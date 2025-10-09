const fs = require("fs");
const mysql = require("mysql2/promise");

const modificaTorneo = async (id, data, nome, pel, ngir) => {
  let connection;
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json", "utf-8"));
    connection = await mysql.createConnection({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
    });

    // Verifica che il torneo esista
    const sqlCheck = "SELECT Id FROM torneo WHERE Id = ?";
    const [rows] = await connection.execute(sqlCheck, [id]);

    if (rows.length === 0) {
      return { result: "Torneo non trovato" };
    }

    // Aggiornamento dati
    const sqlUpdate = `
      UPDATE torneo
      SET Nome = ?, Giorno = ?, PercentualeEliminati = ?, NumeroGironi = ?
      WHERE Id = ?
    `;
    await connection.execute(sqlUpdate, [nome, data, pel, ngir, id]);

    return { result: "Torneo modificato con successo" };
  } catch (error) {
    console.error("Errore modifica torneo:", error);
    return { result: "Non è stato possibile modificare il torneo" };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

module.exports = modificaTorneo;
