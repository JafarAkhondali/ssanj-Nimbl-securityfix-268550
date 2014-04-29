Nimbl
=====

A small node HTTP server with customisable endpoint logic.

Installation
------------

npm install -g Nimbl

Configuration
-------------

In order to customise Nimble you need to create an enpoints.js file in the directory that
you want to serve through Nimbl.

Here's an example endpoints.js file:

    var http = require("http"),
    common = require(path.join(path.dirname(process.argv[1]), 'common'));
 
    var endpoints = module.exports = {}
 
 
    /*
     * Add your own endpoints to the array returned by getEndpoints. 
     * Use the common.ep constructor to create an endpoint as in the example below.
     */
    
    endpoints.getEndpoints = [
      new common.ep('/hello', function(request, response, uri){
              response.writeHead(200, {"Content-Type": "application/json"});
              response.write(JSON.stringify({"messages":"Hello!"}));
              response.end();
      }),
  ];


Running
-------

From the directory that you want to serve, run:

    node PATH_TO_NIMBL PORT

Eg.

    node $NODE_PATH/nimbl/nimbl 9999


If all goes well, when you hit http://localhost:9999/ you should see the Nimbl welcome page.