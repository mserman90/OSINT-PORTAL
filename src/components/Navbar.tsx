import { Search, MapPin, Lightbulb, Clock, Mail, Image as ImageIcon, Database, Server, Terminal, Sun, Moon, Binoculars, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: 'osm', label: 'OSM Search', icon: Search },
  { id: 'geospy', label: 'GeoSpy AI', icon: MapPin },
  { id: 'geohints', label: 'GeoHints', icon: Lightbulb },
  { id: 'chrono', label: 'Chronolocation', icon: Clock },
  { id: 'ghunt', label: 'GHunt', icon: Mail },
  { id: 'stitcher', label: 'You Stitch It!', icon: ImageIcon },
  { id: 'bellingcat', label: 'Bellingcat Tools', icon: Database },
  { id: 'apis', label: 'OSINT APIs', icon: Server },
  { id: 'operators', label: 'Search Operators', icon: Terminal },
  { id: 'cse', label: 'OSINT Search', icon: Binoculars },
  { id: 'cap', label: 'Emergency Alerts', icon: AlertTriangle },
];

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <nav className="bg-gray-100 dark:bg-[#11111b] border-b border-gray-200 dark:border-[#313244] h-14 flex items-center px-6 sticky top-0 z-50">
      <div className="text-blue-600 dark:text-[#89b4fa] font-bold text-lg mr-8 tracking-wider hidden md:block shrink-0">
        OSINT PORTAL
      </div>
      <div className="flex gap-1 h-full overflow-x-auto no-scrollbar flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 h-full text-sm font-semibold transition-all relative whitespace-nowrap ${
                isActive ? 'text-blue-600 dark:text-[#89b4fa]' : 'text-gray-600 dark:text-[#a6adc8] hover:text-gray-900 dark:hover:text-[#cdd6f4]'
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-[#89b4fa]"
                />
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={toggleTheme}
        className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#313244] text-gray-600 dark:text-[#a6adc8] transition-colors shrink-0"
        title="Toggle Theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </nav>
  );
}
