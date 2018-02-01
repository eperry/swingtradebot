var Gdax = require('gdax');
var program = require('commander');
var blessed = require('blessed');
var numeral = require('numeral');
var gdax = require('gdax');
var fs   = require('fs');
var gdaxconfig = require('./gdax.config')
var counter={ total:0 };
var gdaxAccounts={};
coins=['ETH-USD',"BTC-USD","ETH-BTC"]
var tradeStats = {
			direction: {},
			coins:{},
			lastCoins: {},
	};	
if ( fs.existsSync('./cache/tradeStats.coins') ){
	tradeStats.coins = JSON.parse(fs.readFileSync('./cache/tradeStats.coins','utf-8'))
}

websocket = new gdax.WebsocketClient(coins,"wss://ws-feed.gdax.com",null,{ 'channels': ["full","level2"]});

websocket.on('error', err => { /* handle error */ });
websocket.on('close', () => { /* ... */ });

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

// Create a box perfectly centered horizontally and vertically.
var toppos=0;
coins.forEach( function (coin){
	tp = toppos+"%"
	coinbox[coin]={}
	coinbox[coin].buy = blessed.box({
	  top: tp,
	  //top: 'center',
	  //left: 'center',
	  width: '30%',
	  height: '33%',
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
	coinbox[coin].sell = blessed.box({
	  top: tp,
	  //top: 'center',
	  left: '30%',
	  width: '30%',
	  height: '33%',
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
	screen.append(coinbox[coin]['buy']);
	screen.append(coinbox[coin]['sell']);
	toppos+=33
})
var tradewindow = blessed.box({
	  left: '60%',
	  //top: 'center',
	  //left: 'center',
	  //width: '30%',
	  height: '50%',
	  scrollable: true,
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
var orderwindow = blessed.Log({
	  left: '60%',
	  top: '50%',
	  //left: 'center',
	  //width: '30%',
	  height: '50%',
	  scrollable: true,
	  alwaysScroll:true,
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
	screen.append(orderwindow);


// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

//coinbox['ETH-BTC'].focus();
// Focus our element.
websocket.on('message', data => {
	counter.total++;
	if (counter[data.type] === undefined ) counter[data.type]=0;
	counter[data.type]+=1
        /* work with data */
        //var columns = columnify(data, {columns: Object.keys(data),   } )
        if ( data.type == 'match' 
	  && data.price
	  && data.size	
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
		if ( tradeStats.direction[data.product_id] === undefined ) {tradeStats.direction[data.product_id]=0;}
		if ( data.side === 'sell' )
			tradeStats.direction[data.product_id]+=parseFloat(data.size);
		else
			tradeStats.direction[data.product_id]-=parseFloat(data.size);
        }
        if ( data.type == 'done' 
	  && data.price
	  && data.reason != 'canceled'){
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
		window = coinbox[data.product_id][data.side];
		window.setContent(data.product_id)
		Object.keys(data).forEach( function (d){
			window.insertBottom(d+": "+data[d])
			tradeStats.direction[data.product_id]; 
		});
		if ( tradeStats.coins[data.product_id] === undefined ) {tradeStats.coins[data.product_id]={};}
		tradeStats.coins[data.product_id][data.side]=data;
        }
});

setInterval(function (){ 
	fs.writeFileSync('./cache/tradeStats.coins',JSON.stringify(tradeStats.coins,null,2),'utf-8')
},10000);
// Render the screen.
setInterval(function (){ 
	tradewindow.setContent("Trades messages: ");
	Object.keys(tradeStats.direction).forEach( function (d){
		tradewindow.insertBottom("Trades Direction: "+d+" = "+tradeStats.direction[d]);
	})
	Object.keys(counter).forEach( function (d){
		tradewindow.insertBottom("Trades messages: "+d+" = "+counter[d]);
	})
	
	//tradewindow.insertBottom(JSON.stringify(tradeStats.coins,null,2))
	//tradewindow.insertBottom("----------")
	try{
		tradewindow.insertBottom("ETH-BTC buy  Ticker: "+ tradeStats.coins['ETH-BTC']['buy'].price);
		tradewindow.insertBottom("ETH-BTC sell Ticker: "+ tradeStats.coins['ETH-BTC']['sell'].price);
		tradewindow.insertBottom("ETH-USD-BTC buy  Calc  : "+ tradeStats.coins['ETH-USD']['buy'].price/tradeStats.coins['BTC-USD']['buy'].price);
		tradewindow.insertBottom("ETH-USD-BTC sell Calc  : "+ tradeStats.coins['ETH-USD']['sell'].price/tradeStats.coins['BTC-USD']['sell'].price);
		tradeStats.lastCoins=tradeStats.coins;	
	} catch (e) {
	}
	screen.render(); 
},110);
/*****/
setInterval(function (){ 
	var gdaxconfig = require('./gdax.config')
	//orderwindow.insertBottom(JSON.stringify(gdaxconfig,null,1));
	const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);
	//orderwindow.insertBottom(JSON.stringify(authedClient,null,1));
	/*******************
	authedClient.getAccounts((error,response,data)=>{
		if (error)      orderwindow.insertBottom(JSON.stringify(error,null,1));
		for (i=0;i< data.length;i++){
			Object.keys(data[i]).forEach((d)=>{
				orderwindow.insertBottom(d+": "+data[i][d]);
			})
		}

	});
	*******************/
	authedClient.getOrders( (error,response,data)=>{
		if (error )      orderwindow.insertBottom(JSON.stringify(error,null,1)); 
		else
		for (i=0; i < data.length;i++){
			//orderwindow.insertBottom(JSON.stringify(data[i],null,1));
			Object.keys(data[i]).forEach((d)=>{
				orderwindow.insertBottom(d+": "+data[i][d]);
			})
		}

	});
},10000);
/******/
screen.render();

