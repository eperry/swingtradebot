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
//websocket = new gdax.WebsocketClient(['BTC-USD'],gdaxConfig.apiURI,null,{ 'channels':['level2']});
websocket = new Gdax.WebsocketClient(['BTC-USD'],
				"wss://ws-feed-public.sandbox.gdax.com",
				null,
				{ 'channels': ['ticker','full']});
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
	if (data.type === 'error' ) {
		console.log(data)
	}
	if ( data.type === 'ticker' ){
		//console.log(JSON.stringify(data,null,1))
		Object.keys(data).forEach((k) => {
			if ( ! isNaN(data[k] ))  data[k] = parseFloat(data[k]);
		})
		ticker = data;
		console.log("Canceling all open orders on new ticker"); 
                authedClient.cancelAllOrders({ product_id: 'BTC-USD' }, (err, response, data)=>{
			if(err) console.log(err)
			//if(data) console.log(data)
			data.forEach((d) =>{
				console.log(d)
				if ( orders.sell[d] !== undefined ) delete(orders.sell[d])
				if ( orders.buy[d]  !== undefined ) delete(orders.buy[d])
			})
		});
		//console.log("orders",orders);
		var b = Object.keys(orders.buy);
		var s = Object.keys(orders.sell);
		//console.log("orders",o.length);
		if ( b.length == 0 ) buy(buyOffset);
		if ( s.length == 0 ) sell(sellOffset);
		process.stdout.write("\rOrders buy "+b.length+" sell "+s.length)
		//Object.keys(orders).forEach((o) => { 
			//console.log(o); 
			//authedClient.cancelOrders()
		//})
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
			console.log(orders[data.side][data.taker_order_id], data.id );
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
setInterval(() => {
	//console.log("orders",orders);
	var b = Object.keys(orders.buy);
	var s = Object.keys(orders.sell);
	//console.log("orders",o.length);
	if ( b.length == 0 ) buy(buyOffset);
	if ( s.length == 0 ) sell(sellOffset);
	if (ticker.best_ask !== undefined && ticker.best_bid !== undefined ){
		diff=( ticker.best_ask - ticker.best_bid )
		buyOffset = truncate(diff/2,2);
	}else{
		diff=0;
	}
	process.stdout.write("\rOrders buy "+b.length+" sell "+s.length+" "+ buyOffset )	

},1000);
