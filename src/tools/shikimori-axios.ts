import Axios from "axios"

const axios = Axios.create({
  baseURL: "https://shikimori.me/api",
})

export default axios
