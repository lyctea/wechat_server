export default async (ctx, next) => {
  const message = ctx.weixin

  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      ctx.body = `Welcome`
    } else if (message.Event === 'unsubscribe') {
      console.log('unsubscribe')
    } else if (message.Event === 'LOCATION') {
      ctx.body = message.Latitude + ' : ' + message.Longitude
    }
  } else if (message.MsgType === 'text') {
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
