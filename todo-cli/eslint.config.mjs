import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.browser
    },
    env: {
      node: true, // Add this line to define the Node.js environment
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off"
    },
    ignores: [
      "models/**/*.js",
      "__tests__/**/*.js",
      "addTodo.js",
      "completeTodo.js",
      "listTodos.js"
    ],
  },
];
