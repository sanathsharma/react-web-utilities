module.exports = {
    preset: "ts-jest",
    rootDir: "./src",
    testEnvironment: "jsdom",
    setupFilesAfterEnv: [
        "<rootDir>/setupTests.ts"
    ],
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.jest.json"
        }
    }
};