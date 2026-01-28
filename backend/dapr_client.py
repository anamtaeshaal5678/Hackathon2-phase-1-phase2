import httpx
import os
import json
import logging
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_URL = f"http://localhost:{DAPR_HTTP_PORT}/v1.0"

class DaprClient:
    """
    Abstractions for Dapr HTTP API (Spec C3: No vendor-specific SDK)
    """
    
    @staticmethod
    async def publish_event(pubsub_name: str, topic: str, data: Any):
        """Publish an event via Dapr Pub/Sub"""
        url = f"{DAPR_URL}/publish/{pubsub_name}/{topic}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=data)
                if response.status_code == 204:
                    logger.info(f"Published event to {topic} via {pubsub_name}")
                else:
                    logger.error(f"Failed to publish event (Status {response.status_code}): {response.text}")
        except Exception as e:
            logger.error(f"Error publishing event: {str(e)}")

    @staticmethod
    async def save_state(store_name: str, key: str, value: Any):
        """Save state to Dapr State Store"""
        url = f"{DAPR_URL}/state/{store_name}"
        data = [{"key": key, "value": value}]
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=data)
                if response.status_code == 204:
                    logger.info(f"Saved state for key {key} in {store_name}")
                else:
                    logger.error(f"Failed to save state (Status {response.status_code})")
        except Exception as e:
            logger.error(f"Error saving state: {str(e)}")

    @staticmethod
    async def invoke_service(app_id: str, method: str, data: Optional[Dict] = None):
        """Invoke another service via Dapr Service Invocation"""
        url = f"{DAPR_URL}/invoke/{app_id}/method/{method}"
        try:
            async with httpx.AsyncClient() as client:
                if data:
                    response = await client.post(url, json=data)
                else:
                    response = await client.get(url)
                return response.json()
        except Exception as e:
            logger.error(f"Error invoking service {app_id}: {str(e)}")
            return None

# Singleton instance
dapr = DaprClient()
