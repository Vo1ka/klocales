import React from 'react';
import './GeoInput.css';

interface GeoInputProps {
  geoInput: string;
  urlInput: string;
  onGeoInputChange: (value: string) => void;
  onUrlInputChange: (value: string) => void;
  onParse: () => void;
  onClear: () => void;
}

export const GeoInput: React.FC<GeoInputProps> = ({
  geoInput,
  urlInput,
  onGeoInputChange,
  onUrlInputChange,
  onParse,
  onClear
}) => {
  const handlePasteGeo = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onGeoInputChange(text);
    } catch (err) {
      console.error('Ошибка вставки:', err);
    }
  };

  const handlePasteUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onUrlInputChange(text);
    } catch (err) {
      console.error('Ошибка вставки:', err);
    }
  };

  const canParse = geoInput.trim() && urlInput.trim();

  return (
    <div className="geo-input">
      <div className="geo-input-header">
        <h2>🌍 Настройка локалей</h2>
        <button onClick={onClear} className="btn btn-ghost">
          🗑️ Очистить всё
        </button>
      </div>

      <div className="input-grid">
        {/* Гео-коды */}
        <div className="input-section">
          <div className="input-label">
            <label>Scope(локали)</label>
            <button 
              onClick={handlePasteGeo} 
              className="btn-icon"
              title="Вставить из буфера"
            >
              📋
            </button>
          </div>
          <textarea
            value={geoInput}
            onChange={(e) => onGeoInputChange(e.target.value)}
            placeholder="A-TR x B-AU x C-RU x D-US"
            className="input-field geo-field"
            rows={3}
          />
          <div className="input-hint">
            Формат: F-TR x E-FR (разделитель: x)
          </div>
        </div>

        {/* URLs */}
        <div className="input-section">
          <div className="input-label">
            <label>URLs</label>
            <button 
              onClick={handlePasteUrl} 
              className="btn-icon"
              title="Вставить из буфера"
            >
              📋
            </button>
          </div>
          <textarea
            value={urlInput}
            onChange={(e) => onUrlInputChange(e.target.value)}
            placeholder="example.com&#10;example2.com&#10;example3.com"
            className="input-field url-field"
            rows={3}
          />
          <div className="input-hint">
            Каждый URL на новой строке или через запятую
          </div>
        </div>
      </div>

      <div className="input-actions">
        <button 
          onClick={onParse} 
          className="btn btn-primary btn-large"
          disabled={!canParse}
        >
          🚀 Сгенерировать таблицу
        </button>
      </div>
    </div>
  );
};
