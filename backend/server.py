import os
import certifi
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

import stripe
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

# -------------------------------------------------------------------
# Load environment variables & CONFIGURATION
# -------------------------------------------------------------------
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# ✅ FIX: Use .strip() to remove accidental whitespace from environment variables
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").strip()
CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", "")

# -------------------------------------------------------------------
# Pydantic Models for Data Validation
# -------------------------------------------------------------------
class LineItem(BaseModel):
    name: str
    price: float
    quantity: int

class CheckoutRequest(BaseModel):
    items: List[LineItem]

# -------------------------------------------------------------------
# Lifespan and App Initialization
# -------------------------------------------------------------------
db: Optional[AsyncIOMotorClient] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup Logic ---
    global db
    if MONGO_URL and DB_NAME:
        try:
            mongo_client = AsyncIOMotorClient(MONGO_URL, tls=True, tlsCAFile=certifi.where())
            db = mongo_client[DB_NAME]
            print("✅ Connected to MongoDB successfully.")
        except Exception as e:
            print(f"⚠️ MongoDB connection failed: {e}")
            db = None
    else:
        db = None
        print("⚠️ MongoDB not configured — skipping DB connection.")
    
    if not STRIPE_SECRET_KEY:
        raise RuntimeError("❌ STRIPE_SECRET_KEY not found in environment variables.")
    stripe.api_key = STRIPE_SECRET_KEY
    print("✅ Stripe API key configured.")
    print(f"📡 Frontend URL configured for: {FRONTEND_URL}")
    print(f"🌍 Allowing CORS from: {CORS_ORIGINS_RAW}")
    
    yield
    
    # --- Shutdown Logic ---
    print("INFO:     Application shutdown complete.")

app = FastAPI(
    title="Hairbalife Backend",
    lifespan=lifespan # Use the new lifespan manager
)

origins = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",") if origin]
if not origins:
    origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------
@app.get("/")
async def root():
    return {"message": "Hairbalife backend running ✅"}

@app.post("/api/create-checkout-session")
async def create_checkout_session(payload: CheckoutRequest):
    if not payload.items:
        raise HTTPException(status_code=400, detail="No items provided in cart.")

    try:
        line_items = [
            {
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": item.name},
                    "unit_amount": int(round(item.price * 100)),
                },
                "quantity": item.quantity,
            }
            for item in payload.items
        ]

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{FRONTEND_URL}/success",
            cancel_url=f"{FRONTEND_URL}/cancel",
        )

        print(f"✅ Created Stripe Session: {session.id}")
        return {"url": session.url}

    # ✅ FIX: Use the new syntax for Stripe exceptions
    except stripe.StripeError as e:
        print(f"❌ Stripe error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret is not configured.")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload, sig_header=sig_header, secret=STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        print(f"💳 Payment successful for session: {session['id']}")
        
        try:
            line_items = stripe.checkout.Session.list_line_items(session.id, limit=20)
            order_items = [
                {
                    "description": item.description,
                    "quantity": item.quantity,
                    "amount_total": item.amount_total,
                } for item in line_items.data
            ]
        except Exception as e:
            print(f"⚠️ Could not retrieve line items: {e}")
            order_items = []

        order = {
            "stripe_session_id": session.id,
            "amount_total": session.amount_total,
            "customer_email": session.customer_details.email,
            "created_at": datetime.now(timezone.utc),
            "items": order_items,
        }

        if db:
            await db.orders.insert_one(order)
            print("✅ Order saved to MongoDB.")
    else:
        print(f"ℹ️ Unhandled event type: {event['type']}")

    return {"status": "success"}

# -------------------------------------------------------------------
# Local run
# -------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
