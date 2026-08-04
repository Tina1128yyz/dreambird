// components/LanguageToggle.js
'use client';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';

export default function LanguageToggle() {
  const { toggleLanguage, t } = useLanguage();

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleLanguage}
      className="font-medium bg-white/80 backdrop-blur-sm shadow-sm"
    >
      🌐 {t('switchLang')}
    </Button>
  );
}