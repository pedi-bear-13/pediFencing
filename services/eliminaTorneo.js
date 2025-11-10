const fs = require("fs");
const mysql = require("mysql2/promise");

/**
 * Elimina un torneo e tutte le entità collegate (assalti, partecipazioni)
 * @param {*} idTorneo - id del torneo da eliminare
 * @returns { result: "ok" | "error" }
 */
const eliminaTorneo = async (idTorneo) => {
  let connection;
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    connection = await mysql.createConnection({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
      dateStrings: true,
    });

    // Inizio transazione
    await connection.beginTransaction();

    // Elimina assalti collegati
    await connection.execute(`DELETE FROM assalto WHERE IdTorneo = ?`, [
      idTorneo,
    ]);

    // Elimina partecipazioni collegate
    await connection.execute(`DELETE FROM partecipare WHERE IdTorneo = ?`, [
      idTorneo,
    ]);

    // Elimina torneo
    await connection.execute(`DELETE FROM torneo WHERE Id = ?`, [idTorneo]);

    // Commit transazione
    await connection.commit();
    return { result: "ok" };
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Errore eliminaTorneo:", error);
    return { result: "Error: " + error };
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = eliminaTorneo;
