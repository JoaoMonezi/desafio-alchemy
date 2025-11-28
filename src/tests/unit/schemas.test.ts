import { registerSchema, passwordSchema } from "@/_shared/util/schemas"; 

describe("Validação de Schemas (Unitário)", () => {
  
  describe("Senha Forte (passwordSchema)", () => {
    it("deve rejeitar senha curta (menos de 8 caracteres)", () => {
      const result = passwordSchema.safeParse("Ab1!");
      expect(result.success).toBe(false);
    });

    it("deve rejeitar senha sem número", () => {
      const result = passwordSchema.safeParse("Abcdefgh!");
      expect(result.success).toBe(false);
    });

    it("deve rejeitar senha sem caractere especial", () => {
      const result = passwordSchema.safeParse("Abcdefgh1");
      expect(result.success).toBe(false);
    });

    it("deve aceitar senha forte válida", () => {
      const result = passwordSchema.safeParse("SenhaForte123!");
      expect(result.success).toBe(true);
    });
  });

  describe("Registro de Usuário (registerSchema)", () => {
    it("deve rejeitar um nome que contém números", () => {
      const input = {
        name: "Joao123",
        email: "teste@exemplo.com",
        password: "SenhaForte123!",
      };

      const result = registerSchema.safeParse(input);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("apenas letras");
      }
    });

    it("deve aceitar um cadastro válido", () => {
      const input = {
        name: "João Silva",
        email: "teste@exemplo.com",
        password: "SenhaForte123!",
      };

      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar email inválido", () => {
      const input = {
        name: "João",
        email: "email-invalido",
        password: "SenhaForte123!",
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

});