import { Router } from 'express'
import { getDataFromFunction } from 'tcp'
export default class SalaryRouter {
  constructor (router) {
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

  getRoutes () {
    return this.router
  }
}
