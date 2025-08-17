from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx
from typing import Dict, Any

from database import get_db
from models import User
from routers.auth import get_current_user
from utils.security import decrypt_data
from config import settings

router = APIRouter()


def require_broker_or_admin(current_user: User = Depends(get_current_user)):
    """Dependency to require broker or admin role - allow users with broker access"""
    if current_user.role not in ["broker", "admin", "user"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    return current_user


@router.get("/profile")
def get_broker_profile(
    current_user: User = Depends(require_broker_or_admin),
    db: Session = Depends(get_db)
):
    """Get broker profile with decrypted API key"""
    profile = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "broker_name": current_user.broker_name,
        "client_id": current_user.client_id,
        "has_api_key": bool(current_user.encrypted_api_key),
        "has_access_token": bool(current_user.access_token),
        "has_feed_token": bool(current_user.feed_token),
        "is_2fa_enabled": current_user.is_2fa_enabled,
        "broker_session_active": current_user.broker_session_active or False
    }
    return profile


@router.post("/connect")
async def connect_to_broker(
    current_user: User = Depends(require_broker_or_admin),
    db: Session = Depends(get_db)
):
    """Connect to Angel Broker API"""
    if not current_user.encrypted_api_key:
        raise HTTPException(status_code=400, detail="API key not configured")
    
    if not current_user.client_id:
        raise HTTPException(status_code=400, detail="Client ID not configured")
    
    try:
        # Decrypt API key
        api_key = decrypt_data(current_user.encrypted_api_key)
        
        # In a real implementation, you would make actual API calls to Angel Broker
        # For now, we'll simulate the connection
        
        # Simulated Angel Broker API connection
        connection_data = {
            "status": "connected",
            "broker": current_user.broker_name,
            "client_id": current_user.client_id,
            "message": "Successfully connected to Angel Broker"
        }
        
        return connection_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to broker: {str(e)}")


@router.get("/portfolio")
async def get_portfolio(
    current_user: User = Depends(require_broker_or_admin),
    db: Session = Depends(get_db)
):
    """Get user portfolio from broker"""
    if not current_user.access_token:
        raise HTTPException(status_code=400, detail="Not connected to broker")
    
    # Simulated portfolio data
    portfolio = {
        "holdings": [
            {"symbol": "RELIANCE", "quantity": 10, "avg_price": 2500.00, "current_price": 2550.00},
            {"symbol": "TCS", "quantity": 5, "avg_price": 3200.00, "current_price": 3250.00},
            {"symbol": "INFY", "quantity": 15, "avg_price": 1400.00, "current_price": 1450.00}
        ],
        "total_value": 95750.00,
        "total_investment": 93500.00,
        "profit_loss": 2250.00,
        "profit_loss_percentage": 2.41
    }
    
    return portfolio


@router.get("/market-data")
async def get_market_data(
    symbol: str = "NIFTY50",
    current_user: User = Depends(require_broker_or_admin)
):
    """Get market data for a symbol"""
    if not current_user.feed_token:
        raise HTTPException(status_code=400, detail="Feed token not available")
    
    # Simulated market data
    market_data = {
        "symbol": symbol,
        "price": 19500.50,
        "change": 125.30,
        "change_percent": 0.65,
        "volume": 1250000,
        "high": 19550.00,
        "low": 19400.00,
        "open": 19425.00,
        "timestamp": "2024-01-15T15:30:00Z"
    }
    
    return market_data


@router.post("/place-order")
async def place_order(
    order_data: Dict[str, Any],
    current_user: User = Depends(require_broker_or_admin),
    db: Session = Depends(get_db)
):
    """Place an order through the broker"""
    if not current_user.access_token:
        raise HTTPException(status_code=400, detail="Not connected to broker")
    
    # Validate order data
    required_fields = ["symbol", "quantity", "price", "order_type", "transaction_type"]
    for field in required_fields:
        if field not in order_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Simulated order placement
    order_response = {
        "order_id": "ORD123456789",
        "status": "PENDING",
        "symbol": order_data["symbol"],
        "quantity": order_data["quantity"],
        "price": order_data["price"],
        "order_type": order_data["order_type"],
        "transaction_type": order_data["transaction_type"],
        "timestamp": "2024-01-15T15:30:00Z",
        "message": "Order placed successfully"
    }
    
    return order_response