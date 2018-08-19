var timeInterval = 60*1000
var MA = require('moving-average');
var ma = MA(timeInterval)
var ma5 = MA(5*timeInterval)

setInterval(() => {
	console.log("---------------------------------------------------");
	console.log("Moving average   = ", ma.movingAverage()," 5 Moving average   =  ", ma5.movingAverage())
	console.log("Moving variance  = ", ma.variance()," 5 Moving variance  =  ", ma5.variance())
	console.log("Moving deviation = ", ma.deviation()," 5 Moving deviation =  ", ma5.deviation())
	console.log("Moving forecast  = ", ma.forecast()," 5 Moving forecast  =  ", ma5.forecast())
},timeInterval);
var gdax = require('gdax');
var gdaxConfig = require('./../config/gdax.config')
var direction=0;
websocket = new gdax.WebsocketClient(
				['LTC-USD'],
				"wss://ws-feed.gdax.com",
				null,
				{ 'channels': ['ticker']}
				);
websocket.on('message', data => { 
	if( data.type === 'ticker' ) { 
		ma.push( Date.now(), parseFloat(data.price))
		ma5.push( Date.now(), parseFloat(data.price))
	}
});
websocket.on('error', err => { /* handle error */ });
websocket.on('close', () => { /* ... */ });


