import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client/core"
import { onError } from "@apollo/client/link/error"
import { AccessToken } from "~/models/common.model"

const httpLink = createHttpLink({
  uri: "https://graphql.anilist.co",
})

const cache = new InMemoryCache({
  addTypename: false,
  canonizeResults: true,
})

const acceptJsonMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(() => {
    let token: AccessToken | null = null

    const anilistToken = localStorage.getItem("anilistToken")
    if (anilistToken) {
      token = JSON.parse(anilistToken)
      if (token && new Date(token.expiresIn).getMilliseconds() > Date.now()) {
        token = null
        clearTokenFromStorage()
      }
    }

    return {
      headers: {
        accept: "application/json",
        Authorization: token ? "Bearer " + token.accessToken : "",
      },
    }
  })

  return forward(operation)
})

const errorHandler = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    )

  if (networkError) console.log(`[Network error]: ${networkError}`)
})

const anilistApolloClient = new ApolloClient({
  link: from([acceptJsonMiddleware, errorHandler, httpLink]),
  cache,
  credentials: "include",
})

export default anilistApolloClient

function clearTokenFromStorage() {
  localStorage.removeItem("anilistToken")
}
