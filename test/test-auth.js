var Gdax = require('gdax');
var gdaxconfig = require('../config/gdax.config')
console.log(gdaxconfig);
const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);
console.log(authedClient)
authedClient.getAccounts((error,response,data)=>{
	if (error)	console.log(error)
	//console.log(response)
	console.log(data)

});
authedClient.getOrders( (error,response,data)=>{
	if (error)	console.log(error)
	//console.log(response)
	console.log(data)

});

