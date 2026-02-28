import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow yjkoh87@gmail.com
      const allowedEmails = ["yjkoh87@gmail.com"]
      
      if (user.email && allowedEmails.includes(user.email)) {
        return true
      }
      
      // Deny access to everyone else
      return false
    },
    async session({ session }) {
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
})
