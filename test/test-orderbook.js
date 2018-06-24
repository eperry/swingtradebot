var Gdax = require('gdax');
var gdaxConfig = require('../config/gdax.config')
const orderbookSync = new Gdax.OrderbookSync(['BTC-USD'],gdaxConfig.apiURI);
var ob = orderbookSync.books["BTC-USD"].state();
var count=0
setInterval(function (){ 
	console.log("--------------"+count++)
	//console.log (ob);
	var summary = {};
	var c=0;
	console.log(orderbookSync.book)
	//orderbookSync.books['BTC-USD']._bids.each(o => { console.log(JSON.stringify(o))} );

	//var ob = orderbookSync.books["BTC-USD"].state();
	/*
	ob._bids.forEach((data) => {
		c++;	
		if ( summary[data.price] === undefined ) summary[data.price]=0.0;
		summary[data.price]+=parseFloat(data.size);
	})
	console.log(c);
	console.log(JSON.stringify(summary,null,1));	
	*/
	process.exit(1)
	/*var obasks = ob.bids.sort(( a , b ) =>{
		return a.price + b.price;
	})
	for( i = 0; i < obasks.length; i++){
		console.log(JSON.stringify(obasks[i],null,1));	
	}
	*/
	
},10000)
