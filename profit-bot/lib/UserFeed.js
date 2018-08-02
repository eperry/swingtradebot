var Gdax       = require('gdax');
var colors     = require('colors');
var path       = require('path');
var sprintf        = require('sprintf')
var configfilename = path.basename(__filename);
var EventEmitter = require('events').EventEmitter;
var util = require('util');

/*********************************************************************
** 
** gdax - trading 
**
*********************************************************************/

UserFeed = function (gdaxconfig) {
	EventEmitter.call(this);
	this.orders       = []
	this.gdaxconfig   = gdaxconfig;
	this.authedClient = undefined
        this.wsUserFeed   = undefined
	
	this.balance	  = { }
	this.lastbalance  = { }
	this.balance[gdaxconfig.trade.buy_asset] =0
	this.balance[gdaxconfig.trade.sell_asset]=0
}

util.inherits(UserFeed, EventEmitter);

UserFeed.prototype.connect = function (){
	this.authedClient = new Gdax.AuthenticatedClient(
			this.gdaxconfig.key, 
			this.gdaxconfig.secret, 
			this.gdaxconfig.passphrase, 
			this.gdaxconfig.apiURI);
	if (typeof this.wsUserFeed !== 'undefined') this.wsUserFeed.removeAllListeners();
	this.wsUserFeed = new Gdax.WebsocketClient(
			[ this.gdaxconfig.trade.buy_asset+"-"+this.gdaxconfig.trade.sell_asset]
			,this.gdaxconfig.wsURI
			,  {
			    key: this.gdaxconfig.key,
			    secret: this.gdaxconfig.secret,
			    passphrase: this.gdaxconfig.passphrase
			  }
			,{ 'channels': ["user"]});
	this.emit("update", "Connecting") 
	this.wsUserFeed.on('message', (data) => { 
		var key = Object.keys(data)
                   for (i = 0; i < key.length;i++)
                        if ( ! isNaN(data[key[i]] ))  data[key[i]] = parseFloat(data[key[i]]);
		if ( data.type === 'heartbeat' ){
			//console.log(JSON.stringify(data))
		} else 
		if ( data.type === 'open'){
			this.emit("open",data)
		} else 
		if ( data.type === 'match'){
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
			let found = this.orders.find((o) => {
			  return o.id === data.taker_order_id;
			});
			if ( typeof found !== 'undefined' ) {
				orders = this.orders.filter((o) => {
					return o.id !== found.id
				})
				let s = "Match Found "+o.id+" === "+data.taker_order_id;
				this.emit("update",s)
			}
		}else
		if ( data.type === 'done' ){
			this.orders = this.orders.filter((o) => o.id !== data.order_id)
			this.emit(data.side,data)
		}
		if ( data.type === 'open' ){
	        // Data from feed
		/**********************************************************
		 { type: 'open',
		  side: 'sell',
		  price: 77,
		  order_id: 'eedf3655-7e7d-4c6a-90d2-92d10c6f9f4c',
		  remaining_size: 1.06119041,
		  product_id: 'LTC-USD',
		  sequence: 2326894913,
		  user_id: '599088a1aef8bb01138248f9',
		  profile_id: '431f183c-4714-4274-bb8a-3202d56678c2',
		  time: '2018-07-12T12:57:04.705000Z',
		  id: 'eedf3655-7e7d-4c6a-90d2-92d10c6f9f4c',
		  size: 1.06119041 }
		**********************************************************/
		// example getOrder Data
		/*****************************************************
		{ id: '391e91a5-38c5-40c6-99bf-93585b962f5e',
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
		    settled: false }
		******************************************************/
		// Add fields missing
		data.id = data.order_id
		data.size = data.remaining_size
		this.emit("update",sprintf("New order %s %s %s",data.id,data.price, data.size))
		this.orders.push(data)
		}
		
	});
	this.wsUserFeed.on('error', err => { this.emit("update",JSON.stringify(err)) });
	this.wsUserFeed.on('close', () => {  
			this.emit("update", "Websocket closed") 
			this.connect();
	});
	this.getOrders();
}

UserFeed.prototype.getOrders = function (){
	this.authedClient.getOrders((err, response, data)=>{
	for( i = 0; i < data.length; i++){
		keys = Object.keys(data[i]);
		for( j=0; j < keys.length; j++){
			k = keys[j]
			if ( ! isNaN(data[i][k] )){
				data[i][k] = parseFloat(data[i][k]);
			}
		}
	}
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
	    settled: false }
 	]
	******************************************************/
		if(err) {
			this.emit("update",err)
			return;
		}else{
			this.emit("update","Initalized Order list")
			//this.emit("update",JSON.stringify(data))
			this.orders=data
		}
	});
	}

module.exports = UserFeed
