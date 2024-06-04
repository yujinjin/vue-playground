/*
 * @创建者: yujinjin9@126.com
 * @创建时间: 2024-06-03 14:49:41
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2024-06-03 18:23:20
 * @项目的路径: \vue-playground\src\composables\store.ts
 * @描述: repl store 数据配置
 */
import { computed, ref } from "vue";
import { useStore, type ImportMap } from "@vue/repl";

export default function () {
    const vueVersion = ref("latest");

    const importMap = computed<ImportMap>(() => {
        // runtimeProd：`https://fastly.jsdelivr.net/npm/@vue/runtime-dom@${vueVersion.value}/dist/runtime-dom.esm-browser.prod.js`
        return {
            imports: {
                "vue": `https://fastly.jsdelivr.net/npm/@vue/runtime-dom@${vueVersion.value}/dist/runtime-dom.esm-browser.js`,
                "vue/server-renderer": `https://fastly.jsdelivr.net/npm/@vue/server-renderer@${vueVersion.value}/dist/server-renderer.esm-browser.js`
            }
        };
    });

    const store = useStore(
        {
            vueVersion,
            typescriptVersion: ref("latest"),
            // starts on the output pane (mobile only) if the URL has a showOutput query
            showOutput: ref(true),
            // starts on a different tab on the output pane if the URL has a outputMode query
            // and default to the "preview" tab
            outputMode: ref("preview"),
            // pre-set import map
            builtinImportMap: importMap
        },
        // initialize repl with previously serialized state
        location.hash
    );

    return store;
}
