async function connect() {

    if (global.connection) {
        return global.connection.connect();
    }

    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.CONNECTION_STRING
    });

    // Testa a conexão com o banco de dados
    const client = await pool.connect();
    console.log("Conectado ao banco de dados com sucesso!");

    const res = await client.query('SELECT NOW()');
    console.log("Hora atual do banco de dados:", res.rows[0].now);
    client.release();

    // Armazena a conexão globalmente
    global.connection = pool;
    return pool.connect();
}

async function selectCustomer() {
    const client = await connect();
    const res = await client.query('SELECT * FROM clientes');
    return res.rows;
}

async function selectCustomers(id) {
    const client = await connect();
    const res = await client.query('SELECT * FROM clientes WHERE id  = $1', [id]);
    return res.rows;
}

async function insertCustomer(customer){
    const client = await connect();
    const sql = 'INSERT INTO clientes (nome,idade,uf) VALUES ($1,$2,$3);';
    const values = [customer.nome, customer.idade, customer.uf];
    await client.query(sql, values);
}

async function updateCustomer(id, customer){
    const client = await connect();
    const sql = 'UPDATE clientes SET nome=$1, idade=$2, uf=$3 WHERE id=$4;';
    const values = [customer.nome, customer.idade,customer.uf, id];
    await client.query(sql, values);
}

async function deleteCustomer(id){
    const client = await connect();
    const sql = 'DELETE FROM clientes where id=$1;';
    return await client.query(sql, [id]);
}

module.exports = { selectCustomer, selectCustomers, insertCustomer, updateCustomer, deleteCustomer }

connect();
