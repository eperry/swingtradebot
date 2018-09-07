function orders(name = "default"){        	
    this.name=name;
    this.orders=[]
}

orders.prototype.getName=function(){
	return this.name;
}

orders.prototype.updateOrders=function( o ) {
	this.orders = o;	
}

orders.prototype.getAllOrders=function(){
	return this.orders;
}

orders.prototype.getOrder = function( oid ){
        if ( orders.length ) return  orders.find((o) => { if ( o.id === oid ) return o })
	else return [];
}

module.exports = orders
