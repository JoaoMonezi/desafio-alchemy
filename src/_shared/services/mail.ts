import nodemailer from "nodemailer";

const domain = process.env.NEXT_PUBLIC_APP_URL;

// Configuração do "Carteiro" (Transporter)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use a SENHA DE APP, não a senha normal
  },
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"Sistema de Tasks" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Redefinir sua senha",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Redefinição de Senha</h1>
          <p>Você solicitou a troca de senha. Clique no link abaixo para criar uma nova:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
            Mudar Minha Senha
          </a>
          <p style="margin-top: 20px; color: #666;">Se você não solicitou isso, apenas ignore este email.</p>
        </div>
      `,
    });
    console.log("📧 Email enviado com sucesso para:", email);
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
  }
};