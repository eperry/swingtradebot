var fs         = require('fs')
var blessed    = require('blessed')
var display    = require('./lib/display')
var trades     = require('./lib/trades')
var acct       = require('./lib/account');
var Gdax       = require('gdax');
var colors     = require('colors');
var path       = require('path');
var config-filename = path.basename(__filename);
var gdaxconfig = require(__dirname+'/config/'+config-filename+'.config')
var config     = require(__dirname+'/config/Local.config')


var buyTrades  = new trades('buy')
var sellTrades = new trades('sell')
var account    = new acct('all');

var dryrun = false;

var screen = blessed.screen({
  smartCSR: false,
  fastCSR: true,
  replaceScreenOnNewData: true
});

screen.title = 'my window title';

var windows = display(screen)
// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.render();
console.log = function(line){
	if ( line !== undefined ) windows.main.pushLine(line)
	screen.render();
}

/*********************************************************************
** 
** gdax - trading 
**
*********************************************************************/

const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);
var truncate = function (number, places){
	var shift = Math.pow(10,places);
	return ((number * shift) | 0 ) / shift;
}

function calcBalance(){
	windows.righttop.setContent(JSON.stringify(buyTrades,null,1));
	windows.rightbottom.setContent(JSON.stringify(buyTrades,null,1));
}

function updateAccount(){
        authedClient.getAccounts( (err, response, data)=>{
                        /**********************************************************************
                        [ { id: '4dce4a6d-62f4-4fef-a182-3b9d6d770745',
                            currency: 'USD',
                            balance: '727926.3580589406465000',
                            available: '722088.005462589328',
                            hold: '5838.3525963513185000',
                            profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e' },
                          { id: '77840118-fcee-48e8-8686-ec12d10b3b53',
                            currency: 'GBP',
                            balance: '0.0000000000000000',
                            available: '0',
                            hold: '0.0000000000000000',
                            profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e' },
                          { id: '36853c3b-b736-4875-85da-0ae4ea1a58c2',
                            currency: 'EUR',
                            balance: '0.0000000000000000',
                            available: '0',
                            hold: '0.0000000000000000',
                            profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e' },
                          { id: '1d68bd74-655b-4627-a836-d336f6c80d5e',
                            currency: 'BTC',
                            balance: '0.0030974800000000',
                            available: '0.00309748',
                            hold: '0.0000000000000000',
                            profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e' } ]
                        **********************************************************************/
                        if(err) console.log(err.data);
                        if(data) {
				account.updateAccount(data)
			}
                });
}

/*
authedClient.getAccounts((error,response,data)=>{
	if (error)	console.log(error)
	//console.log(response)
	console.log(data)

});
authedClient.getOrders( (error,response,data)=>{
	if (error)	console.log(error)
	//console.log(response)
	console.log(data)

});
*/
//websocket = new gdax.WebsocketClient([config.trade.buy_asset+"-"+config.trade.sell_asset],gdaxConfig.apiURI,null,{ 'channels':['level2']});
var asset_pair = config.trade.buy_asset+"-"+config.trade.sell_asset;
websocket = new Gdax.WebsocketClient([asset_pair]
			,"wss://ws-feed-public.sandbox.gdax.com"
			,null
			,{ 'channels': ['ticker','matches']});
websocket.on('message', (data) => { 
	/**********************************************************
	{
	 "type": "ticker",
	 "sequence": 4648744,
	 "product_id": "BTC-USD",
	 "price": "9195.00000000",
	 "open_24h": "8551.43000000",
	 "volume_24h": "2865.39119759",
	 "low_24h": "9195.00000000",
	 "high_24h": "11079.85000000",
	 "volume_30d": "447403.60225555",
	 "best_bid": "9195",
	 "best_ask": "9220",
	 "side": "sell",
	 "time": "2018-02-03T18:27:35.839000Z",
	 "trade_id": 632289,
	 "last_size": "1.00000000"
	}
	**********************************************/
	if ( data.type === 'ticker' ){
		//console.log(JSON.stringify(data,null,1))
		Object.keys(data).forEach((k) => {
			if ( ! isNaN(data[k] ))  data[k] = parseFloat(data[k]);
		})
		 buyTrades.setTickerPrice ( data.best_ask );
		sellTrades.setTickerPrice ( data.best_bid );
		ticker = data;
	}
        if ( data.type == 'match'
          ){
                /***************************
                {
                 "type": "match",
                 "trade_id": 26710410,
                 "maker_order_id": "46109fbc-cdde-4145-9e0f-9812119491c1",
                 "taker_order_id": "d14fcc6d-82a9-4d27-a964-0990440662ae",
                 "side": "sell",
                 "size": "0.72500000",
                 "price": "1067.30000000",
                 "product_id": "ETH-USD",
                 "sequence": 2114249390,
                 "time": "2018-01-20T03:18:36.087000Z"
                }
                ****************************/
		
        } // end match if
  	if (  data.type === "done"
           && data.reason === "filled"
           ){
		var b = orders.filter( element => ( element.id === data.id ))
		console.log(b)
        }


});
websocket.on('error', err => { console.log(err) });
websocket.on('close', () => {  console.log("Websocket closed") });
/********************************
Update Orders and Update Account funds
*********************************/
setInterval(function (){
	authedClient.getOrders((err, response, data)=>{
		/*****************************************************
		[ { id: '391e91a5-38c5-40c6-99bf-93585b962f5e',
		    price: '8580.12000000',
		    size: '1.00000000',
		    product_id: 'BTC-USD',
		    side: 'sell',
		    stp: 'dc',
		    type: 'limit',
		    time_in_force: 'GTC',
		    post_only: false,
		    created_at: '2018-02-03T01:28:12.726038Z',
		    fill_fees: '0.0000000000000000',
		    filled_size: '0.00000000',
		    executed_value: '0.0000000000000000',
		    status: 'open',
		    settled: false },
		  { id: 'd231ef65-482e-4554-8ad6-56c5542b9aa0',
		    price: '8559.89000000',
		    size: '1.00000000',
		    product_id: 'BTC-USD',
		    side: 'buy',
		    stp: 'dc',
		    type: 'limit',
		    time_in_force: 'GTC',
		    post_only: false,
		    created_at: '2018-02-03T01:28:12.692335Z',
		    fill_fees: '0.0000000000000000',
		    filled_size: '0.00000000',
		    executed_value: '0.0000000000000000',
		    status: 'open',
		    settled: false },
    		]
		******************************************************/
		if(err) {
			console.log(err);
			return;
		}else{
			orders = data;
			//console.log(JSON.stringify(data));
			//console.log(JSON.stringify(response));
			/*
			fs.writeFile('my.log', JSON.stringify(response), (err) => {  
			    if (err) throw err;
			});
			*/
		}
		//console.log('=======================================');
		//if(response) console.log(response);
		//console.log('=======================================');
	});
	updateAccount();
	calcBalance();
},1000);
