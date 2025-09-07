const fs = require("fs");
const mysql = require("mysql2/promise");
/**
 * Modulo contenente la funzione per recuperare i gironi dal db
 * @param {*} nomeTorneo 
 * @param {*} data 
 * @returns 
 */
const recuperaAssaltiGirone = async (nomeTorneo, data) => {
    try {
        const conf = JSON.parse(fs.readFileSync("conf.json"));
        const connection = await mysql.createConnection({
            "host": conf.host,
            "user": conf.user,
            "password": conf.password,
            "database": conf.database
        }
        );
        const [rows, fields] = await connection.execute("SELECT codiceFisAtleta, idAssalto, idFase, punteggio FROM partecipare INNER JOIN fase ON fase.id=partecipare.idFase WHERE fase.dataTorneo = '" + data + "' AND fase.nomeTorneo = '" + nomeTorneo + "' AND fase.Tipologia='Girone'");
        await connection.end();
        if (rows.length > 0) {
            return rows;
        } else {
            return [];
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = recuperaAssaltiGirone;