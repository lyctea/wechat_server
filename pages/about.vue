<template>
  <section>
    <h1>签名获取测试</h1>

  </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
  asyncData({ req }) {
    return {
      name: req ? 'server' : 'client'
    }
  },
  head() {
    return {
      title: '测试页面'
    }
  },
  beforeMount() {
    const wx = window.wx
    const url = window.location.href

    this.$store.dispatch('getWechatSignature', url).then(res => {
      if (res.data.success) {
        const params = res.data.params

        wx.config({
          debug: true,
          appId: params.appId,
          timestamp: params.timestamp,
          nonceStr: params.noncestr,
          signature: params.signature,
          jsApiList: [
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'onMenuShareTimeline',
            'hideAllNonBaseMenuItem',
            'showMenuItems'
          ]
        })

        wx.ready(() => {
          wx.hideAllNonBaseMenuItem()
          console.log('hideAllNonBaseMenuItem success')
        })
      }
    })
  }
}
</script>
