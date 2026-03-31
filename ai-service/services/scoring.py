from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone
import os

def get_db():
    client = MongoClient(os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/chamachain"))
    return client["chamachain"]

def calculate_credit_score(user_id: str, chama_id: str) -> dict:
    db = get_db()

    try:
        user_oid = ObjectId(user_id)
        chama_oid = ObjectId(chama_id)
    except Exception:
        return {"score": 0, "riskLabel": "very_high", "breakdown": {}, "tips": []}

    # Get membership
    membership = db.memberships.find_one({"userId": user_oid, "chamaId": chama_oid, "status": "active"})
    if not membership:
        return {"score": 0, "riskLabel": "very_high", "breakdown": {}, "tips": ["You are not an active member of this chama."]}

    # Get contributions
    contributions = list(db.contributions.find({"userId": user_oid, "chamaId": chama_oid, "status": "success"}))
    total_contributed = sum(c["amount"] for c in contributions)
    contribution_count = len(contributions)

    # Get loans
    loans = list(db.loans.find({"userId": user_oid, "chamaId": chama_oid}))
    repaid_loans = [l for l in loans if l["status"] == "repaid"]
    defaulted_loans = [l for l in loans if l["status"] == "defaulted"]

    # Get chama settings
    chama = db.chamas.find_one({"_id": chama_oid})
    min_contribution = chama.get("settings", {}).get("minContribution", 500) if chama else 500

    # ── Score Calculation ──────────────────────────────────────────
    score = 0
    breakdown = {}

    # Factor 1: Contribution Consistency (25 points)
    if contribution_count >= 12:
        consistency = 25
    elif contribution_count >= 6:
        consistency = 18
    elif contribution_count >= 3:
        consistency = 12
    elif contribution_count >= 1:
        consistency = 6
    else:
        consistency = 0
    score += consistency
    breakdown["contributionConsistency"] = consistency

    # Factor 2: Contribution Amount vs minimum (20 points)
    if total_contributed >= min_contribution * 12:
        amount_score = 20
    elif total_contributed >= min_contribution * 6:
        amount_score = 15
    elif total_contributed >= min_contribution * 3:
        amount_score = 10
    elif total_contributed >= min_contribution:
        amount_score = 5
    else:
        amount_score = 0
    score += amount_score
    breakdown["contributionAmount"] = amount_score

    # Factor 3: Repayment History (25 points)
    total_loans = len(repaid_loans) + len(defaulted_loans)
    if total_loans == 0:
        repayment_score = 12  # neutral
    elif total_loans > 0 and len(defaulted_loans) == 0:
        repayment_score = 25
    elif len(repaid_loans) > len(defaulted_loans):
        repayment_score = 15
    else:
        repayment_score = 5
    score += repayment_score
    breakdown["repaymentHistory"] = repayment_score

    # Factor 4: Membership Tenure (15 points)
    joined_at = membership.get("createdAt", datetime.now(timezone.utc))
    if joined_at.tzinfo is None:
        joined_at = joined_at.replace(tzinfo=timezone.utc)
    months_member = (datetime.now(timezone.utc) - joined_at).days // 30
    if months_member >= 12:
        tenure_score = 15
    elif months_member >= 6:
        tenure_score = 10
    elif months_member >= 3:
        tenure_score = 6
    else:
        tenure_score = 2
    score += tenure_score
    breakdown["membershipTenure"] = tenure_score

    # Factor 5: Streak bonus (15 points)
    streak = membership.get("contributionStreak", 0)
    if streak >= 12:
        streak_score = 15
    elif streak >= 6:
        streak_score = 10
    elif streak >= 3:
        streak_score = 6
    else:
        streak_score = 0
    score += streak_score
    breakdown["contributionStreak"] = streak_score

    # Cap score
    score = min(score, 100)

    # Risk label
    if score >= 80:
        risk_label = "low"
    elif score >= 60:
        risk_label = "medium"
    elif score >= 40:
        risk_label = "high"
    else:
        risk_label = "very_high"

    # Generate tips
    tips = []
    if consistency < 18:
        tips.append(f"Increase your contribution frequency. You have made {contribution_count} contributions so far.")
    if amount_score < 15:
        tips.append(f"Your total contributions are KES {total_contributed}. Contribute more consistently to increase your loan limit.")
    if streak < 6:
        tips.append(f"Your contribution streak is {streak} months. A streak of 6+ months adds significant points to your score.")
    if repayment_score < 20 and total_loans > 0:
        tips.append("You have loan defaults on record. Repaying loans on time significantly improves your score.")
    if not tips:
        tips.append("Great score! Keep contributing consistently to maintain your loan eligibility.")

    return {
        "score": score,
        "riskLabel": risk_label,
        "breakdown": breakdown,
        "tips": tips,
        "totalContributed": total_contributed,
        "contributionCount": contribution_count
    }


def calculate_group_health(chama_id: str) -> dict:
    db = get_db()
    try:
        chama_oid = ObjectId(chama_id)
    except Exception:
        return {"score": 0, "label": "poor"}

    members = list(db.memberships.find({"chamaId": chama_oid, "status": "active"}))
    total_members = len(members)
    if total_members == 0:
        return {"score": 0, "label": "poor"}

    loans = list(db.loans.find({"chamaId": chama_oid}))
    defaulted = len([l for l in loans if l["status"] == "defaulted"])
    active_loans = len([l for l in loans if l["status"] == "disbursed"])
    chama = db.chamas.find_one({"_id": chama_oid})
    total_balance = chama.get("totalBalance", 0) if chama else 0

    score = 70
    if defaulted == 0:
        score += 15
    else:
        score -= defaulted * 10
    if total_balance > 0:
        score += 10
    if active_loans > total_members * 0.5:
        score -= 10

    score = max(0, min(100, score))

    if score >= 80:
        label = "excellent"
    elif score >= 60:
        label = "good"
    elif score >= 40:
        label = "fair"
    else:
        label = "poor"

    return {
        "score": score,
        "label": label,
        "totalMembers": total_members,
        "activeLoans": active_loans,
        "defaultedLoans": defaulted,
        "totalBalance": total_balance
    }
