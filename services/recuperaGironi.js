// services/recuperaGironi.js
const fs = require("fs");
const mysql = require("mysql2/promise");

/**
 * Recupera la lista di atleti con girone assegnato per un torneo
 * @param {string} idTorneo
 * @returns {Object[]} lista atleti
 */
const recuperaGironi = async (idTorneo) => {
  let connection;
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    connection = await mysql.createConnection({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
    });

    // 2. Recupera partecipanti e gironi
    const [rows] = await connection.execute(
      `SELECT p.CodiceFIS, a.Nome, a.Cognome, a.Ranking, p.Girone
       FROM partecipare p
       JOIN atleta a ON p.CodiceFIS = a.CodiceFIS
       WHERE p.IdTorneo = ?`,
      [idTorneo]
    );
    await connection.end();
    return rows;
  } catch (error) {
    if (connection) await connection.end();
    console.error("Errore recupero gironi:", error);
    return { result: "Errore durante il recupero dei gironi" };
  }
};

module.exports = recuperaGironi;
