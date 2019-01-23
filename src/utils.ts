// @flow
import fs from 'fs'
import path from 'path'
import { socketMessage } from '@root/tcp'

export function messageParser (data: string | Buffer): socketMessage | null {
  let message: socketMessage | null = null
  try {
    message = JSON.parse(data.toString())
  } catch (error) {
    return null
  }
  return message || null
}

export function listFunctions (): Array<string> {
  const functionsPath: string = path.resolve(__dirname, '../functions')

  return fs.readdirSync(functionsPath).filter(
    function (item: string): boolean {
      return fs.statSync(functionsPath + '/' + item).isDirectory()
    }
  )
}
