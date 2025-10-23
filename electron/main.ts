import { app, BrowserWindow } from 'electron';
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
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
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
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 🔄 Настройка автообновления
function setupAutoUpdater() {
  // Не проверять обновления в dev режиме
  if (isDev) return;

  // Логирование
  autoUpdater.logger = console;

  // Проверка обновлений при запуске
  autoUpdater.checkForUpdatesAndNotify();

  // Проверка каждые 10 минут
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 10 * 60 * 1000);

  // События автообновления
  autoUpdater.on('checking-for-update', () => {
    console.log('Проверка обновлений...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Доступно обновление:', info.version);
    mainWindow?.webContents.send('update-available', info);
  });

  autoUpdater.on('update-not-available', () => {
    console.log('Обновлений нет');
  });

  autoUpdater.on('error', (err) => {
    console.error('Ошибка обновления:', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`Загрузка: ${progressObj.percent}%`);
    mainWindow?.webContents.send('download-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Обновление загружено:', info.version);
    mainWindow?.webContents.send('update-downloaded', info);
  });
}

app.whenReady().then(() => {
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
