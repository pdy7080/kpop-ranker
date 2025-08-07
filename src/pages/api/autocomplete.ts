// 🔧 KPOP Ranker 자동완성 API 프록시 - CORS 문제 해결
// 시니어 개발자 Claude - 프론트엔드 개선 작업

import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리 (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: '검색어가 필요합니다.' });
    }

    // 백엔드 자동완성 API 호출
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/autocomplete/unified?q=${encodeURIComponent(q)}&limit=${limit}`
    );
    
    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    
    // 성공 응답
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Autocomplete API Error:', error);
    res.status(500).json({ 
      error: '자동완성 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
