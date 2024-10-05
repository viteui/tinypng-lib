<template>
  <div id="app">
    <h1> TinyPNG 使用 </h1>
    <div style="display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 50px;">
      <div style="  width: 800px; position: relative">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="基础使用" name="base">
            <Base />
          </el-tab-pane>
          <el-tab-pane label="WebWork" name="webwork">
            <WebWork />
          </el-tab-pane>
          <!-- <el-tab-pane label="WebWork2" name="webwork2">
          <WebWork2 />
        </el-tab-pane> -->
          <el-tab-pane label="CompressWorker" name="compressWorker">
            <CompressWorker />
          </el-tab-pane>
        </el-tabs>
        <div style="position: absolute; right: 10px; top: 10px; ">
          <el-link size="mini" type="primary" href="https://github.com/viteui/tinypng-lib"
            target="_blank">Github</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Base from './components/Base.vue';
import WebWork from './components/WebWork.vue';
import WebWork2 from './components/WebWork2.vue';
import CompressWorker from './components/CompressWorker.vue';



export default {
  name: 'App',
  components: {
    Base,
    WebWork,
    WebWork2,
    CompressWorker
  },
  data() {
    return {
      activeName: 'base'
    };
  },
  methods: {
    handleClick(tab, event) {
    }
  }
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>./components/CompressWorker.vue