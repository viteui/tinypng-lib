<template>
  <div>
    <h4>tinypng webwork</h4>
    <div style="display: flex;">
      <el-upload class="upload-demo" drag :multiple="false" :http-request="uploadImg" :show-file-list="false"
        action="/">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
      </el-upload>
      <div style="display: flex;">
        <el-image style="margin-left: 40px; width: 180px; height: 180px; flex-shrink:0 ;" :src="imgUrl"
          :preview-src-list="[imgUrl]" fit="contain">
        </el-image>
        <el-descriptions title="压缩信息" :column="1" v-if="compressResult.compressedSize">
          <el-descriptions-item label="压缩前">{{ getSizeTrans(compressResult.originalSize)
            }}</el-descriptions-item>
          <el-descriptions-item label="压缩后">{{ getSizeTrans(compressResult.compressedSize)
            }}</el-descriptions-item>
          <el-descriptions-item label="压缩率">{{ compressResult.rateString }}</el-descriptions-item>
          <el-descriptions-item label="减少">
            <el-tag size="small" type="success">
              -{{ ((1 - compressResult.rate) * 100).toFixed(2) + '%' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <div>
      计数器：{{ count || 0 }}
    </div>
  </div>
</template>

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
      count: 0
    }
  },
  mounted() {
    // Start the worker when the component is mounted
    this.worker = new ImageWorker();

    // Receive the message (compressed result) from the worker
    this.worker.onmessage = (e) => {
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
      console.log(file);
      const image = await TinyPNG.getImage(file);
      console.log(image);
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