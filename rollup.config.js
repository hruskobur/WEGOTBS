import { default as PluginCommonJs } from '@rollup/plugin-commonjs';
import { default as PluginCopy } from 'rollup-plugin-copy';
import { default as PluginNodeResolve } from '@rollup/plugin-node-resolve';

export default [
    {
        input: `src/client/yarl.js`,
        output: {
            file: `build/client/yarl.js`,
            format: 'esm',
            // note: needed by pixi.js(^8.1.0)
            inlineDynamicImports: true
        },
        plugins: [
            PluginCommonJs({}),
            PluginNodeResolve({
                browser: true,
                preferBuiltins: false,
            }),
            PluginCopy({
                targets: [
                    {
                        src: `src/client/page/index.html`,
                        dest:`build/client/`
                    },
                    {
                        src: `src/client/page/yarl.css`,
                        dest:`build/client/`
                    },
                ]
            })
        ]
    }
];