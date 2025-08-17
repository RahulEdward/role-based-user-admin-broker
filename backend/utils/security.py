from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
import pyotp
import qrcode
from io import BytesIO
import base64
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Initialize encryption - generate a proper Fernet key
cipher_suite = Fernet(Fernet.generate_key())


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None


def encrypt_data(data: str) -> str:
    """Encrypt sensitive data like API keys"""
    return cipher_suite.encrypt(data.encode()).decode()


def decrypt_data(encrypted_data: str) -> str:
    """Decrypt sensitive data"""
    return cipher_suite.decrypt(encrypted_data.encode()).decode()


def generate_totp_secret() -> str:
    """Generate a new TOTP secret"""
    return pyotp.random_base32()


def generate_qr_code(username: str, secret: str) -> str:
    """Generate QR code for TOTP setup"""
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=username,
        issuer_name="Stock Market Auth"
    )
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(totp_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode()


def verify_totp(secret: str, token: str) -> bool:
    """Verify TOTP token"""
    try:
        totp = pyotp.TOTP(secret)
        # Use a larger valid_window to account for time drift
        return totp.verify(token, valid_window=2)
    except Exception as e:
        return False