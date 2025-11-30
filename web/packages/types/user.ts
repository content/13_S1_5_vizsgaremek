import { Course } from "./course";

export interface User {
    id: number;
    name: string;
    email: string;
    profile_picture: string | null;
    courses: Course[];
    created_at: Date;
}