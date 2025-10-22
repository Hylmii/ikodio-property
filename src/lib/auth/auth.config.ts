import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Twitter from 'next-auth/providers/twitter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    }),
    Credentials({
      id: 'user-credentials',
      name: 'User Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 User Login Attempt:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          throw new Error('Email dan password harus diisi');
        }

        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email as string,
            role: UserRole.USER,
          },
        });

        console.log('👤 User found:', user ? 'Yes' : 'No');

        if (!user) {
          console.log('❌ User not found or wrong role');
          throw new Error('Email atau password salah');
        }

        if (!user.password) {
          console.log('❌ User has no password (social login only)');
          throw new Error('Akun ini menggunakan social login');
        }

        if (!user.isVerified) {
          console.log('❌ User not verified');
          throw new Error('Email belum diverifikasi. Silakan cek email Anda');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        console.log('🔑 Password valid:', isPasswordValid);

        if (!isPasswordValid) {
          throw new Error('Email atau password salah');
        }

        console.log('✅ Login successful for:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.profileImage,
          isVerified: user.isVerified,
        };
      },
    }),
    Credentials({
      id: 'tenant-credentials',
      name: 'Tenant Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🏢 Tenant Login Attempt:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          throw new Error('Email dan password harus diisi');
        }

        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email as string,
            role: UserRole.TENANT,
          },
        });

        console.log('👤 Tenant found:', user ? 'Yes' : 'No');

        if (!user) {
          console.log('❌ Tenant not found or wrong role');
          throw new Error('Email atau password salah');
        }

        if (!user.password) {
          console.log('❌ Tenant has no password (social login only)');
          throw new Error('Akun ini menggunakan social login');
        }

        if (!user.isVerified) {
          console.log('❌ Tenant not verified');
          throw new Error('Email belum diverifikasi. Silakan cek email Anda');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        console.log('🔑 Password valid:', isPasswordValid);

        if (!isPasswordValid) {
          throw new Error('Email atau password salah');
        }

        console.log('✅ Login successful for:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.profileImage,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'facebook' || account?.provider === 'twitter') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        const providerMap: Record<string, 'GOOGLE' | 'FACEBOOK' | 'TWITTER'> = {
          google: 'GOOGLE',
          facebook: 'FACEBOOK',
          twitter: 'TWITTER',
        };

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              profileImage: user.image,
              provider: providerMap[account.provider] || 'GOOGLE',
              isVerified: true,
              role: UserRole.USER,
            },
          });
        } else if (!existingUser.isVerified) {
          await prisma.user.update({
            where: { email: user.email! },
            data: { 
              isVerified: true,
              profileImage: user.image || existingUser.profileImage,
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login-user',
    error: '/login-user',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
