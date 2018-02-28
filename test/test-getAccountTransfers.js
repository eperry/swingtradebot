var Gdax = require('gdax');
var gdaxconfig = require('../config/gdax.config')
//console.log(gdaxconfig);
var authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);

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
		if(err) console.log(err);
		if(data){
			data.forEach((d) =>{
				console.log(d.id);
				authedClient.getAccountTransfers(d.id, (error,response,da)=>{
					if (error)	console.log(error)
					if (da){ da.forEach((t) => {
						/*
						{"id":"b80f6f7c-1dfb-420e-a978-93a7add0eaa1",
							"type":"deposit",
							"created_at":"2018-02-03 03:33:47.111733+00",
							"completed_at":"2018-02-03 03:33:47.124555+00",
							"canceled_at":null,
							"processed_at":"2018-02-03 03:33:47.124555+00",
							"user_nonce":null,
							"amount":"210000.00000000",
							"details":{"coinbase_account_id":"bcdd4c40-df40-5d76-810c-74aab722b223",
								"coinbase_transaction_id":"507f1f77bcf86cd799439011"
							}
						}
						*/
						if ( d.currency === 'USD' ){
							 value+=parseFloat(t.amount)
							 console.log(value,t)
						}
						if ( d.currency === 'BTC' ) size +=parseFloat(t.amount)
						//console.log(JSON.stringify(t))
					})
					//console.log("==="+JSON.stringify(da))
					}
				})
				//console.log(data);
				//if ( d.currency === 'USD' ) value+=parseFloat(d.available)
				//if ( d.currency === 'BTC' ) size +=parseFloat(d.available)
			})
			resolve({ 'value': value, 'size': size })
			//console.log("ballance value = "+value+" ( "+size+" )")		
		}
	});
}).then(function(result) { // (**)
	console.log("Total ",JSON.stringify(result))
})
