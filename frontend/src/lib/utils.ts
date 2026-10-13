export { cn } from "cn"

export function cleanUrl(url: string): string {
const hostname = new URL(url).hostname;
return hostname
}