const { defineConfig } = require('@vue/cli-service')
// const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
// const path = require("path");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    experiments: {
      asyncWebAssembly: true, // 启用异步 WebAssembly，推荐方式
      // 或者 syncWebAssembly: true (不推荐使用同步方式，因为它已被废弃)
    },
    resolve: {
      extensions: ['.js', '.wasm'],
    },
    // 设置 .wasm 文件的模块规则
    module: {
      rules: [
        {
          test: /\.wasm$/,       // 匹配 .wasm 文件
          type: "webassembly/async"  // 异步 WebAssembly 模式
        },
        // 其他规则...
      ],
    },
    // plugins: [
    //   new WasmPackPlugin({
    //     crateDirectory: path.resolve(__dirname, "./node_modules/tinypng-lib"),
    //   })
    // ]
  }
})
