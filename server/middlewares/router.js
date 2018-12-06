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

    const news = {
      articles: [
        {
          title: 'SSR',
          thumb_media_id: 'dnCq0cRKISK2IQT_HegK40T4WDHL665--jXKuQIpHWw',
          author: 'lyc',
          digest: '没有',
          show_cover_pic: 1,
          content: '很高让沟通哈',
          need_open_comment: 1,
          content_source_url: 'http://www.baidu.com'
        }
      ]
    }
    //若新增的是多图文素材，则此处应还有几段articles结构

    // 调用 uploadMaterial， 并传递参数
    const data = client.handle('uploadMaterial', 'news', news, {})
    console.log(data)
  })

  app.use(router.routes()).use(router.allowedMethods())
}
