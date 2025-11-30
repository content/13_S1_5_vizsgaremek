import { getCoursesByUserId, getPassword, getUser } from '@studify/database';
import { comparePasswords } from '@/lib/encryption/encryption';
import NextAuth from 'next-auth';
import type { AuthOptions, Session } from "next-auth";
import Credentials from 'next-auth/providers/credentials';

export const authConfig: AuthOptions = {
    providers: [
        Credentials({
            name: 'Bejelentkezés e-mail/jelszó párossal',
            credentials: {
                email: {
                    label: 'E-mail cím',
                    type: 'text',
                    placeholder: 'pl. user@example.com',
                },
                password: {
                    label: 'Jelszó',
                    type: 'password',
                },
            },
            async authorize(credentials, req) {
                const { email, password } = credentials ?? {};

                if (!email || !password) {
                    return null;
                }

                const user = (await getUser(email as string)) || undefined;

                if (!user) {
                    return null;
                } 

                const storedPassword = await getPassword(email as string);

                if (!storedPassword || !(await comparePasswords(password.toString(), storedPassword))) {
                    return null;
                }

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                    profile_picture_path: user.profilePicture,
                    created_at: user.createdAt,
                };
            },
        }),
    ],
    pages: {
        signIn: '/login',
        signOut: '/logout',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async session({ session, token }: { session: Session; token: any }) {
            session.user = session.user || ( {
                id: null,
                name: null,
                email: null,
                courses: [],
                profile_picture_path: null,
            } as any );
            
            const user = session.user as any;
            
            user.id = token.id;
            user.name = token.name;
            user.email = token.email;
            user.profile_picture_path = token.profile_picture_path;
            user.created_at = token.created_at;
            
            const courses = token.courses || await getCoursesByUserId(token.id);
            user.courses = courses;
            
            return session;
        },

        async jwt({ token, trigger, user, session }: any) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.profile_picture_path = user.profile_picture_path;
                token.created_at = user.created_at;

                const courses = await getCoursesByUserId(user.id);
                token.courses = courses;
            }
            if (trigger === 'update') {
                token.name = session.name;
                token.email = session.email;
                token.profile_picture_path = session.profile_picture_path;
            }

            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};