var Gdax = require('gdax');
var gdaxconfig = require('../config/gdax.config')
//console.log(gdaxconfig);
const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);
//console.log(authedClient)

new Promise(function(resolve, reject) {
	var value = 0;
	var size  = 0;
	authedClient.getAccounts( (err, response, data)=>{
		/**********************************************************************
		[{ id: '1d68bd74-655b-4627-a836-d336f6c80d5e',
		    currency: 'BTC',
		    balance: '0.0030974800000000',
		    available: '0.00309748',
		    hold: '0.0000000000000000',
		    profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e' } ]
		**********************************************************************/
		if(err) console.log(err.data);
		if(data){
			authedClient.getAccountTransfers(data.id, (error,response,data)=>{
				if (error)	console.log(error)
				console.log(data)
			})
			//console.log(data);
			data.forEach((d) =>{
				if ( d.currency === 'USD' ) value+=parseFloat(d.available)
				if ( d.currency === 'BTC' ) size +=parseFloat(d.available)
			})
			//console.log("ballance value = "+value+" ( "+size+" )")		
		}
	});
	resolve({ 'value': value, 'size': size })
}).then(function(result) { // (**)
	console.log("Total ",JSON.stringify(result))
})
