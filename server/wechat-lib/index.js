import request from 'request-promise'
// import formstream from 'formsrteam'
import fs from 'fs'
import path from 'path'

const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: base + 'token?grant_type=client_credential',
  temporary: {
    upload: base + 'media/upload?',
    fetch: base + 'media/get?'
  },
  permanent: {
    upload: base + 'material/add_material?',
    uploadNews: base + 'media/add_news?',
    uploadNewsPick: base + 'media/uploadimg?',
    fetch: base + 'media/get_material',
    del: base + 'media/del_material',
    update: base + 'media/update_news',
    count: base + 'media/get_materialcount',
    batch: base + 'media/batchget_material'
  }
}

/**
 * 读取文件大小
 * @param filepath 文件路径
 * @returns {Promise<any>}
 */
function statFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.stat(filepath, (err, stat) => {
      if (err) reject(err)
      else resolve(stat)
    })
  })
}

export default class Wechat {
  constructor(opts) {
    this.opts = Object.assign({}, opts)
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken

    this.fetchAccessToken()
  }

  /**
   * 请求微信接口
   * @param options
   * @returns {Promise<void>}
   */
  async request(options) {
    options = Object.assign({}, options, { json: true })
    try {
      const response = await request(options)

      return response
    } catch (error) {
      console.error(error)
    }
  }

  async fetchAccessToken() {
    let data = await this.getAccessToken()
    // 验证token
    if (!this.isValidAccessToken(data)) {
      data = await this.updateAccessToken()
    }

    await this.saveAccessToken(data)
    return data
  }

  // 更新token
  async updateAccessToken() {
    const url = `${api.accessToken}&appid=${this.appID}&secret=${
      this.appSecret
    }`
    const data = await this.request({ url })
    const now = new Date().getTime()
    const expiresIn = now + (data.expires_in - 20) * 1000

    data.expires_in = expiresIn
    return data
  }

  isValidAccessToken(data) {
    if (!data || !data.access_token || !data.expires_in) {
      return false
    }
    const expiresIn = data.expires_in
    const now = new Date().getTime()

    //  判断是否过期
    return now < expiresIn
  }

  /**
   * 钩子方法，调用不同方法，获取options，调用微信接口
   * @param operation
   * @param args
   * @returns {Promise<void>}
   */
  async handle(operation, ...args) {
    const tokenData = await this.fetchAccessToken()
    const options = await this[operation](tokenData.access_token, ...args)
    const data = await this.request(options)

    return data
  }

  /**
   * 配置微信素材上传参数
   * @param token 用户凭证
   * @param type 素材类型
   * @param material 原材料
   * @param permanent 标记是否是永久素材
   */
  async uploadMaterial(token, type, material, permanent) {
    let form = {}
    let url = api.temporary.upload // 临时文件api

    if (permanent) {
      url = api.permanent.uploadNewsPic

      _.extend(form, permanent)
    }

    if (type === 'news') {
      url = api.permanent.uploadNews
      form = material
    } else {
      // form = formstream()
      // const stat = await statFile(material)
      // form.file('media', material, path.basename(material), stat.size)
      form.media = fs.createReadStream(material)
    }

    let uploadUrl = url + 'access_token=' + token

    if (!permanent) {
      uploadUrl += '&type=' + type
    } else {
      // form.field('access_token', access_token)
      form.access_token = access_token
    }

    const options = {
      method: 'POST',
      url: uploadUrl,
      json: true
    }

    if (type === 'news') {
      options.body = form
    } else {
      options.formData = form
    }

    return options
  }
}
