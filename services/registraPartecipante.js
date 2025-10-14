const fs = require("fs");
const mysql = require("mysql2/promise");

/**
 * Registra un atleta ad un torneo.
 * - Verifica che il torneo esista (Nome + Giorno).
 * - Se l'atleta non esiste lo crea, altrimenti aggiorna i suoi dati.
 * - Controlla se è già iscritto al torneo.
 * - Se non iscritto, inserisce nella tabella Partecipare con il ranking usato.
 *
 * @param {*} nome
 * @param {*} cognome
 * @param {*} ranking
 * @param {*} codiceFIS
 * @param {*} nomeTorneo
 * @param {*} dataTorneo
 * @returns { result: string }
 */
const registraPartecipante = async (
  nome,
  cognome,
  ranking,
  codiceFIS,
  nomeTorneo,
  dataTorneo
) => {
  let connection;
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    connection = await mysql.createConnection({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
    });

    // 1. Recupero torneo
    const [tornei] = await connection.execute(
      "SELECT Id FROM torneo WHERE Nome = ? AND Giorno = ?",
      [nomeTorneo, dataTorneo]
    );
    if (tornei.length === 0) {
      return { result: "Torneo non trovato" };
    }
    const idTorneo = tornei[0].Id;

    // 2. Inserisco/aggiorno atleta
    await connection.execute(
      `INSERT INTO atleta (CodiceFIS, Nome, Cognome, Ranking)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         Nome = VALUES(Nome), 
         Cognome = VALUES(Cognome), 
         Ranking = VALUES(Ranking)`,
      [codiceFIS, nome, cognome, ranking]
    );

    // 3. Controllo se già iscritto
    const [iscrizioni] = await connection.execute(
      "SELECT * FROM partecipare WHERE CodiceFIS = ? AND IdTorneo = ?",
      [codiceFIS, idTorneo]
    );
    if (iscrizioni.length > 0) {
      await connection.end();
      return { result: "Atleta già registrato a questo torneo" };
    }

    // 4. Inserisco iscrizione con ranking congelato
    await connection.execute(
      "INSERT INTO partecipare (CodiceFIS, IdTorneo, RankingUsato) VALUES (?, ?, ?)",
      [codiceFIS, idTorneo, ranking]
    );

    await connection.end();
    return { result: "Atleta registrato con successo" };
  } catch (error) {
    if (connection) await connection.end();
    console.error("Errore registrazione atleta:", error);
    return { result: "Errore durante la registrazione dell'atleta" };
  }
};

module.exports = registraPartecipante;
