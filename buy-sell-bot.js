var blessed = require('blessed')
var display = require('./lib/display')

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
	windows.main.pushLine(line)
	screen.render();
}

/*********************************************************************
** 
** gdax - trading 
**
*********************************************************************/
var Gdax = require('gdax');
var colors = require('colors');
var gdaxconfig = require(__dirname+'/config/gdax.config')
var config = require(__dirname+'/config/Local.config')

const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);
var truncate = function (number, places){
	var shift = Math.pow(10,places);
	return ((number * shift) | 0 ) / shift;
}
var orders = [];
var myorders = {};
var ticker = {};
var accounts = [];
var balance = {};
var startBalance = undefined;

function calcBalance(){
	if ( accounts.USD === undefined ||  accounts.BTC === undefined ) return
	var buy_usd=0;
	var sell_usd=0;
	var coin_count = 0;
	if ( orders.length >0 ) coin_count = orders.reduce((count,order) => count+(order.size - order.filled_size),0) 		
	// ******************* 
	// COIN Ballance
	balance = {
		coins:   parseFloat(accounts['BTC'].available),
		dollars: truncate( parseFloat(accounts['USD'].available),2),
		best_ask: truncate( parseFloat(ticker.best_ask),2)
	}
	if ( startBalance === undefined ) startBalance = balance
	windows.righttop.setContent("");
	windows.righttop.pushLine("Balance")	
	 windows.righttop.pushLine("USD Available:   "+ balance.dollars
			+ " / "
			+ truncate( balance.dollars / ticker.best_ask ,2))
	 windows.righttop.pushLine("BTC Available:   "+ balance.coins 
			+ " / $"+ truncate( balance.coins * ticker.best_ask,2))
	 windows.righttop.pushLine("Ticker Best_Bid: "+ balance.best_ask)
	 windows.righttop.pushLine( "------------------------------")
	 windows.righttop.pushLine( "coins: "+ (balance.coins - startBalance.coins))
         windows.righttop.pushLine( "dollars:"+ (balance.dollars - startBalance.dollars))
	windows.rightbottom.setContent("");
	Object.keys(ticker).forEach((key) => {
		 windows.rightbottom.pushLine(key+": "+ticker[key])
	})
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
                        if(data)  {
				data.forEach((a) => {
					accounts[a.currency] = a;
				})
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
//websocket = new gdax.WebsocketClient(['BTC-USD'],gdaxConfig.apiURI,null,{ 'channels':['level2']});
websocket = new Gdax.WebsocketClient(['BTC-USD'],"wss://ws-feed-public.sandbox.gdax.com",null,{ 'channels': ['user','ticker']});
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
		ticker = data;
	}
});
websocket.on('error', err => { console.log(err) });
websocket.on('close', () => { /* ... */ });
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
			console.log(JSON.stringify(data));
		}
		//console.log('=======================================');
		//if(response) console.log(response);
		//console.log('=======================================');
	});
	updateAccount();
	calcBalance();
},1000);
/*******************************************
Trade
********************************************/
setInterval(function (){
	/*
	config
	{
	  "SLACK_URL": "https://hooks.slack.com/services/xxxx/xxxx/xxxx",
	  "default_buy_quanity": .01,
	  "default_ask_quanity": .01,
	  "total_open_order_buy": 1,
	  "total_open_order_ask": 1,
	  "buy_sell_max_spread": 1,
	  "max_buy_usd": 1000,
	  "max_sell_usd": 800,
	  "best_bid_modification": -0.20,
	  "best_ask_modification": 0.20,
	}
	*/
	var b = orders.filter( element => element.side === 'buy')
	//console.log("buy",  JSON.stringify(b,null,2) )
	spread = (ticker.best_ask - ticker.best_bid)
	if (  ticker.best_bid !== undefined && b.length < config.total_open_order_buy  ){
		bbm = config.best_bid_modification;
		p = truncate(ticker.best_bid + bbm ,2);
		q = config.default_buy_quanity;
		if ( accounts['USD'].available - p < 0 ) { console.log("out of cash"); return;}
		const buyParams = {
		  price: p,
		  size: q,
		  product_id: 'BTC-USD',
		  post_only: false,
		};
		authedClient.buy(buyParams, (err, response, data)=>{
			if(err) console.log("buy error",err.data);
			//if(data) console.log("buy data",data);
			if (data) {
				var line ="";
				Object.keys(data).forEach((k) => line+=data[k].blue+"   ")
				console.log(line);
			}
			updateAccount()
			//if(response) console.log(response);
		});
	}
	var s = orders.filter( (element) => element.side === 'sell' )
	//console.log("sell",JSON.stringify(s,null,2) )
	if ( ticker.best_ask !== undefined && s.length < config.total_open_order_ask   ){
		//console.log(config);
		bam = config.best_ask_modification;
		p = truncate(ticker.best_ask + bam ,2);
		q = config.default_ask_quanity;
		if ( accounts['BTC'].available - q < 0 ) { console.log(" out of BTC"); return;}
		const sellParams = {
		  price: p,
		  size:  q,
		  product_id: 'BTC-USD',
		  post_only: false,
		};
		//console.log(sellParams);
		//console.log('---------------------------------------');
		authedClient.sell(sellParams, (err, response, data)=>{
			if(err) console.log("sell error",err.data);
			//if(data) console.log('sell data',data);
			if (data) {
				var line ="";
				Object.keys(data).forEach((k) => line+=data[k].blue+"   ")
				console.log(line);
			}
			updateAccount()
			//if(response) console.log(response);
		});
	}
},2000);
