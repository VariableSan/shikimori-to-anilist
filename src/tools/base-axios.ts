import Axios from "axios"
import { AccessToken } from "~/models/common.model"

const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 0,
})

axios.interceptors.request.use(request => {
  let token: AccessToken | null = null

  const anilistToken = localStorage.getItem("anilistToken")
  if (anilistToken) {
    token = JSON.parse(anilistToken)
    if (token && new Date(token.expiresIn).getMilliseconds() > Date.now()) {
      token = null
      clearTokenFromStorage()
    }
  }

  request.headers.Authorization = token ? "Bearer " + token.accessToken : ""

  return request
})

export default axios

function clearTokenFromStorage() {
  localStorage.removeItem("anilistToken")
}
