
function trades(name = "default"){        	
    this.name=name;
    this.ticker_price= 0.00;
    this.last_price= 0.00;
    this.current_price= 0.00;
    this.atv_price= 0.00;
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
    this.current_price = tp.price;
}
trades.prototype.setAtvPrice=function( tp ){
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
    if ( tp.type === "open" ) this.atv_price = ( this.atv_price + tp.price ) / 2;
    if ( tp.type === "close" ) this.atv_price = ( this.atv_price - tp.price ) / 2;
}
module.exports = trades
