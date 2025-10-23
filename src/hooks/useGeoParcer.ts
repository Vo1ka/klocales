import { useState, useCallback } from 'react';
import type { UrlGroup, GeoCode } from '../types';
import { GeoParser } from '../utils/geoParcer';

export const useGeoParser = () => {
  const [urlGroups, setUrlGroups] = useState<UrlGroup[]>([]);
  const [geoInput, setGeoInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const parse = useCallback(() => {
    const parsed = GeoParser.parse(geoInput, urlInput);
    setUrlGroups(parsed);
  }, [geoInput, urlInput]);

  const updateGeoCode = useCallback((
    urlId: string, 
    geoCode: string, 
    updates: Partial<GeoCode>
  ) => {
    setUrlGroups(prev =>
      prev.map(group =>
        group.id === urlId
          ? {
              ...group,
              geoCodes: group.geoCodes.map(geo =>
                geo.code === geoCode ? { ...geo, ...updates } : geo
              )
            }
          : group
      )
    );
  }, []);

  const toggleCheck = useCallback((urlId: string, geoCode: string) => {
    setUrlGroups(prev =>
      prev.map(group =>
        group.id === urlId
          ? {
              ...group,
              geoCodes: group.geoCodes.map(geo =>
                geo.code === geoCode 
                  ? { ...geo, checked: !geo.checked } 
                  : geo
              )
            }
          : group
      )
    );
  }, []);

  const updateNote = useCallback((
    urlId: string, 
    geoCode: string, 
    note: string
  ) => {
    updateGeoCode(urlId, geoCode, { note });
  }, [updateGeoCode]);

  const deleteUrlGroup = useCallback((urlId: string) => {
    setUrlGroups(prev => prev.filter(group => group.id !== urlId));
  }, []);

  const clearAll = useCallback(() => {
    setUrlGroups([]);
    setGeoInput('');
    setUrlInput('');
  }, []);

  const exportData = useCallback((format: 'json' | 'csv' | 'markdown') => {
    switch (format) {
      case 'json':
        return GeoParser.exportToJSON(urlGroups);
      case 'csv':
        return GeoParser.exportToCSV(urlGroups);
      case 'markdown':
        return GeoParser.exportToMarkdown(urlGroups);
      default:
        return '';
    }
  }, [urlGroups]);

  return {
    urlGroups,
    geoInput,
    urlInput,
    setGeoInput,
    setUrlInput,
    parse,
    toggleCheck,
    updateNote,
    deleteUrlGroup,
    clearAll,
    exportData
  };
};
