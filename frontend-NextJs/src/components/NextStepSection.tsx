// components/NextStepSection.tsx

import React from 'react';

interface NextStepSectionProps {
  title: string;
  description: string;
}

const NextStepSection: React.FC<NextStepSectionProps> = ({ title, description }) => (
  <div className="mb-8 flex flex-col items-center text-center">
    <h3 className="font-bold text-lg text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default NextStepSection;
