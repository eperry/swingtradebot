var gdax = require('gdax');
var gdaxConfig = require('../config/gdax.config')
var direction=0;
//websocket = new gdax.WebsocketClient(['LTC-USD'],gdaxConfig.apiURI,null,{ 'channels':['level2']});
websocket = new gdax.WebsocketClient(['LTC-USD'],"wss://ws-feed.gdax.com",null,{ 'channels': ['full']});
var snapshots = {
	asks: {},
	bids: {}	
};
function sell(data){
	data.shift();
	snapshots.asks[data[0]]=0;
	snapshots.asks[data[0]]+=parseFloat(data[1]);
	//console.log(data[0]+"="+snapshots.asks[data[0]]+"--"+data[1]);
}
function buy(data){
	data.shift();
	snapshots.bids[data[0]]=0;
	snapshots.bids[data[0]]+=parseFloat(data[1]);
}
websocket.on('message', data => { 
	/*
	if ( data.type == 'done' && data.reason != 'canceled'){
		console.log(JSON.stringify(data,null,1))
	}
	*/
	/*
	if ( data.type == 'done' ){
		console.log(JSON.stringify(data,null,1))
	}
	*/
	console.log(JSON.stringify(data,null,2))
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


