var Gdax = require('gdax');
var program = require('commander');
var blessed = require('blessed');
var numeral = require('numeral');
var gdax = require('gdax');
var gdaxconfig = require('./gdax.config')
var counter={ total:0 };
coins=['ETH-USD',"BTC-USD","ETH-BTC"]
var gdaxAccounts={};
const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key, gdaxconfig.secret, gdaxconfig.passphrase, gdaxconfig.apiURI);

authedClient.getAccounts((error,response,data)=>{
	debugwindow.insertBottom(JSON.stringify(data))
	data.forEach( (d) => {
		gdaxAccounts[d.currency]=d;
	})
});

websocket = new gdax.WebsocketClient(coins);

websocket.on('error', err => { /* handle error */ });
websocket.on('close', () => { /* ... */ });

function myRound(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};
coinbox = {};
tradeStats = {
	direction: {},
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
var debugwindow = blessed.box({
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
	screen.append(debugwindow);


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

// Render the screen.
setInterval(function (){ 
	tradewindow.setContent("Trades messages: ");
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
		debugwindow.insertBottom(e.message);
		debugwindow.insertBottom(e.stack);
	}
	try{
		debugwindow.insertBottom("-------"+counter.total+"------")
		//debugwindow.insertBottom(JSON.stringify(gdaxAccounts));
	} catch (e) {
		debugwindow.insertBottom(e.message);
		debugwindow.insertBottom(e.stack);

	}
	debugwindow.setScrollPerc(100);
	screen.render(); 
},110);
screen.render();

