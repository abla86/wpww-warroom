from __future__ import annotations

import hashlib
import hmac
import os
import time
from typing import Any

OPERATOR_ID = os.getenv("WPWW_OPERATOR_ID", "WPWW-LOCAL")
SIGNING_SECRET = os.getenv("WPWW_SIGNING_SECRET", "")
SLOT_SECONDS = max(30, int(os.getenv("WPWW_SIGNATURE_SLOT_SECONDS", "60")))
MAX_DRIFT_SLOTS = max(0, int(os.getenv("WPWW_SIGNATURE_MAX_DRIFT_SLOTS", "1")))


def _secret() -> bytes:
    if not SIGNING_SECRET:
        raise RuntimeError("WPWW_SIGNING_SECRET is not configured")
    return SIGNING_SECRET.encode("utf-8")


def canonical_payload(payload: str) -> str:
    return payload


def signature_message(payload: str, slot: int, operator: str) -> bytes:
    return f"{operator}:{canonical_payload(payload)}:{slot}".encode("utf-8")


def generate_signature(payload: str, now: float | None = None) -> dict[str, Any]:
    current = time.time() if now is None else now
    slot = int(current // SLOT_SECONDS)
    message = signature_message(payload, slot, OPERATOR_ID)
    digest = hmac.new(_secret(), message, hashlib.sha512).hexdigest()
    return {
        "operator": OPERATOR_ID,
        "slot": slot,
        "algorithm": "HMAC-SHA512",
        "signature": digest,
        "payload": payload,
    }


def verify_signature(packet: dict[str, Any], now: float | None = None) -> bool:
    try:
        if packet.get("operator") != OPERATOR_ID:
            return False
        slot = int(packet.get("slot"))
        signature = str(packet.get("signature", ""))
        payload = str(packet.get("payload", ""))
        current_slot = int((time.time() if now is None else now) // SLOT_SECONDS)
        if abs(current_slot - slot) > MAX_DRIFT_SLOTS:
            return False
        expected = hmac.new(
            _secret(),
            signature_message(payload, slot, OPERATOR_ID),
            hashlib.sha512,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)
    except (RuntimeError, TypeError, ValueError):
        return False


if __name__ == "__main__":
    packet = generate_signature("WPWW self-test")
    print(packet)
    print("VALID" if verify_signature(packet) else "INVALID")
