const crypto = require('crypto');
const axios = require('axios');
const q = require('../toolbox/queryList');
const {dbPoolTest} = require('../toolbox/dbtest');
const { Pool, Client } = require('pg');
const {keys, connId} = require('../env/dbId');

const pool = new Pool(connId);


exports.mode = async(symbol) => {

  const myLastOrder = await pool.query(q.getLastOrder(symbol));

  //console.log(myLastOrder.rows[0]);


  console.log(myLastOrder.rows.length === 1 ? 'GET last order OK' : 'No order for the moment');

  let response = {};
  if(myLastOrder.rows.length === 0){
    response = {
      mode :  'BUY', // inversion warning
      result: null
    }
  }
  if(myLastOrder.rows.length === 1){
    response = {
      mode : (myLastOrder.rows[0].mode === 'BUY' ? 'SELL' : 'BUY'), // inversion warning
      result: myLastOrder.rows[0]
    }
  }

  return response;

}



exports.balance = async(token) => {

  let burl = "https://api.binance.com";
  let endPoint = "/api/v3/account";
  let dataQueryString ="timestamp=" + Date.now();

  let signature = crypto.createHmac('sha256',keys['skey']).update(dataQueryString).digest('hex');
  let url = burl + endPoint + '?' + dataQueryString + '&signature=' + signature;

  //console.log(url);

  let options = {
    method: 'get',
    url: url,
    timeout: 1000,
    headers: {'X-MBX-APIKEY': keys['akey'] }
  }
  let res = null;
  try {
    res = await axios(options);
  } catch (err) {
    console.error("Error response:");
    console.error(err.response.data);    // ***
    console.error(err.response.status);  // ***
    console.error(err.response.headers); // ***
  }

  //console.log(res.data.balances);
  let myBalance = res.data.balances.find(element => element.asset === token);
  //console.log(myBalance);

  return myBalance ;


}

exports.insertBalance = async(symbol, quantity) => {
  const insertB = await pool.query(q.insertBalance (Date.now(), symbol, quantity)); // get a ticker price
  return insertB;
}

exports.buy = async(symbol, quoteQuantity) => {
  let precision = quoteQuantity.match(/^-?\d+(?:\.\d{0,8})?/)[0] ;

  const makeOrder = await newOrder ('BUY', 'quoteOrderQty', precision, symbol );
  const saveOrder = await pool.query(q.insertOrder(Number(makeOrder.transactTime), symbol, makeOrder.side, makeOrder.origQty, makeOrder.fills[0].price, ''));
  console.log((saveOrder.rowCount === 1 ? 'SUCCESS order insertion' : 'FAIL order insertion'));

}

exports.sell = async(symbol, baseQuantity, info) => {
  let precision = baseQuantity.match(/^-?\d+(?:\.\d{0,1})?/)[0] ;

  const makeOrder = await newOrder ('SELL', 'quantity', precision, symbol );
  const saveOrder = await pool.query(q.insertOrder(Number(makeOrder.transactTime), symbol, makeOrder.side, baseQuantity, makeOrder.fills[0].price, info));
  console.log((saveOrder.rowCount === 1 ? 'SUCCESS order insertion': 'FAIL order insertion'));

}





const newOrder = async (side, typeQuantity, quantity, symbol) => {


  console.log(quantity);

  let burl = "https://api.binance.com";
  let endPoint = "/api/v3/order";
  let dataQueryString =
  "symbol=" + symbol.toUpperCase() + "&side=" + side + "&type=MARKET&" + typeQuantity + "=" + quantity + "&recvWindow=20000&timestamp=" + Date.now();

  let signature = crypto.createHmac('sha256',keys['skey']).update(dataQueryString).digest('hex');
  let url = burl + endPoint + '?' + dataQueryString + '&signature=' + signature;

  //console.log(url);

  let options = {
    method: 'post',
    url: url,
    timeout: 1000,
    headers: {'X-MBX-APIKEY': keys['akey'] }
  }
  let res = null;
  try {
    res = await axios(options);
  } catch (err) {
    console.error("Error response:");
    console.error(err.response.data);    // ***
    console.error(err.response.status);  // ***
    console.error(err.response.headers); // ***
  }
  console.log(`*********************************`);
  console.log(res.data.status);
  console.log(res.data.symbol);
  console.log(res.data.transactTime);
  console.log(res.data.side);
  console.log(res.data.fills[0].price);
  console.log(res.data.origQty);
  console.log(`*********************************`);
  //onsole.log(res.data);

  return res.data


};

/*
{
  symbol: 'ADAUSDT',
  orderId: 871348898,
  orderListId: -1,
  clientOrderId: 'nltk5tSbpeNU4AH06iwy0E',
  transactTime: 1612378881496,
  price: '0.00000000',
  origQty: '28.90000000',
  executedQty: '28.90000000',
  cummulativeQuoteQty: '12.93737400',
  status: 'FILLED',
  timeInForce: 'GTC',
  type: 'MARKET',
  side: 'BUY',
  fills: [
    {
      price: '0.44766000',
      qty: '28.90000000',
      commission: '0.02890000',
      commissionAsset: 'ADA',
      tradeId: 65019988
    }
  ]
}

*/

  /*/////////////////////////////////////////////////////////////

//Global Modules
const crypto = require('crypto');


var burl = "https://api.binance.com";
var endPoint = "/api/v3/order";
var dataQueryString = "symbol=BTCUSDT&side=BUY&type=LIMIT&timeInForce=GTC&quantity=0.003&price=6200&recvWindow=20000&timestamp=" + Date.now();

var keys = {
    "akey" : '',
    "skey" : ''
}

var signature = crypto.createHmac('sha256',keys['skey']).update(dataQueryString).digest('hex');

var url = burl + endPoint + '?' + dataQueryString + '&signature=' + signature;

options = {
  method: 'post',
  url: url,
  timeout: 1000,
  headers: {'X-MBX-APIKEY': keys['akey'] }
}

axios(options)
*/
