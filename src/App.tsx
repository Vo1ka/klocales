import React, { useEffect } from 'react';
import { GeoTable } from './components/GeoTable/GeoTable';
import './App.css';
import { useAppStore } from './hooks/useAppStore';
import { GeoInput } from './components/InputArea/GeoInput';
import { GeoParser } from './utils/geoParcer';

function App() {
  const store = useAppStore();
  
  useEffect(() => {
    if (!store.activeTabId && store.tabs.length > 0) {
      store.setActiveTab(store.tabs[0].id);
    }
  }, [store.activeTabId, store.tabs]);

  const activeTab = store.tabs.find(t => t.id === store.activeTabId);

  if (!activeTab) return null;

  // Функция для текстовых экспортов (JSON, CSV, MD)
  const handleExportText = (format: 'json' | 'csv' | 'markdown') => {
    switch (format) {
      case 'json': return GeoParser.exportToJSON(activeTab.urlGroups);
      case 'csv': return GeoParser.exportToCSV(activeTab.urlGroups);
      case 'markdown': return GeoParser.exportToMarkdown(activeTab.urlGroups);
      default: return '';
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Kaspersky Locales</h1>
          <p className="header-subtitle">Работа с локалями</p>
        </div>
        
        {/* ПАНЕЛЬ ВКЛАДОК */}
        <div className="tabs-container">
          {store.tabs.map(tab => (
            <div 
              key={tab.id} 
              className={`tab-item ${tab.id === store.activeTabId ? 'active' : ''}`}
              onClick={() => store.setActiveTab(tab.id)}
            >
              <span className="tab-title">
                {tab.title}
                {tab.urlGroups.length > 0 && <span className="tab-badge">{tab.urlGroups.length}</span>}
              </span>
              <button 
                className="tab-close" 
                onClick={(e) => { e.stopPropagation(); store.removeTab(tab.id); }}
              >
                ✕
              </button>
            </div>
          ))}
          <button className="tab-add" onClick={store.addTab}>+ Новая вкладка</button>
        </div>
      </header>

      <main className="app-main">
        <GeoInput
          geoInput={activeTab.geoInput}
          urlInput={activeTab.urlInput}
          onGeoInputChange={store.setGeoInput}
          onUrlInputChange={store.setUrlInput}
          onParse={store.parseActiveTab}
          onClear={store.clearActiveTab}
        />

        <GeoTable
          urlGroups={activeTab.urlGroups}
          onToggleCheck={store.toggleCheck}
          onUpdateNote={store.updateNote}
          onDeleteGroup={store.deleteUrlGroup}
          onExportExcel={(group) => {
            GeoParser.exportToExcel(group || activeTab.urlGroups);
          }} 
        />
      </main>
    </div>
  );
}

export default App;

  