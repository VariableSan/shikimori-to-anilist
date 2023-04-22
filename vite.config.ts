import VueI18n from "@intlify/unplugin-vue-i18n/vite"
import Vue from "@vitejs/plugin-vue"
import "dotenv/config"
import LinkAttributes from "markdown-it-link-attributes"
import Shiki from "markdown-it-shiki"
import path from "node:path"
import AutoImport from "unplugin-auto-import/vite"
import Icons from "unplugin-icons"
import IconsResolver from "unplugin-icons/resolver"
import Components from "unplugin-vue-components/vite"
import VueMacros from "unplugin-vue-macros"
import { defineConfig } from "vite"
import Pages from "vite-plugin-pages"
import Layouts from "vite-plugin-vue-layouts"
import Markdown from "vite-plugin-vue-markdown"
import WindiCSS from "vite-plugin-windicss"
import generateSitemap from "vite-ssg-sitemap"
import windiConfig from "./windi.config"

export default defineConfig({
  server: {
    port: process.env.VITE_APP_PORT as unknown as number,
  },

  resolve: {
    alias: {
      "~/": `${path.resolve(__dirname, "src")}/`,
      "@/": `${path.resolve(__dirname, "src")}/`,
    },
  },

  plugins: [
    VueMacros.vite({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /\.md$/],
          reactivityTransform: true,
        }),
      },
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ["vue", "md"],
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "vue-i18n",
        "vue/macros",
        "@vueuse/head",
        "@vueuse/core",
      ],
      dts: "src/auto-imports.d.ts",
      dirs: ["src/composables", "src/stores"],
      vueTemplate: true,
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ["vue", "md"],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: "src/components.d.ts",
      resolvers: [IconsResolver()],
    }),

    // https://github.com/antfu/vite-plugin-vue-markdown
    // Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
    Markdown({
      wrapperClasses: "prose prose-sm m-auto text-left",
      headEnabled: true,
      markdownItSetup(md) {
        // https://prismjs.com/
        md.use(Shiki, {
          theme: {
            light: "vitesse-light",
            dark: "vitesse-dark",
          },
        })
        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: "_blank",
            rel: "noopener",
          },
        })
      },
    }),

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: [path.resolve(__dirname, "locales/**")],
    }),

    WindiCSS({
      config: windiConfig,
    }),

    Icons.vite({
      autoInstall: true,
    }),
  ],

  // https://github.com/vitest-dev/vitest
  test: {
    include: ["test/**/*.test.ts"],
    environment: "jsdom",
    deps: {
      inline: ["@vue", "@vueuse", "vue-demi"],
    },
  },

  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: "async",
    formatting: "minify",
    crittersOptions: {
      reduceInlineStyles: false,
    },
    onFinished() {
      generateSitemap()
    },
  },

  ssr: {
    // TODO: workaround until they support native ESM
    noExternal: ["workbox-window", /vue-i18n/],
  },
})
