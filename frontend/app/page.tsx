"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { PageGrid } from "@/components/PageGrid";
import { SplitControlPanel } from "@/components/SplitControlPanel";
import { UploadResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [splitPages, setSplitPages] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);

  if (!mounted) return null;

  const handleFileSelected = async (file: File): Promise<{ success: boolean; error?: string }> => {
    setIsUploading(true);
    setUploadData(null);
    setSplitPages([]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/api/pdf/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        return { success: false, error: errBody?.detail || "Upload thất bại" };
      }
      setUploadData(await res.json());
      return { success: true };
    } catch {
      return { success: false, error: "Không thể kết nối tới máy chủ" };
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleSplitPage = (pageNumber: number) => {
    setSplitPages((prev) =>
      prev.includes(pageNumber)
        ? prev.filter((p) => p !== pageNumber).sort((a, b) => a - b)
        : [...prev, pageNumber].sort((a, b) => a - b)
    );
  };

  const handleSplit = async () => {
    if (!uploadData) return;
    setIsSplitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pdf/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: uploadData.file_id, split_pages: splitPages }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${uploadData.original_name}-split.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans">
      {/* Header - đồng bộ với Dashboard gốc */}
      <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card/60 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles size={14} className="text-white animate-pulse" />
          </div>
          <span className="font-bold text-sm tracking-wide font-display bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
            Visual PDF Splitter
          </span>
        </div>

        <button
          type="button"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          title={theme === "light" ? "Chuyển sang giao diện tối" : "Chuyển sang giao diện sáng"}
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-6 gap-6 min-h-0 overflow-hidden">
        {/* Cột trái: Upload (340px cố định, giống panel trái Dashboard) */}
        <section className="w-full md:w-[300px] flex flex-col bg-card border border-border rounded-2xl p-5 glass-panel shrink-0">
          <UploadZone onUpload={handleFileSelected} isUploading={isUploading} />
        </section>

        {/* Khu vực chính: viewport (trái) + control panel (phải), giống SplitScreenEditor */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
          <PageGrid
            thumbnails={uploadData?.thumbnails || []}
            splitPages={splitPages}
            onToggle={handleToggleSplitPage}
            totalPages={uploadData?.total_pages}
          />

          <SplitControlPanel
            uploadData={uploadData}
            splitPages={splitPages}
            isSplitting={isSplitting}
            onReset={() => setSplitPages([])}
            onSplit={handleSplit}
            onRemoveSplitPoint={(page) => setSplitPages((prev) => prev.filter((p) => p !== page))}
          />
        </div>
      </main>
    </div>
  );
}