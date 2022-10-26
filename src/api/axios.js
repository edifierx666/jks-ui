import axios from 'axios';
import { v4 } from 'uuid';

let id = localStorage.getItem('__id');
if (!id) {
  localStorage.setItem('__id', v4());
}
const baseurl = process.env.VUE_APP_BASEURL || 'http://localhost:8010/api';
// create an axios instance
const service = axios.create({
  baseURL: baseurl, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 300000, // request timeout
  headers: {
    __id: localStorage.getItem('__id'),
  },
});
export const request = service;

// request interceptor
service.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data;
    return res;
  },
  error => {
    return Promise.reject(error);
  },
);

