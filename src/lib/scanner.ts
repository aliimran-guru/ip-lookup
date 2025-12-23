export interface ScanResult {
  ip: string;
  status: "active" | "inactive" | "pending";
  responseTime?: number;
  hostname?: string;
  timestamp: number;
}

export interface ScanHistory {
  id: string;
  startIp: string;
  endIp: string;
  cidr?: string;
  results: ScanResult[];
  totalScanned: number;
  activeCount: number;
  inactiveCount: number;
  startTime: number;
  endTime: number;
  duration: number;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function parseIPRange(input: string): string[] {
  const ips: string[] = [];
  
  // Check if it's CIDR notation (e.g., 192.168.1.0/24)
  if (input.includes("/")) {
    const [baseIp, cidrBits] = input.split("/");
    const bits = parseInt(cidrBits);
    
    if (bits < 24 || bits > 32) {
      // Limit to /24 to /32 for performance
      throw new Error("CIDR range must be between /24 and /32");
    }
    
    const parts = baseIp.split(".").map(Number);
    const baseNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    const hostBits = 32 - bits;
    const numHosts = Math.pow(2, hostBits);
    const networkAddress = baseNum & (~0 << hostBits);
    
    for (let i = 1; i < numHosts - 1; i++) { // Skip network and broadcast
      const ipNum = networkAddress + i;
      const ip = [
        (ipNum >>> 24) & 255,
        (ipNum >>> 16) & 255,
        (ipNum >>> 8) & 255,
        ipNum & 255,
      ].join(".");
      ips.push(ip);
    }
  }
  // Check if it's a range (e.g., 192.168.1.1-192.168.1.254)
  else if (input.includes("-")) {
    const [startIp, endIp] = input.split("-").map((s) => s.trim());
    
    const startParts = startIp.split(".").map(Number);
    const endParts = endIp.split(".").map(Number);
    
    const startNum = (startParts[0] << 24) | (startParts[1] << 16) | (startParts[2] << 8) | startParts[3];
    const endNum = (endParts[0] << 24) | (endParts[1] << 16) | (endParts[2] << 8) | endParts[3];
    
    if (endNum - startNum > 254) {
      throw new Error("Range too large. Maximum 254 IPs allowed.");
    }
    
    for (let i = startNum; i <= endNum; i++) {
      const ip = [
        (i >>> 24) & 255,
        (i >>> 16) & 255,
        (i >>> 8) & 255,
        i & 255,
      ].join(".");
      ips.push(ip);
    }
  }
  // Single IP
  else {
    ips.push(input.trim());
  }
  
  return ips;
}

export function validateIP(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    const num = parseInt(part);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Storage functions
const HISTORY_KEY = "teknisi-scan-history";

export function getScanHistory(): ScanHistory[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveScanHistory(history: ScanHistory): void {
  const existing = getScanHistory();
  existing.unshift(history);
  // Keep only last 50 scans
  const limited = existing.slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
}

export function deleteScanHistory(id: string): void {
  const existing = getScanHistory();
  const filtered = existing.filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

export function clearAllHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
