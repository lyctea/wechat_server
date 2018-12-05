import xml2js from 'xml2js'
import template from './tpl'

/**
 * xml转json
 * @param xml
 * @returns {Promise<any>}
 */
function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { trim: true }, (err, content) => {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

/**
 * 将嵌套对象展平
 * @param result
 */
function formatMessage(result) {
  let message = {}

  if (typeof result === 'object') {
    const keys = Object.keys(result)

    // 开始遍历对象的每个属性
    for (let i = 0, len = keys.length; i < len; i++) {
      let item = result[keys[i]]
      let key = keys[i]

      //
      if (!(item instanceof Array) || item.length === 0) {
        continue
      }

      if (item.length === 1) {
        let val = item[0]
        if (typeof val === 'object') {
          message[key] = formatMessage(val)
        } else {
          message[key] = (val || '').trim()
        }
      } else {
        message[key] = []

        for (let j = 0, len = item.length; j < len; j++) {
          message[key].push(formatMessage(item[j]))
        }
      }
    }
  }

  return message
}

function tpl(content, message) {
  let type = 'text'

  if (Array.isArray(content)) {
    type = 'news'
  }

  if (!content) {
    content = 'Empty News'
  }

  if (content && content.type) {
    type = 'text'
  }

  let info = Object.assign(
    {},
    {
      content: content,
      createTime: new Date().getTime(),
      msgType: content.type || 'text',
      toUserName: message.FromUserName,
      fromUserName: message.ToUserName
    }
  )

  return template(info)
}

export { parseXML, formatMessage, tpl }
