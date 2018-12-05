import sha1 from 'sha1'
import getRawBody from 'raw-body'
import * as util from './util'

export default function(opts, reply) {
  return async function wechatMiddle(ctx, next) {
    const token = opts.token
    const { signature, nonce, timestamp, echostr } = ctx.query

    const str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)

    if (ctx.method === 'GET') {
      if (sha === signature) {
        ctx.body = echostr || '2323'
      } else {
        ctx.body = 'Failed'
      }
    } else if (ctx.method === 'POST') {
      // 验证签名
      if (sha !== signature) {
        ctx.body = 'Failed'
        return false
      }

      const data = await getRawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })

      // 解析从微信 post 上来的数据，解析为对象
      const content = await util.parseXML(data)
      const message = util.formatMessage(content.xml)

      ctx.weixin = message

      // 根据消息类型处理回复
      await reply.apply(ctx, [ctx, next])

      const replyBody = ctx.body
      const msg = ctx.weixin

      // tpl模板生成回复的xml数据，返回给微信的xml，注意：中间不能有空格
      let xml = util.tpl(replyBody, msg)
      
      ctx.status = 200
      ctx.type = 'application/xml'
      ctx.body = xml
    }
  }
}
