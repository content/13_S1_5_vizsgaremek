import { comparePasswords } from '@/lib/encryption/encryption';
import { getCoursesByUserId, getPassword, getUser } from '@studify/database';
import type { AuthOptions, Session } from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import { CourseMember, Course } from '@studify/types';



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

                return user;
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
                first_name: null,
                last_name: null,
                email: null,
                courses: [],
                profile_picture: null,
                created_at: null,
            } as any );
            
            const user = session.user as any;
            
            user.id = token.id;
            user.first_name = token.first_name;
            user.last_name = token.last_name;
            user.email = token.email;
            user.profile_picture = token.profile_picture;
            user.created_at = token.created_at;
            
            const courses = await getCoursesByUserId(token.id);
            user.courses = courses.filter((c: Course) => c.members.some((m: CourseMember) => m.user.id === token.id && m.isApproved));
            
            return session;
        },

        async jwt({ token, trigger, user, session }: any) {
            if (user) {
                token.id = user.id;
                token.first_name = user.first_name;
                token.last_name = user.last_name;
                token.email = user.email;
                token.profile_picture = user.profile_picture;
                token.created_at = user.created_at;
            }
            
            if (trigger === 'update') {
                token.first_name = session.first_name;
                token.last_name = session.last_name;
                token.email = session.email;
                token.profile_picture = session.profile_picture;
            }

            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};