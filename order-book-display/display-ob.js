var fs             = require('fs');
var Gdax           = require('gdax');
var colors     	   = require('colors');
var path       	   = require('path');
var configfilename = path.basename(__filename);
var sprintf        = require('sprintf')
var columnify 	   = require('columnify')

// *****************
// Process CLI
// *****************
var gdaxconfig     = null

for ( i = 2; i < process.argv.length; i++){
	if ( process.argv[i].match(/--config/)){
		console.log(process.argv[i])
		let c = process.argv[i].split('=')[1]
		gdaxconfig = require(c);
	}
}
if ( gdaxconfig == null ) {
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
	askswindow = grid.set(r, c, h, w, contrib.table, {
	       keys: true
	     , fg: 'white'
	     , selectedFg: 'white'
	     , selectedBg: 'blue'
	     , interactive: true
	     , label: 'Asks'
	     , width: '30%'
	     , height: '30%'
	     , border: {type: "line", fg: "cyan"}
	     , columnSpacing: 10 //in chars
	     , columnWidth: [16, 12, 12] /*in chars*/ })

	bidswindow = grid.set(r, c+20, 40, 30, contrib.table,{ 
	       keys: true
	     , fg: 'white'
	     , selectedFg: 'white'
	     , selectedBg: 'blue'
	     , interactive: true
	     , label: 'Bids'
	     , width: '30%'
	     , height: '30%'
	     , border: {type: "line", fg: "cyan"}
	     , columnSpacing: 10 //in chars
	     , columnWidth: [6, 12, 12] /*in chars*/ })
	screen.append(askswindow);
	screen.append(bidswindow);
// Quit on Escape, q, or Control-C.
screen.key(['escape', 'C-c', 'q'], function(ch, key) {
	return process.exit(0);
});

const authedClient = new Gdax.AuthenticatedClient(gdaxconfig.key,
                                                gdaxconfig.secret,
                                                gdaxconfig.passphrase,
                                                gdaxconfig.apiURI);
//console.log(authedClient)
setInterval(function (){
	authedClient.getProductOrderBook(
	  'LTC-USD',
	  { level: 2 },
	  (error, response, book) => {
		bidswindow.setData(
		   { headers: ['Price', 'MarketSize', 'col3']
		   , data: book.bids })
		askswindow.setData(
		   { headers: ['Price', 'MarketSize', 'col3']
		   , data: book.asks })

	  }
	);
},1000);




/************************************************
****  Render the screen.
************************************************/
setInterval(function (){
	screen.render();
},100);

