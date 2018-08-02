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
Account.prototype.getAccount = async function (){
	 await this.authedClient.getAccounts( )
	     .then((data) =>{
         /**********************************************************************
         [ { id: '4dce4a6d-62f4-4fef-a182-3b9d6d770745',
             currency: 'USD',
             balance: '727926.3580589406465000',
             available: '722088.005462589328',
             hold: '5838.3525963513185000',
             profile_id: '48744b90-c75f-43c4-b5c4-0c10c6dc644e' }
         ]
         **********************************************************************/
		 if(data) {
	           for (j = 0; j < data.length; j++){
			var key = Object.keys(data[j])
			for (i = 0; i < key.length;i++)
				if ( ! isNaN(data[j][key[i]] ))  data[j][key[i]] = parseFloat(data[j][key[i]]);
		   }
		   this.accounts = data
		   this.emit("update",data)
		 }
         }).catch((err)=> {
		 this.emit("error",err);
	})
}
module.exports = Account

