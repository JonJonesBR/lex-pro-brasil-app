const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
  // Cria uma janela de navegador.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {

    }
  });

  // Carrega a aplicação React.
  // Em desenvolvimento, carrega a partir do servidor de desenvolvimento Vite.
  // Em produção, carrega o arquivo index.html do build.
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, './dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // Opcional: Abrir o DevTools (ferramentas de desenvolvedor).
  // mainWindow.webContents.openDevTools();
}

// Este método será chamado quando o Electron tiver finalizado
// a inicialização e estiver pronto para criar janelas do navegador.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // No macOS, é comum recriar uma janela no aplicativo quando o
    // ícone do dock é clicado e não há outras janelas abertas.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Encerra o aplicativo quando todas as janelas são fechadas, exceto no macOS.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
