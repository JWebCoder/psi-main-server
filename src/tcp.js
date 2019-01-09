/*
In the node.js intro tutorial (http://nodejs.org/), they show a basic tcp
server, but for some reason omit a client connecting to it.  I added an
example at the bottom.
Save the following server in example.js:
*/
import Debug from 'debug'
import 'tcp'
import { messageParser } from 'utils'
import net from 'net'
import shortid from 'shortid'

const sockets = {}
const functions = {}
const callbacks = {}
const debug = Debug('raspsi:tcp-server')

debug('Creating tcp server')
var server = net.createServer(function (socket) {
  console.log('Server: New client online')

  const ID = new Date().getTime()
  sockets[ID] = {
    socket,
    functionList: [],
  }

  socket.on('data', function (data) {
    const message = messageParser(data)
    if (!message) {
      return
    }
    console.log('SERVER MESSAGE:', message)
    switch (message.type) {
      case 'functionList':
        sockets[ID].functionList = message.items
        message.items.forEach(
          functionName => {
            functions[functionName] = [
              ...(functions[functionName] || []),
              {
                ID,
                counter: 0,
              },
            ]
          }
        )
        console.log(functions)
        break
      case 'runFunction':
        if (functions[message.function.name] && sockets[functions[message.function.name]]) {
          sockets[functions[message.function.name]].socket.write(JSON.stringify({
            type: 'runFunction',
            function: {
              name: message.function.name,
            },
          }))
        }
        break
      case 'functionAnswer':
        if (message.callbackID && callbacks[message.callbackID]) {
          callbacks[message.callbackID](message.data)
          delete callbacks[message.callbackID]
        }
    }
  })

  socket.on('end', function () {
    sockets[ID].functionList.forEach(
      functionName => {
        functions[functionName] = functions[functionName].filter(
          functionItem => {
            return functionItem.ID !== ID
          }
        )
        if (!functions[functionName].length) {
          delete functions[functionName]
        }
      }
    )
    delete sockets[ID]
    console.log('Server: Client offline')
  })
})

server.on('listening', onListening)

function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
}

server.listen(process.env.TCP_SERVER_PORT || 1337, 'localhost')

export function getDataFromFunction (functionName, body, query, callback) {
  if (functions[functionName]) {
    let functionToCall = functions[functionName].find(
      functionItem => {
        return functionItem.counter === 0
      }
    )

    if (!functionToCall) {
      functions[functionName] = functions[functionName].map(
        functionItem => {
          functionItem.counter = 0
          return functionItem
        }
      )
      functionToCall = functions[functionName][0]
    }

    functionToCall.counter = 1

    if (sockets[functionToCall.ID]) {
      const callbackID = shortid.generate()
      callbacks[callbackID] = callback
      sockets[functionToCall.ID].socket.write(JSON.stringify({
        type: 'runFunction',
        function: {
          name: functionName,
        },
        data: {
          body,
          query,
        },
        callbackID,
      }))
      console.log(functions)
    }
  } else {
    const error = new Error('Not Found')
    error.status = 404
    throw error
  }
}
