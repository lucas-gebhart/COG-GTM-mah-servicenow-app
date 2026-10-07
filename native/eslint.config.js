import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

const serviceNowServerGlobals = {
    gs: 'readonly',
    GlideRecord: 'readonly',
    GlideAggregate: 'readonly',
    GlideDateTime: 'readonly',
    GlideDate: 'readonly',
    GlideDuration: 'readonly',
    GlideElement: 'readonly',
    GlideSysAttachment: 'readonly',
    GlideStringUtil: 'readonly',
    Class: 'readonly',
    require: 'readonly',
    JSON: 'readonly',
    current: 'writable',
    previous: 'readonly',
    action: 'readonly',
    producer: 'readonly',
    source: 'readonly',
    target: 'writable',
    map: 'readonly',
    log: 'readonly',
    ignore: 'writable',
    error: 'writable',
    error_message: 'writable',
    status_message: 'writable',
    import_set: 'readonly',
    answer: 'writable',
    RP: 'readonly',
    sn_ws: 'readonly',
    global: 'readonly',
}

const serviceNowClientGlobals = {
    g_form: 'readonly',
    g_user: 'readonly',
    g_scratchpad: 'readonly',
    g_list: 'readonly',
    GlideAjax: 'readonly',
    getMessage: 'readonly',
    alert: 'readonly',
    confirm: 'readonly',
    window: 'readonly',
    document: 'readonly',
    console: 'readonly',
    setTimeout: 'readonly',
    gsftSubmit: 'readonly',
    gel: 'readonly',
}

export default tseslint.config(
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'target/**',
            '@types/**',
            '.now/**',
            'src/fluent/generated/**',
            'coverage/**',
            'metadata-xml/**',
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            eqeqeq: ['error', 'always'],
            'prefer-const': 'error',
        },
    },
    {
        // Server modules are installed as sys_module rows keyed by their full path *including* the
        // `.ts` extension, and the instance module loader does not probe extensions. A relative
        // import without `.ts` compiles locally but throws ModuleResolutionException at runtime.
        files: ['src/server/**/*.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: "ImportDeclaration[source.value=/^\\.{1,2}\\/(?!.*\\.(ts|json)$)/]",
                    message: 'Relative imports inside src/server must end in .ts (the instance resolves sys_module paths verbatim).',
                },
                {
                    selector: "ExportAllDeclaration[source.value=/^\\.{1,2}\\/(?!.*\\.(ts|json)$)/], ExportNamedDeclaration[source.value=/^\\.{1,2}\\/(?!.*\\.(ts|json)$)/]",
                    message: 'Relative re-exports inside src/server must end in .ts (the instance resolves sys_module paths verbatim).',
                },
            ],
        },
    },
    {
        // Fluent metadata files rely on SDK-provided ambient globals (Now.ID, script``, etc.)
        files: ['src/fluent/**/*.now.ts'],
        languageOptions: {
            globals: { Now: 'readonly', script: 'readonly', TemplateValue: 'readonly', Time: 'readonly', Duration: 'readonly' },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
    {
        // Script Includes, record producer scripts and other server-side JS included via Now.include()
        files: ['src/server/**/*.server.js', 'src/includes/**/*.js', 'src/producers/**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'script',
            globals: serviceNowServerGlobals,
        },
        rules: {
            'no-var': 'off',
            'prefer-const': 'off',
            eqeqeq: ['error', 'smart'],
            'no-undef': 'error',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/prefer-for-of': 'off',
            'no-unused-vars': ['error', { vars: 'local', args: 'after-used' }],
        },
    },
    {
        // Client scripts and UI policy scripts (run in browser sandbox)
        files: ['src/client/**/*.client.js'],
        languageOptions: {
            ecmaVersion: 2015,
            sourceType: 'script',
            globals: serviceNowClientGlobals,
        },
        rules: {
            'no-var': 'off',
            'prefer-const': 'off',
            'no-undef': 'error',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/prefer-for-of': 'off',
            'no-unused-vars': ['error', { vars: 'local', args: 'none' }],
        },
    },
    {
        files: ['eslint.config.js', 'vitest.config.ts'],
        languageOptions: {
            globals: { process: 'readonly' },
        },
    },
)
