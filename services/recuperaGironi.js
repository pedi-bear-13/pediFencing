const fs = require("fs");
const mysql = require("mysql2/promise");
/**
 * Modulo contenente la funzione per recuperare i gironi dal db
 * @param {*} nomeTorneo 
 * @param {*} data 
 * @returns 
 */
const recuperaGironi = async (nomeTorneo, data) => {
    try {
        const conf = JSON.parse(fs.readFileSync("conf.json"));
        const connection = await mysql.createConnection({
            "host": conf.host,
            "user": conf.user,
            "password": conf.password,
            "database": conf.database
        }
        );
        /**
         * Conta che dovremmo pigliare gli assalti del girone
         * Partecipare con join a fase e atleta
         */
        const [rows, fields] = await connection.execute("SELECT nome, cognome, atleta.codiceFis, societa, ranking, punteggio, idAssalto, fase.id AS idFase FROM fase INNER JOIN partecipare ON id=idFase INNER JOIN atleta ON codiceFisAtleta = codiceFis WHERE fase.dataTorneo = '" + data + "' AND fase.nomeTorneo = '" + nomeTorneo + "' AND fase.Tipologia='Girone'");
        console.log("Recupero gironi");
        console.log(rows);
        await connection.end();
        if (rows.length > 0) {
            return rows;
        } else {
            return [];
        }
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};

module.exports = recuperaGironi;