export default async (ctx, next) => {
  const message = ctx.weixin

  let mp = require('../wechat')
  let client = mp.getWechat()

  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      ctx.body = `Welcome`
    } else if (message.Event === 'unsubscribe') {
      console.log('unsubscribe')
    } else if (message.Event === 'LOCATION') {
      ctx.body = message.Latitude + ' : ' + message.Longitude
    }
  } else if (message.MsgType === 'text') {
    // 测试接口
    if (message.Content === '1') {
      let userList = [
        'oKeyM1SxrrYfDm7N40Q68TtRyjtU',
        'oKeyM1WsyFJQQfBYGOUcUwlVvxG4',
        'oKeyM1eeYGmnf9ahgToIQMew4fRk',
        'oKeyM1Tt9G-P-V2u2Wuk4--oKfbI'
      ]

      const data = await client.handle(
        'batchUserInfo',
        userList.map(user => ({ openid: user, lang: 'zh_CN' }))
      )
    } else if (message.Content === '2') {
      const menu = require('./menu').default
      await client.handle('delMenu')
      const result = await client.handle('createMenu', menu)
    }

    ctx.body = message.Content
  } else if (message.MsgType === 'image') {
    ctx.body = {
      type: 'image',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'voice') {
    ctx.body = {
      type: 'voice',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'video') {
    ctx.body = {
      title: message.ThumbMediaId,
      type: 'video',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'location') {
    ctx.body =
      message.Location_X + ' : ' + message.Location_Y + ' : ' + message.Label
  } else if (message.MsgType === 'link') {
    ctx.body = [
      {
        title: message.title,
        description: message.Description,
        picUrl:
          'http://mmbiz.qpic.cn/mmbiz_jpg/aeN0yqibk2gcSQ7E3EicibyW1ZkPicbtesZGpPQJt5EJ1Cx67wXbhKOXdic1JQKlKTnr6yHDDgxms7ibNycfkDRv2UDQ/0',
        url: message.url
      }
    ]
  }
}
