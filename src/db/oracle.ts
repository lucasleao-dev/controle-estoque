import oracledb from 'oracledb';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTSTRING
};

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; // Retorna resultados como objetos JS

export async function getConnection() {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        return connection;
    } catch (err) {
        console.error('Erro ao conectar ao Oracle:', err);
        throw err;
    }
}