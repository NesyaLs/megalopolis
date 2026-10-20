/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
    preset: 'ts-jest/presets/default-esm', // or other ESM presets
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                diagnostics: { ignoreCodes: [ 'TS151001', 'TS151002' ] }
            },
        ],
    },
    roots: [ "src", "tst" ]
};

export default jestConfig;
