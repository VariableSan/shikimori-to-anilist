import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core"

const httpLink = createHttpLink({
  uri: "https://graphql.anilist.co",
})

const cache = new InMemoryCache()

const anilistApolloClient = new ApolloClient({
  link: httpLink,
  cache,
})

export default anilistApolloClient
