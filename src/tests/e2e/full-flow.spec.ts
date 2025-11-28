import { test, expect } from "@playwright/test";

test.describe("Fluxo Principal do Usuário", () => {
  
  const randomId = Math.floor(Math.random() * 10000);
  
  const user = {
    name: "Tester Automatizado", 
    email: `test.e2e.${randomId}@example.com`,
    password: "Password@123", 
  };

  const task = {
    title: `Tarefa Automatizada ${randomId}`,
    description: "Esta tarefa foi criada por um robô 🤖",
    editedTitle: `Tarefa Editada ${randomId}`,
  };

  test("deve permitir cadastro, criação, edição e conclusão de tarefa", async ({ page }) => {
    await page.goto("/auth/register");
    
    await page.fill('input[name="name"]', user.name);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    
    await page.click('button[type="submit"]');

    await page.waitForURL("**/app", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Dashboard");

    await page.click('text=Gerenciar Tarefas');
    await page.waitForURL("**/tasks");

    await page.click('text=Nova Tarefa'); 
    await page.waitForURL("**/tasks/new");

    await page.fill('input[name="title"]', task.title);
    await page.fill('textarea[name="description"]', task.description);
    
    await page.click('button:has-text("Criar Tarefa")');

    
    await expect(page.getByText("Tarefa criada com sucesso!")).toBeVisible();
    
    await page.click('text=Todas as Tarefas');
    await page.waitForURL("**/tasks");
    
    await expect(page.getByText(task.title)).toBeVisible();


    const row = page.getByRole('row', { name: task.title });
    
    await row.getByRole('button').last().click(); 

    await page.click('text=Editar');

    await page.fill('input[id="title"]', task.editedTitle);
    await page.click('button:has-text("Salvar")'); 

    await expect(page.getByText(task.editedTitle)).toBeVisible();

    const editedRow = page.getByRole('row', { name: task.editedTitle });
    await editedRow.getByRole('button').last().click();
    
    await page.click('text=Editar');

    await page.click('button[role="combobox"]:has-text("A Fazer")');
    await page.click('div[role="option"]:has-text("Concluído")'); 

    await page.click('button:has-text("Salvar")');

    await expect(editedRow.getByText("Concluído")).toBeVisible();
  });
});