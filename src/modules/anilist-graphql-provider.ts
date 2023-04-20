import {
  DefaultApolloClient,
  provideApolloClient,
} from "@vue/apollo-composable"
import anilistApolloClient from "~/tools/anilist-graphql"
import { type UserModule } from "~/types"

export const install: UserModule = ({ app }) => {
  app.provide(DefaultApolloClient, provideApolloClient(anilistApolloClient))
}
