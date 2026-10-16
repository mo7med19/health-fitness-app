// src/App.tsx
import React from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Calculator from './components/Calculator';
import Plans from './components/Plans';
import Progress from './components/Progress';
import Diary from './components/Diary';
import FoodDatabase from './components/FoodDatabase';
import Exercises from './components/Exercises';
import Footer from './components/Footer';
import { useLocalStorageState } from './hooks/useLocalStorageState';

export type TabType = 'home' | 'calculator' | 'plans' | 'progress' | 'diary' | 'food-db' | 'exercises';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useLocalStorageState<TabType>('activeTab_v1', 'home');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans" dir="rtl">
      <div>
        <Navbar currentPage={activeTab} onNavigate={(page: TabType) => setActiveTab(page)} />
        <main>
          {activeTab === 'home' && <Home onNavigate={(page: TabType) => setActiveTab(page)} />}
          
          {/* هنا تم إضافة تمرير دالة onNavigate لصفحة الحاسبة */}
          {activeTab === 'calculator' && (
            <Calculator onNavigate={(page: TabType) => setActiveTab(page)} />
          )}

          {activeTab === 'plans' && <Plans />}
          {activeTab === 'progress' && <Progress />}
          {activeTab === 'diary' && <Diary />}
          {activeTab === 'food-db' && <FoodDatabase />}
          {activeTab === 'exercises' && <Exercises />}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default App;