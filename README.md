Nimbl
=====

A small node HTTP server with customisable endpoint logic.

Installation
------------

    npm install -g nimbl

Configuration
-------------

If you want to use Nimbl as a simple webserver you have nothing to configure. Please see
the Running section on how to run Nimbl.

In order to customise Nimble you need to create an endpoints.js file in the directory that
you want to serve through Nimbl.

Here's an example endpoints.js file:

    var http = require('http'),
        path = require('path'),
        common = require(path.join(path.dirname(process.argv[1]), 'common')),
        endpoints = module.exports = {};
     
     
      /*
       * Add your own endpoints to the array returned by getEndpoints.
       * Use the common.ep constructor to create an endpoint as in the example below.
       * The ep constructor takes 2 parameters:
       * 1. The path to the endpoint to serve. ('/hello' in the example below)
       * 2. A function that takes in a request, response and uri as input and performs an
       *    output on the response object.
       */
     
      endpoints.getEndpoints = [
        new common.ep('/hello', function(request, response, uri) {
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


If all goes well, when you hit [http://localhost:9999/](http://localhost:9999/) you should see the Nimbl welcome page.

![Alt text](https://raw.githubusercontent.com/ssanj/Nimbl/master/nimbl_index.png)

Customisation
-------------

If you want to change the default index page served through nimbl simply create an index.html page of your choosing and drop it in the directory being served. In general, if you request a directory and that directory has a index.html page, it will be shown instead of a 404.
