import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'

export default [{
  input: 'lib/index.ts',      // 入口文件
  output: [
    {
      dir: 'dist/cjs',   // CommonJS 格式
      format: 'cjs',
      exports: 'auto',
      sourcemap: false,              // 生成 sourcemap
      preserveModules: true, // 保留模块结构
      preserveModulesRoot: 'lib' // 将保留的模块放在根级别的此路径下
    },
    {
      dir: 'dist/esm',    // ES Module 格式
      format: 'esm',
      sourcemap: false,
      preserveModules: true, // 保留模块结构
      preserveModulesRoot: 'lib' // 将保留的模块放在根级别的此路径下
    }
  ],
  plugins: [
    resolve(),                      // 解析 node_modules 中的模块
    commonjs(),                     // 将 CommonJS 转为 ES Modules
    typescript({                    // 处理 TypeScript
      tsconfig: './tsconfig.json',
      declaration: false,           // 不生成声明文件
      exclude: ['node_modules/**'] // 排除 node_modules 中的文件
    })
  ]
},
// 单独生成类型声明文件
{
  input: 'lib/index.ts',
  output: {
    dir: 'dist/types',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'lib'
  },
  plugins: [dts()]
}]
