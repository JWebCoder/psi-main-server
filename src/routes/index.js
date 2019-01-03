import { Router } from 'express'
import ApiRouter from 'routes/api'
import path from 'path'
import Debug from 'debug'

const apiRouter = new ApiRouter()

const debug = Debug('cpmgb:routing')

const router = Router()

// A module generates all the express Routes.
export default function () {
  debug('start')
  // GET renders home page
  router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../../public/index.html'))
  })

  router.get('/admin', function (req, res) {
    res.sendFile(path.join(__dirname, '../../public/admin.html'))
  })

  router.use('/api', apiRouter.getRoutes())

  debug('end')
  return router
};
