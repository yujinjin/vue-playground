<!--
 * @创建者: yujinjin9@126.com
 * @创建时间: 2024-06-03 09:38:59
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2024-06-04 09:51:58
 * @项目的路径: \vue-playground\src\app.vue
 * @描述: 主页面
-->
<template>
    <Header :store="store" @reload-page="reloadPage" />
    <Repl
        ref="replRef"
        :editor="Monaco"
        @keydown.ctrl.s.prevent
        @keydown.meta.s.prevent
        :store="store"
        :showCompileOutput="true"
        :autoResize="true"
        :preview-options="{
            customCode: {
                importCode: `import { initCustomFormatter } from 'vue'`,
                useCode: `initCustomFormatter()`
            }
        }"
    />
</template>
<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { Repl } from "@vue/repl";
import Monaco from "@vue/repl/monaco-editor";
import userStore from "./composables/store";
import Header from "./components/header.vue";

const store = userStore();

const replRef = ref<InstanceType<typeof Repl>>();

// persist state to URL hash
watchEffect(() => history.replaceState({}, "", store.serialize()));

function reloadPage() {
    replRef.value?.reload();
}
</script>
<style>
.dark {
    color-scheme: dark;
}

body {
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    margin: 0;
    --base: #444;
    --nav-height: 50px;
    --vh: 100vh;
}

* {
    box-sizing: border-box;
    outline: none;
    scrollbar-color: #ddd #fafafa;
    scrollbar-track-color: #fafafa;
    scrollbar-width: thin;
}

/*滚动条整体样式*/
::-webkit-scrollbar {
    width: 6px; /*竖向滚动条的宽度*/
    height: 6px; /*横向滚动条的高度*/
}
::-webkit-scrollbar-thumb {
    /*滚动条里面的小方块*/
    background: #ddd;
    border-radius: 5px;
}
::-webkit-scrollbar-track {
    /*滚动条轨道的样式*/
    background: #fafafa;
    border-radius: 5px;
}

.vue-repl {
    height: calc(var(--vh) - var(--nav-height)) !important;
}

button {
    border: none;
    outline: none;
    cursor: pointer;
    margin: 0;
    background-color: transparent;
}
</style>
