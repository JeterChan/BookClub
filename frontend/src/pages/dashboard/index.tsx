import { useState } from 'react';
import DashboardBasic from './DashboardBasic';
import DashboardComment from './DashboardComment';
import Header from '../../components/Header';

type DashboardTab = 'basic' | 'comment';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('basic');

  const tabs = [
    { id: 'basic' as const, label: '總覽' },
    { id: 'comment' as const, label: '留言' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 mt-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-brand-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'basic' && <DashboardBasic />}
        {activeTab === 'comment' && <DashboardComment />}
      </main>
    </div>
  );
}
