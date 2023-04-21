import {
  SearchAnimeByNameQuery,
  SearchMangaByNameQuery,
} from "~/gql/generated/schema"

export type SearchTitleByNameQuery = SearchAnimeByNameQuery | SearchMangaByNameQuery
