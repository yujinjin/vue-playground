/*
 * @创建者: yujinjin9@126.com
 * @创建时间: 2024-06-03 14:49:41
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2024-06-20 11:56:52
 * @项目的路径: \vue-playground\src\composables\store.ts
 * @描述: repl store 数据配置
 */
import { computed, ref, reactive, toRefs, shallowRef, watch, watchEffect, type ToRefs } from "vue";
import * as defaultCompiler from "vue/compiler-sfc";
import { File, mergeImportMap, compileFile, type ImportMap, type StoreState, type ReplStore } from "@vue/repl";
import { debounce, utoa, atou } from "../utils/index";
import mainCode from "../template/main.vue?raw";
import welcomeCode from "../template/welcome.vue?raw";
import elementPlusCode from "../template/element-plus.ts?raw";
import newVueCode from "../template/new-vue.vue?raw";
import tsconfigCode from "../template/tsconfig.json?raw";
import { ElMessage, ElMessageBox } from "element-plus";
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/message-box/style/css";

export default function (serializedState?: string) {
    const MAIN_FILE = "src/main.vue";

    const APP_FILE = "src/App.vue";

    const ELEMENT_PLUS_FILE = "src/element-plus.ts";

    const IMPORT_MAP = "import-map.json";

    const TSCONFIG = "tsconfig.json";

    // const state: StoreState = reactive({
    //     files: ref<Record<string, File>>({}),
    //     activeFilename: ref(""),
    //     mainFile: ref(""),
    //     template: ref({}),
    //     builtinImportMap: ref(),
    //     errors: ref([]),
    //     showOutput: ref(true),
    //     outputMode: ref("preview"),
    //     sfcOptions: ref({}),
    //     compiler: shallowRef(defaultCompiler),
    //     vueVersion: ref(""),
    //     locale: ref(),
    //     typescriptVersion: ref("latest"),
    //     dependencyVersion: ref({}),
    //     reloadLanguageTools: ref()
    // });

    const state: StoreState & ToRefs<{ loading: boolean }> = toRefs(
        reactive({
            files: {},
            activeFilename: APP_FILE,
            loading: false,
            mainFile: MAIN_FILE,
            template: {
                welcomeSFC: welcomeCode,
                newSFC: newVueCode
            },
            builtinImportMap: undefined!,
            errors: [],
            showOutput: true,
            outputMode: "preview",
            sfcOptions: {},
            compiler: shallowRef(defaultCompiler),
            vueVersion: "latest",
            locale: undefined,
            typescriptVersion: "latest",
            dependencyVersion: {
                elementPlus: "latest"
            },
            reloadLanguageTools: undefined
        })
    );

    state.builtinImportMap = computed<ImportMap>(() => {
        return {
            imports: {
                "vue": `https://fastly.jsdelivr.net/npm/@vue/runtime-dom@${state.vueVersion.value}/dist/runtime-dom.esm-browser.js`,
                "vue/server-renderer": `https://fastly.jsdelivr.net/npm/@vue/server-renderer@${state.vueVersion.value}/dist/server-renderer.esm-browser.js`,
                "element-plus": `https://fastly.jsdelivr.net/npm/element-plus@${state.dependencyVersion.value.elementPlus}/dist/index.full.min.mjs`,
                "@element-plus/icons-vue": `https://fastly.jsdelivr.net/npm/@element-plus/icons-vue@latest/dist/index.min.js`
            }
        };
    });

    let loadingTimes = 0;

    const showLoading = function () {
        ++loadingTimes;
        state.loading.value = true;
    };

    const hiddenLoaing = function () {
        if (loadingTimes > 0) {
            --loadingTimes;
        } else if (loadingTimes < 0) {
            loadingTimes = 0;
        }
        if (loadingTimes === 0) {
            state.loading.value = false;
        }
    };

    const compileFiles = async function (files: File[]) {
        showLoading();
        try {
            const errors = await Promise.all(files.map(file => compileFile(store, file)));
            state.errors.value = errors.flat();
        } catch (error) {
            console.error(error);
        }
        hiddenLoaing();
    };

    const init = async function () {
        console.info("init>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        watchEffect(async () => {
            console.info("compileFile store.activeFile>>>>>>>>>>>>>>>>>>>");
            await compileFiles([store.activeFile]);
            // compileFile(store, store.activeFile)
        });

        watch(
            () => state.dependencyVersion.value.elementPlus,
            () => {
                const style = `https://fastly.jsdelivr.net/npm/element-plus@${state.dependencyVersion.value.elementPlus}/dist/index.css`;

                const darkStyle = `https://fastly.jsdelivr.net/npm/element-plus@${state.dependencyVersion.value.elementPlus}/theme-chalk/dark/css-vars.css`;

                const file = new File(ELEMENT_PLUS_FILE, elementPlusCode.replace("#STYLE#", style).replace("#DARKSTYLE#", darkStyle).trim(), true);
                state.files.value[ELEMENT_PLUS_FILE] = file;
                compileFiles([file]);
            },
            {
                immediate: true
            }
        );

        watch(
            () => [state.files.value[TSCONFIG]?.code, state.typescriptVersion.value, state.locale.value, state.dependencyVersion.value, state.vueVersion.value],
            () => {
                debounce(async () => {
                    if (state.reloadLanguageTools?.value) {
                        showLoading();
                        await state.reloadLanguageTools.value();
                        hiddenLoaing();
                    }
                }, 300);
            },
            {
                deep: true
            }
        );

        watch(
            state.builtinImportMap,
            () => {
                setImportMap(mergeImportMap(getImportMap(), state.builtinImportMap.value));
            },
            { deep: true }
        );

        watch(state.vueVersion, async version => {
            if (version) {
                const compilerUrl = `https://fastly.jsdelivr.net/npm/@vue/compiler-sfc@${version}/dist/compiler-sfc.esm-browser.js`;
                showLoading();
                state.compiler.value = await import(/* @vite-ignore */ compilerUrl).finally(() => {
                    hiddenLoaing();
                });
                console.info(`[@vue/repl] Now using Vue version: ${version}`);
            } else {
                // reset to default
                state.compiler.value = defaultCompiler;
                console.info(`[@vue/repl] Now using default Vue version`);
            }
        });

        watch(
            state.sfcOptions,
            () => {
                state.sfcOptions.value.script ||= {};
                state.sfcOptions.value.script.fs = {
                    fileExists(file: string) {
                        if (file.startsWith("/")) file = file.slice(1);
                        return !!store.files[file];
                    },
                    readFile(file: string) {
                        if (file.startsWith("/")) file = file.slice(1);
                        return store.files[file].code;
                    }
                };
            },
            { immediate: true }
        );

        // 编译全部文件
        compileFiles(Object.values(state.files.value));
    };

    function addSrcPrefix(filename: string) {
        return filename === IMPORT_MAP || filename === TSCONFIG || TSCONFIG.startsWith("src/") ? filename : `src/${filename}`;
    }

    function stripSrcPrefix(file: string) {
        return file.replace(/^src\//, "");
    }

    // function applyBuiltinImportMap() {
    //     const importMap = mergeImportMap(state.builtinImportMap.value, getImportMap());
    //     setImportMap(importMap);
    // }

    const setImportMap = function (importMap: ImportMap) {
        if (state.files.value[IMPORT_MAP]) {
            state.files.value[IMPORT_MAP].code = JSON.stringify(importMap, undefined, 4);
        } else {
            state.files.value[IMPORT_MAP] = new File(IMPORT_MAP, JSON.stringify(importMap, undefined, 4));
        }
    };

    const getImportMap = function (): ImportMap {
        try {
            return JSON.parse(state.files.value[IMPORT_MAP].code);
        } catch (error) {
            state.errors.value = [`Syntax error in ${IMPORT_MAP}: ${(error as Error).message}`];
        }
        return {};
    };

    const getTsConfig = function (): Record<string, any> {
        try {
            return JSON.parse(state.files.value[TSCONFIG].code);
        } catch (error) {
            console.error(error);
        }
        return {};
    };

    const serialize = function () {
        const files = getFiles();
        files["_vue_version"] = state.vueVersion.value!;
        files["_element-plus_version"] = state.dependencyVersion.value.elementPlus;
        const importMap = getImportMap();
        const customeImportMap: ImportMap = { imports: {} };
        Object.keys(importMap.imports!).forEach(key => {
            if (importMap.imports![key] !== state.builtinImportMap.value.imports![key]) {
                customeImportMap.imports![key] = importMap.imports![key];
            }
        });
        if (Object.keys(customeImportMap.imports!).length > 0) {
            files[IMPORT_MAP] = JSON.stringify(customeImportMap, undefined, 4);
        } else {
            delete files[IMPORT_MAP];
        }
        if (state.files.value[TSCONFIG]?.code === tsconfigCode) {
            delete files[TSCONFIG];
        }
        return "#" + utoa(JSON.stringify(files));
    };

    const deserialize = function (serializedState: string) {
        if (serializedState.startsWith("#")) {
            serializedState = serializedState.slice(1);
        }
        try {
            const files = JSON.parse(atou(serializedState));
            if (Object.prototype.hasOwnProperty.bind(files)("_vue_version")) {
                state.vueVersion.value = files["_vue_version"] || state.vueVersion.value;
                delete files["_vue_version"];
            }
            if (Object.prototype.hasOwnProperty.bind(files)("_element-plus_version")) {
                state.dependencyVersion.value.elementPlus = files["_element-plus_version"] || state.dependencyVersion.value.elementPlus;
                delete files["_element-plus_version"];
            }
            setFiles(files);
        } catch (error) {
            console.error(error);
        }
    };

    // 初始化文件列表
    const initFiles = function (serializedState?: string) {
        console.info("initFiles.................", serializedState);
        if (serializedState) {
            deserialize(serializedState);
        } else {
            state.files.value = {};
            state.files.value[MAIN_FILE] = new File(MAIN_FILE, mainCode, true);
            state.files.value[APP_FILE] = new File(APP_FILE, welcomeCode);
            state.files.value[TSCONFIG] = new File(TSCONFIG, tsconfigCode);
            state.files.value[ELEMENT_PLUS_FILE] = new File(ELEMENT_PLUS_FILE, elementPlusCode, true);
            state.files.value[IMPORT_MAP] = new File(IMPORT_MAP, JSON.stringify(state.builtinImportMap.value, undefined, 4));
        }
    };

    const setActive = function (filename: string) {
        const file = state.files.value[filename];
        if (!file || file.hidden) {
            return;
        }
        state.activeFilename.value = filename;
    };

    const addFile = function (fileOrFilename: string | File) {
        const file: File = typeof fileOrFilename === "string" ? new File(fileOrFilename, fileOrFilename.endsWith(".vue") ? newVueCode : "") : fileOrFilename;
        state.files.value[file.filename] = file;
        if (!file.hidden) {
            setActive(file.filename);
        }
    };

    const renameFile = function (oldFilename: string, newFilename: string) {
        const file = state.files.value[oldFilename];

        if (!file) {
            state.errors.value = [`Could not rename "${oldFilename}", file not found`];
            return;
        }

        if (!newFilename || oldFilename === newFilename) {
            state.errors.value = [`Cannot rename "${oldFilename}" to "${newFilename}"`];
            return;
        }

        if (file.hidden || [APP_FILE, MAIN_FILE, ELEMENT_PLUS_FILE, IMPORT_MAP].includes(oldFilename)) {
            state.errors.value = [`Cannot rename ${oldFilename}`];
            return;
        }
        file.filename = newFilename;
        state.files.value[newFilename] = file;
        delete state.files.value[oldFilename];
        if (state.activeFilename.value === oldFilename) {
            state.activeFilename.value = newFilename;
        } else {
            compileFiles([file]);
        }
    };

    const deleteFile = async function (filename: string) {
        if ([ELEMENT_PLUS_FILE, MAIN_FILE, APP_FILE, IMPORT_MAP].includes(filename)) {
            ElMessage.warning("You cannot remove it, because Element Plus requires it.");
            return;
        }
        try {
            await ElMessageBox.confirm(`Are you sure you want to delete ${stripSrcPrefix(filename)}?`, {
                title: "Delete File",
                type: "warning",
                center: true
            });
            if (state.activeFilename.value === filename) {
                state.activeFilename.value = MAIN_FILE;
            }
            delete state.files.value[filename];
        } catch (error) {
            console.info(error);
        }
    };

    const getFiles = function () {
        const fileCodes: Record<string, string> = {};
        for (const file of Object.values(state.files.value)) {
            if (file.hidden) continue;
            fileCodes[stripSrcPrefix(file.filename)] = file.code;
        }
        return fileCodes;
    };

    const setFiles = async function (newFiles: Record<string, string>, mainFile = store.mainFile) {
        if (mainFile !== MAIN_FILE) {
            state.errors.value = [`Could not set "${mainFile}", mainFile is fixed`];
            return;
        }
        const files: Record<string, File> = {};
        for (const [filename, fileCode] of Object.entries(newFiles)) {
            const srcFilename = addSrcPrefix(filename);
            files[srcFilename] = new File(srcFilename, fileCode);
        }
        if (files[MAIN_FILE]) {
            files[MAIN_FILE].hidden = true;
        } else {
            files[MAIN_FILE] = state.files.value[MAIN_FILE] || new File(MAIN_FILE, mainCode, true);
        }
        if (!files[APP_FILE]) {
            files[APP_FILE] = state.files.value[APP_FILE] || new File(APP_FILE, welcomeCode);
        }
        if (!files[TSCONFIG]) {
            files[TSCONFIG] = state.files.value[TSCONFIG] || new File(TSCONFIG, tsconfigCode);
        }
        if (files[ELEMENT_PLUS_FILE]) {
            files[ELEMENT_PLUS_FILE].hidden = true;
        } else {
            files[ELEMENT_PLUS_FILE] = state.files.value[ELEMENT_PLUS_FILE] || new File(ELEMENT_PLUS_FILE, elementPlusCode, true);
        }
        if (!files[IMPORT_MAP]) {
            files[IMPORT_MAP] = state.files.value[IMPORT_MAP] || new File(IMPORT_MAP, JSON.stringify(state.builtinImportMap.value, undefined, 4));
        } else {
            files[IMPORT_MAP].code = JSON.stringify(mergeImportMap(state.builtinImportMap.value, JSON.parse(files[IMPORT_MAP].code)), undefined, 4);
        }
        state.files.value = files;
        if (!files[state.activeFilename.value]) {
            setActive(APP_FILE);
        }
    };

    const store: ReplStore = reactive({
        ...state,
        activeFile: computed(() => state.files.value[state.activeFilename.value]),
        init,
        reloadLanguageTools: undefined,
        setActive,
        getImportMap,
        getTsConfig,
        serialize,
        deserialize,
        addFile,
        renameFile,
        deleteFile,
        getFiles,
        setFiles
    });

    initFiles(serializedState);
    return store;
}
