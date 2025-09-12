import CredentialsProvider from "next-auth/providers/credentials";
import  { NextAuthOptions } from "next-auth";
import { connectToDatabase } from "@/utils/connectDb";
import candidate from "@/models/candidate.model";
import bcrypt from "bcryptjs"
import employer from "@/models/employer.model";
export const authOptions : NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        role : { label: "Role", type: "text", placeholder: "student" },
        email: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.role === "candidate") {
        await connectToDatabase();
        try {
            const { email, password } = credentials;

            if (!email || !password) {
                throw new Error("Email and Password Required");
            }

            let user : any = await candidate.findOne({ email }).select("+password");
            if (!user) {
                throw new Error("You don't have an account yet");
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid email or password");
            }
            user = await candidate.findOne({ email }).lean();

            return user;

        } catch (error) {
            console.error("Candidate auth error:", error);
            return null;
        }
        }
        else if(credentials?.role === "employer"){
        await connectToDatabase();
        try {
            const { email, password } = credentials;

            if (!email || !password) {
                throw new Error("Email and Password Required");
            }

            let user : any = await employer.findOne({ email }).select("+password");
            if (!user) {
                throw new Error("You don't have an account yet");
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid email or password");
            }
            user = await employer.findOne({ email }).lean();

            return user;

        } catch (error) {
            console.error("Employer auth error:", error);
            return null;
        }
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24hr
  },
callbacks: {
  async jwt({ token, user, trigger, session }) {
    if (user) {
      token.user = user;
    }
    if (trigger === "update") {
      return { ...token, ...session };
    }
    return token;
  },
  async session({ session, token } : any) {
    session.user = token.user;
    return session;
  },
},

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};