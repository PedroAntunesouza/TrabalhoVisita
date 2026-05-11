import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.3.235:8081", //Seu ip
  timeout: 10000, // 10 segundos de timeout
});

export default api;