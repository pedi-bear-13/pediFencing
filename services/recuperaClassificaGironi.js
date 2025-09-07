const fs = require("fs");
const mysql = require("mysql2/promise");
/**
 * Modulo contenente la funzione per recuperare la classifica dei gironi dal db
 * @param {*} nomeTorneo 
 * @param {*} data 
 * @returns 
 */
const recuperaClassificaGironi = async(nomeTorneo, data) =>{
    try {
        const conf = JSON.parse(fs.readFileSync("conf.json"));
        const connection = await mysql.createConnection({
            "host": conf.host,
            "user": conf.user,
            "password": conf.password,
            "database": conf.database
        }
        );
        const [rows, fields] = await connection.execute("SELECT atleta.nome,atleta.cognome,atleta.societa,partecipare.punteggio,fase.id FROM atleta INNER JOIN partecipare ON codiceFis=codiceFisAtleta INNER JOIN fase ON id=idFase WHERE fase.tipologia='Girone' AND fase.svolta = 1 AND partecipare.nomeTorneo='"+nomeTorneo+"' AND partecipare.dataTorneo='"+data+"';");
        await connection.end();
        if (rows.length > 0) {
            return rows;
        } else {
            return [];
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = recuperaClassificaGironi;