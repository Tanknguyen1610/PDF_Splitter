"use client";

import { FileText } from "lucide-react";
import { ThumbnailData } from "@/lib/types";
import { PageThumbnail } from "./PageThumbnail";

interface PageGridProps {
  thumbnails: ThumbnailData[];
  splitPages: number[];
  onToggle: (pageNumber: number) => void;
  totalPages?: number;
}

export function PageGrid({ thumbnails, splitPages, onToggle, totalPages }: PageGridProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-muted rounded-2xl overflow-hidden border border-border relative">
      {/* Floating toolbar */}
      {thumbnails.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 px-3 py-1.5 bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-lg">
          <span className="text-[11px] font-mono text-muted-foreground">
            {totalPages ?? thumbnails.length} trang
          </span>
          <div className="w-[1px] h-4 bg-border" />
          <span className="text-[11px] font-sans text-primary font-semibold">
            {splitPages.length} điểm cắt
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8 pt-16">
        {thumbnails.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs text-center space-y-2">
            <FileText size={40} className="text-muted-foreground/50" />
            <span>Tải lên một file PDF để bắt đầu chọn điểm cắt</span>
          </div>
        ) : (
          // 1 cột, căn giữa, giới hạn chiều rộng để trang không bị kéo quá to trên màn hình lớn
          <div className="flex flex-col items-center gap-8 max-w-2xl mx-auto">
            {thumbnails.map((page) => {
              const splitOrder = splitPages.indexOf(page.page_number);
              return (
                <PageThumbnail
                  key={page.page_number}
                  page={page}
                  isSplitPoint={splitOrder !== -1}
                  splitIndex={splitOrder !== -1 ? splitOrder + 1 : null}
                  onToggle={onToggle}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}