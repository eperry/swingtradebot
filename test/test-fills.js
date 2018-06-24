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
			//console.log(data);
			data.forEach((d) =>{
				if ( d.currency === 'USD' ) value+=parseFloat(d.available)
				if ( d.currency === 'BTC' ) size +=parseFloat(d.available)
			})
			//console.log("ballance value = "+value+" ( "+size+" )")		
		}
	});
	authedClient.getFills((error,response,data)=>{
		if (error)	console.log(error)
		//console.log(data)
		/*
		 { created_at: '2018-02-05T13:38:51.275Z',
		    trade_id: 652849,
		    product_id: 'BTC-USD',
		    order_id: 'a7f4253d-f0c4-4e98-9e40-663f08aaa08a',
		    user_id: '599088a1aef8bb01138248f9',
		    profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e',
		    liquidity: 'M',
		    price: '8902.99000000',
		    size: '0.86600000',
		    fee: '0.0000000000000000',
		    side: 'buy',
		    settled: true,
		    usd_volume: '7709.9893400000000000' },
		  { created_at: '2018-02-05T13:37:22.368Z',
		    trade_id: 652848,
		    product_id: 'BTC-USD',
		    order_id: 'fb413c17-853d-4438-bf2c-ebdf05ae345c',
		    user_id: '599088a1aef8bb01138248f9',
		    profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e',
		    liquidity: 'M',
		    price: '10001.19000000',
		    size: '0.97292854',
		    fee: '0.0000000000000000',
		    side: 'sell',
		    settled: true,
		    usd_volume: '9730.4431849626000000' },
		*/
		data.forEach((d) => {
			if ( d.side === 'buy' ){
				size  += ( parseFloat(d.size) )
				value += ( d.price*d.size )
			} else {
				size  -= ( parseFloat(d.size) )
				value -= ( d.price*d.size )
			}
			console.log(d.created_at+ " "+d.side+" Price "+d.price+" * "+d.size+" = "+(d.price*d.size) +" v="+value+" ( "+size+" )")		
		})
		resolve({ 'value': value, 'size': size })
	});
}).then(function(result) { // (**)
	console.log("Total ",JSON.stringify(result))
})

