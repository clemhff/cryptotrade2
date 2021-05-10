const {analyseData, decisionMaker, lastTicker} = require('./decision');
const {balance, buy, sell, mode, insertBalance} = require('./binance');



exports.trade = async (symbol, base, quote, theTime, high, low, intervalData) => {
  console.log(`////////////////////////// NEW TRADE FUNCTION`);
  let sMode = await mode(symbol);
  //console.log(sMode.result);
  console.log(sMode.mode);


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  if(sMode.mode === 'BUY'){

    data = await analyseData(symbol, theTime, intervalData); //input timestamp
    //console.log(data[0][data[1].length-1]);
    //console.log(data[0]);

    console.log('GET DATA Ok');

    let decision = await decisionMaker('BUY', data);
    console.log('The final decision is ' + decision);

    if(decision === 'BUY') {
      let balanceRes = await balance(quote);
      let insertB = await insertBalance(quote , balanceRes.free)
      console.log('The balance for ' + balanceRes.asset + ' est de ' + balanceRes.free);
      console.log(insertB.rowCount === 1 ? 'Success insertion balance ' : ' Fail to insert balance');
      if ((Number(balanceRes.free)) > 5) {
        //console.log('inserting');
        let buyRes = await buy(symbol, (balanceRes.free)); // put quote order quantity
      }
      else {
        console.log('ERROR empty wallet');
      }
    }
  }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  if(sMode.mode === 'SELL') {

    data = await analyseData(symbol, theTime, intervalData); //input timestamp
    console.log('GET DATA Ok');
    console.log(data);

    //data[2] = [79, 77, 75, 72]

    let decision = await decisionMaker('SELL', data);
    console.log('The final decision is ' + decision);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// mettre un if decision
    theLastTicker = await lastTicker(symbol, theTime);
    console.log('GET last ticker Ok');

    if(decision === 'SELL NOW'){
      console.log('SELL before low limit');
      let balanceRes = await balance(base);

      let insertB = await insertBalance(base , balanceRes.free)
      let sellRes = await sell(symbol, balanceRes.free, 'BEFORE'); // put quote order quantity
    }

    if(decision === 'WATCH MARGIN') {
      buyPrice = Number(sMode.result.price);
      actualPrice = Number(theLastTicker.open);
      console.log('BUY price is ' + buyPrice);
      console.log('Actual price is ' + actualPrice);


      if(actualPrice > (buyPrice + (buyPrice * high))){
        console.log('SELL High');
        let balanceRes = await balance(base);
        let insertB = await insertBalance(base , balanceRes.free)

        let sellRes = await sell(symbol, balanceRes.free, 'HIGH'); // put quote order quantity

        let balanceResQ = await balance(quote);
        let insertBQ = await insertBalance(quote , balanceResQ.free)
      }
      if(actualPrice < (buyPrice - (buyPrice * low ))){
        console.log('SELL low');

        let balanceRes = await balance(base);
        let insertB = await insertBalance(base , balanceRes.free)

        let sellRes = await sell(symbol, balanceRes.free , 'LOW'); // put quote quantity

        let balanceResQ = await balance(quote);
        let insertBQ = await insertBalance(quote , balanceResQ.free)
      }
    }

  }

  console.log(`


    `);
}


//)('adausdt', 'ADA', 'USDT', 1612010700000, 0.01, 0.01)

/*////////////////////////////////////////////////////////////////////////////////

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
