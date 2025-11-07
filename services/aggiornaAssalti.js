const fs = require("fs");
const mysql = require("mysql2/promise");

/**
 * Aggiorna o inserisce un assalto (girone o eliminazione diretta)
 * @param {*} assaltoObj - { fisUno, fisDue, Risultato, tipo, idTorneo }
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

    // Cerca assalto esistente in entrambi gli ordini
    const [rows] = await connection.execute(
      `SELECT Id, IdAtleta1, IdAtleta2 FROM assalto 
       WHERE ((IdAtleta1 = ? AND IdAtleta2 = ?) OR (IdAtleta1 = ? AND IdAtleta2 = ?))
         AND Tipo = ? AND idTorneo = ?`,
      [
        assaltoObj.fisUno,
        assaltoObj.fisDue,
        assaltoObj.fisDue,
        assaltoObj.fisUno,
        assaltoObj.tipo,
        assaltoObj.idTorneo,
      ]
    );

    if (rows.length > 0) {
      const assaltoId = rows[0].Id;

      // Mantieni il risultato così com'è, ma garantisci che il vincitore sia IdAtleta1
      const vincitore = assaltoObj.fisUno;
      const sconfitto = assaltoObj.fisDue;

      await connection.execute(
        `UPDATE assalto SET IdAtleta1 = ?, IdAtleta2 = ?, Risultato = ? WHERE Id = ?`,
        [vincitore, sconfitto, assaltoObj.Risultato, assaltoId]
      );
    } else {
      // Inserisci nuovo assalto
      await connection.execute(
        `INSERT INTO assalto 
        (IdAtleta1, IdAtleta2, Risultato, Tipo, IdTorneo)
         VALUES (?, ?, ?, ?, ?)`,
        [
          assaltoObj.fisUno,
          assaltoObj.fisDue,
          assaltoObj.Risultato,
          assaltoObj.tipo,
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
