<!--
 * @创建者: yujinjin9@126.com
 * @创建时间: 2024-05-31 16:01:35
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2024-06-04 10:45:34
 * @项目的路径: \vue-playground\src\components\Header.vue
 * @描述: 页面头部模板
-->
<template>
    <div class="header">
        <h1>
            <img alt="logo" src="/logo.svg" />
            <span>Vue SFC Playground</span>
        </h1>
        <div class="links">
            <VersionSelect v-model="store.typescriptVersion" :isLoading="store.loading" pkg="typescript" label="TypeScript Version" />
            <VersionSelect v-model="store.vueVersion!" :isLoading="store.loading" pkg="vue" label="Vue Version" />
            <button title="Copy sharable URL" class="share" @click="copyLink">
                <Share />
            </button>
            <button title="Reload page" class="reload" @click="$emit('reload-page')">
                <Reload />
            </button>
            <a href="https://github.com/yujinjin/vue-playground" target="_blank" title="View on GitHub" class="github">
                <GitHub />
            </a>
        </div>
    </div>
</template>
<script setup lang="ts">
import VersionSelect from "./version-select.vue";
import type { ReplStore } from "@vue/repl";
import Share from "../icons/Share.vue";
import GitHub from "../icons/GitHub.vue";
import Reload from "../icons/Reload.vue";

defineProps<{
    store: ReplStore;
}>();

async function copyLink(e: MouseEvent) {
    if (e.metaKey) {
        // hidden logic for going to local debug from play.vuejs.org
        window.location.href = "http://localhost:5173/" + window.location.hash;
        return;
    }
    await navigator.clipboard.writeText(location.href);
    alert("Sharable URL has been copied to clipboard.");
}
</script>
<style lang="scss" scoped>
.header {
    --bg: #fff;
    --bg-light: #fff;
    --border: #ddd;
    --btn: #666;
    --highlight: #333;
    --green: #3ca877;
    --purple: #904cbc;
    --btn-bg: #eee;

    color: var(--base);
    height: var(--nav-height);
    box-sizing: border-box;
    padding: 0 1em;
    background-color: var(--bg);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.33);
    position: relative;
    z-index: 999;
    display: flex;
    justify-content: space-between;

    h1 {
        font-weight: 500;
        display: inline-flex;
        place-items: center;

        img {
            height: 24px;
            margin-right: 10px;
        }
    }

    .links {
        display: flex;
        align-items: center;

        button,
        .github {
            padding: 1px 6px;
            color: var(--btn);

            &:hover {
                color: var(--highlight);
            }
        }
    }
}
@media (max-width: 560px) {
    h1 span {
        font-size: 0.9em;
    }
}

@media (max-width: 520px) {
    h1 span {
        display: none;
    }
}
</style>
