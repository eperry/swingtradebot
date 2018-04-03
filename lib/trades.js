
function trades(name = "default"){        	
    this.name=name;
    this.ticker_price= 0.00;
    this.last_price= 0.00;
    this.current_price= 0.00;
    this.open_orders=[];
}

trades.prototype.getName=function(){
    return this.name;
}
trades.prototype.setTickerPrice=function( tp ) {
    this.ticker_price = tp;
}
trades.prototype.setLastPrice=function( tp ) {
    this.last_price = tp;
}
trades.prototype.setCurrentPrice=function( tp ){
    this.current_price = tp;
}
trades.prototype.addOpenOrder=function( o ) {
	this.open_orders.push(o)
}
trades.prototype.removeOpenOrder=function( o ){
	i = this.open_orders.findIndex((e) => { 
		if ( e.id == o.id ) return 	
	})
	open_orders[i].remove()
}
module.exports = trades
