var Gdax       = require('gdax');
var colors     = require('colors');
var path       = require('path');
var sprintf        = require('sprintf')
var configfilename = path.basename(__filename);
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var MA = require('moving-average');



/*********************************************************************
** 
** gdax - trading 
**
*********************************************************************/

MarketFeed = function (gdaxconfig) {
	EventEmitter.call(this);
	this.gdaxconfig   = gdaxconfig;
	this.authedClient = undefined
        this.wsMarketFeed   = undefined
	this.timeInterval = gdaxconfig.maTimeInterval * 60*1000
	this.movingAvg = {} 
	this.movingAvg.size  = MA(this.timeInterval)
	this.movingAvg.price = MA(this.timeInterval)
	this.movingAvg.size.push(0,0)
	this.movingAvg.price.push(0,0)
}

util.inherits(MarketFeed, EventEmitter);

MarketFeed.prototype.getMovingAvg = function(){
	return this.movingAvg
}

MarketFeed.prototype.connect = function (){
	this.authedClient = new Gdax.AuthenticatedClient(
			this.gdaxconfig.key, 
			this.gdaxconfig.secret, 
			this.gdaxconfig.passphrase, 
			this.gdaxconfig.apiURI);
	if (typeof this.wsMarketFeed !== 'undefined') this.wsMarketFeed.removeAllListeners();
	this.emit("message", "Connecting full feed") 
	this.wsMarketFeed = new Gdax.WebsocketClient(
			[ this.gdaxconfig.trade.buy_asset+"-"+this.gdaxconfig.trade.sell_asset]
			,this.gdaxconfig.wsURI
			,  {
			    key: this.gdaxconfig.key,
			    secret: this.gdaxconfig.secret,
			    passphrase: this.gdaxconfig.passphrase
			  }
			,{ 'channels': ["full"]});
	this.wsMarketFeed.on('message', (data) => { 
		var key = Object.keys(data)
                for (i = 0; i < key.length;i++)
                        if ( ! isNaN(data[key[i]] ))  data[key[i]] = parseFloat(data[key[i]]);
		if ( data.type === 'heartbeat' ){
			//console.log(JSON.stringify(data))
		} else {
			//this.emit("audit",data)
			if ( data.type === 'match'){
				/**********************************
				{
				    "side": "sell" "product_id": "BTC-USD",
				    "type": "match", "trade_id": 10, "sequence": 50,
				    "maker_order_id": "ac928c66-ca53-498f-9c13-a110027a60e8",
				    "taker_order_id": "132fb6ae-456b-4654-b4e0-d681ac05cea1",
				    "time": "2014-11-07T08:19:27.028459Z",
				    "size": "5.23512", "price": "400.23"
				}
				**********************************/
				//s =  parseFloat(data.size) 
				s =  data.side === "buy"? parseFloat(data.size) : parseFloat(data.size) * -1
				p =  data.price
				//this.emit("message", sprintf("%d  %f isNaN %s",Date.now(),s,!isNaN(s)));
				this.movingAvg.size.push    ( Date.now(), s )
				this.movingAvg.price.push   ( Date.now(), p )
				//this.emit("match",data)
			}
		}
		
	});
	this.wsMarketFeed.on('error', err => { this.emit("update",JSON.stringify(err)) });
	this.wsMarketFeed.on('close', () => {  
			this.emit("update", "Websocket closed") 
			this.connect();
	});
}

module.exports = MarketFeed
