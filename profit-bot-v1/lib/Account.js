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
	this.debug = false
}

util.inherits(Account, EventEmitter);

Account.prototype.connect = function (){
        if (this.debug) this.emit("message","Connecting")
	this.authedClient = new Gdax.AuthenticatedClient(
		this.gdaxconfig.key,
		this.gdaxconfig.secret,
		this.gdaxconfig.passphrase,
		this.gdaxconfig.apiURI,
	        this.orders       = []

		);
	this.getAccount()
}
Account.prototype.getAccount = async function (){
        //this.emit("update","Update Account balance's")
	this.getOrders();
	await this.authedClient.getAccounts( ( err, resp, data ) =>{
	if(err){
	 	this.emit("error",sprintf("Account update error: "+err));
		return;
	}
	for (j = 0; j < data.length; j++){
		var key = Object.keys(data[j])
		for (i = 0; i < key.length;i++)
			if ( ! isNaN(data[j][key[i]] ))  data[j][key[i]] = parseFloat(data[j][key[i]]);
	   }
	   if (this.debug) this.emit("debug","getAccount refresh ")
	   this.emit("account",data)
	   this.accounts = data
	})
}
Account.prototype.placeOrder = async function (orderParams) {
	if ( this.orders.find((o) => o.price == orderParams.price) === 'undefined' ) {
        	this.emit("message",sprintf("ABORT %s price %s already exists",
			orderParams.side,
			orderParams.price
			))
	}
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
 		await this.authedClient.placeOrder(orderParams,(err,resp,data) => {
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
Account.prototype.cancelOrders = async function (advice) {

        var co = this.orders.filter((o,index,array) => { 
			//this.emit("update",sprintf("o.p %s >= above %s or o.p %s below %s", o.price , advice.above , o.price , advice.below ))
			//this.emit("update",sprintf("match %s", o.price >= advice.above || o.price <= advice.below ))
			if ( typeof advice.above === 'undefined'  
				&& o.price >= advice.above )
				return o.price >= advice.above
			if ( typeof advice.below === 'undefined'  
				&&  o.price <= advice.below ) 
				return o.price <= advice.below 
	        })

	//this.emit("update",sprintf("count %s", co.length ))
	for ( i = 0; i < co.length; i++ ){
		var o = co[i]
		if ( this.gdaxconfig.dryrun ){
			this.emit("message",sprintf("Cancel %s %.2f",o.id,o.price)); 
			await this.authedClient.cancelOrder(o.id,(err,resp,data) => {
				if(err) {
					this.emit("error",err)
					return;
				}else{
					this.getAccount();
				}
			})
		} else {
			this.emit("message",sprintf("DRYRUN: Cancel %s %.2f",o.id,o.price)); 
		}
	}
}
Account.prototype.getOrders = async function (){
        await this.authedClient.getOrders((err, response, data)=>{
                if(err) {
                        this.emit("error",err)
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
                        if (this.debug ) this.emit("debug","Get Order count "+data.length)
                        this.emit("orders",data)
                }
        });
}


module.exports = Account

