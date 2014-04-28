var libpath = require('path');
    http = require("http"),
    fs = require('fs'),
    url = require("url"),
    mime = require('mime'),
    endpoints = require(libpath.join(process.cwd(), 'endpoints'));

var path = ".";
var port = process.argv.length >= 3 ? process.argv[2] : 8088;

http.createServer(function (request, response) {

    var uri = url.parse(request.url).pathname;
    var filename = libpath.join(path, uri);
    console.log("uri: " + uri); 
    console.log("filename: " + filename);

    var eps = endpoints.getEndpoints;

    for (index = 0; index < eps.length; index++) {
        var ep = eps[index];
        if (ep.doesMatch(request, uri)) {
            //if we find a match, we return the response and stop searching.
            ep.sendResponse(request, response, uri);            
            return;
        }
    }

    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) {
            filename += '/index.html';
            fs.exists(filename, function(hasLocalIndexFile) {
              if (!hasLocalIndexFile) {
                 //use default index
                 filename = libpath.join(libpath.dirname(process.argv[1]), 'index.html');
                 console.log("default filename: " + filename);                 
              }
            
                 fs.readFile(filename, "binary", function (err, file) {
                    if (err) {
                         response.writeHead(500, {
                             "Content-Type": "text/plain"
                        });
                        response.write(err + "\n");
                        response.end();
                        return;
                    }

                    var type = mime.lookup(filename);
                    response.writeHead(200, {
                        "Content-Type": type
                    });
                    response.write(file, "binary");
                    response.end();
                });

            });
        }

    });
}).listen(port);
console.log("started server on port: " + port);
