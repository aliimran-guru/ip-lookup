import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Eye,
  FileText,
  FileSpreadsheet,
  Clock,
  Wifi,
  WifiOff,
  Calendar,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ScanHistory as ScanHistoryType,
  getScanHistory,
  deleteScanHistory,
  clearAllHistory,
  formatDuration,
  formatDate,
} from "@/lib/scanner";
import { exportToCSV, exportToPDF } from "@/lib/export";

export default function History() {
  const { toast } = useToast();
  const [history, setHistory] = useState<ScanHistoryType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScan, setSelectedScan] = useState<ScanHistoryType | null>(null);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteScanHistory(id);
    setHistory(getScanHistory());
    toast({
      title: "Deleted",
      description: "Scan history has been removed",
    });
  };

  const handleClearAll = () => {
    clearAllHistory();
    setHistory([]);
    toast({
      title: "Cleared",
      description: "All scan history has been removed",
    });
  };

  const handleExportPDF = (scan: ScanHistoryType) => {
    exportToPDF(scan);
    toast({
      title: "Export Complete",
      description: "PDF report has been downloaded",
    });
  };

  const handleExportCSV = (scan: ScanHistoryType) => {
    exportToCSV(scan);
    toast({
      title: "Export Complete",
      description: "CSV file has been downloaded",
    });
  };

  const filteredHistory = history.filter((scan) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      scan.startIp.includes(searchLower) ||
      scan.endIp.includes(searchLower) ||
      (scan.cidr && scan.cidr.includes(searchLower))
    );
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="gradient-text">Scan History</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Lihat dan kelola riwayat scan sebelumnya
              </p>
            </div>
            
            {history.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All History?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all scan history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll}>
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Search */}
          {history.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by IP range..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* History List */}
          {filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <HistoryIcon className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">
                    {history.length === 0 ? "No scan history yet" : "No matching results"}
                  </p>
                  <p className="text-sm">
                    {history.length === 0
                      ? "Your scan results will appear here"
                      : "Try a different search term"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredHistory.map((scan) => (
                <Card key={scan.id} className="hover-lift transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                      {/* Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {scan.cidr || `${scan.startIp} - ${scan.endIp}`}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(scan.duration)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(scan.startTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Wifi className="h-4 w-4 text-success" />
                            {scan.activeCount} active
                          </span>
                          <span className="flex items-center gap-1">
                            <WifiOff className="h-4 w-4 text-destructive" />
                            {scan.inactiveCount} inactive
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedScan(scan)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportPDF(scan)}
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportCSV(scan)}
                          className="gap-2"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          CSV
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this scan?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this scan history. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(scan.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Scan Details
            </DialogTitle>
            <DialogDescription>
              {selectedScan?.cidr || `${selectedScan?.startIp} - ${selectedScan?.endIp}`}
              {" • "}
              {selectedScan && formatDate(selectedScan.startTime)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedScan && (
            <div className="flex-1 overflow-auto">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <div className="text-xl font-bold text-success">{selectedScan.activeCount}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-destructive/10">
                  <div className="text-xl font-bold text-destructive">{selectedScan.inactiveCount}</div>
                  <div className="text-xs text-muted-foreground">Inactive</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10">
                  <div className="text-xl font-bold text-primary">{selectedScan.totalScanned}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>

              {/* Results Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Response Time</TableHead>
                        <TableHead>Hostname</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedScan.results.map((result) => (
                        <TableRow key={result.ip}>
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
                            {result.hostname || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
