var fs             = require('fs');
var Gdax           = require('gdax');
var colors     	   = require('colors');
var path       	   = require('path');
var configfilename = path.basename(__filename);
var userFeed       = require(__dirname+'/lib/UserFeed.js');
var Account        = require(__dirname+'/lib/Account.js');
var sprintf        = require('sprintf')
var columnify 	   = require('columnify')
var jsdiff 	   = require('diff')
var figures	   = require("figures")

// *****************
// Process CLI
// *****************
var Advisor       = null
var gdaxconfig     = null

for ( i = 2; i < process.argv.length; i++){
	if ( process.argv[i].match(/--advisor/)){
		let adv = process.argv[i].split('=')[1]
		Advisor = require(__dirname+'/lib/'+adv);
	}else if ( process.argv[i].match(/--config/)){
		console.log(process.argv[i])
		let c = process.argv[i].split('=')[1]
		gdaxconfig = require(c);
	}
}
if (Advisor == null ||
    gdaxconfig == null ) {
	console.error("--advisor=<advisor class>")
	console.error("--config=<file>")
	process.exit(1);
}
var dryrun 	   = gdaxconfig.dryrun
colors.setTheme(gdaxconfig.colorsTheme)

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
		  label: dryrun?"DryRun True":"DryRun False" ,
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

screen.key(['u'], () => { ; account.getAccount()}) 


/************************************************
****  Render the screen.
************************************************/
setInterval(function (){
	screen.render();
},400);


var account = new Account(gdaxconfig)
account.debug=false
account.on("account", (data) => { 
	/*********************
	[{
        "id": "71452118-efc7-4cc4-8780-a5e22d4baa53",
        "currency": "BTC",
        "balance": "0.0000000000000000",
        "available": "0.0000000000000000",
        "hold": "0.0000000000000000",
        "profile_id": "75da88c5-05bf-4f54-bc85-5c775bd68254"
    	}]
	***********************/
	var coinbal = data.filter((a) => a.currency === gdaxconfig.buyAsset )
	var dollarbal = data.filter((a) => a.currency === gdaxconfig.sellAsset )
	Advice.accountBalance.coin= coinbal
	Advice.accountBalance.dollar= dollarbal 
})
account.on("message", (data) => {
        leftwindow.insertBottom("Account message "+data)
})
account.on("error", (data) => {
        leftwindow.insertBottom("Account error "+JSON.stringify(data,null,1))
})
account.on("debug", (data) => {
        leftwindow.insertBottom("Account debug "+data)
})
account.connect();
//*********************************************************************************************
// Initialize Advice
//*********************************************************************************************
var Advice = new Advisor(gdaxconfig)
Advice.debugwindow = leftwindow

Advice.on("buy", (data) => {
	account.placeOrder(data)
})
Advice.on("sell", (data) => {
	account.placeOrder(data)
})
Advice.on("message", (data) => {
        leftwindow.insertBottom("Advice Message "+JSON.stringify(data,null,1))
})
Advice.on("suggestCancel",(data) => {
	account.cancelOrders(data);
})
Advice.connect()
//*********************************************************************************************
// Initialize Ticker Feed
//*********************************************************************************************
screenUpdate = setInterval(() => {
	var ticker = Advice.tickerFeed
	rightwindow.setContent(sprintf("%s",new Date()))
	/**********************************************************
	rightwindow.insertBottom("--------------")
	rightwindow.insertBottom(sprintf("SIZE Moving Average = %.4f Forcast = %.4f",
						Advice.marketFeed.movingAvg.size.movingAverage(),
						Advice.marketFeed.movingAvg.size.forecast()))
	rightwindow.insertBottom("--------------")
	rightwindow.insertBottom(sprintf("Price Moving Average = %.2f Forcast = %.2f",
						Advice.marketFeed.movingAvg.price.movingAverage(),
						Advice.marketFeed.movingAvg.price.forecast()))
	***********************************************************/
	rightwindow.insertBottom("--------------")
	if( account.accounts  && account.accounts.length > 0 ){
		[ gdaxconfig.trade.buy_asset, 
	  	  gdaxconfig.trade.sell_asset].forEach((ast) => {
			a = account.accounts.find((d) => ast === d.currency )
			let display = sprintf("%s balance %.4f available: %.4f hold: %.4f ",
			    a.currency,
			    a.balance,
			    a.available,
			    a.hold
			    ) // end rightwindow insert
			if ( a.currency == "USD" ){
				var s = account.orders.filter((o) => o.side === 'buy' )
				ss = 0.00	
			        for ( i=0; i < s.length; i++) {
					ss += s[i].size
				}
				display += sprintf ("Size = %s",ss)
			}
			rightwindow.insertBottom(display)
        	}) // End Foreach
	} // End if
	rightwindow.insertBottom("--------------")
	let ts = "ticker"
	//rightwindow.insertBottom(JSON.stringify(ticker)+"")
	//if ( "current" in ticker ) 
        account.orders
	        .concat([ { side:"24 Open", price: ticker.current.open_24h }])
	        .concat([ { side:"24 Low", price:  ticker.current.low_24h }])
	        .concat([ { side:"24 High", price: ticker.current.high_24h }])
	        .concat([ { side: "ticker", price: ticker.current.price }])
		//.concat([ { side: "ABuy",   price:  Advice.buy }])
		//.concat([ { side: "ASell",  price:  Advice.ask }])
		.sort((a, b )=> { return Math.trunc(b.price*100) - Math.trunc(a.price*100) })
		.forEach((o) => {	
			let display = sprintf("%4s price %.2f", o.side, o.price)
			if ( o.side === 'buy' ) display = colors.buy(display)+sprintf(" C %.2f 24 h %.2f l %.2f oh %.2f"
								,(ticker.current.price - o.price )
								,(ticker.current.high_24h - o.price )
								,(ticker.current.low_24h - o.price )
								,(ticker.current.open_24h - o.price ))
			else if ( o.side === 'sell' ) display = colors.sell(display)+sprintf(" C %.2f 24 h %.2f l %.2f oh %.2f"
								,(o.price - ticker.current.price  )
								,(o.price - ticker.current.high_24h )
								,(o.price - ticker.current.low_24h )
								,(o.price - ticker.current.open_24h ))
			else if ( o.side.match('ticker') ){
				display += sprintf(" %s",ticker.current.side)
				if( o.price > ticker.last.price ) display = figures.arrowUp +"  "+ colors.yellow.underline(display)
				else if (o.price == ticker.last.price ) display = figures.circle +"  "+ colors.yellow.underline(display)
				else                            display = figures.arrowDown +"  "+ colors.yellow.underline(display)
				if ( ticker.current.side  && ticker.current.last_size ){
					display += "\n\t "
					display += colors
						.yellow
						.underline(
							sprintf("last price %.2f %s",
								ticker.last.price,
								ticker.last.side
							)
						)
				}
			}
			rightwindow.insertBottom(display)
		})
},500) // End On interval

//*********************************************************************************************
// Initialize UserFeed
//*********************************************************************************************
var uf = new userFeed(gdaxconfig)
uf.on("orders", (data) => { 
	if( data === 'undefined' ) leftwindow.insertBottom("UserFeed Orders "+data)
	else Advice.update("orders",data)
})
uf.on("open", (data) => { 
        //leftwindow.insertBottom("UF open "+JSON.stringify(data,null,1))
})
uf.on("sell", (data) => { 
	Advice.update("filled",data); 
	leftwindow.insertBottom( sprintf("UserFeed on %s price %s size %s",
		data.side,
		data.price,
		data.size
		).blue)
})
uf.on("buy",  (data) => { 
	Advice.update("filled",data)
	leftwindow.insertBottom( sprintf("UserFeed on %s price %s reason %s",
		data.side,
		data.price,
		data.reason
		).red)
})
uf.on(["match"], (data)=>{
	leftwindow.insertBottom( sprintf("UserFeed Match on %s price %s size %s",
		data.side,
		data.price,
		data.size
		).green)
	//Advice.update("match",data);
})
uf.on("update", (data) =>{
	leftwindow.insertBottom("UserFeed update "+JSON.stringify(data,null,1))
})
uf.connect()

