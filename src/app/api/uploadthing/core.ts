import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/Config/auth"; 

const f = createUploadthing();

export const ourFileRouter = {
 
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session || !session.user) throw new Error("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completo para o usuário:", metadata.userId);
      console.log("URL do arquivo:", file.url);
      
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;