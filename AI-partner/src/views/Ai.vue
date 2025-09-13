<template>
  <div class="one">
    <l2d class="l2d" />
  </div>
  <div class="two">
    <div class="btn"> 
      <a-button type="dashed" danger style="font-size: 8px;margin-left: 10px;" size="small">学习记录</a-button>
      <a-button type="dashed" danger style="font-size: 8px;" size="small">错题分析</a-button>
      <a-button type="dashed" danger style="font-size: 8px;" size="small">规划调整</a-button>
    </div>
    <Audio class="audio"/>
  </div>
</template>
<script setup>
import l2d from '@/components/l2d.vue'
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
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 10px;
}
.btn{
  display: flex;
  flex-direction: row;
}
</style>
