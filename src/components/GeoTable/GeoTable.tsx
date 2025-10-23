import React from 'react';
import './GeoTable.css';
import type { UrlGroup } from '../../types';
import { GeoTableRow } from './GeoTableRow';

interface GeoTableProps {
  urlGroups: UrlGroup[];
  onToggleCheck: (urlId: string, geoCode: string) => void;
  onUpdateNote: (urlId: string, geoCode: string, note: string) => void;
  onDeleteGroup: (urlId: string) => void;
  onExport?: (format: 'json' | 'csv' | 'markdown') => string; 
}

export const GeoTable: React.FC<GeoTableProps> = ({
  urlGroups,
  onToggleCheck,
  onUpdateNote,
  onDeleteGroup,
}) => {
  if (urlGroups.length === 0) {
    return null;
  }
  // Подсчёт статистики
  const totalGeos = urlGroups.reduce((sum, group) => sum + group.geoCodes.length, 0);
  const checkedGeos = urlGroups.reduce(
    (sum, group) => sum + group.geoCodes.filter(geo => geo.checked).length,
    0
  );
  const completionPercentage = totalGeos > 0 ? Math.round((checkedGeos / totalGeos) * 100) : 0;
  const totalUrls = urlGroups.length;

  return (
    <div className="geo-table-container">
      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">🌐</div>
          <div className="stat-content">
            <div className="stat-label">Всего URLs</div>
            <div className="stat-value">{totalUrls}</div>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <div className="stat-label">Всего страниц(локалей)</div>
            <div className="stat-value">{totalGeos}</div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Проверено</div>
            <div className="stat-value">{checkedGeos}</div>
            <div className="stat-subtext">из {totalGeos}</div>
          </div>
        </div>

        <div className="stat-card stat-card-percentage">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Прогресс</div>
            <div className="stat-value-large">{completionPercentage}%</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="geo-table-content">
        {urlGroups.map((group) => (
          <div key={group.id} className="url-group">
            <div className="url-group-header">
              <div className="url-title">
                <span className="url-icon">🌐</span>
                <h3>{group.url}</h3>
              </div>
              <button
                onClick={() => onDeleteGroup(group.id)}
                className="btn-delete"
                title="Удалить группу"
              >
                🗑️
              </button>
            </div>

            <div className="geo-table">
              <table>
                <thead>
                  <tr>
                    <th className="col-geo">Гео-код</th>
                    <th className="col-status">Статус</th>
                    <th className="col-note">Заметка</th>
                  </tr>
                </thead>
                <tbody>
                  {group.geoCodes.map((geo) => (
                    <GeoTableRow
                      key={geo.code}
                      geo={geo}
                      onToggle={() => onToggleCheck(group.id, geo.code)}
                      onNoteChange={(note) => onUpdateNote(group.id, geo.code, note)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
