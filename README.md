# TinyPNG图片压缩工具使用

![image-20241005120141325](https://cdn.jsdelivr.net/gh/viteui/viteui.github.io@web-image/web/image/202410051201463.png)




## 介绍
- 基于`tinypng`的图片压缩工具，支持图片压缩功能。
- 使用客户端压缩图片，无需上传到服务器，直接在客户端进行压缩。
- 支持WebWork
- npm：[tinypng-lib](https://www.npmjs.com/package/tinypng-lib)

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

| 参数           | 说明                  | 默认值   |
| :------------- | --------------------- | -------- |
| minimumQuality | 最小质量              | 35       |
| quality        | 期望压缩质量（0-100） | 88       |
| fileName       | 压缩后的文件名        | 文件名称 |


```ts
/**
 * 压缩图片参数
 */
interface CompressOptions {
    minimumQuality?: number; // 最小质量
    quality?: number; // 压缩质量 0 - 100
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



### 基本使用

![image-20241005120050296](https://cdn.jsdelivr.net/gh/viteui/viteui.github.io@web-image/web/image/202410051200510.png)
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
      	// 使用支持webWorker的方法
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
        // 拿到压缩结果
        console.log(e);
      }
    };
  },
  methods: {
    getSizeTrans,
    async uploadImg(e) {
      const file = e.file;
      // 获取图片信息
      const image = await TinyPNG.getImage(file);
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

5. 说明：对于jpeg、jpg的图片不支持使用WebWorker压缩需要使用`TinyPNG.compressJpegImage` 进行压缩

```js
import TinyPNG from 'tinypng-lib';
TinyPNG.compressJpegImage(file, options)
```



### CompressWorker 使用

- 封装代码

```js
import ImageWorker from './imageWorker.worker.js'; // 与前面imageWorker.worker.js一致

export class CompressWorker {
    worker = null;
    constructor() {
        this.worker = new ImageWorker();
    }
    async compress(file, options) {
        // 获取图片信息
        const image = await TinyPNG.getImage(file);
        return new Promise((resolve, reject) => {
            // 监听worker的消息
            this.worker.onmessage = (e) => {
                const result = e.data;
                if (result.error && !result.success) {
                    console.error("Compression failed:", result.error);
                    reject(result.error);
                } else {
                    resolve(result);
                }
            };
            // Send the file to the worker for compression
            this.worker.postMessage({
                image,
                options
            });

        });
    }

    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }

    }
}

```

- 使用
  - 实例化：`CompressWorker`只注册一次就行，比如vue的mounted生命周期
  - 图片压缩
  - 页面或者组件卸载的时候执行, 销毁 `CompressWorker` 实例

```js
// 1. 只注册一次就行，比如vue的mounted生命周期
compressWorker = new CompressWorker();

// 2. 监听选择的图片，图片压缩
compressWorker.compress(file, {
  minimumQuality: 30,
  quality: 85
}).then((result) => {
  // 压缩结果
  console.log(result);
})

// 3. 页面或者组件卸载的时候执行, 销毁webworker
if (compressWorker) {
  compressWorker.terminate();
}
```



## 注意事项

- 请确保已经安装了`tinypng-lib`模块