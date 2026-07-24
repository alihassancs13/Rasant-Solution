"""DRF exception handler — always JSON so CORS middleware can attach headers."""
from __future__ import annotations

from rest_framework.response import Response
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        return response

    return Response(
        {
            "success": False,
            "error": str(exc) or exc.__class__.__name__,
            "detail": "An unexpected server error occurred.",
        },
        status=500,
    )
