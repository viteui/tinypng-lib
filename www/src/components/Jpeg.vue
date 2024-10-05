<template>
  <div>
    <el-alert title="使用webwork进行图片压缩, 不阻塞主线程, 大文件压缩时体验更好" type="success" :closable="false">
    </el-alert>
    <div style="display: flex; margin-top: 10px;">
      <el-upload class="upload-demo" drag :multiple="false" :http-request="uploadImg" :show-file-list="false"
        action="/">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
      </el-upload>
      <div style="display: flex;" v-loading="compressing">
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
import CompressorJpeg from 'compressorjs';
import { getSizeTrans } from '../utils/index.js';
export default {
  name: 'Base',
  data() {
    return {
      imgUrl: '',
      compressResult: {},
      compressing: false,
      count: 0
    }
  },
  mounted() {

  },
  methods: {
    getSizeTrans,
    async uploadImg(e) {

      new CompressorJpeg(e.file, {
        quality: 0.6,
        success: (file) => {
          console.log(file)
        }
      }
      )
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
