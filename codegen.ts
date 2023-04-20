import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.VITE_ANILIST_API_URI,
  documents: "src/**/*.{gql,graphql,vue}",
  generates: {
    "./src/gql/generated/schema.ts": {
      // preset: "client",
      plugins: ["typescript", "typescript-operations", "typescript-vue-apollo"],
    },
  },
}

export default config
