import {
  convertShikiStatusToAnilist,
  getRateName,
} from "~/helpers/general-tools"
import {
  UserAnimeRate,
  UserMangaRate,
  UserRate,
} from "~/models/shikimori.model"
import axios from "~/tools/anilist.axios"

const searchTimeoutSec = 60

async function searchTitle(rate: UserAnimeRate | UserMangaRate) {
  let anilistRes: any = null
  let notFound = false
  const rateName = getRateName(rate)

  try {
    if (rate.anime) {
      anilistRes = (await searchAnimeByName(rateName)).data
    } else {
      anilistRes = (await searchMangaByName(rateName)).data
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      notFound = true
    }
  }

  return {
    anilistRes: anilistRes ? anilistRes.data : null,
    notFound,
  }
}

const exportRateToAnilist = async (rate: UserRate, anilistRes: any) => {
  const data = getPreparedDataForMutation(rate, anilistRes)

  const exportError = {
    status: null,
    data: null,
  }

  try {
    await axios.post("", data)
  } catch (error: any) {
    exportError.status = error.response?.status
    exportError.data = error.response?.data
  }

  return exportError
}

async function searchAnimeByName(name: string) {
  return axios.post(
    "",
    {
      query:
        "query ($search: String) { Media(type: ANIME, search: $search) { id } }",
      variables: {
        search: name,
      },
    },
    {
      timeout: searchTimeoutSec * 1000,
    },
  )
}

async function searchMangaByName(name: string) {
  return axios.post(
    "",
    {
      query:
        "query ($search: String) { Media(type: MANGA, search: $search) { id } }",
      variables: {
        search: name,
      },
    },
    {
      timeout: searchTimeoutSec * 1000,
    },
  )
}

function getPreparedDataForMutation(
  rate: UserAnimeRate | UserMangaRate,
  anilistRes: any,
) {
  const updatedAtDate = new Date(rate.updated_at)
  const createdAtDate = new Date(rate.created_at)

  return {
    query:
      "mutation ($mediaId: Int, $status: MediaListStatus, $score: Float, $repeat: Int, $startedAt: FuzzyDateInput, $completedAt: FuzzyDateInput) {SaveMediaListEntry(mediaId: $mediaId status: $status score: $score repeat: $repeat startedAt: $startedAt completedAt: $completedAt) {id status media {title {english}}}}",
    variables: {
      mediaId: anilistRes.Media?.id,
      status: convertShikiStatusToAnilist(rate.status),
      score: rate.score,
      repeat: rate.rewatches,
      completedAt: {
        day: updatedAtDate.getDay(),
        month: updatedAtDate.getMonth(),
        year: updatedAtDate.getFullYear(),
      },
      startedAt: {
        day: createdAtDate.getDay(),
        month: createdAtDate.getMonth(),
        year: createdAtDate.getFullYear(),
      },
    },
  }
}

export default {
  searchTitle,
  exportRateToAnilist,
}
