"""Ensure CORS headers on every response, including error/HTML fallbacks."""
from __future__ import annotations

from django.http import HttpResponse


ALLOWED_HEADERS = (
    "accept, accept-encoding, authorization, content-type, dnt, origin, "
    "user-agent, x-csrftoken, x-requested-with"
)
ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS"


def _origin_allowed(origin: str) -> bool:
    if not origin:
        return False
    origin = origin.strip()
    explicit = {
        "https://rasantsol.com",
        "https://www.rasantsol.com",
        "https://app.rasantsol.com",
        "http://rasantsol.com",
        "http://www.rasantsol.com",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    }
    if origin in explicit:
        return True
    try:
        from urllib.parse import urlparse

        host = (urlparse(origin).hostname or "").lower()
    except Exception:
        return False
    if host == "rasantsol.com" or host.endswith(".rasantsol.com"):
        return True
    if host in ("localhost", "127.0.0.1"):
        return True
    return False


def _apply_cors(response, origin: str):
    if not origin or not _origin_allowed(origin):
        return response
    response["Access-Control-Allow-Origin"] = origin
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Allow-Headers"] = ALLOWED_HEADERS
    response["Access-Control-Allow-Methods"] = ALLOWED_METHODS
    response["Access-Control-Expose-Headers"] = "content-disposition, content-type"
    response["Vary"] = "Origin"
    return response


class EnsureCorsMiddleware:
    """
    Safety net so production error responses still include
    Access-Control-Allow-Origin for the SPA (https://rasantsol.com).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.META.get("HTTP_ORIGIN", "")

        if request.method == "OPTIONS" and _origin_allowed(origin):
            response = HttpResponse(status=204)
            response["Access-Control-Max-Age"] = "86400"
            return _apply_cors(response, origin)

        response = self.get_response(request)
        return _apply_cors(response, origin)

    def process_exception(self, request, exception):
        origin = request.META.get("HTTP_ORIGIN", "")
        response = HttpResponse(
            '{"success":false,"detail":"Internal server error."}',
            status=500,
            content_type="application/json",
        )
        return _apply_cors(response, origin)
