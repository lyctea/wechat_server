const tip = `微信消息回复\n <a src="www.baidu.com">点击跳转</a>`

export default async (ctx, next) => {
  const message = ctx.weixin
  console.log(message)

  ctx.body = tip
}
