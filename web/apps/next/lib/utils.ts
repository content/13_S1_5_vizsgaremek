import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchData(endpoint: string, options?: RequestInit, jsonify = true) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  
  if(jsonify) {
    const data = await res.json();
    data.status = res.status;
    return data;
  }

  return res;
}