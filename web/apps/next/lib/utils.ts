import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}