/*
In the node.js intro tutorial (http://nodejs.org/), they show a basic tcp
server, but for some reason omit a client connecting to it.  I added an
example at the bottom.
Save the following server in example.js:
*/
import { messageParser } from 'utils'
import net from 'net'
import shortid from 'shortid'
const sockets = {}
const functions = {}
const callbacks = {}

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
          functionItem => {
            functions[functionItem] = ID
          }
        )
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
      functionItem => {
        delete functions[functionItem]
      }
    )
    delete sockets[ID]
    console.log('Server: Client offline')
  })
})

server.listen(1337, 'localhost')

export function getDataFromFunction (functionName, body, query, callback) {
  if (functions[functionName] && sockets[functions[functionName]]) {
    const callbackID = shortid.generate()
    callbacks[callbackID] = callback
    sockets[functions[functionName]].socket.write(JSON.stringify({
      type: 'runFunction',
      function: {
        name: functionName,
        body,
        query,
      },
      callbackID,
    }))
  } else {
    const error = new Error('Not Found')
    error.status = 404
    throw error
  }
}
