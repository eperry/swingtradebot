var fs             = require('fs');
var Gdax           = require('gdax');
var colors     	   = require('colors');
var path       	   = require('path');
var configfilename = path.basename(__filename);
var gdaxconfig     = require(__dirname+'/config/'+configfilename+'.config')
var userFeed       = require(__dirname+'/lib/UserFeed.js');
var tickerFeed     = require(__dirname+'/lib/TickerFeed.js');
var Advisor       = require(__dirname+'/lib/Advisor.js');
var Account        = require(__dirname+'/lib/Account.js');
var sprintf        = require('sprintf')
var columnify 	   = require('columnify')
var jsdiff 	   = require('diff');
var dryrun = true;

// *****************
var blessed 	   = require('blessed');
var contrib 	   = require('blessed-contrib');
var screen 	   = blessed.screen({
  smartCSR: false,
  fastCSR: true,
  replaceScreenOnNewData: true
});

screen.title = ' DryRun = '+dryrun;

var grid = new contrib.grid({rows: 40, cols: 40, screen: screen})

// Create a box perfectly centered horizontally and vertically.
var toppos=0;
	var r = 0;
	var c = 0;
	var w = 20;
	var h = 40
	var leftpos = 0;
	leftwindow = grid.set(r, c, h, w, blessed.Log, {
		  content: '',
		  tags: true,
		  label: "Left" ,
		  border: {
		    type: 'line'
		  },
		  style: {
		    fg: 'white',
		    //bg: 'black',
		    border: {
		      fg: '#f0f0f0'
		    },
		  },
		});

	rightwindow = grid.set(r, c+20, 40, 30, blessed.Log,{ 
		  content: '',
		  tags: true,
		  label: "dryrun "+ dryrun?"True":"False" ,
		  border: {
		    type: 'line'
		  },
		  style: {
		    fg: 'white',
		    //bg: 'black',
		    border: {
		      fg: '#f0f0f0'
		    },
		  },
	})
	screen.append(leftwindow);
	screen.append(rightwindow);
// Quit on Escape, q, or Control-C.
screen.key(['escape', 'C-c', 'q'], function(ch, key) {
	return process.exit(0);
});
screen.key(['c'], function(ch, key) {
	if( ! dryrun ){
		uf.authedClient.cancelAllOrders();
		leftwindow.insertBottom("canceled all orders");
	}else{
		leftwindow.insertBottom("DRYRUN: canceled all orders");
	}

});

screen.key(['u'], () => account.getAccount()) 


/************************************************
****  Render the screen.
************************************************/
setInterval(function (){
	screen.render();
},400);

var Advice = new Advisor(gdaxconfig)


var account = new Account(gdaxconfig)
account.connect();
account.on("update", (data) => { 
	Advice.update("account",data)
        //leftwindow.insertBottom("Account update "+JSON.stringify(data,null,1))
})
account.on("message", (data) => {
        leftwindow.insertBottom("Message "+JSON.stringify(data,null,1))
})
account.on("error", (data) => {
        leftwindow.insertBottom("error "+JSON.stringify(data,null,1))
})
Advice.debugwindow = leftwindow
Advice.monitor = setInterval(() => {
	Advice.priceMonitor()
},10000)
Advice.on("buy", (data) => {
        //leftwindow.insertBottom("Advice "+data.side+"\n"+JSON.stringify(data,null,1))
	account.placeOrder(data)
})
Advice.on("sell", (data) => {
        //leftwindow.insertBottom("Advice "+data.side+"\n"+JSON.stringify(data,null,1))
	account.placeOrder(data)
})
Advice.on("message", (data) => {
        leftwindow.insertBottom("Message "+JSON.stringify(data,null,1))
})

/***************************************************************
account.on("update", (data) =>{
	leftwindow.insertBottom(JSON.stringify(data,null,4).red)
})
***************************************************************/
var tf = new tickerFeed(gdaxconfig)
tf.on("ticker", (data) =>{
	Advice.update("ticker",data)
        rightwindow.setContent(JSON.stringify(data.current,null,4));
        rightwindow.insertBottom(sprintf("Advice Buy %.02f Sell %.02f", Advice.buy, Advice.ask).yellow);
        rightwindow.insertBottom(sprintf("Advice Buy size %.02f Sell size %.02f", Advice.buy_size, Advice.ask_size).yellow);
	if( account.accounts  && account.accounts.length > 0 ){
		[ gdaxconfig.trade.buy_asset, 
	  	  gdaxconfig.trade.sell_asset].forEach((ast) => {
			a = account.accounts.find((d) => ast === d.currency )
			rightwindow.insertBottom(sprintf("%s balance %.4f available: %.4f hold: %.4f",
			    a.currency,
			    a.balance,
			    a.available,
			    a.hold,
			    )) // end rightwindow insert
        	}) // End Foreach
	} // End if
        uf.orders.filter((o) => "buy" === o.side ).forEach((o) => {	
		rightwindow.insertBottom(sprintf("%s oid %s price %.2f",
			o.side,
			o.id,
			o.price
			).red)
	})
        uf.orders.filter((o) => "sell" === o.side ).forEach((o) => {	
		rightwindow.insertBottom(sprintf("%s oid %s price %.2f",
			o.side,
			o.id,
			o.price
			).blue)
	})
}) // End On Ticker

var uf = new userFeed(gdaxconfig)
uf.on("open", (data) => { 
	account.getAccount();         
        //leftwindow.insertBottom("UF open "+JSON.stringify(data,null,1))
})
uf.on("sell", (data) => { 
	Advice.update("filled",data); 
	account.getAccount();         
        //leftwindow.insertBottom("UF sell "+JSON.stringify(data,null,1))
})
uf.on("buy",  (data) => { 
	Advice.update("filled",data)
	account.getAccount();         
        //leftwindow.insertBottom("UF buy "+JSON.stringify(data,null,1))
})
uf.on(["match"], (data)=>{
	account.getAccount();         
	leftwindow.insertBottom( sprintf("Match %s price %s size %s",
		data.side,
		data.price,
		data.size
		).red)
	Advice.update("match",data);
})
uf.on("update", (data) =>{
	leftwindow.insertBottom("UF update "+JSON.stringify(data,null,1))
})
uf.connect()
tf.connect()


