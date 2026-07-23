/**
 * Browser geolocation helper used for employee check-in/out and admin office pin.
 */

export const LOCATION_REQUIRED_MESSAGE =
    'Please enable location. Attendance will not be marked until location access is allowed.';

export function getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error(
                'Location is not supported in this browser. Please use a supported browser and enable location.',
            ));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
            },
            (err) => {
                const map = {
                    1: LOCATION_REQUIRED_MESSAGE,
                    2: 'Location unavailable. Move to an open area, enable location, and try again. Attendance will not be marked until location is available.',
                    3: 'Location request timed out. Please enable location / try again. Attendance will not be marked until location is captured.',
                };
                reject(new Error(map[err.code] || LOCATION_REQUIRED_MESSAGE));
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
                ...options,
            },
        );
    });
}

/** Optional pre-check via Permissions API (not supported in all browsers). */
export async function ensureLocationPermission() {
    if (!navigator.geolocation) {
        throw new Error(
            'Location is not supported in this browser. Please use a supported browser and enable location.',
        );
    }
    if (!navigator.permissions?.query) return true;
    try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'denied') {
            throw new Error(LOCATION_REQUIRED_MESSAGE);
        }
    } catch (err) {
        // Some browsers reject the Permissions query for geolocation — ignore and let getCurrentPosition handle it.
        if (err?.message === LOCATION_REQUIRED_MESSAGE) throw err;
    }
    return true;
}

export async function reverseGeocodeLabel(latitude, longitude) {
    try {
        const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}` +
            `&lon=${encodeURIComponent(longitude)}`;
        const res = await fetch(url, {
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) return '';
        const data = await res.json();
        return data.display_name || '';
    } catch {
        return '';
    }
}

export function mapsLink(lat, lng) {
    if (lat == null || lng == null) return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function formatDistance(meters) {
    if (meters == null) return '—';
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(2)} km`;
}

export function officeLabel(inOffice, workFromHome = false) {
    if (inOffice === true) return 'In office';
    if (inOffice === false) return workFromHome ? 'Work from home' : 'Not in office';
    return 'Office not set';
}
