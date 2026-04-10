import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { geoPath, geoMercator } from 'd3-geo';
import type { ProvinceData, AppSettings } from '../types';

interface Props {
  provinces: Map<number, ProvinceData>;
  settings: AppSettings;
  onProvinceClick: (id: number, name: string) => void;
}

interface GeoFeature {
  type: string;
  geometry: { type: string; coordinates: number[][][] };
  properties: { name: string; number: number };
}

export default function TurkeyMap({ provinces, settings, onProvinceClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<{ type: string; features: GeoFeature[] } | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; status: string } | null>(null);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'tr-cities.json')
      .then(r => r.json())
      .then(setGeoData);
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = width * 0.55;
    svgRef.current.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const projection = geoMercator()
      .fitSize([width - 20, height - 20], geoData as unknown as d3.GeoPermissibleObjects)
      .translate([width / 2, height / 2]);

    const pathGenerator = geoPath().projection(projection);

    const getColor = (id: number) => {
      const p = provinces.get(id);
      if (!p || p.status === 'none') return settings.colors.none;
      return settings.colors[p.status];
    };

    const getStatusLabel = (id: number) => {
      const p = provinces.get(id);
      if (!p || p.status === 'none') return settings.statusLabels.none;
      return settings.statusLabels[p.status];
    };

    svg.selectAll('path')
      .data(geoData.features)
      .join('path')
      .attr('d', d => pathGenerator(d as unknown as d3.GeoPermissibleObjects) || '')
      .attr('fill', d => getColor(d.properties.number))
      .attr('stroke', '#475569')
      .attr('stroke-width', 0.8)
      .attr('cursor', 'pointer')
      .style('transition', 'fill 0.2s, transform 0.15s')
      .on('click', (_, d) => {
        onProvinceClick(d.properties.number, d.properties.name);
        setTooltip(null);
      })
      .on('touchstart', (event, d) => {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top - 40,
          name: d.properties.name,
          status: getStatusLabel(d.properties.number),
        });
      })
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('fill-opacity', 0.8).attr('stroke-width', 2);
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 40,
          name: d.properties.name,
          status: getStatusLabel(d.properties.number),
        });
      })
      .on('mouseleave', function () {
        d3.select(this).attr('fill-opacity', 1).attr('stroke-width', 0.8);
        setTooltip(null);
      });
  }, [geoData, provinces, settings, onProvinceClick]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        ref={svgRef}
        style={{ width: '100%', height: 'auto', touchAction: 'manipulation' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
            background: 'rgba(15,23,42,0.9)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 13,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          <strong>{tooltip.name}</strong>
          <br />
          <span style={{ fontSize: 11, opacity: 0.8 }}>{tooltip.status}</span>
        </div>
      )}
    </div>
  );
}
