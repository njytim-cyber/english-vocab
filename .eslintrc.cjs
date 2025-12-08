module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs', 'playwright-report', 'test-results', 'src/data/scripts/**', 'test_simulation.js'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    settings: { react: { version: '18.2' } },
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        'react/prop-types': 'off',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'react/no-unescaped-entities': 'off',
    },
    overrides: [
        {
            files: ['**/*.test.js', '**/*.spec.js', 'tests/**', 'playwright.config.js', 'vite.config.js'],
            env: {
                node: true,
            },
        },
    ],
}
