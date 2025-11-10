const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname
});

module.exports = [
  {
    ignores: ['eslint.config.cjs', '.next/**', 'node_modules/**', 'coverage/**', 'playwright-report/**', 'test-results/**']
  },
  ...compat.config({
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: __dirname
    },
    plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],
    extends: [
      'next/core-web-vitals',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:import/recommended',
      'plugin:import/typescript',
      'plugin:testing-library/react',
      'plugin:jest-dom/recommended',
      'prettier'
    ],
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        }
      }
    },
    rules: {
      'import/no-default-export': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }]
    },
    overrides: [
      {
        files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.tsx', '**/*.spec.ts'],
        env: {
          jest: true
        }
      },
      {
        files: ['**/app/**/page.tsx', '**/app/**/layout.tsx', '**/app/**/route.ts', 'next-env.d.ts'],
        rules: {
          'import/no-default-export': 'off'
        }
      }
    ]
  })
];
