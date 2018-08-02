var gdax = require('gdax');
var gdaxConfig = require('../config/profit.js-v5.config')
var direction=0;
websocket = new gdax.WebsocketClient(['LTC-USD'],"wss://ws-feed.gdax.com",null,{ 'channels': ['user']});
websocket.on('message', data => { 
	/*
	if ( data.type == 'done' && data.reason != 'canceled'){
		console.log(JSON.stringify(data,null,1))
	}
	*/
	if ( data.type !== 'heartbeat' ){
		console.log(JSON.stringify(data,null,1))
	}
	/*
	if (data.size !== undefined && data.type === "match" ){
		console.log(JSON.stringify(data,null,1))
		
	}
	if (data.size !== undefined && data.type === "received" ){
		if (data.side === "buy" ){
			direction += parseFloat(data.size)
		}else{
			direction -= parseFloat(data.size)
		}
	}
	if (data.remaining_size !== undefined && data.type === "done" && data.reason === "canceled" ){
		if (data.side === "buy" ){
			direction -= parseInt(data.remaining_size)
		}else{
			direction += parseInt(data.remaining_size)
		}
	}
	*/
	//console.log(direction)

});
websocket.on('error', err => { /* handle error */ });
websocket.on('close', () => { /* ... */ });


