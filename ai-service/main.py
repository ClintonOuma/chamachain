from fastapi import FastAPI
from dotenv import load_dotenv
from routers.scoring_router import router as scoring_router

load_dotenv()

app = FastAPI(title="ChamaChain AI Service")

app.include_router(scoring_router, prefix="/ai")

@app.get("/health")
def health():
    return {"success": True, "message": "ChamaChain AI Service running"}
