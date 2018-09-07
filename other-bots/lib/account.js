
function account(name = "default"){        	
    this.name=name;
    this.ballance=[]
}

account.prototype.getName=function(){
    return this.name;
}

account.prototype.updateAccount=function( b ) {
	this.ballance = b;	
}

account.prototype.getAllAccount=function( ) {
	return this.ballance;
}

module.exports = account
