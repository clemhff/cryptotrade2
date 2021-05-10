const { Pool, Client } = require('pg');
const {connId} = require('../env/dbId');


exports.dbPoolTest = async () => {

  const pool = new Pool(connId);

  /*pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    pool.end()
  })*/

  // async/await
  try {
    const res = await pool.query('SELECT NOW()')
    console.log('POOL CONNECTION SUCCESS \n' + JSON.stringify(res.rows));
  } catch (error) {
    console.error('postgres error : ' + error);
  } finally {
    await pool.end()
  }

};

// for connection information

exports.dbClientTest = async () => {
  const client = new Client(connId)

  try {
    await client.connect()
    const res = await client.query('SELECT NOW()')
      console.log('CLIENT CONNECTION SUCCESS \n' + JSON.stringify(res.rows));
  } catch (error) {
    console.error('postgres error : ' + error);
  } finally {
    await client.end()
  }

};
