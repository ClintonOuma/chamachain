from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers.scoring_router import router as scoring_router
import os

load_dotenv()

app = FastAPI(title="ChamaChain AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scoring_router, prefix="/ai")

@app.get("/")
def read_root():
    return {"status": "ok", "service": "ChamaChain AI Service", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"success": True, "message": "ChamaChain AI Service running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
