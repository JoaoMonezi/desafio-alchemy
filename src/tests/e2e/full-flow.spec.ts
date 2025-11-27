import { test, expect } from "@playwright/test";

test.describe("Fluxo Principal do Usuário", () => {
  
  // Gera um ID aleatório apenas para o EMAIL (que precisa ser único)
  const randomId = Math.floor(Math.random() * 10000);
  
  const user = {
    // CORREÇÃO: Nome apenas com letras para passar no Zod
    name: "Tester Automatizado", 
    email: `test.e2e.${randomId}@example.com`,
    password: "Password@123", // Senha forte
  };

  const task = {
    title: `Tarefa Automatizada ${randomId}`,
    description: "Esta tarefa foi criada por um robô 🤖",
    editedTitle: `Tarefa Editada ${randomId}`,
  };

  test("deve permitir cadastro, criação, edição e conclusão de tarefa", async ({ page }) => {
    // --- 1. CADASTRO ---
    await page.goto("/auth/register");
    
    await page.fill('input[name="name"]', user.name);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    
    await page.click('button[type="submit"]');

    // Espera redirecionar para o Dashboard (/app)
    // Aumentei o timeout para 15s caso o banco frio demore um pouco
    await page.waitForURL("**/app", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Dashboard");

    // --- 2. NAVEGAR PARA TAREFAS ---
    await page.click('text=Gerenciar Tarefas');
    await page.waitForURL("**/tasks");

    // --- 3. CRIAR TAREFA ---
    await page.click('text=Nova Tarefa'); 
    await page.waitForURL("**/tasks/new");

    await page.fill('input[name="title"]', task.title);
    await page.fill('textarea[name="description"]', task.description);
    
    await page.click('button:has-text("Criar Tarefa")');

    // MUDANÇA NO TESTE: 
    // Como removemos o redirect automático, verificamos o sucesso 
    // e navegamos manualmente para a lista.
    await expect(page.getByText("Tarefa criada com sucesso!")).toBeVisible();
    
    // Clica na Sidebar para voltar para a lista
    await page.click('text=Todas as Tarefas');
    await page.waitForURL("**/tasks");
    
    // Verifica se a tarefa apareceu na lista
    await expect(page.getByText(task.title)).toBeVisible();

    // --- 4. EDITAR TAREFA ---
    // Encontra a linha da tarefa específica
    const row = page.getByRole('row', { name: task.title });
    
    // Clica no botão de menu (MoreHorizontal) dentro dessa linha
    await row.getByRole('button').last().click(); 

    await page.click('text=Editar');

    // Edita o título no modal
    await page.fill('input[id="title"]', task.editedTitle);
    await page.click('button:has-text("Salvar")'); // Ajuste para o texto do seu botão no modal

    // Verifica se atualizou na tela
    await expect(page.getByText(task.editedTitle)).toBeVisible();

    // --- 5. MARCAR COMO CONCLUÍDA ---
    const editedRow = page.getByRole('row', { name: task.editedTitle });
    await editedRow.getByRole('button').last().click();
    
    await page.click('text=Editar');

    // Troca o status no Select
    await page.click('button[role="combobox"]:has-text("A Fazer")');
    await page.click('div[role="option"]:has-text("Concluído")'); 

    await page.click('button:has-text("Salvar")');

    // Verifica se mudou visualmente (procura pelo texto "Concluído" na linha)
    await expect(editedRow.getByText("Concluído")).toBeVisible();
  });
});