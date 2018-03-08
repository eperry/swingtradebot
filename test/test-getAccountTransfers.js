var Gdax = require('gdax');
var gdaxconfig = require('../config/gdax.config')
//console.log(gdaxconfig);
var authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);
var accounts = []
authedClient.getAccounts().then((ga)=>{
            var p = [];
	    for( i =0; i < ga.length;i++){
		p.push(authedClient.getAccountTransfers(ga[i].id).then((result)=>{
			    //console.log(result)
			    var total = 0;
			    result.forEach((r)=>{
				if ( r.amount ) total+=parseFloat(r.amount)
			    })
			    return total;
		    }))
	    } // End for
	    Promise.all(p).then((result)=>{
	    //console.log(result)
	    var total = result.reduce((accumulator, currentValue) =>  accumulator + currentValue)
	    return total
	 }).then ((result)=>{
	    	console.log("total",result)
	 }).catch ((error)=>{
	  	console.log(error)
	 })
		
 }).catch ((error)=>{
			console.log(error)
 })
