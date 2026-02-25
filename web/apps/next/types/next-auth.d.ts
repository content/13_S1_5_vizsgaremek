import type { Attachment, Course } from "@studify/types";

declare module "next-auth" {
  interface Session {
    user?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      courses: Course[];
      profile_picture: string | null;
      created_at: string;
    };
  }

  interface User {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string | null;
    profile_picture?: string | null;
    created_at?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    profile_picture?: string | null;
    created_at?: string | null;
  }
}