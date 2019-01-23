// @flow
/*
In the node.js intro tutorial (http://nodejs.org/), they show a basic tcp
server, but for some reason omit a client connecting to it.  I added an
example at the bottom.
Save the following server in example.js:
*/

import Debug from 'debug'
import { messageParser } from '@root/utils'
import net from 'net'
import shortid from 'shortid'
import HttpError from './exceptions'

type functionItem = {
  ID: number,
  counter: number,
}

export interface socketMessage {
  type: string;
  items?: Array<string>
  function?: {
    name: string
  },
  callbackID?: string,
  data?: {}
}

const functions: {
  [key: string]: Array<functionItem>
} = {}

const sockets: {
  [key: string]: {
    socket: net.Socket,
    functionList: Array<string>
  }
} = {}

const callbacks: {
  [key: string]: (data?: {}) => void
} = {}
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
    const message: socketMessage | null = messageParser(data)
    if (!message) {
      return
    }
    console.log('SERVER MESSAGE:', message)
    switch (message.type) {
      case 'functionList':
        sockets[ID].functionList = []
        if (message.items) {
          sockets[ID].functionList = message.items
          message.items.forEach(
            (functionName: string) => {
              functions[functionName] = [
                ...(functions[functionName] || []),
                {
                  ID,
                  counter: 0,
                },
              ]
            }
          )
        }
        
        break
      case 'runFunction':
        if (message.function && functions[message.function.name]) {
          let functionName = message.function.name
          functions[functionName].forEach(
            functionItem => {
              sockets[functionItem.ID].socket.write(JSON.stringify({
                type: 'runFunction',
                function: {
                  name: functionName,
                },
              }))
            }
          )
          
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

server.listen(process.env.TCP_SERVER_PORT || 1337)

export function getDataFromFunction (functionName: string, body: any, query: any, callback: (data?: {}) => void) {
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
    const error = new HttpError(404, 'Not Found')
    throw error
  }
}
