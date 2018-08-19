var Gdax = require('gdax');
var sprintf = require('sprintf')
var color = require('colors')
var gdaxconfig = require('../config/profit.js.config')
var size = 0
var price = 0
var value = 0
const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);
function getFills( before ){
	p =  { product_id: "LTC-USD"}
	if ( before >0  ) p.before = before
	//console.log(p)
	authedClient.getFills(p ,(error,response,data)=>{
		if (error) console.log(error)
		if (data) {
			//console.log(data)
			data.forEach((d) => {
				o = sprintf("%s %s %s",d.side,d.price,d.size)
				if ( d.side === 'buy' ){
					o = o.red
					size += parseFloat(d.size)
					value += parseFloat(d.size) * parseFloat(d.price)
				} else {
					o = o.blue
					size -= parseFloat(d.size)
					value -= parseFloat(d.size) * parseFloat(d.price)
				}
				price = ( price + parseFloat(d.price) ) / 2
				console.log( o , sprintf(" price %f size %f value %f",price, size,value))
			})
			after = response.headers['cb-after'];
			//console.log(after)
			//console.log(response.headers)
			if ( typeof after !== 'undefined' ) getFills(after)
			else console.log( sprintf("price %f size %f",price, size))
		}
	});
}
getFills(1);
