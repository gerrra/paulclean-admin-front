import React from 'react';

export const TestPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600">Тестовая страница</h1>
      <p className="text-gray-600 mt-4">Если вы видите эту страницу, значит роутинг работает!</p>
      <div className="mt-6 p-4 bg-green-100 rounded-lg">
        <p className="text-green-800">✅ React + TypeScript + Tailwind CSS работают корректно</p>
      </div>
    </div>
  );
};
