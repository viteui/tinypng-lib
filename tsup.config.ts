import { defineConfig } from 'tsup'


export default defineConfig({
    entry: ['src/index.ts', "src/workder.ts"],
    splitting: false,
    sourcemap: false,
    clean: true,
    // 输出esm，cjs，iife
    format: ['esm', 'cjs'],
    // 生成d.ts文件
    dts: false,
})