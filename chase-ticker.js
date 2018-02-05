var Gdax = require('gdax');
var colors = require('colors');
var gdaxconfig = require(__dirname+'/config/gdax.config')
var config = require(__dirname+'/config/Local.config')
var ticker = undefined;
var match = [] ;
var orders = {};
//console.log(gdaxconfig);
const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);
var truncate = function (number, places){
	var shift = Math.pow(10,places);
	return ((number * shift) | 0 ) / shift;
}
//websocket = new gdax.WebsocketClient(['BTC-USD'],gdaxConfig.apiURI,null,{ 'channels':['level2']});
websocket = new Gdax.WebsocketClient(['BTC-USD'],"wss://ws-feed-public.sandbox.gdax.com",null,{ 'channels': ['ticker','full']});
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
		Object.keys(orders).forEach((o) => { 
			console.log(o); 
			authedClient.cancelOrder(o.id,(error,response,data) => {
				if (err) return
				console.log(data)
			}) 
		})
	}
	if ( data.type === 'done' ){
		if ( orders[data.id] !== undefined ) {
			delete (orders[data.id])
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
		if ( orders[data.taker_order_id] !== undefined){
			console.log(orders[data.taker_order_id], data.id );
			process.exit(0);
		}
		//match.push(data);
	}
});
websocket.on('error', err => { console.log(err) });
websocket.on('close', () => { console.log("Closed") });
function buy() { 
	console.log("trying to buy");
	if (ticker === undefined ) return 

		const buyParams = {
		  price: ticker.best_bid,
		  size: .1,
		  product_id: 'BTC-USD',
		  post_only: false,
		};
		authedClient.buy(buyParams, (err, response, data)=>{
			if(err) console.log("buy error",err.data);
			//if(data) console.log("buy data",data);
			if (data) {
				Object.keys(data).forEach((k) => process.stdout.write(data[k].blue+"   "))
				console.log("");
				Object.keys(data).forEach((k) => {
					if ( ! isNaN(data[k] ))  data[k] = parseFloat(data[k]);
				})
				orders[data.id]=data
			}
		});
	}

setInterval(()=> {
	//console.log("orders",orders);
	if ( Object.keys(orders).length == 0 ) buy();
},1000)
