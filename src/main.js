import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import naive from 'naive-ui';
import 'lib-flexible';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/saga-green/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import Button from 'primevue/button';

dayjs.extend(relativeTime);

dayjs.locale('zh-cn');
// 全局过滤器：处理相对时间
let app = createApp(App);
app.mixin({
  filters: {
    relativeTime: value => {
      return dayjs().to(dayjs(value));
    },
  },
});
app.component('p-button', Button);
app.use(router).use(autoAnimatePlugin).use(PrimeVue).use(naive).mount('#app');
