import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
    backgroundColor: '#0f172a',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    // mainWindow.webContents.openDevTools();  // Раскомментируй для отладки
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 🔄 Настройка автообновления
function setupAutoUpdater() {
  if (isDev) {
    console.log('🔧 Dev режим - автообновления отключены');
    return;
  }

  console.log('🚀 Production режим - настройка автообновлений');

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.logger = console;

  console.log('⏰ Проверка обновлений через 3 секунды...');
  setTimeout(() => {
    console.log('🔍 Начинаем проверку обновлений...');
    autoUpdater.checkForUpdates();
  }, 3000);

  setInterval(() => {
    console.log('🔄 Периодическая проверка обновлений...');
    autoUpdater.checkForUpdates();
  }, 10 * 60 * 1000);

  autoUpdater.on('checking-for-update', () => {
    console.log('⏳ Проверяем наличие обновлений на GitHub...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('✅ Доступно обновление!');
    console.log('📦 Версия:', info.version);
    console.log('📝 Детали:', info);
    
    mainWindow?.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseDate: info.releaseDate
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('❌ Обновлений нет');
    console.log('📌 Текущая версия актуальна:', info.version);
  });

  autoUpdater.on('error', (err) => {
    console.error('⚠️ Ошибка обновления:', err.message);
    console.error('Stack:', err.stack);
    
    mainWindow?.webContents.send('update-error', {
      message: err.message
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent);
    console.log(`📥 Загружено: ${percent}% (${progressObj.transferred}/${progressObj.total})`);
    
    mainWindow?.webContents.send('download-progress', {
      percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  });

  autoUpdater.on('update-downloaded', async (info) => {
    console.log('✅ Обновление загружено:', info.version);
    
    mainWindow?.webContents.send('update-downloaded', {
      version: info.version
    });

    // Показываем нативное диалоговое окно (опционально)
    if (mainWindow) {
      try {
        const result = await dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Обновление готово',
          message: `Версия ${info.version} загружена и готова к установке.`,
          detail: 'Обновление будет установлено при следующем запуске приложения.\n\nИли нажмите "Перезапустить сейчас" для немедленной установки.',
          buttons: ['Перезапустить сейчас', 'Позже'],
          defaultId: 0,
          cancelId: 1
        });

        if (result === 0) {
          console.log('🔄 Перезапуск для установки обновления...');
          autoUpdater.quitAndInstall();
        } else {
          console.log('⏰ Обновление будет установлено при следующем запуске');
        }
      } catch (err) {
        console.error('Ошибка диалога:', err);
      }
    }
  });
}

app.whenReady().then(() => {
  console.log('🎉 Приложение запущено');
  console.log('📍 Режим:', isDev ? 'development' : 'production');
  console.log('📦 Версия:', app.getVersion());
  
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 🔌 IPC handlers
ipcMain.handle('check-for-updates', async () => {
  try {
    console.log('🔄 Ручная проверка обновлений запрошена из UI');
    const result = await autoUpdater.checkForUpdates();
    return { 
      success: true, 
      updateInfo: result?.updateInfo 
    };
  } catch (error) {
    console.error('❌ Ошибка при ручной проверке:', error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    console.log('📥 Ручная загрузка обновления запрошена из UI');
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка при загрузке:', error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
});

ipcMain.handle('install-update', () => {
  console.log('🔄 Установка обновления запрошена из UI');
  autoUpdater.quitAndInstall();
});

ipcMain.handle('get-app-version', () => {
  const version = app.getVersion();
  console.log('📦 Запрошена версия приложения:', version);
  return version;
});
