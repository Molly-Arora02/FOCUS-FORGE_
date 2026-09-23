"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderSync,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  FileText,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Integration, ResourceItem } from "@/types";

export default function IntegrationsPage() {
  const { user } = useAuth();

  const [connected, setConnected] = useState(false);
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [driveFiles, setDriveFiles] = useState<ResourceItem[]>([]);
  const [isRealOAuthConfigured, setIsRealOAuthConfigured] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      const userId = user?._id || "demo-user-123";
      try {
        const res = await fetch(`/api/integrations/google-drive?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setConnected(data.connected);
          setIntegration(data.integration);
          setDriveFiles(data.driveResources || []);
          setIsRealOAuthConfigured(data.isRealOAuthConfigured);
        }
      } catch (err) {
        console.error("Integrations load error:", err);
      }
    }
    loadStatus();
  }, [user]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/google-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || "demo-user-123",
          action: "connect_demo",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConnected(true);
        setIntegration(data.integration);
        // Refresh files
        const filesRes = await fetch(`/api/integrations/google-drive?userId=${user?._id || "demo-user-123"}`);
        const filesData = await filesRes.json();
        setDriveFiles(filesData.driveResources || []);
      }
    } catch (err) {
      console.error("Error connecting Google Drive:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch(`/api/integrations/google-drive?userId=${user?._id || "demo-user-123"}`, {
        method: "DELETE",
      });
      setConnected(false);
      setIntegration(null);
      setDriveFiles([]);
    } catch (err) {
      console.error("Error disconnecting:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-txt-primary flex items-center gap-2.5">
              <FolderSync className="w-7 h-7 text-forge" />
              Connected Integrations & Cloud Drives
            </h1>
            <p className="text-xs sm:text-sm text-txt-secondary">
              Connect external documents, course management systems, and cloud storage providers.
            </p>
          </div>
        </div>

        {/* Google Drive Integration Box */}
        <Card className="p-6 md:p-8 space-y-6 bg-surface-card border-surface-border shadow-glow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-surface-border flex items-center justify-center shadow-md">
                <svg className="w-7 h-7" viewBox="0 0 87.3 78" fill="none">
                  <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA" />
                  <path d="M43.65 25L29.9 1.2C28.55.4 27 0 25.45 0H18.2c-1.55 0-3.1.4-4.45 1.2L0 25h43.65z" fill="#00AC47" />
                  <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 5.4-9.35c.8-1.4 1.2-2.95 1.2-4.5H56.2l6.2 10.75 11.15 9.15z" fill="#EA4335" />
                  <path d="M43.65 25L57.4 1.2c-1.35-.8-2.9-1.2-4.45-1.2h-18.6c-1.55 0-3.1.4-4.45 1.2L43.65 25z" fill="#00832D" />
                  <path d="M56.2 56.9H27.5L13.75 76.8c1.35.8 2.9 1.2 4.45 1.2h50.9c1.55 0 3.1-.4 4.45-1.2L56.2 56.9z" fill="#2684FC" />
                  <path d="M73.4 25H43.65l13.75 23.8 13.75-23.8z" fill="#FFBA00" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-txt-primary">Google Drive</h2>
                  <Badge variant={connected ? "forge" : "outline"} size="sm">
                    {connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <p className="text-xs text-txt-secondary">
                  Authorize access to study files, exam syllabi, and semester timetables.
                </p>
              </div>
            </div>

            <div>
              {connected ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDisconnect}
                  isLoading={loading}
                  className="font-semibold text-xs"
                >
                  Disconnect Drive
                </Button>
              ) : (
                <Button
                  variant="forge"
                  size="md"
                  onClick={handleConnect}
                  isLoading={loading}
                  className="font-bold shadow-glow text-xs"
                >
                  Connect Google Drive
                </Button>
              )}
            </div>
          </div>

          {/* Privacy & Scope Disclosure */}
          <div className="p-4 rounded-xl bg-surface-hover/80 border border-surface-border text-xs text-txt-secondary space-y-2">
            <div className="flex items-center gap-2 text-txt-primary font-semibold">
              <Shield className="w-4 h-4 text-forge" />
              <span>Permission & Security Disclosures</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Focus Forge requests only limited Drive scopes (<code className="font-mono text-forge">drive.file</code> and <code className="font-mono text-forge">drive.readonly</code>) to access documents you explicitly choose. No private account files are scraped or indexed without your consent.
            </p>
            {!isRealOAuthConfigured && (
              <p className="text-[11px] text-status-warning font-mono pt-1">
                ⚠️ Live Google OAuth credentials not detected in .env. Interactive development demo connection is active.
              </p>
            )}
          </div>

          {/* Connected Authorized Drive Documents */}
          {connected && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono uppercase text-txt-muted">
                Authorized Drive Documents ({driveFiles.length})
              </span>

              <div className="space-y-2">
                {driveFiles.map((file) => (
                  <div
                    key={file._id}
                    className="p-3.5 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs gap-3"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="w-4 h-4 text-forge shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-txt-primary truncate">{file.fileName}</p>
                        <p className="text-[11px] text-txt-muted truncate">{file.contentSnippet}</p>
                      </div>
                    </div>

                    <a
                      href={file.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forge hover:underline font-mono inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Open Doc</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
