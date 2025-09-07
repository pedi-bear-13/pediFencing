const fs = require("fs");
const mysql = require("mysql2/promise");
/**
 * Modulo contenente la funzione per recuperare gli atleti da db
 * @param {*} nomeTorneo 
 * @param {*} data 
 * @returns 
 */
const recuperaAtleti = async (nomeTorneo, data) => {
    try {
        console.log(nomeTorneo+ ", "+data);
        const conf = JSON.parse(fs.readFileSync("conf.json"));
        const connection = await mysql.createConnection({
            "host": conf.host,
            "user": conf.user,
            "password": conf.password,
            "database": conf.database
        }
        );
        const [rows, fields] = await connection.execute("SELECT DISTINCT atleta.* FROM partecipare INNER JOIN atleta ON partecipare.codiceFisAtleta = atleta.codiceFis WHERE nomeTorneo ='"+nomeTorneo+"' AND dataTorneo ='"+data+"'");
        await connection.end();
        console.log(rows);
        if (rows.length > 0) {
            return rows;
        } else {
            return [];
        }
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

module.exports = recuperaAtleti;
