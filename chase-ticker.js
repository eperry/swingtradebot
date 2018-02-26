var Gdax = require('gdax');
var colors = require('colors');
var gdaxconfig = require(__dirname+'/config/gdax.config')
var config = require(__dirname+'/config/Local.config')
var ticker = undefined;
var match = [] ;
var orders = { 'buy':{},'sell':{}};
var buyOffset  = .00
var sellOffset = .00


const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, 
						  gdaxconfig.secret, 
						  gdaxconfig.passphrase, 
						  gdaxconfig.apiURI);
var truncate = function (number, places){
	var shift = Math.pow(10,places);
	return ((number * shift) | 0 ) / shift;
}
authedClient.getOrders( (err, response, data)=>{
	if (data.type === 'error' ) {
		console.log(data)
	}
	data.forEach((o) =>{
		/*
		{ id: 'f0acb9e9-fb15-4cf2-a360-a962a30ccd46',
		  price: '448943.49000000',
		  size: '0.10000000',
		  product_id: 'BTC-USD',
		  side: 'buy',
		  type: 'limit',
		  time_in_force: 'GTC',
		  post_only: false,
		  created_at: '2018-02-25T14:35:41.309182Z',
		  fill_fees: '0.0000000000000000',
		  filled_size: '0.07101973',
		  executed_value: '31883.8454450577000000',
		  status: 'open',
		  settled: false }
		*/
		//console.log(o)
		orders[o.side][o.id] = o;
	})
})
// For pagination, you can include extra page arguments
// Get all orders of 'open' status

//websocket = new gdax.WebsocketClient(['BTC-USD'],gdaxConfig.apiURI,null,{ 'channels':['level2']});
websocket = new Gdax.WebsocketClient(['BTC-USD'],
				"wss://ws-feed-public.sandbox.gdax.com",
				null,
				{ 'channels': ['ticker','full']});
websocket.on('message', (data) => { 
	if (data.type === 'error' ) {
		console.log(data)
	}
	if ( data.type === 'ticker' ){
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
		//console.log(JSON.stringify(data,null,1))
		Object.keys(data).forEach((k) => {
			if ( ! isNaN(data[k] ))  data[k] = parseFloat(data[k]);
		})
		ticker = data;
		var b = Object.keys(orders.buy);
		var s = Object.keys(orders.sell);
		if ( b.length == 0 ) buy(buyOffset);
		if ( s.length == 0 ) sell(sellOffset);
		process.stdout.write("\rOrders in memory buy "+b.length+" sell "+s.length)
	}
	if ( data.type === 'open' ){
		/*
		{
		  "type": "open",
		  "side": "sell",
		  "price": "9441.45000000",
		  "order_id": "01a866ff-ec58-41bd-8c33-e44129e19c49",
		  "remaining_size": "0.20000000",
		  "product_id": "BTC-USD",
		  "sequence": 5237195946,
		  "time": "2018-02-25T16:57:39.118000Z"
		}
		*/
		if ( data.side === 'buy' ){
			if ( data.price > ticker.best_bid && data.price < ticker.best_ask){
				console.log("found",data)
			}
		}
	}
	if ( data.type === 'done' ){
		//console.log(data)
		if ( orders[data.side][data.order_id] !== undefined ) {
			delete (orders[data.side][data.order_id])
			var o = Object.keys(orders[data.side]);
			if ( o.length == 0 && data.side === 'buy' ) buy(buyOffset);
			if ( o.length == 0 && data.side === 'sell' ) sell(sellOffset);
		}
	}
	if ( data.type === 'match' ){
		/*************************************************
		{
		 "type": "match",
		 "trade_id": 636368,
		 "maker_order_id": "e237461b-2d9f-4e98-a713-0452d25cf9c0",
		 "taker_order_id": "6f4ed67a-1c34-45dd-9fa1-759e0c0239b6",
		 "side": "buy",
		 "size": "0.07800000",
		 "price": "8950.12000000",
		 "product_id": "BTC-USD",
		 "sequence": 4794861,
		 "time": "2018-02-04T02:07:12.565000Z"
		}
		**************************************************/
		//console.log(JSON.stringify(data,null,1))
		Object.keys(data).forEach((k) => {
			if ( ! isNaN(data[k] ))  data[k] = parseFloat(data[k]);
		})
		if ( orders[data.side][data.taker_order_id] !== undefined){
			console.log("Match Taker",orders[data.side][data.taker_order_id], data );
			process.exit(0);
		}
		if ( orders[data.side][data.maker_order_id] !== undefined){
			console.log("Match Maker",orders[data.side][data.maker_order_id], data );
			process.exit(0);
		}
		//match.push(data);
	}
});
websocket.on('error', err => { console.log(err) });
websocket.on('close', () => { console.log("Closed") });
function buy(offset=0.00) { 
	console.log("trying to buy");
	if (ticker === undefined ) return 

		const buyParams = {
		  price: ticker.best_bid+offset,
		  size: .1,
		  product_id: 'BTC-USD',
		  post_only: false,
		};
		authedClient.buy(buyParams, (err, response, data)=>{
			if(err) console.log("buy error",err.data);
			//if(data) console.log("buy data",data);
			if (data) {
				Object.keys(data).forEach((k) => process.stdout.write(data[k].toString().blue+"   "))
				console.log("");
				Object.keys(data).forEach((k) => {
					if ( ! isNaN(data[k] ))  data[k] = parseFloat(data[k]);
				})
				orders['buy'][data.id]=data
			}
		});
	}
function sell(offset = 0.00 ) { 
	console.log("trying to sell");
	if (ticker === undefined ) return 

		const sellParams = {
		  price: ticker.best_ask-offset,
		  size: .1,
		  product_id: 'BTC-USD',
		  post_only: false,
		};
		authedClient.sell(sellParams, (err, response, data)=>{
			if(err) console.log("sell error",err.data);
			//if(data) console.log("buy data",data);
			if (data) {
				Object.keys(data).forEach((k) => process.stdout.write(data[k].toString().red+"   "))
				console.log("");
				Object.keys(data).forEach((k) => {
					if ( ! isNaN(data[k] ))  data[k] = parseFloat(data[k]);
				})
				orders['sell'][data.id]=data
			}
		});
	}
function checkOrder(id,side){
	authedClient.getOrder(id, (err, response,data) =>{
		if(err) console.log(err)
		if(data.message && data.message === 'Invalid order id') delete(orders[side][id])
	})
}
setInterval(() => {
	//console.log("orders",orders);
	var b = Object.keys(orders.buy);
	var s = Object.keys(orders.sell);
	//console.log("orders",o.length);
	if ( b.length == 0 ) buy(buyOffset);
	if ( s.length == 0 ) sell(sellOffset);
	if ( ticker && (
             ticker.best_ask !== undefined && 
	     ticker.best_bid !== undefined )
	     ){
		diff=( ticker.best_ask - ticker.best_bid )
		buyOffset = truncate(diff/2,2);
	}else{
		diff=0;
	}
	process.stdout.write("\rOrders buy "+b.length+" sell "+s.length+" "+ buyOffset )	

},1000);
setInterval(() => {
	/* ORDER Validator */
	//console.log("orders",orders);
	//console.log("orders",o.length);
	["buy","sell"].forEach((s)=>{
		Object.keys(orders[s]).forEach((v) => {
			checkOrder(v,s)
		})
	})
},60000);
