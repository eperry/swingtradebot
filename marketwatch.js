var Gdax = require('gdax');
var program = require('commander');
var blessed = require('blessed');
var contrib = require('blessed-contrib');
var numeral = require('numeral');
var fs   = require('fs');
var config = require('./config/MarketWatch.conf')
var counter={ total:0 };
var gdaxAccounts={};
var coins=config.coins
var tradeStats = {
			direction: {},
			tmpdirection: {},
			coins:{},
			lastCoins: {},
			lastMatch: {}
	};	
if ( fs.existsSync('./cache/tradeStats.coins') ){
	tradeStats.coins = JSON.parse(fs.readFileSync('./cache/tradeStats.coins','utf-8'))
}

websocket = new Gdax.WebsocketClient(coins,config.apiURI,null,{ 'channels': [ "full" ]});

websocket.on('error', err => { console.log(err)/* handle error */ });
websocket.on('close', () => { console.log("colose")/* ... */ });

function myRound(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};
coinbox = {};

program
	.version('0.0.1')
	.usage('-c [ceiling] -f [floor]')
	.description('Description: Simple CLI for setting slack alerts for ether price on GDAX')
	.option('-c, --ceiling [ceiling]', 'Input high alert')
	.option('-f, --floor [floor]', 'Input low alert')
program.parse(process.argv);

// Create a screen object.
var screen = blessed.screen({
  smartCSR: false,
  fastCSR: true,
  replaceScreenOnNewData: true
});

screen.title = 'my window title';

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen})

// Create a box perfectly centered horizontally and vertically.
var toppos=0;
	var r = 0;
	var c = 0;
	var w = 4;
	var h = 4;
coins.forEach( function (coin){
	var leftpos = 0;
	coinbox[coin]={};
	[ "sell","buy"].forEach( (side) => {
		//console.log(coin,side)
	        coinbox[coin][side] = grid.set(r, c, h, w, blessed.box, {
		  //top: 'center',
		  //left: 'center',
		  content: '',
		  tags: true,
		  label: coin + " " + side,
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
		screen.append(coinbox[coin][side]);
		r+=4
        })
	c+=4
	r=0
})
var leftpos = 0;
debugwindow = grid.set(8, 0, h, 8, blessed.box, {
	  top: toppos+"%",
	  left: leftpos+"%",
	  //top: 'center',
	  //left: 'center',
	  width: '60%',
	  height: '20%',
	  content: '',
	  tags: true,
	  border: {
	    type: 'line'
	  },
	  style: {
	    fg: 'white',
	    //bg: 'black',
	    border: {
	      fg: '#f0f0f0'
	    },
	  }
});
debugwindow.setContent("debug")
screen.append(debugwindow);
	         
var tradewindow = grid.set(0, 8, 5, w, blessed.box, {
	  left: '60%',
	  //top: 'center',
	  //left: 'center',
	  //width: '30%',
	  height: '40%',
	  scrollable: true,
	  label: "Trade Window",
	  content: '',
	  tags: true,
	  border: {
	    type: 'line'
	  },
	  style: {
	    fg: 'white',
	    //bg: 'black',
	    border: {
	      fg: '#f0f0f0'
	    },
	  }
	});
	screen.append(tradewindow);
var orderwindow =grid.set(5, 8, 7, w, blessed.Log, {
	  left: '60%',
	  top: '40%',
	  //left: 'center',
	  //width: '30%',
	  height: '60%',
	  scrollable: true,
	  alwaysScroll:true,
	  content: '',
	  tags: true,
	  label: "Debug Window",
	  border: {
	    type: 'line'
	  },
	  style: {
	    fg: 'white',
	    //bg: 'black',
	    border: {
	      fg: '#f0f0f0'
	    },
	  }
	});
	screen.append(orderwindow);


// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Focus our element.
websocket.on('message', data => {
	counter.total++;
	if (counter[data.type] === undefined ) counter[data.type]={};
	if (counter[data.type]['total'] === undefined ) counter[data.type]['total']=0;
	if ( data.reason !== undefined )
		if ( counter[data.type][data.reason] === undefined ) counter[data.type][data.reason]=0;
		else counter[data.type][data.reason]+=1
	counter[data.type]['total']+=1
	if ( (data.type === 'open' || data.type === 'done') && data.side !== undefined ) {
		if (counter[data.type][data.side] == undefined ) counter[data.type][data.side]=0;
		counter[data.type][data.side]++;
	}
	/* work with data */
        //var columns = columnify(data, {columns: Object.keys(data),   } )
        if ( data.type == 'match' 
	  ){
		/***************************
		{
		 "type": "match",
		 "trade_id": 26710410,
		 "maker_order_id": "46109fbc-cdde-4145-9e0f-9812119491c1",
		 "taker_order_id": "d14fcc6d-82a9-4d27-a964-0990440662ae",
		 "side": "sell",
		 "size": "0.72500000",
		 "price": "1067.30000000",
		 "product_id": "ETH-USD",
		 "sequence": 2114249390,
		 "time": "2018-01-20T03:18:36.087000Z"
		}
		****************************/
		window = coinbox[data.product_id][data.side];
		window.content=''
		Object.keys(data).forEach( function (d){
			window.insertBottom(d+": "+data[d])
			//tradeStats.direction[data.product_id]; 
		});
		if ( tradeStats.coins[data.product_id] === undefined ) tradeStats.coins[data.product_id]={};
		tradeStats.coins[data.product_id][data.side]=data;
		tradeStats.lastmatch=data;
		if ( tradeStats.direction[data.product_id] === undefined ) tradeStats.direction[data.product_id]=0;
		if ( data.side === 'sell' ){
			tradeStats.direction[data.product_id]-=parseFloat(data.size);
		}else{
			tradeStats.direction[data.product_id]+=parseFloat(data.size);
		}
		//tradeStats.direction[data.product_id]/=2
        }
        if ( data.type === 'open'  ){
		/*{
		 "type": "done",
		 "side": "sell",
		 "order_id": "1518b3bf-5e10-4c62-8fec-5c923e6d0d0b",
		 "reason": "filled",
		 "product_id": "ETH-USD",
		 "price": "912.62000000",
		 "remaining_size": "0.00000000",
		 "sequence": 2068077210,
		 "time": "2018-01-17T12:24:30.229000Z"
		}*/
                //console.log(JSON.stringify(data,null,1))
		/***********************************************************************
		window = coinbox[data.product_id][data.side];
		window.setContent(data.product_id)
		Object.keys(data).forEach( function (d){
			window.insertBottom(d+": "+data[d])
			//tradeStats.direction[data.product_id]; 
		});
		************************************************************************/
		//if ( data.remaining_size !== undefined ) {
		if ( tradeStats.tmpdirection[data.product_id] === undefined ) {tradeStats.tmpdirection[data.product_id]=0;}
		if ( data.side === 'sell' ){
			tradeStats.tmpdirection[data.product_id]-=parseFloat(data.remaining_size);
		}else{
			tradeStats.tmpdirection[data.product_id]+=parseFloat(data.remaining_size);
		}
		//}
	}
	if ( data.type === "done" 
	     && data.reason !== "filled"
	   ){
	//&& data.reason === 'canceled'  ){
		//if ( data.remaining_size !== undefined ) return;
		if ( tradeStats.tmpdirection[data.product_id] === undefined ) { tradeStats.tmpdirection[data.product_id]=0;}
		if ( data.side === 'sell' ){
			tradeStats.tmpdirection[data.product_id]+=parseFloat(data.remaining_size);
		}else{
			tradeStats.tmpdirection[data.product_id]-=parseFloat(data.remaining_size);
		}
	}
});

setInterval(function (){ 
	fs.writeFileSync('./cache/tradeStats.coins',JSON.stringify(tradeStats.coins,null,2),'utf-8')
},10000);
// Render the screen.
setInterval(function (){ 
	tradewindow.setContent("");
	Object.keys(tradeStats.direction).forEach( function (d){
		tradewindow.insertBottom("Trades Direction: "+d+" = "+tradeStats.direction[d]);
	})
	tradewindow.insertBottom("-------------------------");
	Object.keys(tradeStats.tmpdirection).forEach( function (d){
		tradewindow.insertBottom("Trades Tmp Direction: "+d+" = "+tradeStats.tmpdirection[d]);
	})
	
	Object.keys(tradeStats.coins).forEach( function (coin){
		try{
			tradewindow.insertBottom(coin+" buy  Ticker:     "+ tradeStats.coins[coin]['buy'].price);
			tradewindow.insertBottom(coin+" sell Ticker:     "+ tradeStats.coins[coin]['sell'].price);
			tradeStats.lastCoins=tradeStats.coins;	
		} catch (e) {
		}
	})
	screen.render(); 
},110);
/*****/
setInterval(function (){ 
	//orderwindow.insertBottom(JSON.stringify(gdaxconfig,null,1));
	const authedClient = new Gdax.AuthenticatedClient(config.gdax.key,
							  config.gdax.secret, 
							  config.gdax.passphrase, 
							  config.gdax.apiURI);
	orderwindow.setContent("");
	Object.keys(counter).forEach( function (d){
		orderwindow.insertBottom("Trades message types: "+d );
		Object.keys(counter[d]).forEach( function (m){
			orderwindow.insertBottom("                               "+m+" = "+counter[d][m]);
		})
	})
},1000);
/******/
screen.render();

