<template>
  <div id="app">
    <input type="file" @input="uploadImg" />
    <img :src="imgUrl" alt="">
  </div>
</template>

<script>
import TinyPNG from 'tinypng-lib'


export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      imgUrl: ''
    }
  },
  methods: {
    async uploadImg(e) {
      const file = e.target.files[0];
      try {
        const res = await TinyPNG.compress(file, {})
        console.log('res', res)
        const url = URL.createObjectURL(res.blob)
        const img = new Image()
        this.imgUrl = url
      } catch (error) {
        console.log("error", error)
      }

    }
  }
}
</script>