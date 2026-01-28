const { nativeImage } = require('electron/common');
const { app, BrowserWindow, session, desktopCapturer, screen, Tray, Menu } = require('electron/main')
const path = require('node:path')
const fs = require('node:fs')

let tray;
let position;
let mainWindow;

function createWindow() {
      let workSizeArea = screen.getPrimaryDisplay().workAreaSize;
      const MAIN_WINDOWS_WIDTH = 300;
      const MAIN_WINDOWS_HEIGHT = 350;

      position = [
            {
                  name: "TopRight",
                  position: {
                        x: workSizeArea.width - MAIN_WINDOWS_WIDTH,
                        y: 20
                  }
            },
            {
                  name: "TopLeft",
                  position: {
                        x: 0,
                        y: 0
                  }
            },
            {
                  name: "BottomRight",
                  position: {
                        x: workSizeArea.width - MAIN_WINDOWS_WIDTH,
                        y: workSizeArea.height - MAIN_WINDOWS_HEIGHT
                  }
            },
            {
                  name: "BottomLeft",
                  position: {
                        x: 0,
                        y: workSizeArea.height - MAIN_WINDOWS_HEIGHT
                  }
            }
      ];
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
      mainWindow.setPosition(position[0].position.x, position[0].position.y)
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
            let iconPath;

            if (process.platform === 'darwin') {
                  iconPath = path.join(__dirname, 'assets', 'icon-22x22.png');
            } else if (process.platform === 'win32') {
                  iconPath = path.join(__dirname, 'assets', 'icon-16x16.png');
            } else {
                  iconPath = path.join(__dirname, 'assets', 'icon-32x32.png');
            }
            tray = new Tray(iconPath);
            tray.setToolTip('Ducksy');

            let currentPosition = 0;

            const updateTrayMenu = () => {

                  const contextMenu = Menu.buildFromTemplate([
                        {
                              label: `Now Position : ${position[currentPosition].name}`
                        },
                        {
                              label: `Next Position : ${position[(currentPosition + 1) % position.length].name}`,
                              click: () => {
                                    console.log(currentPosition)
                                    if (position.length - 1 > currentPosition) {
                                          currentPosition++
                                    } else {
                                          currentPosition = 0
                                    }
                                    mainWindow.setPosition(position[currentPosition].position.x, position[currentPosition].position.y)
                                    updateTrayMenu();
                              }
                        },
                        {
                              label: 'Quit',
                              click: () => app.quit()
                        },
                  ]);

                  tray.setContextMenu(contextMenu);
            }

            updateTrayMenu();

            console.log('Tray created successfully');
            console.log('Tray bounds:', tray.getBounds());

      } catch (error) {
            console.error('Error creating tray:', error);
      }
}

app.whenReady().then(() => {
      createWindow()
      setTimeout(() => {
            createTaskBar();
      }, 500)
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