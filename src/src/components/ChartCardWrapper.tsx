import React, { useEffect, useState } from 'react';
import ChartCardEnhanced from './ChartCardEnhanced';

interface ChartResult {
  rank: number | null;
  album_image: string | null;
  published_at: string;
}

interface ChartCardWrapperProps {
  name: string;
  data: ChartResult;
  index: number;
  artistName?: string;
  trackName?: string;
}

const ChartCardWrapper: React.FC<ChartCardWrapperProps> = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasTimeout, setHasTimeout] = useState(false);

  useEffect(() => {
    // 3초 타임아웃 설정
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasTimeout(true);
      }
    }, 3000);

    // 데이터가 있으면 로딩 완료
    if (props.data) {
      setIsLoading(false);
    }

    return () => clearTimeout(timeout);
  }, [props.data, isLoading]);

  // 타임아웃된 경우 특별한 처리
  if (hasTimeout && props.data.rank === null) {
    return (
      <ChartCardEnhanced
        {...props}
        data={{
          ...props.data,
          rank: null,
          album_image: null,
          published_at: props.data.published_at
        }}
        isLoading={false}
      />
    );
  }

  return <ChartCardEnhanced {...props} isLoading={isLoading} />;
};

export default ChartCardWrapper;
