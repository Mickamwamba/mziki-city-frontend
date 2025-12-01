import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Enable sending cookies with requests
api.defaults.withCredentials = true;

export default api;
