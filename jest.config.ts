import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/src/tests/e2e/"],
};

export default createJestConfig(config);