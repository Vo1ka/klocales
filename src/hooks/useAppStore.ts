import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UrlGroup } from '../types';
import { GeoParser } from '../utils/geoParcer';

// Тип для отдельной вкладки
export interface TabSession {
  id: string;
  title: string;
  geoInput: string;
  urlInput: string;
  urlGroups: UrlGroup[];
}

interface AppState {
  tabs: TabSession[];
  activeTabId: string;
  
  // Управление вкладками
  addTab: () => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabTitle: (id: string, title: string) => void;
  
  // ВАЖНО: Добавили хелпер в интерфейс, чтобы TS знал типы
  _updateActiveTab: (updater: (tab: TabSession) => Partial<TabSession>) => void;
  
  // Данные активной вкладки
  setGeoInput: (input: string) => void;
  setUrlInput: (input: string) => void;
  parseActiveTab: () => void;
  clearActiveTab: () => void;
  
  // Управление гео-кодами активной вкладки
  toggleCheck: (urlId: string, geoCode: string) => void;
  updateNote: (urlId: string, geoCode: string, note: string) => void;
  deleteUrlGroup: (urlId: string) => void;
}

const createEmptyTab = (): TabSession => ({
  id: `tab-${Date.now()}`,
  title: 'Новая сессия',
  geoInput: '',
  urlInput: '',
  urlGroups: []
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tabs: [createEmptyTab()],
      activeTabId: '', 

      addTab: () => set((state) => {
        const newTab = createEmptyTab();
        return {
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id
        };
      }),

      removeTab: (id) => set((state) => {
        const newTabs = state.tabs.filter((t: TabSession) => t.id !== id);
        if (newTabs.length === 0) {
          const freshTab = createEmptyTab();
          return { tabs: [freshTab], activeTabId: freshTab.id };
        }
        return {
          tabs: newTabs,
          activeTabId: state.activeTabId === id ? newTabs[0].id : state.activeTabId
        };
      }),

      setActiveTab: (id) => set({ activeTabId: id }),

      updateTabTitle: (id, title) => set((state) => ({
        tabs: state.tabs.map((t: TabSession) => t.id === id ? { ...t, title } : t)
      })),

      // Реализация хелпера
      _updateActiveTab: (updater) => set((state) => ({
        tabs: state.tabs.map((tab: TabSession) => 
          tab.id === state.activeTabId ? { ...tab, ...updater(tab) } : tab
        )
      })),

      // Использование хелпера (теперь TS знает, что `tab` это `TabSession`)
      setGeoInput: (geoInput) => get()._updateActiveTab(() => ({ geoInput })),
      
      setUrlInput: (urlInput) => get()._updateActiveTab(() => ({ urlInput })),

      parseActiveTab: () => get()._updateActiveTab((tab) => {
        const parsed = GeoParser.parse(tab.geoInput, tab.urlInput);
        // Можно заодно обновлять заголовок вкладки по первому URL
        const title = parsed.length > 0 ? parsed[0].url : 'Новая сессия';
        return { urlGroups: parsed, title };
      }),

      clearActiveTab: () => get()._updateActiveTab(() => ({
        geoInput: '', urlInput: '', urlGroups: []
      })),

      toggleCheck: (urlId, geoCode) => get()._updateActiveTab((tab) => ({
        urlGroups: tab.urlGroups.map(group => group.id === urlId ? {
          ...group,
          geoCodes: group.geoCodes.map(geo => geo.code === geoCode ? { ...geo, checked: !geo.checked } : geo)
        } : group)
      })),

      updateNote: (urlId, geoCode, note) => get()._updateActiveTab((tab) => ({
        urlGroups: tab.urlGroups.map(group => group.id === urlId ? {
          ...group,
          geoCodes: group.geoCodes.map(geo => geo.code === geoCode ? { ...geo, note } : geo)
        } : group)
      })),

      deleteUrlGroup: (urlId) => get()._updateActiveTab((tab) => ({
        urlGroups: tab.urlGroups.filter(g => g.id !== urlId)
      }))
    }),
    {
      name: 'geo-parser-storage', // Ключ в localStorage
    }
  )
);
