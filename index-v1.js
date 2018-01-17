var Gdax = require('gdax');
var program = require('commander');
var blessed = require('blessed');
var numeral = require('numeral');
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
	coinbox[coin] = blessed.box({
	  top: tp,
	  //top: 'center',
	  //left: 'center',
	  width: '75%',
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
	screen.append(coinbox[coin]);
	toppos+=33
})
var tradewindow = blessed.box({
	  left: '75%',
	  //top: 'center',
	  //left: 'center',
	  width: '25%',
	  height: '100%',
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
ticker = function(err, response, data) {
		//box.setContent("ETH{"+data.price+"} Recommendation: Buy\n"+JSON.stringify(data));
		window = coinbox[this.coin];
		window.setContent(this.coin)
		Object.keys(data).forEach( function (d){
			window.insertBottom(d+": "+numeral(data[d]).format('0.00000000'))
		});
		tradeStats.coins[this.coin]=data;
}

// Render the screen.
setInterval(function (){ 
	Object.keys(coins).forEach(function (coin){
		coins[coin].getProductTicker(ticker.bind({ 'coin': coin}));
	})
	tradewindow.setContent("-Trades-"+Date.now());
	try{
	tradewindow.insertBottom("ETH-BTC     Ticker: "+ numeral(tradeStats.coins['ETH-BTC'].bid).format('0.00000000'));
	tradewindow.insertBottom("ETH-USD-BTC Calc  : "+ myRound(tradeStats.coins['ETH-USD'].bid/tradeStats.coins['BTC-USD'].bid,8));
        tradeStats.lastCoins=tradeStats.coins;	
	} catch (e) {
	}
	screen.render(); 
},1010);
screen.render();
