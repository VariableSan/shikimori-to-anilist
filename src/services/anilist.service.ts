import { convertShikiStatusToAnilist } from "~/helpers/status-converting"
import axios from "~/tools/anilist.axios"

export async function updateUserAnime(rate: any, anilistRes: any) {
  const updatedAtDate = new Date(rate.updated_at)
  const createdAtDate = new Date(rate.created_at)

  const mutationData = {
    operationName: "SetAnimeToUserList",
    query:
      "mutation SetAnimeToUserList($mediaId: Int, $status: MediaListStatus, $score: Float, $repeat: Int, $startedAt: FuzzyDateInput, $completedAt: FuzzyDateInput) {\n  SaveMediaListEntry(\n    mediaId: $mediaId\n    status: $status\n    score: $score\n    repeat: $repeat\n    startedAt: $startedAt\n    completedAt: $completedAt\n  ) {\n    id\n    status\n    media {\n      title {\n        english\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}",
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

  try {
    await axios.post("/", mutationData)
  } catch (error) {
    console.info(JSON.parse(JSON.stringify(error)))
    throw new Error("cannot update")
  }

  return mutationData
}
