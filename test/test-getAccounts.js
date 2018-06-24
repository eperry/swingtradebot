var Gdax = require('gdax');
var gdaxconfig = require('../config/gdax.config')
//console.log(gdaxconfig);
const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);
var truncate = function (number, places){
	var shift = Math.pow(10,places);
	return ((number * shift) | 0 ) / shift;
}
var orders = [];
var myorders = {};
var ticker = {};


setInterval(function (){
	console.log('\033[2J');
	authedClient.getAccounts( (err, response, data)=>{
			/**********************************************************************
			[ { id: '4dce4a6d-62f4-4fef-a182-3b9d6d770745',
			    currency: 'USD',
			    balance: '727926.3580589406465000',
			    available: '722088.005462589328',
			    hold: '5838.3525963513185000',
			    profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e' },
			  { id: '77840118-fcee-48e8-8686-ec12d10b3b53',
			    currency: 'GBP',
			    balance: '0.0000000000000000',
			    available: '0',
			    hold: '0.0000000000000000',
			    profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e' },
			  { id: '36853c3b-b736-4875-85da-0ae4ea1a58c2',
			    currency: 'EUR',
			    balance: '0.0000000000000000',
			    available: '0',
			    hold: '0.0000000000000000',
			    profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e' },
			  { id: '1d68bd74-655b-4627-a836-d336f6c80d5e',
			    currency: 'BTC',
			    balance: '0.0030974800000000',
			    available: '0.00309748',
			    hold: '0.0000000000000000',
			    profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e' } ]
			**********************************************************************/
			if(err) console.log(err.data);
			if(data) console.log(data);
		});
},2000);
