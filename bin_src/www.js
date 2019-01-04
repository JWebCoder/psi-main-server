/**
 * Module dependencies.
 */

import 'envLoader'
import App from 'app'
import Debug from 'debug'
import http from 'http'
import 'tcp'

const debug = Debug('raspsi:server')

let params = {
  SERVER_PORT: process.env.SERVER_PORT,
  NOVE_ENV: process.env.NODE_ENV,
}

console.log('---------------------------------------------')
console.log('INIT PARAMETERS:\n', params)
console.log('---------------------------------------------')

/**
 * Get port from environment and store in Express.
 */

var app = new App()

var port = normalizePort(process.env.SERVER_PORT || '3000')
app.server.set('port', port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app.server)

/**
 * Listen on provided port, on all network interfaces.
 */

server.on('error', onError)
server.on('listening', onListening)

server.listen(port)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
}
