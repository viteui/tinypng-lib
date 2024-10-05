<template>
    <div>
        <el-alert title="主线程压缩时大文件会卡住，需要控制文件大小，如需要压缩大文件建议使用web worker" type="info" :closable="false">
        </el-alert>

        <div style="display: flex; margin-top: 10px">
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

// import TinyPNG from 'tinypng-lib'
// import TinyPNG from 'tinypng-lib';
import TinyPNG from '../../../dist';
import { getSizeTrans } from '../utils';


export default {
    name: 'Base',
    components: {
    },
    data() {
        return {
            imgUrl: '',
            compressResult: {},
            count: 0
        }
    },
    mounted() {
        // 计数器
        setInterval(() => {
            this.count++
        }, 500)
    },
    methods: {
        getSizeTrans,
        handleAvatarSuccess(res, file) {
            this.imageUrl = URL.createObjectURL(file.raw);
        },
        beforeAvatarUpload(file) {
            return true
        },
        async uploadImg(e) {
            const file = e.file;
            try {
                const res = await TinyPNG.compress(file, {
                    minimumQuality: 35,
                    quality: 50
                })
                const url = URL.createObjectURL(res.blob)
                const img = new Image()
                this.imgUrl = url;
                this.compressResult = res;
            } catch (error) {
                console.log("error", error)
            }

        }
    }
}
</script>