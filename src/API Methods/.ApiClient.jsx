import axios from 'axios';
import Cookies from 'js-cookie';

// const API_BASE_URL = process.env.VITE_APP_API_BASE_URL ?? 'http://localhost:8080/api';
// const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`
const API_BASE_URL = 'http://localhost:5166/api';
// const API_BASE_URL = 'https://localhost:7022/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// добавляем токен к каждому запросу
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// обработка ошибок ответа
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiClient;