/// <reference types="vite/client" />
/// <reference types="element-plus/global" />

declare module '*.vue' {
    import type { ComponentOptions } from 'vue'
    const comp: ComponentOptions
    export default comp
}