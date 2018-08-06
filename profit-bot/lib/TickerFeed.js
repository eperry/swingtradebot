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

TickerFeed = function (gdaxconfig) {
	EventEmitter.call(this);
	this.gdaxconfig   = gdaxconfig;
	this.authedClient = undefined
        this.wsTickerFeed = undefined
	this.ticker       = { "last": {}, "current": {} }
}

util.inherits(TickerFeed, EventEmitter);

TickerFeed.prototype.connect = function (){
	this.authedClient = new Gdax.AuthenticatedClient(
			this.gdaxconfig.key, 
			this.gdaxconfig.secret, 
			this.gdaxconfig.passphrase, 
			this.gdaxconfig.apiURI);
        if (typeof this.wsUserFeed !== 'undefined') this.wsUserFeed.removeAllListeners();
	this.wsTickerFeed = new Gdax.WebsocketClient(
			[ this.gdaxconfig.trade.buy_asset+"-"+this.gdaxconfig.trade.sell_asset]
			,this.gdaxconfig.wsURI
			,  {
			    key: this.gdaxconfig.key,
			    secret: this.gdaxconfig.secret,
			    passphrase: this.gdaxconfig.passphrase
			  }
			,{ 'channels': ["ticker"]});
	this.wsTickerFeed.on('message', (data) => { 
		 var key = Object.keys(data)
                   for (i = 0; i < key.length;i++)
                        if ( ! isNaN(data[key[i]] ))  data[key[i]] = parseFloat(data[key[i]]);

		if ( data.type === 'ticker'){
			//console.log(JSON.stringify(data).yellow);
			this.ticker['last'] = this.ticker.current
			this.ticker['current'] = data
			this.emit("ticker",this.ticker)
		}
	});
	this.wsTickerFeed.on('error', err => { this.emit("message",JSON.stringify(err)) });
	this.wsTickerFeed.on('close', () => {  
		this.emit("message","TickerFeed Websocket closed") 
		this.connect()
	});
	
}

module.exports = TickerFeed
