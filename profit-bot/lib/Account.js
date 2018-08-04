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
		this.gdaxconfig.apiURI
		);
	this.getAccount()
}
Account.prototype.getAccount = function (){
	 this.authedClient.getAccounts( ( err, resp, data ) =>{
	 if(err){
	 	this.emit("error",sprintf("Account update error: "+err));
		return;
	 }
         /**********************************************************************
         [ { id: '4dce4a6d-62f4-4fef-a182-3b9d6d770745',
             currency: 'USD',
             balance: '727926.3580589406465000',
             available: '722088.005462589328',
             hold: '5838.3525963513185000',
             profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e' }
         ]
         **********************************************************************/
	   for (j = 0; j < data.length; j++){
		var key = Object.keys(data[j])
		for (i = 0; i < key.length;i++)
			if ( ! isNaN(data[j][key[i]] ))  data[j][key[i]] = parseFloat(data[j][key[i]]);
	   }
	   this.emit("update",data)
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

module.exports = Account

