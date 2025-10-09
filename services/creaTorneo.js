const fs = require("fs");
const mysql = require("mysql2/promise");

const creaTorneo = async (data, nome, pel, ngir) => {
  let connection;
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json", "utf-8"));
    connection = await mysql.createConnection({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
    });

    // Verifica se torneo con stesso nome e data esiste già
    const sqlVerifica = "SELECT Id FROM torneo WHERE Nome = ? AND Giorno = ?";
    const [rows] = await connection.execute(sqlVerifica, [nome, data]);

    if (rows.length > 0) {
      return { result: "Torneo già registrato" };
    }

    // Inserimento nuovo torneo
    const sqlInsert = `
      INSERT INTO torneo (Nome, Stato, Giorno, PercentualeEliminati, NumeroGironi)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.execute(sqlInsert, [nome, true, data, pel, ngir]);

    return { result: "Torneo creato con successo" };
  } catch (error) {
    console.error("Errore creazione torneo:", error);
    return { result: "Non è stato possibile creare il torneo" };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

module.exports = creaTorneo;
