var Gdax = require('gdax');
var gdaxconfig = require('../config/gdax.config')

const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);

var truncate = function (number, places){
	var shift = Math.pow(10,places);
	return ((number * shift) | 0 ) / shift;
}

var match = [];
var marketorders = [];
var myorders = {}

websocket = new Gdax.WebsocketClient(['BTC-USD'],"wss://ws-feed-public.sandbox.gdax.com",null,{ 'channels': ['heartbeat']});
websocket.on('message', (data) => {
        if ( data.type === "heartbeat" ){
                console.log(JSON.stringify(data,null,1))
        }
});
websocket.on('error', err => { console.log(err) });
websocket.on('close', () => { /* ... */ });


	
