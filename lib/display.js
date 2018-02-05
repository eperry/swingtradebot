var blessed = require('blessed');
var contrib = require('blessed-contrib');
var fs   = require('fs');

var default_window_opts = { 
                  content: '',
		  scrollable: true,
                  style: {
                    fg: 'white',
                    //bg: 'black',
                    border: {
                      fg: '#f0f0f0'
                    },
                  }
                }
var layout = function layout(opts){        	
	if ( opts === undefined ) {
		return { error: " screen object must be passed  { screen: <obj> }" }
	}
	var grid = new contrib.grid( {rows: 12 , cols:12, screen: opts.screen })
	var window = {};
	window['header'] = grid.set( 0, 0, 1, 12, blessed.log, { content: '', hideBorder: true, });
	window['main'] = grid.set( 1, 0, 11, 8, blessed.log, default_window_opts);
	window['righttop'] = grid.set( 1, 8, 5, 4, blessed.log, default_window_opts);
	window['rightbottom'] = grid.set( 6, 8, 6, 4, blessed.log, default_window_opts);
	// Quit on Escape, q, or Control-C.
	return window;
}
module.exports = layout;

