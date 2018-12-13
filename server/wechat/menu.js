export default {
  button: [
    {
      name: '菜单测试',
      sub_button: [
        {
          name: '小程序',
          type: 'click',
          key: 'mini_clicked'
        },
        {
          name: '大程序',
          type: 'click',
          key: 'big_clicked'
        }
      ]
    },
    {
      name: '前端框架',
      sub_button: [
        {
          name: 'react',
          type: 'view',
          url: 'http://www.baidu.com'
        },
        {
          name: '我的位置',
          type: 'location_select',
          key: 'location'
        },
        {
          name: '扫码',
          type: 'scancode_push',
          key: 'scancode'
        }
      ]
    }
  ]
}
