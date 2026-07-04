"use client";

import { Scissors, RotateCcw, FileText, Loader2, Info } from "lucide-react";
import { UploadResponse } from "@/lib/types";

interface SplitControlPanelProps {
  uploadData: UploadResponse | null;
  splitPages: number[];
  isSplitting: boolean;
  onReset: () => void;
  onSplit: () => void;
  onRemoveSplitPoint: (pageNumber: number) => void;
}

export function SplitControlPanel({
  uploadData,
  splitPages,
  isSplitting,
  onReset,
  onSplit,
  onRemoveSplitPoint,
}: SplitControlPanelProps) {
  const totalOutputFiles =
    splitPages.length > 0 ? (splitPages[0] === 1 ? splitPages.length : splitPages.length + 1) : 1;

  return (
    <div className="w-full lg:w-[380px] flex flex-col bg-card border border-border rounded-2xl overflow-hidden glass-panel shrink-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold font-display text-foreground">Cấu hình tách file</h3>
          {uploadData && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-semibold bg-primary/10 text-primary border border-primary/20">
              {uploadData.total_pages} TRANG
            </span>
          )}
        </div>
        {uploadData && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate" title={uploadData.original_name}>
            {uploadData.original_name}.pdf
          </p>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {!uploadData ? (
          <div className="flex h-40 flex-col items-center justify-center text-muted-foreground text-xs text-center gap-2">
            <Info size={24} className="text-muted-foreground/60" />
            <span>Tải lên file PDF để bắt đầu chọn điểm cắt</span>
          </div>
        ) : splitPages.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-muted-foreground text-xs text-center gap-2">
            <FileText size={24} className="text-muted-foreground/60" />
            <span>Click vào trang bất kỳ để đánh dấu điểm bắt đầu văn bản mới</span>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-muted-foreground font-medium">
              Sẽ tạo ra <span className="text-primary font-bold">{totalOutputFiles}</span> file PDF:
            </p>
            {splitPages.map((page, idx) => (
              <div
                key={page}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/40 border border-border text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Scissors size={12} className="text-primary shrink-0" />
                  <span className="font-mono text-muted-foreground truncate">
                    {uploadData.original_name}-{String(idx + 1).padStart(2, "0")}.pdf
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveSplitPoint(page)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
                  title={`Bỏ điểm cắt trang ${page}`}
                >
                  ×
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-5 border-t border-border bg-card/40 backdrop-blur-md flex items-center gap-3 shrink-0 select-none">
        <button
          type="button"
          onClick={onReset}
          disabled={splitPages.length === 0}
          className="flex-1 flex items-center justify-center px-3 py-2.5 rounded-xl border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 font-semibold text-xs transition-all hover:border-primary/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw size={14} className="mr-1.5" />
          Reset
        </button>

        <button
          type="button"
          onClick={onSplit}
          disabled={!uploadData || isSplitting}
          className="flex-1 flex items-center justify-center px-3 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-md border border-transparent bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSplitting ? (
            <Loader2 size={14} className="animate-spin mr-1.5" />
          ) : (
            <Scissors size={14} className="mr-1.5" />
          )}
          {isSplitting ? "Đang tách..." : "Thực hiện tách"}
        </button>
      </div>
    </div>
  );
}