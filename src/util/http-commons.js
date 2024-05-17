import axios from 'axios';

const { VITE_LOCAL_API_URL } = import.meta.env;

function localAxios() {
  const instance = axios.create({
    baseURL: VITE_LOCAL_API_URL,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  // 요청 인터셉터 추가
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  return instance;
}

export { localAxios };
