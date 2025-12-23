import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Play,
  Square,
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Network,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ScanResult,
  ScanHistory,
  parseIPRange,
  generateId,
  saveScanHistory,
  formatDuration,
} from "@/lib/scanner";
import { exportToCSV, exportToPDF } from "@/lib/export";

export default function Scanner() {
  const { toast } = useToast();
  const [inputMode, setInputMode] = useState<"manual" | "cidr">("manual");
  const [startIp, setStartIp] = useState("192.168.1.1");
  const [endIp, setEndIp] = useState("192.168.1.254");
  const [cidr, setCidr] = useState("192.168.1.0/24");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanHistory | null>(null);
  const [scanStartTime, setScanStartTime] = useState<number>(0);

  const simulatePing = async (ip: string): Promise<ScanResult> => {
    // Simulate network latency
    const delay = Math.random() * 200 + 50;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulate ~60% active IPs for demo
    const isActive = Math.random() > 0.4;
    
    return {
      ip,
      status: isActive ? "active" : "inactive",
      responseTime: isActive ? Math.floor(Math.random() * 50 + 1) : undefined,
      hostname: isActive && Math.random() > 0.5 ? `device-${ip.split(".").pop()}` : undefined,
      timestamp: Date.now(),
    };
  };

  const startScan = useCallback(async () => {
    try {
      const input = inputMode === "cidr" ? cidr : `${startIp}-${endIp}`;
      const ips = parseIPRange(input);

      if (ips.length === 0) {
        toast({
          title: "Error",
          description: "No valid IPs to scan",
          variant: "destructive",
        });
        return;
      }

      setIsScanning(true);
      setProgress(0);
      setResults([]);
      const startTime = Date.now();
      setScanStartTime(startTime);

      const scanResults: ScanResult[] = [];

      for (let i = 0; i < ips.length; i++) {
        if (!isScanning && i > 0) break; // Check if scan was stopped

        const result = await simulatePing(ips[i]);
        scanResults.push(result);
        setResults([...scanResults]);
        setProgress(((i + 1) / ips.length) * 100);
      }

      const endTime = Date.now();
      const activeCount = scanResults.filter((r) => r.status === "active").length;
      
      const history: ScanHistory = {
        id: generateId(),
        startIp: inputMode === "manual" ? startIp : ips[0],
        endIp: inputMode === "manual" ? endIp : ips[ips.length - 1],
        cidr: inputMode === "cidr" ? cidr : undefined,
        results: scanResults,
        totalScanned: scanResults.length,
        activeCount,
        inactiveCount: scanResults.length - activeCount,
        startTime,
        endTime,
        duration: endTime - startTime,
      };

      setCurrentScan(history);
      saveScanHistory(history);

      toast({
        title: "Scan Complete",
        description: `Scanned ${scanResults.length} IPs. ${activeCount} active, ${scanResults.length - activeCount} inactive.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to scan",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  }, [inputMode, cidr, startIp, endIp, toast]);

  const stopScan = () => {
    setIsScanning(false);
    toast({
      title: "Scan Stopped",
      description: "Network scan has been cancelled",
    });
  };

  const handleExportPDF = () => {
    if (!currentScan) return;
    exportToPDF(currentScan);
    toast({
      title: "Export Complete",
      description: "PDF report has been downloaded",
    });
  };

  const handleExportCSV = () => {
    if (!currentScan) return;
    exportToCSV(currentScan);
    toast({
      title: "Export Complete",
      description: "CSV file has been downloaded",
    });
  };

  const activeCount = results.filter((r) => r.status === "active").length;
  const inactiveCount = results.filter((r) => r.status === "inactive").length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text">IP Scanner</span>
            </h1>
            <p className="text-muted-foreground">
              Scan range IP untuk mendeteksi perangkat aktif di jaringan
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  Scan Configuration
                </CardTitle>
                <CardDescription>
                  Masukkan range IP yang ingin di-scan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "manual" | "cidr")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Range</TabsTrigger>
                    <TabsTrigger value="cidr">CIDR</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="manual" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-ip">Start IP</Label>
                      <Input
                        id="start-ip"
                        placeholder="192.168.1.1"
                        value={startIp}
                        onChange={(e) => setStartIp(e.target.value)}
                        disabled={isScanning}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-ip">End IP</Label>
                      <Input
                        id="end-ip"
                        placeholder="192.168.1.254"
                        value={endIp}
                        onChange={(e) => setEndIp(e.target.value)}
                        disabled={isScanning}
                        className="font-mono"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="cidr" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cidr">CIDR Notation</Label>
                      <Input
                        id="cidr"
                        placeholder="192.168.1.0/24"
                        value={cidr}
                        onChange={(e) => setCidr(e.target.value)}
                        disabled={isScanning}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Support /24 hingga /32
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  {!isScanning ? (
                    <Button onClick={startScan} className="flex-1 gap-2">
                      <Play className="h-4 w-4" />
                      Start Scan
                    </Button>
                  ) : (
                    <Button onClick={stopScan} variant="destructive" className="flex-1 gap-2">
                      <Square className="h-4 w-4" />
                      Stop Scan
                    </Button>
                  )}
                </div>

                {/* Progress */}
                {isScanning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Scanning...</span>
                      <span className="font-mono">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{results.length} IPs scanned</span>
                    </div>
                  </div>
                )}

                {/* Stats */}
                {results.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                    <div className="text-center p-3 rounded-lg bg-success/10">
                      <div className="text-2xl font-bold text-success">{activeCount}</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-destructive/10">
                      <div className="text-2xl font-bold text-destructive">{inactiveCount}</div>
                      <div className="text-xs text-muted-foreground">Inactive</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-primary/10">
                      <div className="text-2xl font-bold text-primary">{results.length}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                  </div>
                )}

                {/* Export Buttons */}
                {currentScan && !isScanning && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <Label>Export Results</Label>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleExportPDF}
                        variant="outline"
                        className="flex-1 gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        onClick={handleExportCSV}
                        variant="outline"
                        className="flex-1 gap-2"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        CSV
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Scan Results
                    </CardTitle>
                    <CardDescription>
                      {results.length > 0
                        ? `${results.length} IPs scanned`
                        : "Results will appear here"}
                    </CardDescription>
                  </div>
                  {currentScan && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(currentScan.duration)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Network className="h-16 w-16 mb-4 opacity-20" />
                    <p>No scan results yet</p>
                    <p className="text-sm">Configure and start a scan to see results</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="max-h-[500px] overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-card z-10">
                          <TableRow>
                            <TableHead className="w-[150px]">IP Address</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="w-[120px]">Response Time</TableHead>
                            <TableHead>Hostname</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((result, index) => (
                            <TableRow
                              key={result.ip}
                              className="animate-fade-in"
                              style={{ animationDelay: `${index * 0.02}s` }}
                            >
                              <TableCell className="font-mono text-sm">
                                {result.ip}
                              </TableCell>
                              <TableCell>
                                {result.status === "active" ? (
                                  <Badge className="gap-1 bg-success hover:bg-success/90">
                                    <Wifi className="h-3 w-3" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="gap-1">
                                    <WifiOff className="h-3 w-3" />
                                    Inactive
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {result.responseTime ? (
                                  <span className="text-success">{result.responseTime}ms</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {result.hostname || (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
