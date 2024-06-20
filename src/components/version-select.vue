<!--
 * @创建者: yujinjin9@126.com
 * @创建时间: 2024-05-31 16:09:38
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2024-06-14 16:00:46
 * @项目的路径: \vue-playground\src\components\version-select.vue
 * @描述: 选择版本下拉框
-->
<template>
    <div class="version-select">
        <div class="label-text">{{ label }}：</div>
        <div class="input-box">
            <el-select v-model="version" size="small" :loading="!versionList" loading-text="loading versions..." @change="isShowLoading = true" @visible-change="visibleChangeHandle">
                <el-option v-for="item of versionList" :key="item" :value="item" :label="item" />
            </el-select>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { gte } from "semver";
import { ElSelect, ElOption } from "element-plus";
import "element-plus/es/components/select/style/css";

const props = defineProps<{
    pkg: string;
    label: string;
    isLoading: boolean;
}>();

const versionList = ref<string[]>();

const version = defineModel<string>();

const isShowLoading = ref(false);

watch(
    () => props.isLoading,
    value => {
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
    } else if (props.pkg === "element-plus") {
        return versions.filter(version => gte(version, "2.2.0"));
    }
    return versions;
}

async function visibleChangeHandle() {
    if (!versionList.value) {
        versionList.value = await fetchVersions();
    }
}
</script>
<style lang="scss" scoped>
.version-select {
    margin-right: 12px;
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;

    .label-text {
        display: inline-block;
    }

    .input-box {
        width: 200px;
    }
}
</style>
