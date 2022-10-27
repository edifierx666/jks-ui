import { request } from '@/api/axios';

export function getViews() {
  return request({
    method: 'get',
    url: '/views',
  });
}

export function getView(data) {
  return request({
    method: 'get',
    url: '/views/detail',
    params: data,
  });
}

export function getJob(data) {
  return request({
    method: 'post',
    url: '/job',
    data,
  });
}

export function buildJob(data) {
  return request({
    method: 'post',
    url: '/job/build',
    data,
  });
}

export function cancelJob(data) {
  return request({
    method: 'post',
    url: '/job/cancel',
    data,
  });
}

export function getJobBuildDetail(data) {
  return request({
    method: 'post',
    url: '/job/build/detail',
    data,
  });
}

export function getOnlineUsers() {
  return request({
    method: 'get',
    url: '/online/users',
  });
}

export function getRecord() {
  return request({
    method: 'post',
    url: '/job/build/console',
  });
}
