const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 创建 Schema(数据模型，不具备操作数据库的能力)
const TokenSchema = new Schema({
  name: String,
  token: String,
  expires_in: Number,
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    update: {
      type: Date,
      default: Date.now()
    }
  }
})

// pre中间件，做控制流程，执行下一个方法需要调用next()
TokenSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

// 静态方法
TokenSchema.statics = {
  // 从数据库中获取token
  async getAccessToken() {
    const token = await this.findOne({
      name: 'access_token'
    }).exec()

    if (token && token.token) {
      token.access_token = token.token
    }

    return token
  },

  // 将请求过来的数据data，存放到数据库中
  async saveAccessToken(data) {
    let token = await this.findOne({
      name: 'access_token'
    }).exec()

    if (token) {
      token.token = data.access_token
      token.expires_in = data.expires_in
    } else {
      // 创建一条新的记录
      token = new Token({
        name: 'access_token',
        token: data.access_token,
        expires_in: data.expires_in
      })
    }

    await token.save()
    return data
  }
}

// 根据schema创建model
const Token = mongoose.model('Token', TokenSchema)
