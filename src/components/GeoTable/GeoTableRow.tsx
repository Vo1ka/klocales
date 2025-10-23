import React, { useState } from 'react';
import type { GeoCode } from '../../types';
import './GeoTable.css'
interface GeoTableRowProps {
  geo: GeoCode;
  onToggle: () => void;
  onNoteChange: (note: string) => void;
}

export const GeoTableRow: React.FC<GeoTableRowProps> = ({
  geo,
  onToggle,
  onNoteChange
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(geo.note);

  const handleNoteBlur = () => {
    setIsEditingNote(false);
    if (noteValue !== geo.note) {
      onNoteChange(noteValue);
    }
  };

  const handleNoteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNoteBlur();
    }
    if (e.key === 'Escape') {
      setNoteValue(geo.note);
      setIsEditingNote(false);
    }
  };

  return (
    <tr className={geo.checked ? 'row-checked' : 'row-unchecked'}>
      <td className="col-geo">
        <div className="geo-code-badge">
          <span className="geo-prefix">{geo.prefix}</span>
          <span className="geo-separator">-</span>
          <span className="geo-country">{geo.country}</span>
        </div>
      </td>
      
      <td className="col-status">
        <button
          onClick={onToggle}
          className={`status-toggle ${geo.checked ? 'checked' : 'unchecked'}`}
          title={geo.checked ? 'Отметить как невыполненное' : 'Отметить как выполненное'}
        >
          <span className="status-icon">
            {geo.checked ? '✅' : '❌'}
          </span>
          <span className="status-text">
            {geo.checked ? 'Выполнено' : 'Не выполнено'}
          </span>
        </button>
      </td>
      
      <td className="col-note">
        {isEditingNote ? (
          <input
            type="text"
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            onBlur={handleNoteBlur}
            onKeyDown={handleNoteKeyDown}
            className="note-input"
            placeholder="Добавить заметку..."
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingNote(true)}
            className="note-display"
            title="Нажмите для редактирования"
          >
            {geo.note || (
              <span className="note-placeholder">Добавить заметку...</span>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};
