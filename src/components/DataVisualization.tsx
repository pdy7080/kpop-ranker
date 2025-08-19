import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

// 개선된 버블 차트 (조회수 기반)
export const BubbleChart: React.FC<{ data: any[] }> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // 기존 요소 제거
    
    const width = 800;
    const height = 600;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // 데이터 정렬 및 제한 (상위 20개만)
    const sortedData = [...data]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 20)
      .map(d => ({
        ...d,
        radius: Math.max(30, Math.min(80, Math.sqrt((d.views || 1000000) / 500000) * 15))
      }));
    
    const simulation = d3.forceSimulation(sortedData)
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('collide', d3.forceCollide((d: any) => d.radius + 5));
    
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(sortedData, (d: any) => d.views) || 1])
      .interpolator(d3.interpolateRgb('#9333EA', '#EC4899'));
    
    const g = svg.append('g');
    
    const bubbleGroups = g.selectAll('.bubble')
      .data(sortedData)
      .enter()
      .append('g')
      .attr('class', 'bubble cursor-pointer')
      .on('click', (event, d: any) => {
        router.push(`/track/${encodeURIComponent(d.artist)}/${encodeURIComponent(d.title)}`);
      })
      .on('mouseenter', (event, d: any) => {
        setHoveredBubble(d.id);
      })
      .on('mouseleave', () => {
        setHoveredBubble(null);
      });
    
    // 원 그리기
    bubbleGroups.append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d: any) => colorScale(d.views))
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.5))');
    
    // 아티스트 이름 (큰 글씨)
    bubbleGroups.append('text')
      .text((d: any) => d.artist)
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('fill', '#fff')
      .attr('font-size', (d: any) => Math.max(12, d.radius / 5))
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');
    
    // 트랙 제목 (작은 글씨)
    bubbleGroups.append('text')
      .text((d: any) => {
        const maxLength = Math.floor(d.radius / 4);
        return d.title.length > maxLength ? d.title.substring(0, maxLength) + '...' : d.title;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('fill', '#fff')
      .attr('font-size', (d: any) => Math.max(10, d.radius / 6))
      .attr('opacity', 0.8)
      .style('pointer-events', 'none');
    
    // 조회수 표시
    bubbleGroups.append('text')
      .text((d: any) => {
        const views = d.views || 0;
        if (views > 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views > 1000) return `${(views / 1000).toFixed(0)}K`;
        return views.toString();
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '2.5em')
      .attr('fill', '#fbbf24')
      .attr('font-size', (d: any) => Math.max(10, d.radius / 7))
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');
    
    simulation.on('tick', () => {
      bubbleGroups.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
    
    // 호버 효과
    bubbleGroups.selectAll('circle')
      .transition()
      .duration(200)
      .attr('transform', (d: any) => hoveredBubble === d.id ? 'scale(1.1)' : 'scale(1)');
    
    return () => {
      simulation.stop();
    };
  }, [data, hoveredBubble]);
  
  return (
    <div className="w-full h-[600px] glass-card rounded-xl p-4 relative">
      <div className="absolute top-4 right-4 text-xs text-gray-400">
        클릭하여 상세 페이지로 이동
      </div>
      <svg ref={svgRef} className="w-full h-full" />
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
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="glass-card rounded-xl p-4 text-center"
    >
      <motion.div
        className="text-3xl md:text-4xl font-bold neon-text"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {displayValue.toLocaleString()}
      </motion.div>
      <div className="text-sm text-gray-400 mt-2">{label}</div>
    </motion.div>
  );
};

// 순위 변동 스파크라인
export const SparkLine: React.FC<{ data: number[] }> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 120;
    const height = 40;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([5, width - 5]);
    
    const yScale = d3.scaleLinear()
      .domain([d3.max(data) || 100, d3.min(data) || 1])
      .range([5, height - 5]);
    
    const line = d3.line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveCardinal);
    
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', `spark-gradient-${Math.random()}`)
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
      .attr('stroke', `url(#${gradient.attr('id')})`)
      .attr('stroke-width', 2)
      .attr('d', line);
    
    // 점 추가
    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (_, i) => xScale(i))
      .attr('cy', (d) => yScale(d))
      .attr('r', 2)
      .attr('fill', '#fff');
  }, [data]);
  
  return <svg ref={svgRef} className="w-full h-10" />;
};

export default {
  BubbleChart,
  TrendingFlame,
  LiveCounter,
  SparkLine,
};
