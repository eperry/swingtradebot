var Gdax = require('gdax');
var program = require('commander');
var blessed = require('blessed');
var numeral = require('numeral');
var gdax = require('gdax');
websocket = new gdax.WebsocketClient(['ETH-USD',"BTC-USD","ETH-BTC"]);

websocket.on('error', err => { /* handle error */ });
websocket.on('close', () => { /* ... */ });

var coins = {};
function myRound(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};
coins['ETH-USD'] = new Gdax.PublicClient('ETH-USD');		// public API might cap at 100 requests/day
coins['BTC-USD'] = new Gdax.PublicClient('BTC-USD');		// public API might cap at 100 requests/day
coins['ETH-BTC'] = new Gdax.PublicClient('ETH-BTC');		// public API might cap at 100 requests/day
coinbox = {};
tradeStats = {
	direction: 0,
	coins:{},
	lastCoins: {},
};	

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
Object.keys(coins).forEach( function (coin){
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
	  height: '100%',
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


// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

//coinbox['ETH-BTC'].focus();
// Focus our element.
websocket.on('message', data => {
        /* work with data */
        //var columns = columnify(data, {columns: Object.keys(data),   } )
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
		});
		if ( tradeStats.coins[data.product_id] === undefined ) {tradeStats.coins[data.product_id]={};}
		tradeStats.coins[data.product_id][data.side]=data;
        }
});

// Render the screen.
setInterval(function (){ 
	tradewindow.setContent("-Trades-"+Date.now());
	//tradewindow.insertBottom(JSON.stringify(tradeStats.coins,null,2))
	//tradewindow.insertBottom("----------")
	try{
		tradewindow.insertBottom("ETH-BTC buy  Ticker: "+ tradeStats.coins['ETH-BTC']['buy'].price);
		tradewindow.insertBottom("ETH-BTC sell Ticker: "+ tradeStats.coins['ETH-BTC']['sell'].price);
		tradewindow.insertBottom("ETH-USD-BTC buy  Calc  : "+ tradeStats.coins['ETH-USD']['buy'].price/tradeStats.coins['BTC-USD']['buy'].price);
		tradewindow.insertBottom("ETH-USD-BTC sell Calc  : "+ tradeStats.coins['ETH-USD']['sell'].price/tradeStats.coins['BTC-USD']['sell'].price);
		tradeStats.lastCoins=tradeStats.coins;	
	} catch (e) {
		tradewindow.insertBottom(e.message);
		tradewindow.insertBottom(e.stack);
	}
	screen.render(); 
},110);
screen.render();
