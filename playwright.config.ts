import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Aponta para a pasta onde criamos o teste
  testDir: "./src/tests/e2e",
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  
  // ⚠️ AQUI ESTÁ A CORREÇÃO: Definimos a URL padrão
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Opcional: Isso faz o Playwright tentar subir seu servidor se ele não estiver rodando
  /*
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
  */
});