import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';
import { useEffect, useState, useCallback, useMemo } from 'react';


// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Algo deu errado')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/v1/auth/me',
    login: '/api/v1/auth',
    logout: '/api/v1/auth/logout',
    register: '/api/auth/register',
    reset_password: '/api/v1/password_reset/reset',
    confirm_password: '/api/v1/password_reset/confirm',
    validate_token: '/api/v1/password_reset/validate_token',
  },
  user: {
    list: '/api/v1/usuarios',
    post: '/api/v1/usuarios',
    get_by_id: '/api/v1/usuarios/',
    update: '/api/v1/usuarios/',
    delete: '/api/v1/usuarios/',
  },
  turma :{
    list: '/api/v1/turmas',
    post: '/api/v1/turmas',
    get_by_id: '/api/v1/turmas/',
    update: '/api/v1/turmas/',
    delete: '/api/v1/turmas/',
  }
  /*mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },*/
};
