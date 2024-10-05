# 图片压缩工具

## 介绍
- 基于`tinypng`的图片压缩工具，支持图片压缩功能。
- 使用客户端压缩图片，无需上传到服务器，直接在客户端进行压缩。

## 使用方法
- 安装
```shell
npm install tinypng-lib
```
- 基本使用
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

## WebWorker中使用
1. webpack项目中安装`worker-loader`
```shell
npm install worker-loader
```
2. 在`webpack.config.js`中配置
```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      },
    ],
  },
};
```
3. 定义`imageWorker.worker.js`
```js
// imageWorker.worker.js
import TinyPNG from 'tinypng-lib';

self.onmessage = async function (e) {
    const {
        image,
        options
    } = e.data;
    try {
        const result = await TinyPNG.compressWorkerImage(image, options);
        self.postMessage(result);
    } catch (error) {
        self.postMessage({ error: error.message });
    }
};

```
4. 在组件中使用
  - 监听webworker的消息
  -  使用 `TinyPNG.getImage` 处理文件信息
  - 发送图片信息给webworker进行压缩
  - 接收webworker返回的压缩结果
```vue
<script>
// Import the worker
import ImageWorker from './imageWorker.worker.js'; // This is the bundled worker
import { getSizeTrans } from '../utils';
import TinyPNG from 'tinypng-lib';
export default {
  name: 'Base',
  data() {
    return {
      imgUrl: '',
      compressResult: {},
      count: 0,
      compressing: false,
    }
  },
  mounted() {
    // Start the worker when the component is mounted
    this.worker = new ImageWorker();

    // Receive the message (compressed result) from the worker
    this.worker.onmessage = (e) => {
      this.compressing = false;
      const result = e.data;
      if (result.error) {
        console.error("Compression failed:", result.error);
      } else {
        const url = URL.createObjectURL(result.blob);
        this.imgUrl = url;
        this.compressResult = result;
      }
    };

    // Counter for the UI
    setInterval(() => {
      this.count++;
    }, 500);
  },
  methods: {
    getSizeTrans,
    async uploadImg(e) {
      const file = e.file;
      // 获取图片信息
      const image = await TinyPNG.getImage(file);
      this.compressing = true;
      // Send the file to the worker for compression
      this.worker.postMessage({
        image,
        options: {
          minimumQuality: 30,
          quality: 85
        }
      });
    }
  },
  beforeDestroy() {
    // Terminate the worker when the component is destroyed
    if (this.worker) {
      this.worker.terminate();
    }
  }
}
</script>

```

## 注意事项
- 请确保已经安装了`tinypng-lib`模块