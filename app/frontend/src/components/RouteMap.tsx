import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GpsPoint {
  lat: number;
  lng: number;
  alt: number | null;
  spd: number;
  hr: number | null;
  cad: number | null;
  time: string;
}

interface RouteMapProps {
  gpsPath: GpsPoint[];
  peakHr: {
    latitude: number | null;
    longitude: number | null;
    heart_rate: number;
  };
  activePointIndex?: number | null;
}

export const RouteMap: React.FC<RouteMapProps> = ({ gpsPath, peakHr, activePointIndex }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const hoverMarkerRef = useRef<L.Marker | null>(null);
  const [colorMetric, setColorMetric] = useState<'solid' | 'hr' | 'spd' | 'alt'>('solid');

  // Colormap Helper Functions
  const getHrColor = (hr: number | null): string => {
    if (!hr) return '#94a3b8'; // gray
    if (hr < 128) return '#06b6d4'; // Z1/Z2 - Cyan
    if (hr < 146) return '#10b981'; // Z3 - Emerald
    if (hr < 165) return '#f59e0b'; // Z4 - Amber
    return '#ef4444'; // Z5 - Red
  };

  const getSpeedColor = (spd: number): string => {
    if (spd < 1.0) return '#71717a'; // Stopped - Zinc
    if (spd < 4.0) return '#06b6d4'; // Slow walk - Cyan
    if (spd < 5.0) return '#10b981'; // Fast walk - Emerald
    return '#6366f1'; // Power walk/trote - Indigo
  };

  const getAltitudeColor = (alt: number | null): string => {
    if (alt === null) return '#94a3b8';
    if (alt < 5) return '#06b6d4'; // Low - Cyan
    if (alt < 12) return '#10b981'; // Mid - Emerald
    return '#f59e0b'; // High - Amber
  };

  useEffect(() => {
    if (!mapContainerRef.current || gpsPath.length === 0) return;

    // Create Map if it doesn't exist
    if (!mapRef.current) {
      const startPoint = gpsPath[0];
      
      const map = L.map(mapContainerRef.current, {
        center: [startPoint.lat, startPoint.lng],
        zoom: 15,
        zoomControl: true,
      });

      // Add TileLayer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    } else {
      // Clear previous layers
      layerGroupRef.current?.clearLayers();
    }

    const map = mapRef.current;
    const layerGroup = layerGroupRef.current!;

    // Custom icons for Start, End, and Peak HR
    const startIcon = L.divIcon({
      className: 'custom-map-pin start',
      html: '<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const endIcon = L.divIcon({
      className: 'custom-map-pin end',
      html: '<div style="background-color: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const peakIcon = L.divIcon({
      className: 'custom-map-pin peak',
      html: '<div style="background-color: #f43f5e; color: white; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: bold; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(244,63,94,0.6);">❤️</div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    // Add Start / End Markers
    const start = gpsPath[0];
    const end = gpsPath[gpsPath.length - 1];

    L.marker([start.lat, start.lng], { icon: startIcon }).addTo(layerGroup).bindPopup('Início da Atividade');
    L.marker([end.lat, end.lng], { icon: endIcon }).addTo(layerGroup).bindPopup('Fim da Atividade');

    // Add Peak HR Marker
    if (peakHr.latitude && peakHr.longitude) {
      L.marker([peakHr.latitude, peakHr.longitude], { icon: peakIcon })
        .addTo(layerGroup)
        .bindPopup(`Pico de Frequência Cardíaca: <b>${peakHr.heart_rate} bpm</b>`);
    }

    // Draw route lines based on selection
    if (colorMetric === 'solid') {
      const latlngs = gpsPath.map(p => [p.lat, p.lng] as [number, number]);
      L.polyline(latlngs, {
        color: '#6366f1',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round'
      }).addTo(layerGroup);
    } else {
      // Draw segmented polyline for gradient effect
      for (let i = 0; i < gpsPath.length - 1; i++) {
        const p1 = gpsPath[i];
        const p2 = gpsPath[i + 1];
        
        let segmentColor = '#6366f1';
        if (colorMetric === 'hr') {
          segmentColor = getHrColor(p1.hr);
        } else if (colorMetric === 'spd') {
          segmentColor = getSpeedColor(p1.spd);
        } else if (colorMetric === 'alt') {
          segmentColor = getAltitudeColor(p1.alt);
        }

        L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
          color: segmentColor,
          weight: 5,
          opacity: 0.9,
          lineJoin: 'round'
        }).addTo(layerGroup);
      }
    }

    // Fit map bounds to show full route
    const bounds = L.latLngBounds(gpsPath.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });

  }, [gpsPath, colorMetric, peakHr]);

  // Handle active point hovering tracker
  useEffect(() => {
    if (!mapRef.current || gpsPath.length === 0) return;

    if (activePointIndex !== undefined && activePointIndex !== null && activePointIndex >= 0 && activePointIndex < gpsPath.length) {
      const pt = gpsPath[activePointIndex];
      const latlng: L.LatLngExpression = [pt.lat, pt.lng];

      const hoverIcon = L.divIcon({
        className: 'custom-map-pin hover-point',
        html: '<div style="background-color: var(--accent-cyan); width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(6,182,212,0.8);"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      // Format tooltip content
      const paceDecimal = pt.spd > 0.1 ? 60 / pt.spd : 0;
      const mins = Math.floor(paceDecimal);
      const secs = Math.round((paceDecimal - mins) * 60);
      const paceStr = paceDecimal > 0 ? `${mins}'${secs < 10 ? '0' : ''}${secs}"` : '-';

      const tooltipContent = `
        <div style="font-size: 0.75rem; line-height: 1.3; font-family: inherit;">
          <strong>Tempo:</strong> ${pt.time}<br/>
          <strong>FC:</strong> ${pt.hr ? `${pt.hr} bpm` : '-'}<br/>
          <strong>Ritmo:</strong> ${paceStr}/km<br/>
          <strong>Alt:</strong> ${pt.alt ? `${Math.round(pt.alt)}m` : '-'}
        </div>
      `;

      if (!hoverMarkerRef.current) {
        hoverMarkerRef.current = L.marker(latlng, { icon: hoverIcon })
          .addTo(mapRef.current)
          .bindTooltip(tooltipContent, { permanent: true, direction: 'top', className: 'map-hover-tooltip' });
      } else {
        hoverMarkerRef.current.setLatLng(latlng);
        hoverMarkerRef.current.setTooltipContent(tooltipContent);
      }
    } else {
      if (hoverMarkerRef.current && mapRef.current) {
        hoverMarkerRef.current.remove();
        hoverMarkerRef.current = null;
      }
    }
  }, [activePointIndex, gpsPath]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="card" style={{ padding: 0, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🗺️ Rota GPS Interativa
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <span>Colorir trajeto por:</span>
          <select 
            value={colorMetric} 
            onChange={(e) => setColorMetric(e.target.value as any)}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="solid">Cor Sólida (Indigo)</option>
            <option value="hr">Frequência Cardíaca</option>
            <option value="spd">Velocidade</option>
            <option value="alt">Altitude (Elevação)</option>
          </select>
        </div>
      </div>
      <div className="map-wrapper">
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};
