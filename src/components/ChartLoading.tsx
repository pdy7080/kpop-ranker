import React from 'react';
import { motion } from 'framer-motion';

interface ChartLoadingProps {
  chartName: string;
  color: string;
}

const ChartLoading: React.FC<ChartLoadingProps> = ({ chartName, color }) => {
  return (
    <div className="text-center py-8">
      <motion.div
        className="inline-block"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className={`w-10 h-10 border-3 border-t-transparent rounded-full ${color} border-opacity-30`}>
          <div className={`w-full h-full border-3 border-t-current rounded-full ${color}`}></div>
        </div>
      </motion.div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
        {chartName} 데이터 로딩 중...
      </p>
    </div>
  );
};

export default ChartLoading;
