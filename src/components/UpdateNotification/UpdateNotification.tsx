import React, { useEffect, useState } from 'react';
import './UpdateNotification.css';

export const UpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.onUpdateAvailable((info) => {
      setUpdateAvailable(true);
      setUpdateInfo(info);
    });

    window.electronAPI.onDownloadProgress((progress) => {
      setDownloadProgress(Math.round(progress.percent));
    });

    window.electronAPI.onUpdateDownloaded((info) => {
      setUpdateDownloaded(true);
      setUpdateInfo(info);
    });
  }, []);

  const handleInstall = () => {
    window.electronAPI.installUpdate();
  };

  if (updateDownloaded) {
    return (
      <div className="update-notification update-ready">
        <div className="update-content">
          <span className="update-icon">🎉</span>
          <div className="update-text">
            <strong>Обновление готово!</strong>
            <p>Версия {updateInfo?.version} загружена</p>
          </div>
          <button onClick={handleInstall} className="btn btn-primary">
            Перезапустить
          </button>
        </div>
      </div>
    );
  }

  if (updateAvailable) {
    return (
      <div className="update-notification update-downloading">
        <div className="update-content">
          <span className="update-icon">⬇️</span>
          <div className="update-text">
            <strong>Загрузка обновления...</strong>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <p>{downloadProgress}%</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
