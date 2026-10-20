import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.jest,
                ...globals.node,
            },
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-inferrable-types" : "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "array-callback-return": "error",
            "consistent-return": "error",
            "eqeqeq": "error",
            "no-eval": "error",
            "no-fallthrough": "error",
            "no-mixed-spaces-and-tabs": "error",
            "no-undef": "error",
            "no-unreachable": "error",
            "no-var": "error",
            "prefer-const": "error",
            "semi": "error",
        },
    },
    {
        ignores: ["dist/", "node_modules/"],
    },
);
