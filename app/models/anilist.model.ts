type SearchAnimeByNameQuery = {
	__typename?: 'Query'
	Media?: { __typename?: 'Media'; id: number } | null
}

type SearchMangaByNameQuery = {
	__typename?: 'Query'
	Media?: { __typename?: 'Media'; id: number } | null
}

export enum MediaListStatus {
	/** Finished watching/reading */
	Completed = 'COMPLETED',
	/** Currently watching/reading */
	Current = 'CURRENT',
	/** Stopped watching/reading before completing */
	Dropped = 'DROPPED',
	/** Paused watching/reading */
	Paused = 'PAUSED',
	/** Planning to watch/read */
	Planning = 'PLANNING',
	/** Re-watching/reading */
	Repeating = 'REPEATING',
}

export type SearchTitleByNameQuery = SearchAnimeByNameQuery | SearchMangaByNameQuery
