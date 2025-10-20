import os
import certifi
from datetime import datetime, timezone
from typing import List, Optional

import stripe
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

# -------------------------------------------------------------------
# Load environment variables
# -------------------------------------------------------------------
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000") # NEW: Default fallback
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",")           # NEW: Load CORS origins

# -------------------------------------------------------------------
# Pydantic Models for Data Validation (NEW)
# -------------------------------------------------------------------
class LineItem(BaseModel):
    """Defines the structure for an item in the cart."""
    name: str
    price: float
    quantity: int

class CheckoutRequest(BaseModel):
    """Defines the structure for the checkout request body."""
    items: List[LineItem]

# -------------------------------------------------------------------
# App initialization
# -------------------------------------------------------------------
app = FastAPI(
    title="Hairbalife Backend",
    version="1.1",
    description="A robust backend using FastAPI, Stripe, and MongoDB.",
)

# Use configured origins or a default if not set
origins = [origin.strip() for origin in CORS_ORIGINS if origin]
if not origins:
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # CHANGED: Use dynamic origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Database setup
# -------------------------------------------------------------------
# Define db with a type hint for better autocompletion
db: Optional[AsyncIOMotorClient] = None

if MONGO_URL and DB_NAME:
    try:
        mongo_client = AsyncIOMotorClient(
            MONGO_URL,
            tls=True,
            tlsCAFile=certifi.where(),
        )
        db = mongo_client[DB_NAME]
        print("✅ Connected to MongoDB successfully.")
    except Exception as e:
        print(f"⚠️ MongoDB connection failed: {e}")
        db = None
else:
    db = None
    print("⚠️ MongoDB not configured — skipping DB connection.")


@app.on_event("startup")
async def startup_event():
    """Configure Stripe on application startup."""
    if not STRIPE_SECRET_KEY:
        raise RuntimeError("❌ STRIPE_SECRET_KEY not found in environment variables.")
    stripe.api_key = STRIPE_SECRET_KEY
    print("✅ Stripe API key configured.")
    print(f"📡 Frontend URL configured for: {FRONTEND_URL}")
    print(f"🌍 Allowing CORS from: {origins}")

# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------

@app.get("/")
async def root():
    """Root endpoint for health checks."""
    return {"message": "Hairbalife backend running ✅"}


@app.post("/api/create-checkout-session")
async def create_checkout_session(payload: CheckoutRequest): # CHANGED: Uses Pydantic model
    """
    Create a Stripe Checkout Session from a validated list of cart items.
    """
    if not payload.items:
        raise HTTPException(status_code=400, detail="No items provided in cart.")

    try:
        # Build Stripe line items from the validated payload
        line_items = [
            {
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": item.name},
                    "unit_amount": int(round(item.price * 100)),  # Convert to cents
                },
                "quantity": item.quantity,
            }
            for item in payload.items
        ]

        # Create Stripe checkout session with dynamic URLs
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{FRONTEND_URL}/success", # CHANGED
            cancel_url=f"{FRONTEND_URL}/cancel",   # CHANGED
        )

        print(f"✅ Created Stripe Session: {session.id}")
       # server.py -> create_checkout_session function
        return {"url": session.url}

    except stripe.error.StripeError as e:
        print(f"❌ Stripe error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")


@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    """
    Handle incoming Stripe webhook events securely.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret is not configured.")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload, sig_header=sig_header, secret=STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        print(f"⚠️ Invalid webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        print(f"⚠️ Invalid webhook signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # -------------------------------------------------------------------
    # THIS ENTIRE BLOCK WAS MOVED TO BE INSIDE THE FUNCTION
    # -------------------------------------------------------------------
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
                    "currency": item.currency,
                }
                for item in line_items.data
            ]
        except Exception as e:
            print(f"⚠️ Could not retrieve line items: {e}")
            order_items = []

        order = {
            "stripe_session_id": session.get("id"),
            "amount_total": session.get("amount_total"),
            "currency": session.get("currency"),
            "payment_status": session.get("payment_status"),
            "customer_email": session.get("customer_details", {}).get("email"),
            "created_at": datetime.now(timezone.utc),
            "items": order_items,
        }

        if db:
            try:
                result = await db.orders.insert_one(order)
                print(f"✅ Order {result.inserted_id} saved to MongoDB with items.")
            except Exception as db_error:
                print(f"⚠️ Failed to save order to MongoDB: {db_error}")
        else:
            print("⚠️ MongoDB not configured; skipping order save.")
    
    # You can add logic for other events here using elif
    # elif event["type"] == "charge.refunded":
    #     print("Refund processed.")

    else:
        print(f"ℹ️ Unhandled event type: {event['type']}")

    return {"status": "success"} # This should also be inside the function

# -------------------------------------------------------------------
# Local run (optional, for development)
# -------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    # Use 0.0.0.0 to make it accessible on your local network
    uvicorn.run(app, host="0.0.0.0", port=8000)
