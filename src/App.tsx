/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PortalProvider, usePortal } from './context/PortalContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/overview/OverviewView';
import { IssueSheetView } from './components/issues/IssueSheetView';
import { UpdateSheetView } from './components/updates/UpdateSheetView';
import { StationView } from './components/stations/StationView';
import { ComplainsView } from './components/complains/ComplainsView';
import { QueueView } from './components/queue/QueueView';
import { StoreMatrixView } from './components/stores/StoreMatrixView';
import { DailyHandoverView } from './components/handover/DailyHandoverView';
import { CommandPalette } from './components/modals/CommandPalette';
import { AnnouncementsModal } from './components/modals/AnnouncementsModal';
import { UserProfileModal } from './components/modals/UserProfileModal';

const PortalMain: React.FC = () => {
  const { activeTab, theme } = usePortal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'bg-[#090b0e] text-[#e2e8f0]' : 'bg-[#f8fafc] text-[#0f172a]'} font-sans antialiased transition-colors duration-200`}>
      {/* Sidebar matching ScaleUp UI */}
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onCloseMobile={() => setMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Header with "SAA (Dashboard)" */}
        <Header onOpenMobile={() => setMobileMenuOpen(true)} />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8">
          <div className="max-w-[1560px] mx-auto min-h-full flex flex-col justify-between">
            <div>
              {activeTab === 'overview' && <OverviewView />}
              {activeTab === 'issues' && <IssueSheetView />}
              {activeTab === 'updates' && <UpdateSheetView />}
              {activeTab === 'stations' && <StationView />}
              {activeTab === 'complains' && <ComplainsView />}
              {activeTab === 'queue' && <QueueView />}
              {activeTab === 'stores' && <StoreMatrixView />}
              {activeTab === 'handover' && <DailyHandoverView />}
            </div>

            {/* Bottom Credits matching screenshot */}
            <footer className="pt-12 pb-4 flex items-center justify-end text-[11px] text-[#475569] select-none">
              <span>Developed By Team FSD</span>
            </footer>
          </div>
        </main>
      </div>

      {/* Global Interactive Modals */}
      <CommandPalette />
      <AnnouncementsModal />
      <UserProfileModal />
    </div>
  );
};

export default function App() {
  return (
    <PortalProvider>
      <PortalMain />
    </PortalProvider>
  );
}
