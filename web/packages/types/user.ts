import { Course } from "./course";

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture: string | null;
    courses: Course[];
    created_at: Date;
}