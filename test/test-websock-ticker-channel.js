var gdax = require('gdax');
var gdaxConfig = require('./gdax.config')
var direction=0;
//websocket = new gdax.WebsocketClient(['BTC-USD'],gdaxConfig.apiURI,null,{ 'channels':['level2']});
websocket = new gdax.WebsocketClient(['BTC-USD'],"wss://ws-feed-public.sandbox.gdax.com",null,{ 'channels': ['ticker']});
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
		if( data.type !== 'heartbeat' ) console.log(JSON.stringify(data,null,1))
});
websocket.on('error', err => { /* handle error */ });
websocket.on('close', () => { /* ... */ });


