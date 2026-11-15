import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import prettier from 'eslint-config-prettier'

/**
 * Architecture rules, enforced by lint:
 *   shared   -> may import only shared
 *   content  -> may import only content + shared (data, no UI)
 *   three    -> shared + content
 *   feature  -> shared, content, three, and ITS OWN folder (never another feature)
 *   pages    -> features + everything below
 *   app      -> everything
 */
export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results', 'tools'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh, boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.app.json' } },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'pages', pattern: 'src/pages/**' },
        { type: 'feature', pattern: 'src/features/*', capture: ['feature'], mode: 'folder' },
        { type: 'three', pattern: 'src/three/**' },
        { type: 'content', pattern: 'src/content/**' },
        { type: 'shared', pattern: 'src/shared/**' },
      ],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'app', allow: ['app', 'pages', 'feature', 'three', 'content', 'shared'] },
            { from: 'pages', allow: ['pages', 'feature', 'three', 'content', 'shared'] },
            {
              from: 'feature',
              allow: [['feature', { feature: '${from.feature}' }], 'three', 'content', 'shared'],
            },
            { from: 'three', allow: ['three', 'content', 'shared'] },
            { from: 'content', allow: ['content', 'shared'] },
            { from: 'shared', allow: ['shared'] },
          ],
        },
      ],
    },
  },
  prettier,
)
