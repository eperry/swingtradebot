var Gdax = require('gdax');
var gdaxconfig = require('../config/gdax.config')
//console.log(gdaxconfig);
var authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);
var total = 0 
authedClient.getAccounts().then((ga)=>{
         var p = [];
	//console.log(ga)
	 for( i =0; i < ga.length;i++){
	    console.log("Trans balance "+ga[i].balance*-1)
	    if ( ga[i].balance ) total-=parseFloat(ga[i].balance) ; 
	    //console.log("-",total)
	    p.push(authedClient.getAccountTransfers(ga[i].id).then((result)=>{
		    //console.log(result)
	//	    var total = 0;
		    result.forEach((r)=>{
			total+=parseFloat(r.amount) ; 
			console.log("Amount "+r.amount) ; 
		    })
		    //console.log(total)
		    return total;
	    })
	 )} // End for
	 Promise.all(p).then((result)=>{
	    //console.log(result)
	    //var total =0;
	    for ( i=0; i < result.length; i++){
			total += result[i]
	    }
	    return total
	 }).then ((result)=>{
		console.log("total",result)
	 }).catch ((error)=>{
		console.log(error)
	 })
	    
		
 }).catch ((error)=>{
	console.log(error)
 })
