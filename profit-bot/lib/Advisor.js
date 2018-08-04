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
	this.buy         = -1
	this.ask         = -1
	this.buy_size    = -1
	this.ask_size    = -1
	this.debugwindow = undefined
	this.product_id  = gdaxconfig.trade.buy_asset+'-'+gdaxconfig.trade.sell_asset
	this.monitor     = undefined
}


util.inherits(Advisor, EventEmitter);

Advisor.prototype.priceMonitor = function(){
	/******************
	this.emit("message", { 
		"buyAssetBalance": this.buyAssetBalance,
		"minOrderSize"   : this.gdaxconfig.minOrderSize,
		"sellAssetBalance" : this.sellAssetBalance
	})
	*******************/
	// Coin
	if ( this.buy_size >  this.gdaxconfig.minOrderSize ) {
		var orderParams = {
			"type":       "limit",
			"side":       "buy",
			"post_only":  true,
			"price":      this.buy,
			"size":       this.buy_size,
			"product_id": this.product_id
		} 
		if( this.gdaxconfig.minOrderSize < orderParams.size )
			this.emit("buy",orderParams)
	}
	// USD
	if ( this.ask_size >  this.gdaxconfig.minOrderSize ) {
		var orderParams = {
			"type":       "limit",
			"side":       "sell",
			"post_only":  true,
			"price":      this.ask,
			"size":       this.ask_size,
			"product_id": this.product_id
		} 
		if( this.gdaxconfig.minOrderSize < orderParams.size )
			this.emit("sell",orderParams)
	}
}
Advisor.prototype.update = function(type, data) {
	if ( type === "ticker" ){
		this.tickerFeed = data
	}else if ( type == "filled" ) {
		this.emit("update","UPDATE"+JSON.stringify(data,null,1))
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
                var simplebid = ((this.tickerFeed.current.best_bid - this.gdaxconfig.bidAdjustment)*100) /100
                var simpleask = ((this.tickerFeed.current.best_ask + this.gdaxconfig.askAdjustment)*100 )/100
                if ( simpleask < this.lastbuy ) (( this.lastbuy + this.gdaxconfig.askAdjustment )*100    )/100
                this.buy = simplebid
                this.ask = simpleask
                as = Math.trunc(this.sellAssetBalance.available*100)/100 ;
		as = as > this.gdaxconfig.maxOrderSize ? this.gdaxconfig.maxOrderSize: as
                bs = Math.trunc((this.buyAssetBalance.available / this.buy)*100 )/100  ;
		bs = bs > this.gdaxconfig.maxOrderSize ? this.gdaxconfig.maxOrderSize: bs
                this.ask_size = as
                this.buy_size = bs
		
        }
}

module.exports = Advisor

