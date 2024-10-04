# 图片压缩工具

## 介绍
- 基于`tinypng`的图片压缩工具，支持图片压缩功能。
- 使用客户端压缩图片，无需上传到服务器，直接在客户端进行压缩。

## 使用方法
- 安装
```shell
npm install tinypng-lib
```
- 使用
```vue
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
```


## 参数说明

```ts
/**
 * 压缩图片参数
 */
interface CompressOptions {
    minimumQuality?: number; // 最小质量
    quality?: number; // 压缩质量 0 - 1
    fileName?: string; // 压缩后的文件名, 默认为file.name
}

```

## 返回值说明
```ts
/**
 * 压缩图片结果
 */
interface CompressResult {
    success: boolean, // 是否成功
    file: File, // 压缩后的文件
    originalSize: number, // 原始文件大小
    compressedSize: number, // 压缩后文件大小
    rate: number, // 压缩率（压缩为原来的%）
    output: ArrayBuffer, // 压缩后的 ArrayBuffer
    blob: Blob, // 压缩后的 Blob
    rateString: string, // 压缩率字符串

}

```

## 注意事项
- 请确保已经安装了`tinypng-lib`模块