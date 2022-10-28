<template>
  <a :href="data.consoles.url" style="font-size:20px;">数据源</a>
  <div v-html= data.consoles.text style="font-size:20px;white-space: pre-line;">
  </div>
</template>
<script setup>
import {
  getRecord,
} from '@/api';
import { computed, nextTick, reactive, ref, toRef, unref, watch } from 'vue';
import {  useRoute } from 'vue-router';
const route = useRoute()
const data = reactive({
  consoles : '',
  doingInterval:null,
});


let toInitConsoleText = function(){
  getRecord({
    'jobName': route.query.jobName,
    'buildId': route.query.buildId * 1,
  }).then((res) => {
    if (res.code == 200) {
      data.consoles = res.data;
      // 三个状态 ABORTED取消 ''进行中 SUCCESS成功
      if(data.consoles.result == ''){
        if(!data.doingInterval){
          data.doingInterval = setInterval(()=>{
            toInitConsoleText();
          },5*1000)
        }
      }else{
        clearInterval(data.doingInterval)
      }
    }
  });
}
toInitConsoleText();
</script>
<style lang="scss">

</style>
