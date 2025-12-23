import { Network, Github, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Network className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg gradient-text">
                Teknisi IP Lookup
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Professional network scanning tool untuk teknisi jaringan.
              Scan, analyze, dan manage IP addresses dengan mudah.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/scanner" className="hover:text-primary transition-colors">
                IP Scanner
              </Link>
              <Link to="/history" className="hover:text-primary transition-colors">
                Scan History
              </Link>
              <Link to="/about" className="hover:text-primary transition-colors">
                About
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a
                href="mailto:support@teknisi.dev"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                support@teknisi.dev
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Teknisi IP Lookup. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
