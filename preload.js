import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  setTitle: (title) => ipcRenderer.send('set-title', title),
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  getGroups: (event) => ipcRenderer.invoke('getGroups', event),
  createUser: (user) => ipcRenderer.invoke('createUser', user),
  getUsers: (event) => ipcRenderer.invoke('getUsers', event),
  editUser: (user) => ipcRenderer.invoke('editUser', user),
  deleteUser: (id_empleado) => ipcRenderer.invoke('deleteUser', id_empleado),
  markAsPresent: (id_empleado) => ipcRenderer.invoke('markAsPresent', id_empleado),
  markAttendance: (data) => ipcRenderer.invoke('markAttendance', data),
  getLastUserActivity: (id_empleado) => ipcRenderer.invoke('getLastUserActivity', id_empleado),
  getLast10UserActivities: (id_empleado) => ipcRenderer.invoke('getLast10UserActivities', id_empleado),
  getAllUserActivities: () => ipcRenderer.invoke('getAllUserActivities'),
  createGroup: (data) => ipcRenderer.invoke('createGroup', data),
  editGroup: (group) => ipcRenderer.invoke('editGroup', group),
  deleteGroup: (id_grupo) => ipcRenderer.invoke('deleteGroup', id_grupo),
  calculateAttendance: (data) => ipcRenderer.invoke('calculateAttendance', data),
  generateTestAttendances: () => ipcRenderer.invoke('generateTestAttendances'),
  printReport: (data) => ipcRenderer.invoke('printReport', data),
})
