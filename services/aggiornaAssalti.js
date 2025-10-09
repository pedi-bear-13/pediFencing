const fs = require("fs");
const mysql = require("mysql2/promise");

/**
 * Aggiorna o inserisce un assalto di un girone
 * @param {*} assaltoObj - { CodiceFISAtleta1, CodiceFISAtleta2, Risultato, Tipo, IdTorneo }
 * @returns { result: "ok" }
 */
const aggiornaAssalti = async (assaltoObj) => {
  let connection;
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    connection = await mysql.createConnection({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
    });

    // Verifica se l'assalto esiste
    const [rows] = await connection.execute(
      `SELECT Id FROM assalto 
       WHERE IdAtleta1 = ? AND IdAtleta2 = ? 
         AND Tipo = ? AND IdTorneo = ?`,
      [assaltoObj.fisUno, assaltoObj.fisDue, "Girone", assaltoObj.idTorneo]
    );

    if (rows.length > 0) {
      // Esiste, aggiorna
      await connection.execute(
        `UPDATE assalto SET Risultato = ? WHERE Id = ?`,
        [assaltoObj.Risultato, rows[0].Id]
      );
    } else {
      // Non esiste, inserisci nuovo record
      await connection.execute(
        `INSERT INTO assalto 
        (IdAtleta1, IdAtleta2, Risultato, Tipo, IdTorneo)
         VALUES (?, ?, ?, ?, ?)`,
        [
          assaltoObj.fisUno,
          assaltoObj.fisDue,
          assaltoObj.atleta1 + "-" + assaltoObj.atleta2,
          "Girone",
          assaltoObj.idTorneo,
        ]
      );
    }

    return { result: "ok" };
  } catch (error) {
    console.error("Errore aggiornaAssalti:", error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = aggiornaAssalti;
