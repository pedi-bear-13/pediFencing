const fs = require("fs");
const mysql = require("mysql2/promise");

/**
 * Recupera tutti gli atleti iscritti ad un torneo
 * utilizzando il RankingUsato salvato in 'partecipare'
 * (rinominato come 'Ranking' per compatibilità con il codice esistente)
 *
 * @param {string} nomeTorneo
 * @param {string} data
 * @returns {Array} Lista atleti con Ranking "freezato" per il torneo
 */
const recuperaAtleti = async (nomeTorneo, data) => {
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    const connection = await mysql.createConnection({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
    });

    const [rows] = await connection.execute(
      `SELECT DISTINCT atleta.CodiceFIS,
              atleta.Nome,
              atleta.Cognome,
              partecipare.RankingUsato AS Ranking,
              partecipare.Girone AS Girone
       FROM partecipare
       INNER JOIN atleta ON partecipare.CodiceFIS = atleta.CodiceFIS
       INNER JOIN torneo ON partecipare.IdTorneo = torneo.Id
       WHERE torneo.Nome = ? AND torneo.Giorno = ?`,
      [nomeTorneo, data]
    );

    await connection.end();
    return rows.length > 0 ? rows : [];
  } catch (error) {
    console.error("Errore nel recupero atleti:", error);
    throw new Error(error.message);
  }
};

module.exports = recuperaAtleti;
