
const fs = require("fs");
const mysql = require("mysql2/promise");
/**
 * Modulo contenente la funzione per recuperare gli atleti da db
 * @param {*} nomeTorneo 
 * @param {*} data 
 * @returns 
 */
const recuperaFasi = async (nomeTorneo, data) => {
    try {
        const conf = JSON.parse(fs.readFileSync("conf.json"));
        const connection = await mysql.createConnection({
            "host": conf.host,
            "user": conf.user,
            "password": conf.password,
            "database": conf.database
        }
        );
        const sql = "SELECT * FROM fase WHERE nomeTorneo='"+nomeTorneo+"' AND dataTorneo='"+data+"'";
        const [rows, fields] = await connection.execute(sql);
        if (rows.length > 0) {
            await connection.end();
            return rows;
        } else {
            await connection.end();
            return [];
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = recuperaFasi;
