import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.browser, // Include browser globals
        ...globals.jest, // Add Jest globals for test files
      },
    },
  },
  pluginJs.configs.recommended,
];
