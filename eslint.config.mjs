import globals from "globals";
import pluginJs from "@eslint/js";
import eslint from '@eslint/js';
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { FlatCompat } from "@eslint/eslintrc"

// const compat = new FlatCompat({
//     // import.meta.dirname is available after Node.js v20.11.0
//     baseDirectory: import.meta.dirname,
//   })

// /** @type {import('eslint').Linter.Config[]} */
// const eslintConfig = [
//   {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
//   {languageOptions: { globals: {...globals.browser, ...globals.node} }},
//   pluginJs.configs.recommended,
//   ...tseslint.configs.recommended,
//   pluginReact.configs.flat.recommended,
//   ...compat.config({
//     extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
//   }),
// ];


export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);