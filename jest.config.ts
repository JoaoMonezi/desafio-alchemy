import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Aponta para a raiz do projeto Next.js para carregar variáveis de ambiente e config
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  
  // Mapeamento de módulos igual ao tsconfig.json
  // Isso permite que o Jest entenda imports como "@/lib/utils"
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  
  // Arquivo que roda antes de cada teste (para configurar matchers do DOM)
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  
  // Ignora a pasta de testes E2E para não misturar testes unitários com de integração
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/src/tests/e2e/"],
};

export default createJestConfig(config);