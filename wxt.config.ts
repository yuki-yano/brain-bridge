import { defineConfig } from "wxt"

export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  srcDir: "src",
  manifest: {
    name: "Brain Bridge",
    permissions: ["storage", "contextMenus"],
    host_permissions: ["https://*.openai.com/*", "https://*.anthropic.com/*", "https://*.deepseek.com/*"],
  },
})
