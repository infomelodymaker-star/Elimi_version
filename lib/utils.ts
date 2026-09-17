import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const WHATSAPP_NUMBER = '25764444546';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
