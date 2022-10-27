<template>
  <div ref="layout">
    <n-layout has-sider position="absolute">
      <n-layout
          :native-scrollbar="false"
          content-style="padding: 24px;"
      >
        <n-affix :trigger-top="0" :top="0" :listen-to="() => layout">
          <n-space align="center">
            <span>每列数量:</span>
            <n-input-number
                v-model:value="data.colCount"
                min="1"
                max="5"
                button-placement="both"
            />
            <n-button type="warning" dashed @click="clearStore">清空缓存</n-button>
            <n-popselect v-model:value="data.modeValue" :options="data.mode" trigger="click">
              <n-button>{{ data.modeLabel || '普通模式' }}</n-button>
            </n-popselect>
            <n-popover trigger="hover">
              <template #trigger>
                <n-button text>
                  <n-gradient-text type="success" size="16">
                    在线人数: {{ data.onlineUsers }}
                  </n-gradient-text>
                </n-button>
              </template>
              <n-space vertical>
                <template v-for="(item,index) in data.onlineItems">
                  <n-gradient-text type="error" v-if="item == data.__id">
                    {{ item }}
                  </n-gradient-text>
                  <span v-else>{{ item }}</span>
                </template>
              </n-space>
            </n-popover>
          </n-space>
        </n-affix>
        <div
            v-for="item in data.views" :key="item.url"
        >
          <n-gradient-text type="info" class="fs20">
            {{ item.name }}
          </n-gradient-text>
          <n-checkbox v-model:checked="item.__autoupdate">
            自动更新(只拉最新15条)
          </n-checkbox>
          <!--    <n-checkbox v-model:checked="item.__subscribeToNotifications">-->
          <!--      订阅通知-->
          <!--    </n-checkbox>-->
          <div v-auto-animate v-if="item.__autoupdate">
            <n-grid :x-gap="12" :y-gap="8" :cols="data.colCount" responsive="screen">
              <n-grid-item v-auto-animate v-for="(job,jobi) in item.jobs" :key="job.name">
                <n-card class="data-card">
                  <template #header>
                    <n-ellipsis>
                      <a :href="job.url" target="_blank" style="text-decoration:none;color:#18a058">{{ job.name.replace(item._prefix, '') }}</a>
                      <template #tooltip>
                        <div style="text-align: center">
                          {{ job.name }}
                        </div>
                      </template>
                    </n-ellipsis>
                  </template>
                  <template #header-extra>
                    <n-button-group class="mgr10">
                      <n-popover trigger="click" v-if="job.params">
                        <template #trigger>
                          <n-button round ghost :loading="job.loading" type="success">
                            {{ showBranchText(job.buildParams) }}
                          </n-button>
                        </template>
                        <div>
                          <n-radio-group
                              class="mgr10"
                              v-for="(radios,radiosIndex) in job.params"
                              v-model:value="job.buildParams[radios.name]"
                              name="radiogroup"
                              @update:value="branchRadioUpdate(job)"
                          >
                            <n-gradient-text size="18" type="success">
                              {{ radios.description }} {{ radios.name }}
                            </n-gradient-text>
                            <n-space vertical>
                              <n-radio v-for="r in radios.chooice" :key="r" :value="r">
                                {{ r }}
                              </n-radio>
                            </n-space>
                          </n-radio-group>
                        </div>
                      </n-popover>
                      <n-button
                          round
                          type="success"
                          @click="buildJobHandle(job)"
                          :loading="job.buildQueue"
                      >
                        打包
                      </n-button>
                    </n-button-group>
                    <n-button circle @click="refresh(job)" :loading="job.loading">
                      <template #icon>
                        <n-icon>
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              xmlns:xlink="http://www.w3.org/1999/xlink"
                              viewBox="0 0 32 32"
                          >
                            <path
                                d="M27 25.586l-2-2V21h-2v3.414L25.586 27L27 25.586z"
                                fill="currentColor"
                            ></path>
                            <path
                                d="M24 31a7 7 0 1 1 7-7a7.008 7.008 0 0 1-7 7zm0-12a5 5 0 1 0 5 5a5.005 5.005 0 0 0-5-5z"
                                fill="currentColor"
                            ></path>
                            <path
                                d="M16 28A12.013 12.013 0 0 1 4 16H2a14.016 14.016 0 0 0 14 14z"
                                fill="currentColor"
                            ></path>
                            <path
                                d="M12 8H7.078A11.984 11.984 0 0 1 28 16h2A13.978 13.978 0 0 0 6 6.234V2H4v8h8z"
                                fill="currentColor"
                            ></path>
                          </svg>
                        </n-icon>
                      </template>
                    </n-button>
                  </template>
                  <n-data-table
                      size="small"
                      v-if="!data.isJiJianMode"
                      :loading="job.loading"
                      class="card-table"
                      :columns="cardCols"
                      :data="job?.detail??[]"
                      :class="{
                        'card-table-jingjian':data.isJingJianMode,
                        'card-table-jijian':data.isJiJianMode,
                        'card-table-normal':data.isNormalMode,
                        'card-table-pingpu':data.isPingPuMode,
                      }"
                      :bordered="false"
                      :max-height="(data.isJingJianMode && !data.isPingPuMode) ? 106 : ''"
                      :flex-height="(data.isNormalMode && !data.isPingPuMode)"
                  />
                </n-card>
              </n-grid-item>
            </n-grid>
          </div>
        </div>
      </n-layout>
      <n-layout-sider
          width="360px"
          content-style="padding: 6px;"
          bordered
      >
        <n-gradient-text type="info" class="fs20">
          正在构建
          <n-statistic :value="isBuildingJobs.length">
            <template #suffix>
              / {{ activeViewJobsCount }}
            </template>
          </n-statistic>
        </n-gradient-text>
        <n-data-table
            :row-key="rowKey"
            :data="data.isBuildingJobsCombins"
            :columns="isBuildCols"
            :bordered="false"
        />
      </n-layout-sider>
    </n-layout>
  </div>
</template>
<script setup>
import {
  buildJob,
  cancelJob,
  getJob,
  getJobBuildDetail,
  getOnlineUsers,
  getView,
  getViews,
  getRecord,
} from '@/api';
import { computed, nextTick, reactive, ref, toRef, unref, watch } from 'vue';
import { NButton, NPopconfirm, useMessage } from 'naive-ui';
import { jobQ, queue } from '@/common/pq';
import { noop, useLocalStorage, watchDebounced, watchThrottled } from '@vueuse/core';
import dayjs from 'dayjs';
const layout = ref(null);
const showBranchText = (v) => {
  let values = Object.values(v);
  let s = values.join(',');
  return (s == ',' || s == '') ? '请选择' : s;
};

const message = useMessage();
const data = reactive({
  views: [],
  subscribeViews: [],
  autoUpdateViews: [],
  isBuildingJobsCombins: [],
  colCount: 3,
  onlineUsers: 0,
  onlineItems: [],
  __id: localStorage.getItem('__id'),
  modeValue: localStorage.getItem('__modeValue') ?? 0,
  modeLabel: '',
  mode: [
    {
      label: '普通模式',
      value: '0',
    },
    {
      label: '极简模式',
      value: '1',
    },
    {
      label: '精简模式',
      value: '2',
    },
    {
      label: '平铺模式',
      value: '3',
    },
  ],
  isNormalMode: computed(() => data.modeValue == 0),
  isJiJianMode: computed(() => data.modeValue == 1),
  isJingJianMode: computed(() => data.modeValue == 2),
  isPingPuMode: computed(() => data.modeValue == 3),
});

watch(() => data.modeValue, (v) => {
  data.modeLabel = data.mode.find(item => item.value == v).label;
}, {
  immediate: true,
});
usePersistence(toRef(data, 'modeValue'), '__modeValue', function(v) {
  return v * 1;
});
const onlineUsersApi = () => {
  return getOnlineUsers().then((res) => {
    if (res.code == 200) {
      data.onlineUsers = res.data.count;
      data.onlineItems = res.data.items;
    }
  });
};
onlineUsersApi();
setInterval(() => {
  onlineUsersApi();
}, 10 * 1000);

const clearStore = () => {
  let __id = localStorage.getItem('__id');
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('__id', __id);
  window.location.reload();
};
const persistence = (key, target) => {
  localStorage.setItem(key, target);
};

function usePersistence(data, key, transfer = noop) {
  watch(() => unref(data), (v) => {
    persistence(key, transfer(v));
  });
}

const activeViews = computed(() => data.views.filter(view => (view?.__autoupdate ?? false)));
const activeViewsJobs = computed(() => unref(activeViews).map(view => view.jobs).flat());
const activeViewJobsCount = computed(() => unref(activeViewsJobs).length);
const isBuildingJobs = computed(() => unref(activeViewsJobs).filter(
    job => job?.detail?.some(jobDetail => jobDetail.isRunning) ?? false));

watchThrottled(() => isBuildingJobs, (v) => {
  let isBuildingJobs = unref(v);
  if (isBuildingJobs.length) {
    let result = [];
    isBuildingJobs.forEach((job) => {
      job.detail.forEach(jobTask => {
        // let isInList = data.isBuildingJobsCombins.some(
        //     (jobCombin) => jobCombin.number == jobTask.number && jobCombin.jobName ==
        //         jobTask.jobName);
        if (jobTask.isRunning) {
          let combin = {
            viewName: job?._view?.name || '',
            ...jobTask,
          };
          result.push(combin);
        }
      });
    });
    data.isBuildingJobsCombins = result;
  } else {
    data.isBuildingJobsCombins = [];
  }
}, {
  immediate: true,
  deep: true,
  leading: true,
  throttle: 300,
});

data.colCount = useLocalStorage('col_count', 3);
watchThrottled(() => data.colCount, (v) => {
  useLocalStorage('col_count', v);
}, {
  immediate: true,
  deep: true,
  leading: true,
  throttle: 300,
});

const rowKey = (rowData) => {
  return rowData.jobName + rowData.number;
};
const tableColBuildStatus = reactive({
  title: '状态',
  key: 'result',
  render(rowData, rowIndex) {
    if (rowData.result == 'SUCCESS') {
      return <NIcon color="green" size="30">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 512 512"
        >
          <path
              d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192s192-86 192-192z"
              fill="none"
              stroke="currentColor"
              stroke-miterlimit="10"
              stroke-width="32"
          ></path>
          <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="32"
              d="M368 192L256.13 320l-47.95-48"
          ></path>
          <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="32"
              d="M191.95 320L144 272"
          ></path>
          <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="32"
              d="M305.71 192l-51.55 59"
          ></path>
        </svg>
      </NIcon>;
    }
    if (rowData.result == 'FAILURE') {
      return <NIcon color="red" size="30">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 1024 1024"
        >
          <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372s372 166.6 372 372s-166.6 372-372 372z"
              fill-opacity=".8"
              fill="currentColor"
          ></path>
          <path
              d="M512 140c-205.4 0-372 166.6-372 372s166.6 372 372 372s372-166.6 372-372s-166.6-372-372-372zm171.8 527.1c1.2 1.5 1.9 3.3 1.9 5.2c0 4.5-3.6 8-8 8l-66-.3l-99.3-118.4l-99.3 118.5l-66.1.3c-4.4 0-8-3.6-8-8c0-1.9.7-3.7 1.9-5.2L471 512.3l-130.1-155a8.32 8.32 0 0 1-1.9-5.2c0-4.5 3.6-8 8-8l66.1.3l99.3 118.4l99.4-118.5l66-.3c4.4 0 8 3.6 8 8c0 1.9-.6 3.8-1.8 5.2l-130.1 155l129.9 154.9z"
              fill-opacity=".1"
              fill="currentColor"
          ></path>
          <path
              d="M685.8 352c0-4.4-3.6-8-8-8l-66 .3l-99.4 118.5l-99.3-118.4l-66.1-.3c-4.4 0-8 3.5-8 8c0 1.9.7 3.7 1.9 5.2l130.1 155l-130.1 154.9a8.32 8.32 0 0 0-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3l99.3-118.5L611.7 680l66 .3c4.4 0 8-3.5 8-8c0-1.9-.7-3.7-1.9-5.2L553.9 512.2l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z"
              fill-opacity=".8"
              fill="currentColor"
          ></path>
        </svg>
      </NIcon>;
    }
    if (rowData.isRunning) {
      return <n-spin size="small" />;
    }
    return rowData.result;
  },
});
const cardCols = reactive([
  {
    title: '构建序号',
    key: 'number',
    render(rowData, rowIndex) {
      return <NButton
          text
          tag="a"
          target="_blank"
          href={ rowData.url }
          type="primary"
      >{ rowData.number }</NButton>;
    },
  },
  tableColBuildStatus,
  {
    title: '用户',
    key: 'username',
  },
  {
    title: '启动时间',
    key: 'startTime',
    render(rowData) {
      return dayjs().to(dayjs(rowData.startTime));
    },
  },
  {
    title: '启动时间',
    key: 'startTime',
  },
  {
    title: '分支(如果有)',
    key: 'branch',
  },
  {
    title: '部署环境(如果有)',
    key: 'domin',
        render(rowData) {
      return rowData['buildParams'][1]['Value'];
    },
  },
  // {
  //   title: '日志',
  //   key: 'record',
  //   render(rowData, rowIndex) {
  //     const toShowRecord = (job) => {
  //       return getRecord({
  //         jobName: job.jobName,
  //         buildId: job.number,
  //       }).then((res) => {
  //         if (res.code == 200) {
            
  //         }
  //       });
  //     };
  //     return <NButton
  //         text
  //         onClick={toShowRecord(rowData)}
  //     >{ rowData.number }</NButton>;
  //   },
  // },
  {
    title: '操作',
    render(rowData) {
      const cancel = (job) => {
        return cancelJob({
          name: job.jobName,
          buildId: job.number,
        }).then((res) => {
          if (res.code == 200) {
            setTimeout(() => getJobBuildDetailApi(job), 1000);
          }
        });
      };
      if (rowData.isRunning) {
        let slots = {
          trigger: () => (
              <NButton
                  slot="trigger"
                  text
                  type="primary"
              >
                取消
              </NButton>
          ),
        };
        return <NPopconfirm
            negative-text="取消"
            positive-text="确定"
            onPositiveClick={ () => cancel(rowData) }
            v-slots={ slots }
        >
          { '确定取消构建任务吗 ?' }
        </NPopconfirm>;
      }
    },
  },
]);

const isBuildCols = reactive([
  {
    title: '环境',
    key: 'viewName',
  },
  {
    title: '项目',
    key: 'jobName',
  },
  tableColBuildStatus,
  cardCols[2],
]);
const longestCommonPrefix = function(strs) {
  if (strs == null || strs.length == 0) return '';
  let l = strs[0].length;
  let cnt = strs.length;
  for (let i = 0; i < l; i++) {
    let c = strs[0].charAt(i);
    for (let j = 1; j < cnt; j++) {
      if (strs[j].charAt(i) != c) {
        return strs[0].substring(0, i);
      }
    }
  }
  return strs[0];
};

const getViewDetailApi = (view) => {
  view.isFetching = true;
  return getView({
    name: view.name,
  }).then((res) => {
    if (res.code == 200) {
      Object.assign(view, res.data);
      return res;
    } else {
      return Promise.reject();
    }
  });
};

const getJobApi = (job) => {
  job.loading = true;
  if (!'name' in job) {
    debugger
  }
  return getJob({
    name: job.name,
  }).then((res) => {
    if (res.code == 200) {
      job.detail = res.data.buildList;
      if (res.data?.params?.length == 0) {
        job.params = null;
      } else {
        job.params = res.data.params;
        res.data.params?.forEach((param) => {
          param.chooice = param.chooice?.sort?.() ?? [];
        });
        let itembuildParams = localStorage.getItem(job.name + '__BuildParams');
        job.buildParams = {};
        job.buildQueue = false;
        f();
        if (itembuildParams) {
          job.buildParams = JSON.parse(itembuildParams);
          if (Object.keys(job.buildParams).length != res.data.params.length) {
            f();
          }
        }

        function f() {
          res.data.params.forEach((p) => {
            job.buildParams[p.name] = '';
          });
        }
      }
      for (let jobDetail of job.detail) {
        //如果有正在打包的job
        if (jobDetail.isRunning) {
          jobDetail._interval = setInterval(() => {
            jobQ.add(() => getJobBuildDetailApi(jobDetail).then((res) => {
              if (!res.data.isRunning) {
                clearInterval(jobDetail._interval);
              }
            }).catch(()=>{
              clearInterval(jobDetail._interval);
            }));
          }, 10 * 1000);
        }
      }
    }
  }).finally(() => {
    job.loading = false;
  });
};

const getJobBuildDetailApi = (jobDetail) => {
  if (!'jobName' in jobDetail) {
    debugger
  }
  return getJobBuildDetail({
    jobName: jobDetail.jobName,
    buildId: jobDetail.number,
  }).then((res) => {
    if (res.code == 200) {
      jobDetail.isRunning = res.data.isRunning;
      jobDetail.result = res.data.result;
      Object.assign(jobDetail, res.data);
    }
    return res;
  });
};
const getViewApi = () => {
  return getViews().then((res) => {
    if (res.code == 200) {
      data.views = res.data;
      data.views.forEach(async view => {
        view.jobs = view.jobs.filter((job)=>job.color != 'disabled');
        let map = view.jobs.map(job => job.name);
        view._prefix = longestCommonPrefix(map);
      });
    } else {
      return Promise.reject();
    }
  }).then(() => {
    data.views.forEach(async view => {
      autoUpdateHandle(view);
      subscribeNotificationHandle(view);
    });
  });
};

const buildJobHandle = (job) => {
  job.buildQueue = true;
  if (job.params) {
    let valid = Object.values(job.buildParams).some(v => v == '' || !!!v);
    if (valid) {
      message.warning(`请选择打包参数${ job.name }`);
      job.buildQueue = false;
      return;
    }
  }
  return buildJob({
    name: job.name,
    param: job.buildParams ?? {},
  }).then((res) => {
    if (res.code == 200) {
      message.success('构建成功,5s后开始构建');
      setTimeout(() => {
        getJobApi(job);
        job.buildQueue = false;
      }, 15 * 1000);
    } else {
      message.error(res.message);
      job.buildQueue = false;
    }
  }).catch(() => {
    job.buildQueue = false;
  });
};

const branchRadioUpdate = (job) => {
  localStorage.setItem(job.name + '__BuildParams', JSON.stringify(job.buildParams));
};

const updateViewAllJobs = async (view) => {
  for (const job of view.jobs) {
    job._view = view;
    queue.add(() => getJobApi(job));
  }
};

function autoUpdateHandle(view) {

  view?.__autoupdateWatch?.();
  view.__autoupdateWatch = watchDebounced(() => view.__autoupdate, (v) => {
        if (v) {
          data.autoUpdateViews.push(v);
          useLocalStorage(view.name + '__autoupdate', true, { flush: true });
          updateViewAllJobs(view);
        } else {
          useLocalStorage(view.name + '__autoupdate', false, { flush: true });
          data.autoUpdateViews = data.autoUpdateViews.filter(view => view !== v);
        }
      },
      {
        deep: true,
        debounce: 500,
        immediate: true,
      },
  );
  watchDebounced(() => view.__autoupdate, (v) => {
    clearInterval(view.__autoupdateInterval);
    if (v) {
      view.__autoupdateInterval = setInterval(async () => {
        let res = await getViewDetailApi(view).catch(() => {});
        nextTick(() => {
          updateViewAllJobs(view);
        });
      }, 60 * 1000);
    } else {
    }
  }, {
    deep: true,
    debounce: 500,
    immediate: true,
  });
}

function subscribeNotificationHandle(view) {
  view?.__subscribeNotificationWatch?.();
  view.__subscribeNotificationWatch = watchDebounced(
      () => view.__subscribeToNotifications, (v) => {
        if (v) {
          data.subscribeViews.push(view);
          useLocalStorage(view.name + '__subscribeToNotifications', true, { flush: true });
        } else {
          data.subscribeViews = data.subscribeViews.filter(v => v !== view);
          useLocalStorage(view.name + '__subscribeToNotifications', false, { flush: true });
        }
      });
}

getViewApi().then(() => {
  data.views.forEach(view => {
    view.__autoupdate = useLocalStorage(view.name + '__autoupdate', false, { flush: true });
    view.__subscribeToNotifications = useLocalStorage(
        view.name + '__subscribeToNotifications', false, { flush: true });
  });
});
const refresh = (job) => {
  getJobApi(job);
};
</script>
<style lang="scss">
.fs20 {
  font-size: 25px;
}


.mgr20 {
  margin-right: 20px;
}

.mgr10 {
  margin-right: 10px;
}

.card-table-normal {
  height: 300px;
}

.card-table-pingpu {
  height: initial;
}

.card-table-jingjian {
  height: initial;

  .n-data-table-thead {
    display: none;
  }
}

.data-card {
  .n-card__content {
    padding: 0;
  }
}
</style>
