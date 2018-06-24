var Gdax = require('gdax');
var gdaxconfig = require('./gdax.config')
//console.log(gdaxconfig);
const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);
var truncate = function (number, places){
	var shift = Math.pow(10,places);
	return ((number * shift) | 0 ) / shift;
}
var orders = [];
var myorders = {};
var ticker = {};
var accounts = [];
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
		}
		orders = data;
		//console.log('=======================================');
		//if(data) console.log(data);
		//if(response) console.log(response);
		//console.log('=======================================');
	});
	updateAccount();
},1000);
setInterval(function (){
	/*****************************************************
	console.log('---------------------------------------');
	console.log(orders);
	console.log('---------------------------------------');
	******************************************************/
	var b = orders.filter( element => element.side === 'buy')
	//console.log("buy",  JSON.stringify(b,null,2) )
	if (  ticker.best_bid !== undefined && b.length == 0 ){
		p = truncate(ticker.best_bid - 0.20,2);
		if ( accounts['USD'].available - p < 0 ) { console.log("out of cash"); return;}
		const buyParams = {
		  price: truncate(ticker.best_bid - 0.20,2),
		  size: '1', // BTC
		  product_id: 'BTC-USD',
		};
		//console.log('---------------------------------------');
		//console.log("buy",buyParams,match.buy.price);
		//console.log('---------------------------------------');
		authedClient.buy(buyParams, (err, response, data)=>{
			if(err) console.log("buy error",err.data);
			if(data) console.log("buy data",data);
			updateAccount()
			//if(response) console.log(response);
		});
	}
	var s = orders.filter( (element) => element.side === 'sell' )
	//console.log("sell",JSON.stringify(s,null,2) )
	if ( ticker.best_ask !== undefined && s.length == 0 ){
		q = 1;
		if ( accounts['BTC'].available - q < 0 ) { console.log(" out of BTC"); return;}
		const sellParams = {
		  price: truncate(ticker.best_ask + 0.20,2),
		  size: q,
		  product_id: 'BTC-USD',
		};
		//console.log('---------------------------------------');
		//console.log(sellParams,match.sell.price);
		//console.log("sell",sellParams,match.sell.price);
		//console.log('---------------------------------------');
		authedClient.sell(sellParams, (err, response, data)=>{
			if(err) console.log("sell error",err.data);
			if(data) console.log('sell data',data);
			updateAccount()
			//if(response) console.log(response);
		});
	}
},2000);
