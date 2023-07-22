import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import camelCase from "camelcase";
import pkg from "./package.json" assert { type: "json" };

export default {
  input: "src/index.ts", // 输入文件
  output: [
    {
      file: pkg.main,
      format: "umd",
      name: camelCase(pkg.name),
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [resolve(), typescript()],
};
