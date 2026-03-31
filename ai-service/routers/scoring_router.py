from fastapi import APIRouter, HTTPException
from services.scoring import calculate_credit_score, calculate_group_health

router = APIRouter()

@router.get("/credit-score/{user_id}/{chama_id}")
def get_credit_score(user_id: str, chama_id: str):
    result = calculate_credit_score(user_id, chama_id)
    return {"success": True, "data": result}

@router.get("/group-health/{chama_id}")
def get_group_health(chama_id: str):
    result = calculate_group_health(chama_id)
    return {"success": True, "data": result}
