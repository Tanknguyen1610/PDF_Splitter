export interface ThumbnailData {
  page_number: number;
  thumbnail: string;
  width: number;
  height: number;
}

export interface UploadResponse {
  file_id: string;
  original_name: string;
  total_pages: number;
  thumbnails: ThumbnailData[];
}