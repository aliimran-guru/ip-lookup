import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Info,
  Network,
  Search,
  Download,
  History,
  Moon,
  Code,
  Shield,
  Zap,
  HelpCircle,
  CheckCircle,
} from "lucide-react";

const techStack = [
  { name: "React", version: "18.x", description: "UI Framework" },
  { name: "TypeScript", version: "5.x", description: "Type Safety" },
  { name: "Tailwind CSS", version: "3.x", description: "Styling" },
  { name: "Shadcn/ui", version: "Latest", description: "UI Components" },
  { name: "jsPDF", version: "Latest", description: "PDF Export" },
  { name: "Docker", version: "Latest", description: "Containerization" },
];

const faqs = [
  {
    question: "Apa itu Teknisi IP Lookup?",
    answer:
      "Teknisi IP Lookup adalah tool network scanning profesional yang membantu teknisi jaringan untuk men-scan range IP dan mendeteksi perangkat yang aktif atau tidak aktif di jaringan.",
  },
  {
    question: "Bagaimana cara kerja scanning?",
    answer:
      "Tool ini bekerja dengan mengirimkan ping request ke setiap IP dalam range yang ditentukan. Jika IP merespon, maka dianggap aktif. Jika tidak ada respon dalam timeout, dianggap tidak aktif.",
  },
  {
    question: "Apa perbedaan format Manual dan CIDR?",
    answer:
      "Format manual menggunakan start dan end IP (contoh: 192.168.1.1 - 192.168.1.254). Format CIDR menggunakan notasi subnet (contoh: 192.168.1.0/24 untuk 254 host).",
  },
  {
    question: "Berapa maksimal IP yang bisa di-scan?",
    answer:
      "Untuk mencegah overload, maksimal 254 IP per scan. Untuk range yang lebih besar, scan bisa dilakukan dalam beberapa batch.",
  },
  {
    question: "Apakah data scan tersimpan?",
    answer:
      "Ya, history scan tersimpan di browser (localStorage). Maksimal 50 scan terakhir disimpan. Data bisa di-export ke PDF atau CSV.",
  },
  {
    question: "Apakah tool ini bisa digunakan untuk scan jaringan publik?",
    answer:
      "Secara teknis bisa, tapi disarankan hanya untuk scan jaringan internal yang Anda kelola. Scanning jaringan tanpa izin bisa melanggar hukum.",
  },
];

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text">About</span>
            </h1>
            <p className="text-muted-foreground">
              Pelajari lebih lanjut tentang Teknisi IP Lookup
            </p>
          </div>

          {/* About Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Teknisi IP Lookup
              </CardTitle>
              <CardDescription>
                Professional Network Scanner Tool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Teknisi IP Lookup adalah aplikasi web untuk scanning dan management IP address 
                yang dirancang khusus untuk teknisi jaringan. Tool ini membantu dalam 
                mengidentifikasi perangkat aktif dan tidak aktif di jaringan, serta 
                menyediakan fitur export laporan untuk dokumentasi.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Search className="h-3 w-3" />
                  IP Scanning
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Download className="h-3 w-3" />
                  PDF/CSV Export
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <History className="h-3 w-3" />
                  Scan History
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Moon className="h-3 w-3" />
                  Dark Mode
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Cara Penggunaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: "Buka IP Scanner",
                    description: "Navigasi ke halaman IP Scanner melalui menu atau klik tombol 'Mulai Scanning' di halaman utama.",
                  },
                  {
                    step: 2,
                    title: "Pilih Format Input",
                    description: "Pilih format Manual Range untuk input IP awal dan akhir, atau CIDR untuk notasi subnet.",
                  },
                  {
                    step: 3,
                    title: "Masukkan IP Range",
                    description: "Contoh Manual: 192.168.1.1 - 192.168.1.254. Contoh CIDR: 192.168.1.0/24",
                  },
                  {
                    step: 4,
                    title: "Jalankan Scan",
                    description: "Klik tombol 'Start Scan' dan tunggu proses selesai. Progress akan ditampilkan secara real-time.",
                  },
                  {
                    step: 5,
                    title: "Lihat Hasil",
                    description: "Hasil scan akan ditampilkan dalam tabel dengan status Active (hijau) atau Inactive (merah).",
                  },
                  {
                    step: 6,
                    title: "Export Report",
                    description: "Klik tombol PDF atau CSV untuk mengunduh laporan hasil scan.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Fitur Utama
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: Search,
                    title: "IP Range Scanning",
                    description: "Support format manual dan CIDR notation",
                  },
                  {
                    icon: Zap,
                    title: "Real-time Progress",
                    description: "Lihat progress scanning secara langsung",
                  },
                  {
                    icon: Shield,
                    title: "Status Detection",
                    description: "Deteksi IP aktif dengan response time",
                  },
                  {
                    icon: Download,
                    title: "Export Report",
                    description: "Export ke PDF atau CSV",
                  },
                  {
                    icon: History,
                    title: "Scan History",
                    description: "Simpan dan akses history scan",
                  },
                  {
                    icon: Moon,
                    title: "Dark/Light Mode",
                    description: "Theme switching sesuai preferensi",
                  },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Tech Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {techStack.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border"
                  >
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {tech.version} • {tech.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                FAQ
              </CardTitle>
              <CardDescription>
                Pertanyaan yang sering diajukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
