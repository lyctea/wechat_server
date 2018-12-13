const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 创建 Schema(数据模型，不具备操作数据库的能力)
const TicketSchema = new Schema({
  name: String,
  ticket: String,
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
TicketSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

// 静态方法
TicketSchema.statics = {
  // 从数据库中获取Ticket
  async getTicket() {
    const ticket = await this.findOne({
      name: 'ticket'
    }).exec()

    if (ticket && ticket.ticket) {
      ticket.ticket = ticket.ticket
    }

    return ticket
  },

  // 将请求过来的数据data，存放到数据库中
  async saveTicket(data) {
    let ticket = await this.findOne({
      name: 'ticket'
    }).exec()

    if (ticket) {
      ticket.ticket = data.ticket
      ticket.expires_in = data.expires_in
    } else {
      // 创建一条新的记录
      ticket = new Ticket({
        name: 'ticket',
        ticket: data.ticket,
        expires_in: data.expires_in
      })
    }

    await ticket.save()
    return data
  }
}

// 根据schema创建model
const Ticket = mongoose.model('Ticket', TicketSchema)
