// src/components/Home.tsx
import React from 'react';
import { HeroSection } from './home/HeroSection';
import { QuickNavCards } from './home/QuickNavCards';
import { HomeWidgets } from './home/HomeWidgets';
import { NutritionLookup } from './home/NutritionLookup';
import { SmartSnacks } from './home/SmartSnacks';
import { MistakesSection } from './home/MistakesSection';
import { MealOfDay } from './home/MealOfDay';
import { FoodSwaps } from './home/FoodSwaps';
import { SuccessStories } from './home/SuccessStories';
import { FaqSection } from './home/FaqSection';

interface HomeProps {
  onNavigate: (page: 'home' | 'calculator' | 'plans') => void;
}

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col font-sans" dir="rtl">
      <HeroSection onNavigate={onNavigate} onScrollTo={scrollToId} />
      <QuickNavCards onScrollTo={scrollToId} />
      <HomeWidgets />
      <NutritionLookup />
      <SmartSnacks />
      <MistakesSection />
      <MealOfDay />
      <FoodSwaps />
      <SuccessStories />
      <FaqSection />
    </div>
  );
};

export default Home;