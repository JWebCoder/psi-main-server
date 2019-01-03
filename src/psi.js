import { messageParser, listFunctions } from './utils'
import net from 'net'
const loadedFunctions = {}

function run (loadedFunction, callbackID) {
  client.write(JSON.stringify({
    data: loadedFunction(),
    callbackID,
    type: 'functionAnswer',
  }))
}

let client = net.createConnection({
  port: 1337,
  host: 'localhost',
}, function () {
  console.log('PSI: PSI Client connected')
  client.write(JSON.stringify(
    {
      type: 'functionList',
      items: listFunctions(),
    }
  ))
})

client.on('data', function (data) {
  const message = messageParser(data)
  if (!message) {
    return
  }
  console.log('PSI Received: ' + data.toString())
  switch (message.type) {
    case 'runFunction':
      if (loadedFunctions[message.function.name]) {
        run(loadedFunctions[message.function.name], message.callbackID || null)
      } else {
        import('/Users/joaomoura/Repos/personal/ras-psi/functions/' + message.function.name + '/index.js').then(
          module => {
            loadedFunctions[message.function.name] = module.default
            run(loadedFunctions[message.function.name], message.callbackID || null)
          }
        ).catch(
          err => console.log(err)
        )
      }
      break
  }
})

client.on('close', function () {
  console.log('Client: Connection closed')
})
