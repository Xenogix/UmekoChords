import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettier,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          tabWidth: 2,
          useTabs: false,
          printWidth: 100,
          semi: true,
          singleQuote: false,
        }
      ],

      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: ['camelCase'],
        },
        {
          selector: 'property',
          modifiers: ['readonly'],
          format: ['camelCase'],
        },
          {
          selector: 'property',
          modifiers: ['static', 'readonly'],
          format: ['UPPER_CASE'],
        },
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['UPPER_CASE', 'camelCase'],
        }
      ]
    },
  }
);
