import { getConnection } from './oracle';

async function test() {
    try {
        const conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM usuarios`);
        console.log(' Conexão OK. Resultado:', result.rows);
        await conn.close();
    } catch (err) {
        console.error(' Erro no teste:', err);
    }
}

test();