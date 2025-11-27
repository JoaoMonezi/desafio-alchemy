import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";

// This file must be "Edge Compatible"
// DO NOT import Drizzle, Bcrypt, or the Database here!

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    // We will add Credentials in the full auth.ts file because it needs bcrypt
  ],
  pages: {
    signIn: "/auth/login",
  },
} satisfies NextAuthConfig; 