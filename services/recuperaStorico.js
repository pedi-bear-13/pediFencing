const fs = require("fs");
const mysql = require("mysql2/promise");

/**
 * Modulo contenente la funzione per recuperare gli atleti da db
 * @param {*} user
 * @returns
 */
const recuperaAtleti = async (user) => {
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    const connection = await mysql.createConnection({
      "host": conf.host,
      "user": conf.user,
      "password": conf.password,
      "database": conf.database
  }
  );
    const queryIdIniziale = "SELECT id FROM fase WHERE tipologia='Iniziale'";
    const [idIniziali] = await connection.execute(queryIdIniziale);
    const tornei = [];
    for (const idRow of idIniziali) {
      const [rows] = await connection.execute(
        "SELECT * FROM partecipare JOIN atleta ON atleta.codiceFis = partecipare.codiceFisAtleta WHERE partecipare.idFase=? AND emailUtente = ?",
        [idRow.id, user]
      );
      if (rows.length > 0) {
        tornei.push(rows[0]);
      }
    }
    await connection.end();
    return tornei;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = recuperaAtleti;
