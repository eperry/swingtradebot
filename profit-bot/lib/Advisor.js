var colors     = require('colors');
var path       = require('path');
var sprintf        = require('sprintf')
var EventEmitter = require('events').EventEmitter;
var util = require('util');

/*********************************************************************
** 
** gdax - trading 
**
*********************************************************************/

Advisor = function (gdaxconfig) {
        EventEmitter.call(this);
	this.tickerFeed   = { }
	this.bsPosition   = 2
	this.gdaxconfig   = gdaxconfig
	this.lastbuy	  = 0.00
	this.sellAssetBalance = undefined
	this.buyAssetBalance = undefined
	this.buy = -1
	this.ask = -1
	this.buy_size = -1
	this.ask_size = -1
	this.debugwindow = undefined
}

util.inherits(Advisor, EventEmitter);

Advisor.prototype.update = function(type, data) {
	if ( type === "ticker" ){
		this.tickerFeed = data
	}else if ( type == "account" ) {
		this.account = data
		this.sellAssetBalance = data.find((a) => a.currency === this.gdaxconfig.trade.buy_asset )
		this.buyAssetBalance  = data.find((a) => a.currency === this.gdaxconfig.trade.sell_asset)
	}
	this.calculate()
}
Advisor.prototype.calculate = function(){
        if( this.tickerFeed.current 
         && this.tickerFeed.last  
         && this.sellAssetBalance 
         && this.buyAssetBalance  
	 ){
                var simplebid = parseFloat((this.tickerFeed.current.best_bid - .50 ).toFixed(2))
                var simpleask = parseFloat((this.tickerFeed.current.best_ask + .25 ).toFixed(2))
                if ( simpleask < this.lastbuy ) parseFloat(( this.lastbuy + .15 ).toFixed(2))
                this.buy = simplebid
                this.ask = simpleask
                sa = this.sellAssetBalance.available
                ba = this.buyAssetBalance.available
                bs = ba / this.buy
                this.ask_size = parseFloat(sprintf("%.2f",  sa ));
                this.buy_size = parseFloat(sprintf("%.2f",  bs ));
		
        }
}

module.exports = Advisor

