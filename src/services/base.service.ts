import { UserRate } from "~/models/shikimori.model"
import axios from "~/tools/base-axios"

export async function sendRateListToBase(rateList: UserRate[]) {
  let failedRateList = []

  try {
    const res = await axios.post("/export-to-anilist", rateList)
    failedRateList = res.data
  } catch (error) {
    console.error(error)
  }

  return failedRateList
}
