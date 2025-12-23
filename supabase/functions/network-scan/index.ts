import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extended list of common ports for better device detection
const DEFAULT_PROBE_PORTS = [
  // Web
  80, 443, 8080, 8443, 8000, 8888, 3000, 5000,
  // Remote access
  22, 23, 3389, 5900, 5901,
  // Email
  25, 110, 143, 465, 587, 993, 995,
  // File sharing
  21, 20, 445, 139, 2049,
  // Database
  3306, 5432, 1433, 27017, 6379,
  // DNS & DHCP
  53, 67, 68,
  // Printers & IoT
  9100, 515, 631, 1883, 8883,
  // Network services
  161, 162, 179, 389, 636,
  // Other common
  111, 135, 137, 138, 1723, 1812
];

interface ScanResult {
  ip: string;
  status: "active" | "inactive";
  responseTime?: number;
  openPorts?: number[];
  timestamp: number;
  method?: string;
}

// Quick connectivity check using multiple methods
async function quickCheck(ip: string, timeout: number = 800): Promise<{connected: boolean, port?: number}> {
  // Try the most common ports first for quick detection
  const quickPorts = [80, 443, 22, 445, 139, 21, 23, 3389, 8080];
  
  const checks = quickPorts.map(async (port) => {
    try {
      const conn = await Promise.race([
        Deno.connect({ hostname: ip, port }),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error("timeout")), timeout)
        )
      ]);
      
      if (conn && typeof conn === 'object' && 'close' in conn) {
        (conn as Deno.Conn).close();
        return { connected: true, port };
      }
      return { connected: false };
    } catch {
      return { connected: false };
    }
  });
  
  // Return first successful connection
  const results = await Promise.race([
    Promise.any(checks.map(p => p.then(r => r.connected ? r : Promise.reject()))).catch(() => ({ connected: false })),
    new Promise<{connected: boolean}>((resolve) => setTimeout(() => resolve({ connected: false }), timeout + 100))
  ]);
  
  return results;
}

async function checkPort(ip: string, port: number, timeout: number = 1000): Promise<boolean> {
  try {
    const conn = await Promise.race([
      Deno.connect({ hostname: ip, port }),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("timeout")), timeout)
      )
    ]);
    
    if (conn && typeof conn === 'object' && 'close' in conn) {
      (conn as Deno.Conn).close();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function scanHost(ip: string, ports: number[] = DEFAULT_PROBE_PORTS, quickMode: boolean = false): Promise<ScanResult> {
  const startTime = Date.now();
  
  console.log(`Scanning host: ${ip} (${quickMode ? 'quick' : 'full'} mode, ${ports.length} ports)`);
  
  // Quick mode: just check if host is up
  if (quickMode) {
    const quickResult = await quickCheck(ip);
    const responseTime = Date.now() - startTime;
    
    console.log(`Host ${ip}: ${quickResult.connected ? 'ACTIVE' : 'inactive'}${quickResult.port ? ` (port ${quickResult.port})` : ''}`);
    
    return {
      ip,
      status: quickResult.connected ? "active" : "inactive",
      responseTime: quickResult.connected ? responseTime : undefined,
      openPorts: quickResult.port ? [quickResult.port] : undefined,
      timestamp: Date.now(),
      method: "tcp-quick"
    };
  }
  
  // Full scan: check all specified ports
  const openPorts: number[] = [];
  
  // Scan in smaller batches to avoid overwhelming
  const batchSize = 15;
  for (let i = 0; i < ports.length; i += batchSize) {
    const batch = ports.slice(i, i + batchSize);
    const portChecks = batch.map(async (port) => {
      const isOpen = await checkPort(ip, port, 800);
      if (isOpen) {
        openPorts.push(port);
      }
      return isOpen;
    });
    await Promise.all(portChecks);
    
    // Early exit if we found open ports
    if (openPorts.length > 0 && i === 0) break;
  }
  
  const isActive = openPorts.length > 0;
  const responseTime = Date.now() - startTime;
  
  console.log(`Host ${ip}: ${isActive ? 'ACTIVE' : 'inactive'}, open ports: ${openPorts.join(', ') || 'none'}`);
  
  return {
    ip,
    status: isActive ? "active" : "inactive",
    responseTime: isActive ? responseTime : undefined,
    openPorts: openPorts.length > 0 ? openPorts.sort((a, b) => a - b) : undefined,
    timestamp: Date.now(),
    method: "tcp-full"
  };
}

function parseIPRange(input: string): string[] {
  const ips: string[] = [];
  
  // CIDR notation
  if (input.includes("/")) {
    const [baseIp, cidrBits] = input.split("/");
    const bits = parseInt(cidrBits);
    
    if (bits < 24 || bits > 32) {
      throw new Error("CIDR range must be between /24 and /32");
    }
    
    const parts = baseIp.split(".").map(Number);
    const baseNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    const hostBits = 32 - bits;
    const numHosts = Math.pow(2, hostBits);
    const networkAddress = baseNum & (~0 << hostBits);
    
    for (let i = 1; i < numHosts - 1; i++) {
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
  // Range notation
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { ipRange, singleIp, target, ports, quickMode = true } = body;
    
    // Support both 'target' (from frontend) and 'ipRange'/'singleIp' parameters
    const scanTarget = target || ipRange || singleIp;
    
    // Custom ports or use defaults
    const scanPorts: number[] = ports && Array.isArray(ports) ? ports : DEFAULT_PROBE_PORTS;
    
    console.log(`Network scan request: ${scanTarget}, quickMode: ${quickMode}, ports: ${scanPorts.length}`);
    
    if (!scanTarget) {
      throw new Error("Target IP/range is required. Use 'target', 'ipRange', or 'singleIp' parameter.");
    }
    
    const startTime = Date.now();
    
    // Check if it's a single IP (no range or CIDR)
    const isSingleIp = !scanTarget.includes("/") && !scanTarget.includes("-");
    
    if (isSingleIp) {
      // Scan single IP - use full scan for single IPs
      const result = await scanHost(scanTarget, scanPorts, false);
      return new Response(JSON.stringify({ 
        results: [result],
        totalHosts: 1,
        activeHosts: result.status === "active" ? 1 : 0,
        scanDuration: Date.now() - startTime,
        scanMethod: result.method,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Scan IP range or CIDR
    const ips = parseIPRange(scanTarget);
    console.log(`Scanning ${ips.length} IPs in ${quickMode ? 'quick' : 'full'} mode`);
    
    // Use larger batches for quick mode, smaller for full scan
    const batchSize = quickMode ? 20 : 10;
    const results: ScanResult[] = [];
    
    for (let i = 0; i < ips.length; i += batchSize) {
      const batch = ips.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(ip => scanHost(ip, scanPorts, quickMode))
      );
      results.push(...batchResults);
      
      // Log progress for large scans
      if (ips.length > 50) {
        console.log(`Progress: ${Math.min(i + batchSize, ips.length)}/${ips.length} hosts scanned`);
      }
    }
    
    const activeCount = results.filter(r => r.status === "active").length;
    
    return new Response(JSON.stringify({ 
      results,
      totalHosts: results.length,
      activeHosts: activeCount,
      scanDuration: Date.now() - startTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    console.error('Error in network-scan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
