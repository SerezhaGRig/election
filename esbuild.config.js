// eslint-disable-next-line @typescript-eslint/no-var-requires
const esbuildPluginTsc = require("esbuild-plugin-tsc");
module.exports = (serverless) => ({
  bundle: true,
  minify: true,
  keepNames: true,
  platform: "node",
  target: "es2022",
  format: "esm",
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);import path from 'path';import { fileURLToPath } from 'url';const __filename = fileURLToPath(import.meta.url);const __dirname = path.dirname(__filename);",
  },
  outputFileExtension: ".mjs",
  sourcemap: true,
  exclude: ["@aws-sdk/*"],
  concurrency: 3,
  plugins: [
    esbuildPluginTsc({
      force: true,
    }),
  ],
});
