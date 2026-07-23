"""Geolocation helpers for office check-in / check-out."""
from __future__ import annotations

import math
from decimal import Decimal
from typing import Optional, Tuple


def haversine_meters(lat1, lon1, lat2, lon2) -> float:
    """Great-circle distance between two WGS84 points in meters."""
    r = 6371000.0
    phi1, phi2 = math.radians(float(lat1)), math.radians(float(lat2))
    d_phi = math.radians(float(lat2) - float(lat1))
    d_lambda = math.radians(float(lon2) - float(lon1))
    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return 2 * r * math.asin(math.sqrt(a))


def evaluate_office_presence(
    latitude,
    longitude,
    office_latitude,
    office_longitude,
    radius_meters: int,
) -> Tuple[Optional[bool], Optional[int]]:
    """
    Returns (in_office, distance_meters).
    in_office is None when office pin is not configured.
    """
    if office_latitude is None or office_longitude is None:
        return None, None
    if latitude is None or longitude is None:
        return None, None

    distance = haversine_meters(latitude, longitude, office_latitude, office_longitude)
    distance_int = int(round(distance))
    return distance_int <= int(radius_meters or 0), distance_int


def coerce_coordinate(value) -> Optional[Decimal]:
    if value is None or value == "":
        return None
    try:
        return Decimal(str(value))
    except Exception:
        return None


def location_presence_label(in_office, work_from_home: bool = False) -> str:
    """Human label for GPS vs office pin, considering WFH flag."""
    if in_office is True:
        return "In office"
    if in_office is False:
        return "Work from home" if work_from_home else "Not in office"
    return "Office not set"
