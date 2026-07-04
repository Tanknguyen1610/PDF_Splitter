"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, AlertCircle, Loader2 } from "lucide-react";

interface UploadZoneProps {
  onUpload: (file: File) => Promise<{ success: boolean; error?: string }>;
  isUploading: boolean;
}

export function UploadZone({ onUpload, isUploading }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
  };

  const validateAndUpload = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Tệp không hợp lệ! Hệ thống chỉ chấp nhận định dạng tài liệu .pdf", "error");
      return;
    }

    const result = await onUpload(file);
    if (result.success) {
      showToast(`Đã tải lên "${file.name}" thành công!`, "success");
    } else {
      showToast(result.error || "Tải tệp lên thất bại.", "error");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isUploading) return;
    if (e.dataTransfer.files) validateAndUpload(e.dataTransfer.files);
  };

  const triggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="relative w-full space-y-3">
      {toast && (
        <div
          role="alert"
          className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 max-w-sm ${
            toast.type === "error"
              ? "bg-destructive/10 border-destructive/30 text-destructive"
              : "bg-success/10 border-success/30 text-success"
          }`}
        >
          <AlertCircle className="mr-2.5 shrink-0" size={18} />
          <span className="text-xs font-sans font-medium">{toast.message}</span>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && validateAndUpload(e.target.files)}
        accept=".pdf"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`glass-panel relative flex flex-col items-center justify-center p-6 text-center rounded-2xl border-dashed transition-all duration-300 cursor-pointer group ${
          isDragOver
            ? "bg-success/10 border-success/80 text-success scale-[1.01]"
            : isUploading
            ? "border-border opacity-60 cursor-not-allowed"
            : "border-border text-muted-foreground hover:border-primary/80 hover:bg-accent/40"
        }`}
      >
        {isUploading ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        ) : (
          <UploadCloud
            className={`h-10 w-10 mb-3 transition-transform duration-300 ${
              isDragOver ? "text-success scale-110" : "text-muted-foreground group-hover:text-primary group-hover:scale-105"
            }`}
          />
        )}

        <div className="text-xs font-semibold text-foreground mb-1">
          {isDragOver ? "Thả tài liệu vào đây" : isUploading ? "Đang xử lý tài liệu..." : "Kéo thả tệp PDF hoặc nhấp để duyệt"}
        </div>

        <p className="text-[10px] text-muted-foreground max-w-[240px]">
          Chỉ chấp nhận 1 tệp định dạng .pdf mỗi lần.
        </p>
      </div>
    </div>
  );
}