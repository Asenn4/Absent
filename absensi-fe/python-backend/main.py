from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Izinkan Next.js (localhost:3000) untuk mengakses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Server AI Absensi Berjalan Lancar!"}

@app.post("/api/recognize-face")
async def recognize_face(file: UploadFile = File(...)):
    # Saat ini hanya simulasi, model AI aslinya belum dipasang
    image_bytes = await file.read()
    
    # --- Di sini nanti kode untuk run model AI Anda ---
    # result = my_face_model.predict(image_bytes)
    # ---------------------------------------------------

    print(f"Menerima gambar: {file.filename} dengan ukuran {len(image_bytes)} bytes")
    
    # Kembalikan respons dummy seolah-olah wajah dikenali
    return {
        "status": "success",
        "user_id": "1",
        "name": "Budi (Simulasi)",
        "confidence": 0.95
    }

@app.post("/api/train-face")
async def train_face(file: UploadFile = File(...), user_id: str = Form(...)):
    # Saat ini hanya simulasi, model AI aslinya belum dipasang
    image_bytes = await file.read()
    
    # --- Di sini nanti kode untuk ekstrak vektor wajah (embedding) ---
    # misal: embedding = my_face_model.extract_embedding(image_bytes)
    # -----------------------------------------------------------------

    print(f"Menerima gambar untuk training: {file.filename} (user: {user_id}), ukuran {len(image_bytes)} bytes")
    
    # Kembalikan vektor dummy (128 dimensi)
    dummy_embedding = [0.1] * 128
    
    return {
        "status": "success",
        "user_id": user_id,
        "embedding": dummy_embedding
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
