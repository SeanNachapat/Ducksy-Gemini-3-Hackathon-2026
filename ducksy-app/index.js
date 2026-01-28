const { nativeImage } = require('electron/common');
const { app, BrowserWindow, session, desktopCapturer, screen, Tray, Menu } = require('electron/main')
const path = require('node:path')
const fs = require('node:fs')

let tray;

function createWindow() {

      let mainWindow;
      let workSizeArea = screen.getPrimaryDisplay().workAreaSize;
      const MAIN_WINDOWS_WIDTH = 300;
      const MAIN_WINDOWS_HEIGHT = 350;
      let initialPosition = {
            x: workSizeArea.width - MAIN_WINDOWS_WIDTH,
            y: workSizeArea.height - MAIN_WINDOWS_HEIGHT
      }

      mainWindow = new BrowserWindow({
            width: MAIN_WINDOWS_WIDTH,
            height: MAIN_WINDOWS_HEIGHT,
            transparent: true,
            frame: false,
            resizable: false,
            hasShadow: false,
            webPreferences: {
                  devTools: true,
                  preload: path.join(__dirname, 'preload.js')
            }
      })
      mainWindow.setIgnoreMouseEvents(true)
      mainWindow.setPosition(initialPosition.x, initialPosition.y)
      mainWindow.setAlwaysOnTop(true, 'screen-saver')
      mainWindow.setVisibleOnAllWorkspaces(true)
      mainWindow.setMenuBarVisibility(false)
      mainWindow.setIgnoreMouseEvents(true)

      function setTopRightPosition() {
            let workAreaSize = screen.getPrimaryDisplay().workAreaSize;
            mainWindow.setPosition(workAreaSize.width - MAIN_WINDOWS_WIDTH, 20)
      }
      function setTopLeftPosition() {
            mainWindow.setPosition(0, 0)
      }
      function setBottomRightPosition() {
            let workAreaSize = screen.getPrimaryDisplay().workAreaSize;
            mainWindow.setPosition(workAreaSize.width - MAIN_WINDOWS_WIDTH, workAreaSize.height - MAIN_WINDOWS_HEIGHT)
      }
      function setBottomLeftPosition() {
            let workAreaSize = screen.getPrimaryDisplay().workAreaSize;
            mainWindow.setPosition(0, workAreaSize.height - MAIN_WINDOWS_HEIGHT)
      }
      // session.defaultSession.setDisplayMediaRequestHandler((req, callback) => {
      //       desktopCapturer.getSources({ types: ['screen', 'window'] }).then(src => {
      //             callback({ video: src[0], audio: 'loopback' })
      //       })
      // }, {
      //       useSystemPicker: true
      // })

      mainWindow.loadFile(path.join(__dirname, 'views', 'index.html'))
}
const createTaskBar = () => {
      try {
            const icon = nativeImage.createFromDataURL("");

            if (icon.isEmpty()) {
                  console.error('Failed to create icon from data URL');
                  return;
            }

            console.log('Icon created:', icon.getSize());

            const resizedIcon = icon.resize({ width: 16, height: 16 });

            resizedIcon.setTemplateImage(true);

            tray = new Tray(resizedIcon);
            tray.setToolTip('Ducksy');

            const contextMenu = Menu.buildFromTemplate([
                  {
                        label: 'Quit',
                        click: () => app.quit()
                  },
                  {
                        label: 'Quit',
                        click: () => app.quit()
                  },
                  {
                        label: 'Quit',
                        click: () => app.quit()
                  },
                  {
                        label: 'Quit',
                        click: () => app.quit()
                  },
            ]);

            tray.setContextMenu(contextMenu);

            console.log('Tray created successfully');
            console.log('Tray bounds:', tray.getBounds());

      } catch (error) {
            console.error('Error creating tray:', error);
      }
}

app.whenReady().then(() => {
      createWindow()
      createTaskBar();
      app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                  createWindow()
            }
      })
})

app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
            app.quit()
      }
})