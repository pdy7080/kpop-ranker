import React from 'react';
import { GetServerSideProps } from 'next';
import RealDuplicateManager from '../../components/RealDuplicateManager';

const RealDuplicatePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <RealDuplicateManager />
      </div>
    </div>
  );
};

export default RealDuplicatePage;