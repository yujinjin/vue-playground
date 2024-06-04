<!--
 * @创建者: yujinjin9@126.com
 * @创建时间: 2024-05-31 16:09:38
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2024-06-03 19:07:27
 * @项目的路径: \vue-playground\src\components\version-select.vue
 * @描述: 选择版本下拉框
-->
<template>
    <div class="version-select" @click.stop>
        <span class="active-version" @click="toggle">
            {{ label }}
            <span class="number">{{ isShowLoading ? "loading..." : version }}</span>
        </span>
        <ul class="versions" :class="{ expanded }">
            <li v-if="!versionList"><a>loading versions...</a></li>
            <li v-for="item of versionList" :class="{ active: item === version }">
                <a @click="setVersion(item)">v{{ item }}</a>
            </li>
            <div @click="expanded = false">
                <slot />
            </div>
        </ul>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { gte } from "semver";

const props = defineProps<{
    pkg: string;
    label: string;
    isLoading: boolean;
}>();

const expanded = ref(false);

const versionList = ref<string[]>();

const version = defineModel<string>();

const isShowLoading = ref(false);

watch(
    () => props.isLoading,
    value => {
        console.info("..............", value);
        if (!value) {
            isShowLoading.value = false;
        }
    }
);

async function fetchVersions(): Promise<string[]> {
    const response = await fetch(`https://data.jsdelivr.com/v1/package/npm/${props.pkg}`);

    const { versions } = (await response.json()) as { versions: string[] };

    if (props.pkg === "vue") {
        return versions.filter(version => gte(version, "3.2.0"));
    } else if (props.pkg === "typescript") {
        return versions.filter(version => !version.includes("dev") && !version.includes("insiders"));
    }
    return versions;
}

async function toggle() {
    expanded.value = !expanded.value;
    if (!versionList.value) {
        versionList.value = await fetchVersions();
    }
}

function setVersion(value: string) {
    isShowLoading.value = true;
    version.value = value;
    expanded.value = false;
}

onMounted(() => {
    window.addEventListener("click", () => {
        expanded.value = false;
    });
    window.addEventListener("blur", () => {
        if (document.activeElement?.tagName === "IFRAME") {
            expanded.value = false;
        }
    });
});
</script>
<style lang="scss" scoped>
.version-select {
    margin-right: 12px;
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;

    .active-version {
        cursor: pointer;
        position: relative;
        display: inline-flex;
        place-items: center;

        &::after {
            content: "";
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 6px solid #aaa;
            margin-left: 8px;
        }

        .number {
            color: var(--green);
            margin-left: 4px;
        }
    }

    .versions {
        display: none;
        position: absolute;
        left: 0;
        top: 40px;
        background-color: var(--bg-light);
        border: 1px solid var(--border);
        border-radius: 4px;
        list-style-type: none;
        padding: 8px;
        margin: 0;
        width: 200px;
        max-height: calc(100vh - 70px);
        overflow: scroll;

        &.expanded {
            display: block;
        }

        a {
            display: block;
            padding: 6px 12px;
            text-decoration: none;
            cursor: pointer;
            color: var(--base);

            &:hover {
                color: var(--green);
            }
        }

        .active a {
            color: var(--green);
        }
    }
}
</style>
