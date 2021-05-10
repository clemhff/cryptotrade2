const q = require('./queryList');
const {dbPoolTest} = require('./dbtest');
const { Pool, Client } = require('pg');
const {connId} = require('../env/dbId');



const pool = new Pool(connId);

exports.checkTable = async(table) => {
  const tableExist = await pool.query(q.tableName(table));
  if(tableExist.rows.length === 0){

    console.log('Table ' + table + ' doesn\'t exist');
    const createTable = await pool.query(q.createTable(table)); // create table
    const createIndex= await pool.query(q.createIndexTimestamp(table)); // create index
    console.log('Table ' + table + ' created');
  }
};
