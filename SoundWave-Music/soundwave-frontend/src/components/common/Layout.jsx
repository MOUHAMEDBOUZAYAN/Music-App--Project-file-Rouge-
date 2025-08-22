import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AudioPlayer from '../player/AudioPlayer';
import { Menu } from 'lucide-react';
import { useSidebar } from '../../store/SidebarContext';

const Layout = ({ children }) => {
  const { isSidebarOpen, toggleSidebar, openSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Bouton hamburger pour mobile */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[9996] p-2 bg-gray-800 rounded-md text-white hover:bg-gray-700 transition-colors lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Bouton pour rouvrir la sidebar sur desktop */}
      {!isSidebarOpen && (
        <button
          onClick={openSidebar}
          className="fixed top-4 left-4 z-[9996] p-2 bg-gray-800 rounded-md text-white hover:bg-gray-700 transition-colors lg:block hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      <div className="flex h-screen">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          {/* Ajouter un padding-bottom pour éviter que le contenu ne passe sous le player fixe */}
          <main className="flex-1 overflow-y-auto bg-black pb-28">
            {children}
          </main>
        </div>
      </div>
      
      <AudioPlayer />
    </div>
  );
};

export default Layout; 