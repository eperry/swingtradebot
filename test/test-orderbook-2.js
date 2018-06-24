var Gdax = require('gdax');
var gdaxConfig = require('./gdax.config')
var publicClient = new Gdax.PublicClient(gdaxConfig.apiURI);
var count=0
publicClient.getProductOrderBook('BTC-USD',{ level:3 },(error,reponse,data) => {
	console.log(data)
})
