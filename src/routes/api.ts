import { Router } from 'express'
import { getDataFromFunction } from '@root/tcp'
export default class SalaryRouter {
  router: Router
  constructor (router?: Router) {
    this.router = router || Router()
    this.router.all('/:functionName',
      (req, res, next) => {
        getDataFromFunction(
          req.params.functionName,
          req.body,
          req.query,
          function (data) {
            res.json({
              data,
            })
          }
        )
      },
    )
  }

  getRoutes (): Router {
    return this.router
  }
}
