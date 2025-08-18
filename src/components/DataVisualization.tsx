import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

// 버블 차트 (조회수 기반)
export const BubbleChart: React.FC<{ data: any[] }> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    const simulation = d3.forceSimulation(data)
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .force('charge', d3.forceManyBody().strength(-50))
      .force('collide', d3.forceCollide((d: any) => Math.sqrt(d.views / 1000000) * 5 + 2));
    
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(data, (d: any) => d.views) || 1])
      .interpolator(d3.interpolateRgb('#9333EA', '#EC4899'));
    
    const bubbles = svg.selectAll('.bubble')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bubble');
    
    bubbles.append('circle')
      .attr('r', (d: any) => Math.sqrt(d.views / 1000000) * 5)
      .attr('fill', (d: any) => colorScale(d.views))
      .attr('fill-opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
    
    bubbles.append('text')
      .text((d: any) => d.artist)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold');
    
    simulation.on('tick', () => {
      bubbles.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
    
    return () => {
      simulation.stop();
    };
  }, [data]);
  
  return (
    <div className="w-full h-[600px] glass-card rounded-xl p-4">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

// 히트맵 (시간대별 순위)
export const HeatMap: React.FC<{ data: any[] }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    const cellWidth = width / 24;
    const cellHeight = height / 7;
    
    const colorScale = d3.scaleSequential()
      .domain([100, 1])
      .interpolator(d3.interpolateRgb('#1A1A2E', '#EC4899'));
    
    data.forEach((item) => {
      const x = item.hour * cellWidth;
      const y = item.day * cellHeight;
      
      ctx.fillStyle = colorScale(item.rank);
      ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);
      
      ctx.fillStyle = '#fff';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.rank.toString(), x + cellWidth / 2, y + cellHeight / 2);
    });
  }, [data]);
  
  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-lg font-bold mb-4 neon-text">시간대별 순위 히트맵</h3>
      <canvas
        ref={canvasRef}
        width={768}
        height={210}
        className="w-full rounded-lg"
      />
    </div>
  );
};

// 트렌딩 불꽃 효과
export const TrendingFlame: React.FC<{ intensity: number }> = ({ intensity }) => {
  const flames = Array.from({ length: Math.floor(intensity / 20) }, (_, i) => i);
  
  return (
    <div className="relative h-24 w-24">
      {flames.map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 left-1/2 w-8 h-12 rounded-full"
          style={{
            background: `radial-gradient(circle, ${
              intensity > 80 ? '#FF0080' : intensity > 50 ? '#FF6B00' : '#FFA500'
            } 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
          animate={{
            y: [-10, -30, -10],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.5, 0.8],
            opacity: [0.8, 1, 0.6],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
        {intensity}°
      </div>
    </div>
  );
};

// 순위 변동 스파크라인
export const SparkLine: React.FC<{ data: number[] }> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    
    const svg = d3.select(svgRef.current);
    const width = 120;
    const height = 40;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([d3.max(data) || 100, d3.min(data) || 1])
      .range([5, height - 5]);
    
    const line = d3.line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveCardinal);
    
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'spark-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#9333EA');
    
    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#EC4899');
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3B82F6');
    
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#spark-gradient)')
      .attr('stroke-width', 2)
      .attr('d', line);
    
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (_, i) => xScale(i))
      .attr('cy', (d) => yScale(d))
      .attr('r', 2)
      .attr('fill', '#fff');
  }, [data]);
  
  return <svg ref={svgRef} className="w-30 h-10" />;
};

// 실시간 카운터
export const LiveCounter: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      setDisplayValue(Math.floor(current));
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  return (
    <motion.div
      className="glass-card rounded-xl p-6 text-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <motion.div
        className="text-4xl font-bold neon-text mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {formatNumber(displayValue)}
      </motion.div>
      <div className="text-sm opacity-70">{label}</div>
    </motion.div>
  );
};

export default {
  BubbleChart,
  HeatMap,
  TrendingFlame,
  SparkLine,
  LiveCounter,
};