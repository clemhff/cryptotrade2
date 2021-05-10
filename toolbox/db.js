const { Pool, Client } = require('pg');
const {connId} = require('../env/dbId');

exports.dbQuery = async (query) => {
  const client = new Client(connId)

  try {

    await client.connect();
    const res = await client.query(query);
    console.log('CLIENT CONNECTION SUCCESS \n result \n ' + JSON.stringify(res.rows));

  } catch (error) {

    console.error('postgres error : ' + error);

  } finally {

    await client.end()

  }

};
