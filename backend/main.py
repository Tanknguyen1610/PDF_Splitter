import fitz  # PyMuPDF
import uuid
import base64
import io
import zipfile
import shutil
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="Visual PDF Splitter API")

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # domain của Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Cấu hình lưu trữ tạm ----
TEMP_DIR = Path("temp_storage")
TEMP_DIR.mkdir(exist_ok=True)

# Map file_id -> thông tin file (đường dẫn, tên gốc)
# Lưu ý: dùng dict in-memory chỉ phù hợp cho demo/dev.
# Khi tích hợp vào hệ thống lớn, nên thay bằng Redis/DB.
FILE_REGISTRY: dict[str, dict] = {}


class SplitRequest(BaseModel):
    file_id: str
    split_pages: list[int]  # 1-indexed, do người dùng chọn trên UI


@app.post("/api/pdf/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File phải là định dạng PDF")

    file_id = str(uuid.uuid4())
    original_name = Path(file.filename).stem  # bỏ đuôi .pdf
    saved_path = TEMP_DIR / f"{file_id}.pdf"

    # Lưu file gốc xuống đĩa
    content = await file.read()
    with open(saved_path, "wb") as f:
        f.write(content)

    try:
        doc = fitz.open(saved_path)
    except Exception:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="File PDF không hợp lệ hoặc bị hỏng")

    total_pages = doc.page_count
    thumbnails = []

    # Zoom 2.0 tương đương ~144 DPI - đã được verify là đủ nét trong dự án tham khảo
    zoom = 2.0
    zoom_matrix = fitz.Matrix(zoom, zoom)

    for page_index in range(total_pages):
        page = doc.load_page(page_index)
        pix = page.get_pixmap(matrix=zoom_matrix)

        # PNG lossless - giữ nguyên độ nét của chữ và đường kẻ
        img_bytes = pix.tobytes("png")
        b64_str = base64.b64encode(img_bytes).decode("utf-8")

        thumbnails.append({
            "page_number": page_index + 1,
            "thumbnail": f"data:image/png;base64,{b64_str}",
            "width": pix.width,
            "height": pix.height,
        })

    doc.close()

    FILE_REGISTRY[file_id] = {
        "path": str(saved_path),
        "original_name": original_name,
        "total_pages": total_pages,
    }

    return {
        "file_id": file_id,
        "original_name": original_name,
        "total_pages": total_pages,
        "thumbnails": thumbnails,
    }


@app.post("/api/pdf/split")
async def split_pdf(payload: SplitRequest):
    file_info = FILE_REGISTRY.get(payload.file_id)
    if not file_info:
        raise HTTPException(status_code=404, detail="Không tìm thấy file, vui lòng upload lại")

    pdf_path = Path(file_info["path"])
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="File tạm đã bị xóa, vui lòng upload lại")

    total_pages = file_info["total_pages"]
    original_name = file_info["original_name"]

    # Chuẩn hóa & validate danh sách điểm cắt
    split_pages = sorted(set(payload.split_pages))
    for p in split_pages:
        if p < 1 or p > total_pages:
            raise HTTPException(
                status_code=400,
                detail=f"Trang cắt {p} không hợp lệ (tài liệu chỉ có {total_pages} trang)",
            )

    # Nếu người dùng không chọn điểm cắt nào -> mặc định tách nguyên file
    if not split_pages or split_pages[0] != 1:
        split_pages = [1] + split_pages

    # Tính các khoảng (start, end) — 0-indexed để dùng với PyMuPDF
    ranges = []
    for i, start_page in enumerate(split_pages):
        end_page = (split_pages[i + 1] - 1) if i + 1 < len(split_pages) else total_pages
        ranges.append((start_page, end_page))  # 1-indexed, inclusive

    doc = fitz.open(pdf_path)
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for idx, (start_page, end_page) in enumerate(ranges, start=1):
            new_doc = fitz.open()
            new_doc.insert_pdf(doc, from_page=start_page - 1, to_page=end_page - 1)

            file_name = f"{original_name}-{idx:02d}.pdf"
            pdf_bytes = new_doc.tobytes()
            zip_file.writestr(file_name, pdf_bytes)
            new_doc.close()

    doc.close()
    zip_buffer.seek(0)

    # Lưu file zip tạm để trả về qua FileResponse
    zip_path = TEMP_DIR / f"{payload.file_id}-split.zip"
    with open(zip_path, "wb") as f:
        f.write(zip_buffer.getvalue())

    return FileResponse(
        path=zip_path,
        filename=f"{original_name}-split.zip",
        media_type="application/zip",
    )


@app.delete("/api/pdf/{file_id}")
async def cleanup_file(file_id: str):
    """Endpoint phụ trợ: dọn dẹp file tạm sau khi client tải xong."""
    file_info = FILE_REGISTRY.pop(file_id, None)
    if file_info:
        Path(file_info["path"]).unlink(missing_ok=True)
    zip_path = TEMP_DIR / f"{file_id}-split.zip"
    zip_path.unlink(missing_ok=True)
    return {"status": "cleaned"}


@app.get("/")
async def health_check():
    return {"status": "ok", "service": "Visual PDF Splitter"}