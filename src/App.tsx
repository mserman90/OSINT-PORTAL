/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Navbar from './components/Navbar';
import OSMSearch from './components/OSMSearch';
import GeoSpy from './components/GeoSpy';
import GeoHints from './components/GeoHints';
import Chronolocation from './components/Chronolocation';
import GHunt from './components/GHunt';
import PanoramaStitcher from './components/PanoramaStitcher';
import BellingcatTools from './components/BellingcatTools';
import OsintApis from './components/OsintApis';
import AdvancedSearchOperators from './components/AdvancedSearchOperators';
import OSINTSearch from './components/OSINTSearch';
import CAPAlerts from './components/CAPAlerts';

export default function App() {
  const [activeTab, setActiveTab] = useState('osm');

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0d0d1a] text-gray-900 dark:text-[#cdd6f4] overflow-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 min-h-0 relative">
        {activeTab === 'osm' && <OSMSearch />}
        {activeTab === 'geospy' && <GeoSpy />}
        {activeTab === 'geohints' && <GeoHints />}
        {activeTab === 'chrono' && <Chronolocation />}
        {activeTab === 'ghunt' && <GHunt />}
        {activeTab === 'stitcher' && <PanoramaStitcher />}
        {activeTab === 'bellingcat' && <BellingcatTools />}
        {activeTab === 'apis' && <OsintApis />}
        {activeTab === 'operators' && <AdvancedSearchOperators />}
        {activeTab === 'cse' && <OSINTSearch />}
        {activeTab === 'cap' && <CAPAlerts />}
      </main>
    </div>
  );
}
