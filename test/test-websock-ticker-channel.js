var gdax = require('gdax');
var gdaxConfig = require('./../config/gdax.config')
var direction=0;
//websocket = new gdax.WebsocketClient(['BTC-USD'],gdaxConfig.apiURI,null,{ 'channels':['level2']});
//websocket = new gdax.WebsocketClient(['BTC-USD'],"wss://ws-feed-public.sandbox.gdax.com",null,{ 'channels': ['ticker']});
websocket = new gdax.WebsocketClient(
				['BTC-USD'],
				"wss://ws-feed.gdax.com",
				null,
				{ 'channels': ['ticker']}
				);
websocket.on('message', data => { 
	if( data.type !== 'heartbeat' ) console.log(JSON.stringify(data,null,1))
});
websocket.on('error', err => { /* handle error */ });
websocket.on('close', () => { /* ... */ });


