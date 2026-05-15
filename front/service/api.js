import axios from "axios";

const api = axios.create({
  baseURL: "http://[ENDEREÇO DE IP]:8081",
});

export default api;