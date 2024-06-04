/*
 * @创建者: yujinjin9@126.com
 * @创建时间: 2024-05-31 10:45:31
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2024-06-04 10:16:13
 * @项目的路径: \vue-playground\vite.config.ts
 * @描述: vite配置
 */
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    base: "./",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src")
        }
    },
    build: {
        rollupOptions: {
            external: ["typescript"]
        }
    },
    server: {
        host: true
    },
    plugins: [
        vue({
            script: {
                defineModel: true,
                propsDestructure: true,
                fs: {
                    fileExists: fs.existsSync,
                    readFile: file => fs.readFileSync(file, "utf-8")
                }
            }
        })
    ],
    optimizeDeps: {
        exclude: ["@vue/repl"]
    }
});
