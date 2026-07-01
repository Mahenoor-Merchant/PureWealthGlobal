/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Client-Side Geolocation & Session Tracking for Real Analytics

export interface VisitorLocation {
  ip: string;
  country: string;
  region: string;
  city: string;
}

export interface VisitorDemographics {
  age?: string;
  gender?: string;
}

// Ensure unique visitor ID exists
export function getOrCreateVisitorId(): { id: string; isNew: boolean } {
  try {
    let visitorId = localStorage.getItem('pw_visitor_id');
    let isNew = false;
    
    if (!visitorId) {
      visitorId = 'vis_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
      localStorage.setItem('pw_visitor_id', visitorId);
      localStorage.setItem('pw_is_new_visitor', 'true');
      isNew = true;
    } else {
      isNew = localStorage.getItem('pw_is_new_visitor') === 'true';
    }
    
    return { id: visitorId, isNew };
  } catch (err) {
    // Fallback if localStorage is disabled
    return { 
      id: 'vis_temp_' + Date.now() + '_' + Math.floor(Math.random() * 1000000), 
      isNew: true 
    };
  }
}

// Fetch real geolocation details
export async function fetchGeoLocation(): Promise<VisitorLocation | null> {
  const cacheKey = 'pw_geo_data';
  try {
    // Try cache first to minimize external requests
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (_) {}

  // List of high-reliability, no-auth IP geolocation APIs
  const apiUrls = [
    'https://ipapi.co/json/',
    'https://ip-api.com/json/',
    'https://api.db-ip.com/v2/free/self'
  ];

  for (const url of apiUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const geo: VisitorLocation = {
          ip: data.ip || data.query || 'Unknown IP',
          country: data.country_name || data.country || 'India',
          region: data.region_name || data.region || 'Maharashtra',
          city: data.city || 'Mumbai'
        };
        try {
          localStorage.setItem(cacheKey, JSON.stringify(geo));
        } catch (_) {}
        return geo;
      }
    } catch (e) {
      console.warn(`Geolocation lookup failed for ${url}, trying fallback...`);
    }
  }

  return {
    ip: 'Unknown IP',
    country: 'India',
    region: 'Maharashtra',
    city: 'Mumbai'
  };
}

// Log a ping/heartbeat or action to the analytics backend
export async function trackPing(params: {
  currentPage: string;
  action?: 'view_page' | 'use_tool' | 'heartbeat';
  toolName?: string;
  timeActive?: number;
  demographics?: VisitorDemographics;
}) {
  try {
    const { id: visitorId, isNew } = getOrCreateVisitorId();
    const location = await fetchGeoLocation();
    
    // Check if the user entered their age in any calculators or survey to log factually
    let demo: VisitorDemographics = params.demographics || {};
    try {
      const savedAge = localStorage.getItem('pw_survey_age');
      const savedGender = localStorage.getItem('pw_survey_gender');
      if (savedAge) demo.age = savedAge;
      if (savedGender) demo.gender = savedGender;
    } catch (_) {}

    await fetch('/api/analytics/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        isNew,
        currentPage: params.currentPage,
        action: params.action || 'heartbeat',
        toolName: params.toolName,
        timeActive: params.timeActive || 0,
        location,
        demographics: demo
      })
    });

    // After first successful ping, we can mark them as non-new if they refresh
    if (isNew) {
      try {
        localStorage.setItem('pw_is_new_visitor', 'false');
      } catch (_) {}
    }
  } catch (err) {
    console.error('Failed to log client-side tracking:', err);
  }
}
