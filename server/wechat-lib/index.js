import request from 'request-promise'
import fs from 'fs'
import * as _ from 'lodash'

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
    uploadNewsPic: base + 'media/uploadimg?',
    fetch: base + 'media/get_material',
    del: base + 'media/del_material',
    update: base + 'media/update_news',
    count: base + 'media/get_materialcount',
    batch: base + 'media/batchget_material'
  },
  tag: {
    create: base + 'tags/create?',
    fetch: base + 'tags/get?',
    update: base + 'tags/update?',
    del: base + 'tags/delete?',
    fetchUsers: base + 'user/tag/get?',
    batchTag: base + 'members/batchtagging?',
    batchUnTag: base + 'members/batchuntagging?',
    getTagList: base + 'members/getidlist?'
  },
  user: {
    remark: base + 'user/info/updateremark?',
    info: base + 'user/info?', //每个用户对每个公众号是唯一的，对于不同公众号，用一用户openid不同
    batchInfo: base + 'user/info/batchget?',
    fetchUserList: base + 'user/get?',
    getBlackList: base + 'tags/embers/getblacklist?',
    batchBlackList: base + 'tags/members/batchblacklist?',
    batchUnBlackList: base + 'tags/members/batchunblacklist?'
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
    console.log(data)
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
      url = api.permanent.upload
      _.extend(form, permanent)
    }

    if (type === 'pic') {
      url = api.permanent.uploadNewsPic
    }

    if (type === 'news') {
      url = api.permanent.uploadNews
      form = material
    } else {
      form.media = fs.createReadStream(material)
    }

    let uploadUrl = url + 'access_token=' + token

    if (!permanent) {
      uploadUrl += '&type=' + type
    } else {
      if (type !== 'news') {
        form.access_token = token
      }
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

  fetchMaterial(token, mediaId, type, permanent) {
    let form = {}
    let fetchUrl = api.temporary.fetch

    if (permanent) {
      fetchUrl = api.permanent.fetch
    }

    let url = fetchUrl + 'access_token=' + token
    let options = { method: 'POST', url: url }

    if (permanent) {
      form.media_id = mediaId
      form.access_token = token
      options.body = form
    } else {
      if (type === 'video') {
        url = url.replace('https://', 'http://')
      }

      url += '&media_id' + mediaId
    }

    return options
  }

  deleteMaterial(token, mediaId) {
    const form = {
      media_id: mediaId
    }

    const url =
      api.permanent.del + 'access_token' + token + '&media_id' + mediaId

    return {
      method: 'POST',
      url,
      body: form
    }
  }

  updateMaterial(token, mediaId, news) {
    const form = {
      media_id: mediaId
    }

    _.extend(form, news)

    const url =
      api.permanent.update + 'access_token' + token + '&media_id' + mediaId

    return {
      method: 'POST',
      url,
      body: form
    }
  }

  countMaterial(token) {
    const url = api.permanent.count + 'access_token=' + token

    return { method: 'POST', url }
  }

  batchMaterial(token, options) {
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 10

    const url = api.permanent.batch + 'access_token=' + token

    return { method: 'POST', url, body: options }
  }

  /**
   * 创建标签
   * @param token
   * @param name
   * @returns {{method: string, url: string, body: {tag: {name: *}}}}
   */
  createTag(token, name) {
    const form = {
      tag: {
        name
      }
    }
    const url = api.tag.create + 'access_token=' + token
    return { method: 'POST', url, body: form }
  }

  /**
   * 获取公众号已创建的标签
   * @param token
   * @returns {{url: string}}
   */
  fetchTags(token) {
    const url = api.tag.fetch + 'access_token=' + token
    return { url }
  }

  /**
   * 更新标签
   * @param token
   * @param tagId
   * @param name
   * @returns {{method: string, url: string, body: {tag: {id: *, name: *}}}}
   */
  updateTag(token, tagId, name) {
    const form = {
      tag: {
        id: tagId,
        name
      }
    }
    const url = api.tag.update + 'access_token=' + token
    return { method: 'POST', url, body: form }
  }

  /**
   * 删除标签
   * @param token
   * @param tagId
   * @returns {{method: string, url: string, body: {tag: {id: *}}}}
   */
  delTag(token, tagId) {
    const form = {
      tag: {
        id: tagId
      }
    }
    const url = api.tag.del + 'access_token=' + token
    return { method: 'POST', url, body: form }
  }

  /**
   * 获取用户下标签列表
   * @param token
   * @param tagId
   * @param openId
   * @returns {{method: string, url: string, body: {tagid: *, next_openid: (*|string)}}}
   */
  fetchTagUsers(token, tagId, openId) {
    let form = {
      tagid: tagId,
      next_openid: openId || ''
    }

    const url = api.tag.fetchUsers + 'access_token=' + token
    return { method: 'POST', url, body: form }
  }

  /**
   * 批量为用户打标签,去标签
   * @param token
   * @param openIdList
   * @param tagId
   * @returns {{method: string, url: string, body: {openid_list: *, tagid: *}}}
   */
  batchTag(token, openIdList, tagId, unTag) {
    const form = {
      openid_list: openIdList,
      tagid: tagId
    }

    let url = unTag ? api.tag.batchUnTag : api.tag.batchTag

    url += 'access_token=' + token
    return { method: 'POST', url, body: form }
  }

  /**
   * 获取用户标签列表
   * @param token
   * @param openId
   * @returns {{method: string, url: string, body: {openid: *}}}
   */
  getTagList(token, openId) {
    const form = {
      openid: openId
    }

    const url = api.tag.getTagList + 'access_token=' + token
    return { method: 'POST', url, body: form }
  }

  /**
   * 设置用户备注名
   * @param token
   * @param openId
   * @param remark
   * @returns {{method: string, url: string, body: {openid: *, remark: *}}}
   */
  remarkUser(token, openId, remark) {
    const form = {
      openid: openId,
      remark: remark
    }
    const url = api.user.remark + 'access_token=' + token
    return { method: 'POST', url, body: form }
  }

  /**
   * 获取用户信息
   * @param token
   * @param openId
   * @param lang
   * @returns {{url: string}}
   */
  getUserInfo(token, openId, lang) {
    const url = `${api.user.info}
    access_token=${token}
    &openid${openId}
    &lang=${lang || 'zh_CN'}`

    return { url }
  }

  /**
   * 批量获取用户信息
   * @param token
   * @param userList
   * @returns {{method: string, url: string, body: {user_list: *}}}
   */
  batchUserInfo(token, userList) {
    const url = api.user.batchInfo + 'access_token=' + token
    const form = {
      user_list: userList
    }
    return { method: 'POST', url, body: form }
  }

  /**
   *  获取用户列表
   * @param token
   * @param openId
   * @returns {{url: string}}
   */
  batchUserList(token, openId) {
    const url = `${api.user.fetchUserList}
    access_token=${token}
    &next_openid${openId || ''}`

    return { url }
  }
}
