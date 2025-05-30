import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Platform utilities
export function getPlatformDisplayName(platform: string): string {
  const platformMap: Record<string, string> = {
    'whatsapp': 'WhatsApp',
    'instagram': 'Instagram',
    'facebook': 'Facebook',
    'twitter': 'Twitter',
    'linkedin': 'LinkedIn',
    'phone': 'Phone',
    'email': 'Email',
    'in_person': 'In Person',
    'custom': 'Custom'
  }
  
  return platformMap[platform] || platform
}

export function formatPlatformForDisplay(platform: string, customPlatform?: string | null): string {
  if (platform === 'custom' && customPlatform) {
    return customPlatform
  }
  return getPlatformDisplayName(platform)
}
