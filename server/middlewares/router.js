import Router from 'koa-router'
var sha1 = require('sha1')
import config from '../config'

export const router = app => {
  const router = new Router()

  router.get('/wechat-hear', (ctx, next) => {
    // import wechat，执行获取token的方法
    require('../wechat')

    const token = config.wechat.token
    const { signature, nonce, timestamp, echostr } = ctx.query

    const str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)

    if (sha === signature) {
      ctx.body = echostr || '2323'
    } else {
      ctx.body = 'Failed'
    }
  })

  app.use(router.routes())
  app.use(router.allowedMethods())
}
