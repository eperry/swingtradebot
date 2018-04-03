
function account(name = "default"){        	
    this.name=name;
    this.orders=[]
}

account.prototype.getName=function(){
    return this.name;
}

account.prototype.updateAccount=function( o ) {
	this.orders = o;	
}

module.exports = account
