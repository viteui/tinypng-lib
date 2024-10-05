<template>
  <div id="app">
    <h1> TinyPNG 使用 </h1>
    <div style="display: flex;
    justify-content: center;
    align-items: center;
  
    margin-top: 50px;">
      <el-tabs v-model="activeName" @tab-click="handleClick" style="  width: 800px;">
        <el-tab-pane label="基础使用" name="base">
          <Base />
        </el-tab-pane>
        <el-tab-pane label="WebWork" name="webwork">
          <WebWork />
        </el-tab-pane>
        <el-tab-pane label="WebWork2" name="webwork2">
          <WebWork2 />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import Base from './components/Base.vue';
import WebWork from './components/WebWork.vue';
import WebWork2 from './components/WebWork2.vue';
import TinyPNG from 'tinypng-lib';



export default {
  name: 'App',
  components: {
    Base,
    WebWork,
    WebWork2
  },
  data() {
    return {
      activeName: 'webwork2'
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
</style>