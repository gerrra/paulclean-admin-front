module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: [
        'eslint:recommended',
        // Only extend @typescript-eslint/recommended if the package is available
        ...(require('fs').existsSync('node_modules/@typescript-eslint/eslint-plugin') 
          ? ['@typescript-eslint/recommended'] 
          : []
        ),
      ],
      rules: {
        'no-unused-vars': 'off', // Turn off base rule
        ...(require('fs').existsSync('node_modules/@typescript-eslint/eslint-plugin') 
          ? {
              '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
              '@typescript-eslint/no-explicit-any': 'warn',
              '@typescript-eslint/explicit-function-return-type': 'off',
              '@typescript-eslint/explicit-module-boundary-types': 'off',
              '@typescript-eslint/no-empty-function': 'warn'
            }
          : {}
        )
      }
    },
    {
      files: ['*.tsx', '*.jsx'],
      extends: [
        'eslint:recommended',
        // Only extend React plugins if they are available
        ...(require('fs').existsSync('node_modules/eslint-plugin-react') 
          ? ['plugin:react/recommended'] 
          : []
        ),
        ...(require('fs').existsSync('node_modules/eslint-plugin-react-hooks') 
          ? ['plugin:react-hooks/recommended'] 
          : []
        ),
      ],
      rules: {
        ...(require('fs').existsSync('node_modules/eslint-plugin-react') 
          ? {
              'react/react-in-jsx-scope': 'off',
              'react/prop-types': 'off'
            }
          : {}
        ),
        ...(require('fs').existsSync('node_modules/eslint-plugin-react-hooks') 
          ? {
              'react-hooks/rules-of-hooks': 'error',
              'react-hooks/exhaustive-deps': 'warn'
            }
          : {}
        )
      },
      settings: {
        react: {
          version: 'detect'
        }
      }
    }
  ]
}