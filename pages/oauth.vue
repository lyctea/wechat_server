<template>
  <section>
    <h1>授权测试</h1>

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
    this.$store
      .dispatch('getUserByOAuth', encodeURIComponent(url))
      .then(res => {
        if (res.data.success) {
          console.log(res.data)
        }
      })
  }
}
</script>
