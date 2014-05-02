/*
 * Nimbl
 * 
 * @author: Sanjiv Sahayam
 * @email: sanjsmailbox@gmail.com
 * @twitter: http://twitter.com/ssanj
 * @license: MIT
 *
 */

var libpath = require('path');
    http = require("http"),
    fs = require('fs'),
    url = require("url"),
    mime = require('mime'),
    /* optionally load endpoints.js if it exists */
    endpoints = getOptionalLib('endpoints', { getEndpoints: [] }),
    path = ".",
    /* if a port has been supplied use that, if not use 8888 */
    port = process.argv.length >= 3 ? process.argv[2] : 8888;


  /*
   * Loads a library from the current working directory using require.js
   * and uses the @onError parameter as the return result if the library
   * can't be loaded.
   *
   * @param {String} libname - The name of the library to load from the current directory.
   * @param {Object} onError - The default object to return if the library can't be loaded.
   * @return {Object} - The library requested or the default object.
   */  
  function getOptionalLib(libname, onError) {
    try {
      return require(libpath.join(process.cwd(), libname));
    } catch (e) {
      return onError;
    }
  }

  /*
   * If enpoint.js has been loaded from the current directory and it has endpoints, then try
   * and match the incoming request uri with that of an endpoint.
   *
   * @param {Object} request - The request object.
   * @param {Object} response - The response object.
   * @param {String} uri - The request path.   
   * @return {boolean} - If the url matches and endpoint, then sends back the response of the endpoint and
   * returns {true}. Otherwise returns {false}.
   */
  function endpointMatched(request, response, uri) {
    var eps = endpoints.getEndpoints;

    for (index = 0; index < eps.length; index++) {
        if (eps[index].doesMatch(request, uri)) {
            //if we find a match, we return the response and stop searching.
            eps[index].sendResponse(request, response, uri);            
            return true;
        }
    }

    return false;
  }

  /*
   * Serves the file specified to the client, if possible or sends back a 500 error if the file contents 
   * can't be returned..
   *
   * @param {String} filename - The name of the file to serve to the client.
   * @param {Object} response - The response object.
   * @param {Object} response - The response object.   
   * @return {void} - serves the file if it can be read and sends the content to the client or returns a 500 error.
   * returns {true}. Otherwise returns {false}.
   */
  function serveFile(filename, response) {
     fs.readFile(filename, "binary", function (err, file) {
        if (err) {
            serve500(err, response);
        } else {
          response.writeHead(200, { "Content-Type": mime.lookup(filename) });
          response.write(file, "binary");
          response.end();
        }
     });
  }

  /*
   * Adds square braces around the supplied value.
   * @example: braced("hello") -> "[hello]"
   *
   * @param {String} value - The value to insert square braces around.
   * @return {String} - The value supplied in square braces.
   */
  function braced(value) {
    return "[" + value + "]"
  }

  /*
   * Serves the first valid file in an array of filenames. Each file will be tried in turn until one can be
   * returned back to the client in the response. If none of the files are reachable a 404 error is returned.
   * @example: braced("hello") -> "[hello]"
   *
   * @param {String} filenames - An array of filesnames in the order they should be searched for.
   * @param {Object} response - The response object.
   * @return {void} - returns the contents of the first file that can be served or returns a 404 error.
   */
  function serveOneOf(filenames, response) {
      for (index = 0; index < filenames.length; index++) {
        
        var filename = filenames[index];
        var braceFilename = braced(filename);
        console.log("searching for " + braceFilename);        
        
        if(fs.existsSync(filename)) {
              console.log("serving " + braceFilename);        
              serveFile(filename, response);
              return;
        } else {
          console.log("could not find " + braceFilename);
        } 
      }

      serve404(response);      
  }

  /*
   * Returns the path to a file in the installation directory of Nimbl.
   *
   * @param {String} filename - The name of the file to load from the installation directory.
   * @return {String} - The full path to the file within the installation directory.
   */
  function fromInstallPath(filename) {
    return libpath.join(libpath.dirname(process.argv[1]), filename);
  }

  /*
   * Returns the result of joining a path a filename.
   *
   * @param {String} path - The path.   
   * @param {String} filename - The name of the file.
   * @return {String} - The full path to the file.
   */
  function join(path, filename) {
    return libpath.join(path, filename);
  }
  
  /*
   * Returns 404 error to the client.
   *
   * @param {Object} response - The response object.
   * @return {void} - returns a 404 error to the client.
   */ 
  function serve404(response) {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.write("404 Not Found\n");
    response.end();
  }

  /*
   * Returns 500 error to the client along with the error that occurred.
   *
   * @param {String} err - The error that occurred.   
   * @param {Object} response - The response object.
   * @return {void} - returns a 500 error to the client.
   */
  function serve500(err, response) {
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.write(err + "\n");
    response.end(); 
  }

  /*
   * Prints a summary of the working directory and port of the running server.
   *
   * @return {void} - A summary of the working directory and port of the running server.
   */  
  function printSummary() {
    fs.realpath('.', {}, function (err, resolvedPath) {
      if (err) throw err;
      console.log("started server from " + braced(resolvedPath) +" on port " + braced(port));
    });    
  }

  /*
   * Starts the server on the supplied port.
   *
   * @param {Object} request - The request object.
   * @param {Object} response - The response object.
   * returns {void}. Starts the server on the supplied port.
   */
  http.createServer(function (request, response) {

      var uri = url.parse(request.url).pathname,
          filename = join(path, uri);

      console.log("request " + braced(uri));    

      if (!endpointMatched(request, response, uri)) {
        fs.exists(filename, function (exists) {
            if (!exists) {
                serve404(response);
            } else {
              if (fs.statSync(filename).isDirectory()) {
                  serveOneOf([ join(filename, 'index.html'), 
                               fromInstallPath('index.html')
                              ], response);
              } else {
                serveFile(filename, response);
              }
            }
        });
      }     
  }).listen(port);

printSummary();
