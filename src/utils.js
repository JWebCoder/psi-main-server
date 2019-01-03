import fs from 'fs'
import path from 'path'

export function messageParser (data) {
  let message = ''
  try {
    message = JSON.parse(data.toString())
  } catch (e) {
    return
  }
  return message || null
}

export function listFunctions () {
  const functionsPath = path.resolve(__dirname, '../functions')
  return fs.readdirSync(functionsPath).filter(function (file) {
    return fs.statSync(functionsPath + '/' + file).isDirectory()
  })
}
