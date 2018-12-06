import Router from 'koa-router'
import config from '../config'
import reply from '../wechat/reply'
import wechatMiddle from '../wechat-lib/middleware'
import { resolve } from 'path'

export const router = app => {
  const router = new Router()

  router.all('/wechat-hear', wechatMiddle(config.wechat, reply))

  router.get('/upload', async (ctx, next) => {
    let mp = require('../wechat')
    let client = mp.getWechat()

    // 调用 uploadMaterial， 并传递参数
    const data = client.handle(
      'uploadMaterial',
      'video',
      resolve(__dirname, '../../ice.jpg'),
      {
        type: 'image'
      }
    )
    console.log(data)
  })

  app.use(router.routes()).use(router.allowedMethods())
}
