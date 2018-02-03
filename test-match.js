var Gdax = require('gdax');
var gdaxconfig = require('./gdax.config')

const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);

var truncate = function (number, places){
	var shift = Math.pow(10,places);
	return ((number * shift) | 0 ) / shift;
}

var match = [];
var marketorders = [];
var myorders = {}

setInterval(function(){
	authedClient.getOrders( (error,response,data)=>{
		if (error)	console.log(error)
		marketorders = data;
		})
},10000);
websocket = new Gdax.WebsocketClient(['BTC-USD'],"wss://ws-feed-public.sandbox.gdax.com",null,{ 'channels': ['user']});
websocket.on('message', (data) => {
	console.log(data.type)
        if (data.size !== undefined && data.type === "match" ){
                console.log(JSON.stringify(data,null,1))
                data.price = parseFloat(data.price);
                match[data.side] = data;
        }
});
websocket.on('error', err => { console.log(err) });
websocket.on('close', () => { /* ... */ });


setInterval(function(){
	marketorders.forEach((o) => {
		//console.log("getOrders foreach",o)
		console.log('-------------------------------------------');
		authedClient.getOrder(o.id, function(error, response, data) {
			if(error ){
				 console.log("Order Id not found ", o.id);
				 console.log("removing order from array", o.id);
				 oindex = marketorders.findIndex((order) => marketorders.id === o.id);
				 marketorders.splice(oindex,1)
				 return;
				 
			}
			if( data.status === 'done' ) {
				console.log("Order "+data.id+" Done reason: ",data.done_reason)
				 marketorders.splice(oindex,1)
			}
			/*****************************************	
			if( JSON.stringify(o) !== JSON.stringify(data) ) {
				console.log("Order foreach",o);	
				console.log("getOrder Callback",data);	
			}
			******************************************/
		});
	})
},1000);
	
