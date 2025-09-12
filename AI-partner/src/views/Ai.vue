<template>
  <div class="one">
    王俊的主场
  </div>
  <div class="two">
    <div class="btn"> 
      <a-button type="dashed" danger style="font-size: 8px;" size="small">学习记录</a-button>
      <a-button type="dashed" danger style="font-size: 8px;" size="small">错题分析</a-button>
      <a-button type="dashed" danger style="font-size: 8px;" size="small">规划调整</a-button>
    </div>
    <Audio/>
  </div>
</template>
<script setup>
import Audio from'@/components/Audio.vue'
</script>
<style scoped>
.one{
  height: 90%;
  width: 100%;
  background-color: aqua;
}
.two{
  height: 10%;
  width: 100%;
  background-color: rebeccapurple;
}
.btn{
  display: flex;
  flex-direction: row;

}
</style>
