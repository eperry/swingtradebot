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
	this.gdaxconfig   = gdaxconfig;
	this.authedClient = undefined
        this.wsUserFeed   = undefined
	
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
		} else {
			this.emit("audit",data)
			if ( data.type === 'match'){
				this.emit("match",data)
			}else
			if ( data.type === 'done' ){
				this.emit(data.side,data)
			}else
			if ( data.type === 'open' ){
				if ( typeof data.id === 'undefined' )   data.id   = data.order_id
				if ( typeof data.size === 'undefined' ) data.size = data.remaining_size
				this.emit("open",data)
			}
		}
		
	});
	this.wsUserFeed.on('error', err => { this.emit("update",JSON.stringify(err)) });
	this.wsUserFeed.on('close', () => {  
			this.emit("update", "Websocket closed") 
			this.connect();
	});
}

module.exports = UserFeed
