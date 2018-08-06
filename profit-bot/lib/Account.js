var Gdax       = require('gdax');
var colors     = require('colors');
var path       = require('path');
var sprintf        = require('sprintf')
var configfilename = path.basename(__filename);
var EventEmitter   = require('events').EventEmitter;
var util 	   = require('util');

/*********************************************************************
** 
** gdax - trading 
**
*********************************************************************/

Account = function (gdaxconfig) {
        EventEmitter.call(this);
        this.accounts     = {}
        this.gdaxconfig   = gdaxconfig;
        this.authedClient = undefined
}

util.inherits(Account, EventEmitter);

Account.prototype.connect = function (){
	this.authedClient = new Gdax.AuthenticatedClient(
		this.gdaxconfig.key,
		this.gdaxconfig.secret,
		this.gdaxconfig.passphrase,
		this.gdaxconfig.apiURI,
	        this.orders       = []

		);
	this.getAccount()
}
Account.prototype.getAccount = function (){
	this.getOrders();
	this.authedClient.getAccounts( ( err, resp, data ) =>{
	if(err){
	 	this.emit("error",sprintf("Account update error: "+err));
		return;
	}
	for (j = 0; j < data.length; j++){
		var key = Object.keys(data[j])
		for (i = 0; i < key.length;i++)
			if ( ! isNaN(data[j][key[i]] ))  data[j][key[i]] = parseFloat(data[j][key[i]]);
	   }
	   this.emit("account",data)
	   this.accounts = data
	})
}
Account.prototype.placeOrder = function (orderParams) {
	if(  this.gdaxconfig.dryrun ){
        	this.emit("message",sprintf("DRYRUN %s price %s Size: %s",
			orderParams.side,
			orderParams.price,
			orderParams.size
			))
		return;
        }// End Dryrun
        if ( orderParams.size < this.gdaxconfig.minOrderSize ){
 		this.emit("message",sprintf("%s order to small, no oder placed $%.2f size %.2f",
 			orderParams.side,
 			orderParams.price,
 			orderParams.size
                        ))
		return;
	}else{
 		this.authedClient.placeOrder(orderParams,(err,resp,data) => {
			this.emit("message",sprintf("a %s price %.2f Size: %.2f",
				orderParams.side,
				orderParams.price,
				orderParams.size
				)) 
                if (err){
                        this.emit("error",sprintf("ERROR: %s", err ))
                } //End Error
            })// End Place Order
        } // End Else
        this.getAccount();
}
Account.prototype.getOrders = function (){
        this.authedClient.getOrders((err, response, data)=>{
                if(err) {
                        this.emit("update",err)
                        return;
                }else{
                        for( i = 0; i < data.length; i++){
                                keys = Object.keys(data[i]);
                                for( j=0; j < keys.length; j++){
                                        k = keys[j]
                                        if ( ! isNaN(data[i][k] )){
                                                data[i][k] = parseFloat(data[i][k]);
                                        }
                                }
                        }
                        this.orders=data
                        this.emit("update","Initalized Order list")
                        this.emit("orders",data)
                }
        });
}


module.exports = Account

