var common = module.exports = {}

common.ep = function(matchPath, responseFunction, options) {

	var self = this;

	self.defaults = function() {
		if (typeof options === 'undefined') {
	    	options = { }
	    } 

	    if (typeof options.delay === 'undefined') {
	    	options.delay = 100;	
	    }

	    if (typeof options.method === 'undefined') {
	    	options.method = 'get';
	    }
	}

	self.defaults();
    
    self.doesMatch = function(request, incomingPath) {
    	var method = request.method.toLowerCase();
    	var matched = matchPath === incomingPath && options.method === method;
    	console.log("matchPath: [" + matchPath + "], " + 
    		        "reqPath: [" + incomingPath + "], " + 
    		        "matchMethod: [" + options.method.toLowerCase() + "], " + 
    		        "reqMethod: [" + method + "], " + 
    		        "matched: " + matched);
        return matched;
    }

    self.sendResponse = function(request, response, uri) {   
        setTimeout(function(){ responseFunction(request, response, uri); },  options.delay);
    }
}

common.jsonResponse = function (handler){

	    return function(request, response, uri) {
	        response.writeHead(200, {"Content-Type": "application/json"});        
	        handler(request, response, uri);
	        response.end();
	    }
}


common.htmlResponse = function (handler){

	    return function(request, response, uri) {
	        response.writeHead(200, {"Content-Type": "text/html"});        
	        handler(request, response, uri);
	        response.end();
	    }
}
