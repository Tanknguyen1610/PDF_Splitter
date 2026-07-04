"use client";

import { Scissors } from "lucide-react";
import { ThumbnailData } from "@/lib/types";

interface PageThumbnailProps {
  page: ThumbnailData;
  isSplitPoint: boolean;
  splitIndex: number | null;
  onToggle: (pageNumber: number) => void;
}

export function PageThumbnail({ page, isSplitPoint, splitIndex, onToggle }: PageThumbnailProps) {
  const aspectRatio = page.width && page.height ? page.width / page.height : 0.75;

  return (
    <button
      type="button"
      onClick={() => onToggle(page.page_number)}
      className="group relative flex flex-col items-center gap-2 focus:outline-none w-full"
    >
      <div
        style={{ aspectRatio }}
        className={`relative w-full overflow-hidden rounded-lg bg-white shadow-xl border-2 transition-all duration-200
          ${isSplitPoint
            ? "border-primary ring-4 ring-primary/25 scale-[1.005]"
            : "border-border group-hover:border-primary/50"
          }`}
      >
        <img
          src={page.thumbnail}
          alt={`Trang ${page.page_number}`}
          className="h-full w-full object-contain select-none pointer-events-none"
          draggable={false}
          loading="lazy"
        />

        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />

        {isSplitPoint && (
          <div className="absolute top-0 left-0 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold pl-3 pr-4 py-1.5 rounded-br-xl shadow-md z-10">
            <Scissors size={13} />
            <span>Điểm cắt #{splitIndex}</span>
          </div>
        )}

        <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs leading-none px-2 py-1.5 rounded font-mono">
          Trang {page.page_number}
        </span>
      </div>

      <span className={`text-xs font-medium transition-colors ${isSplitPoint ? "text-primary" : "text-muted-foreground"}`}>
        {isSplitPoint ? "Bắt đầu file mới" : "Click để đánh dấu điểm cắt"}
      </span>
    </button>
  );
}