import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:5000/api' : '/api',
  timeout: 30000, 
});

export default API;