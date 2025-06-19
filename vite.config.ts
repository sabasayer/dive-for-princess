import { defineConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig({
  plugins: [
    AutoImport({
      imports: [
        {
          phaser: [
            // default imports
            ["default", "Phaser"], // import { default as axios } from 'axios',
          ],
        },
      ],
      dirs: ["./src/**"],
      eslintrc: {
        enabled: true,
        filepath: "./.eslintrc-auto-import.mjs",
      },
    }),
  ],
});
