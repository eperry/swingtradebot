var gdax = require('gdax');
var gdaxConfig = require('./gdax.config')
var direction=0;
//websocket = new gdax.WebsocketClient(['BTC-USD'],gdaxConfig.apiURI,null,{ 'channels':['level2']});
websocket = new gdax.WebsocketClient(['BTC-USD'],"wss://ws-feed.gdax.com",null,{ 'channels': ['level2']});
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
	/*****************************************
	{
	 "product_id": "BTC-USD",
	 "type": "snapshot",
	 "bids": [ [ "11453.46", "0.00847986" ]],
	 "asks": [ [ "11453.46", "0.00847986" ]]
	}
	****************************************/
	if ( data.type == 'snapshot' ){
		//console.log(JSON.stringify(data,null,1))
	}
	/*****************************************
	{
	  "type": "l2update",
	  "product_id": "BTC-USD",
	  "time": "2018-01-22T00:43:03.501Z",
	  "changes": [
	    [ "sell", "11570.28000000", "0" ]
	  ]
	}
	*********************************/
	if ( data.type == 'l2update' ){
		//console.log(JSON.stringify(data,null,1))
		if (data.changes[0][0] === 'buy' ){
				buy(data.changes[0]);
		}else{
				sell(data.changes[0]);
		}
			
	}
	/*
	if ( data.type == 'done' && data.reason != 'canceled'){
		console.log(JSON.stringify(data,null,1))
	}
	*/
	//console.log(JSON.stringify(data,null,2))
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

setInterval(function (){ 
	//process.stdout.write("__ETH-USD_____"+direction+"________\r")
	var askkeys = Object.keys(snapshots.asks).sort(( a,b) =>{
                return (a) - (b);
	});
	var bidkeys = Object.keys(snapshots.bids).sort((a,b) => {
                return (a) - (b);
	})
	bidkeys.forEach( (k) =>{
		console.log(k+": "+snapshots.bids[k]);
	})
	console.log("-------------------");
	askkeys.forEach( (k) =>{
		console.log(k+": "+snapshots.asks[k]);
	})
	console.log(snapshots.asks);
 },5000);

