import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  setTitle: (title) => ipcRenderer.send('set-title', title),
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  getGroups: (event) => ipcRenderer.invoke('getGroups', event),
  createUser: (user) => ipcRenderer.invoke('createUser', user),
  getUsers: (event) => ipcRenderer.invoke('getUsers', event),
  editUser: (user) => ipcRenderer.invoke('editUser', user),
  deleteUser: (id_empleado) => ipcRenderer.invoke('deleteUser', id_empleado),
})
