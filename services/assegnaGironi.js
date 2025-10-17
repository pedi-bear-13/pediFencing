// services/assegnaGironi.js
const fs = require("fs");
const mysql = require("mysql2/promise");

/**
 * Assegna gironi agli atleti iscritti a un torneo.
 * @param {string} idTorneo
 * @param {Array<{CodiceFIS: string, Girone: number}>} assegnazioni
 * @returns {Object} { result: string }
 */
const assegnaGironi = async (idTorneo, assegnazioni) => {
  let connection;
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    connection = await mysql.createConnection({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
    });

    // 2. Aggiorna girone per ciascun atleta
    for (const { CodiceFIS, Girone } of assegnazioni) {
      await connection.execute(
        "UPDATE partecipare SET Girone = ? WHERE CodiceFIS = ? AND IdTorneo = ?",
        [Girone, CodiceFIS, idTorneo]
      );
    }

    await connection.end();
    return { result: "Gironi assegnati con successo" };
  } catch (error) {
    if (connection) await connection.end();
    console.error("Errore assegnazione gironi:", error);
    return { result: "Errore durante l'assegnazione dei gironi" };
  }
};

module.exports = assegnaGironi;
