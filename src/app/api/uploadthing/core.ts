import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/Config/auth"; // Sua autenticação

const f = createUploadthing();

// Arquivo de configuração das rotas de upload
export const ourFileRouter = {
  // Rota para Avatar de Perfil
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      // Código que roda ANTES do upload (Autenticação)
      const session = await auth();
      if (!session || !session.user) throw new Error("Unauthorized");

      // O que retornarmos aqui fica acessível no passo seguinte
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Código que roda DEPOIS do upload (no Servidor)
      console.log("Upload completo para o usuário:", metadata.userId);
      console.log("URL do arquivo:", file.url);
      
      // AQUI É O PULO DO GATO:
      // Você poderia atualizar o banco aqui direto se quisesse, 
      // mas vamos manter a lógica no componente para simplificar a atualização da UI.
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;