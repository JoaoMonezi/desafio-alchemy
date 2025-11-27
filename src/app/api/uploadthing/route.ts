import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Exporta as rotas para o App Router do Next.js
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Opcional: Adicione isso se estiver tendo problemas com configurações
  // config: { ... },
});