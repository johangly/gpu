# Lista de Tareas: Sistema de Asistencia Digital

## 1. Módulo de Autenticación y Gestión de Usuarios

- [✅] **Registro de Empleados:**
  - [✅] Crear formulario para que un administrador registre nuevos empleados.
  - [✅] Incluir campos: Cédula, Nombre, Apellido, Usuario, Contraseña (inicial/temporal), Grupo, Estado.
  - [✅] Implementar validación de datos (formato de cédula, usuario único).
- [ ] **Inicio de Sesión Seguro:**
  - [✅] Diseñar pantalla de login con campos para Usuario y Contraseña.
  - [✅] Verificar credenciales contra la base de datos.
  - [✅] Asegurar el uso de hashing para contraseñas (Argon2).
  - [ ] Implementar manejo de sesiones (ej. token de sesión).
- [✅] **Gestión de Perfiles de Usuario:**
  <!-- - [ ] Añadir opción para que el usuario cambie su contraseña. -->
  - [✅] (Opcional) Permitir al administrador editar datos de empleados.
- [✅] **Gestión de Grupos de Personal:**
  - [✅] Implementar CRUD para los grupos de personal (Administrativo, Docente, Obrero).

## 2. Módulo de Registro de Asistencia (Firma Digital)

- [ ] **Pantalla de Firma de Entrada/Salida:**
  - [✅] Crear interfaz para que el empleado marque su asistencia.
  - [✅] Añadir botones para "Marcar Entrada" y "Marcar Salida".
  - [✅] Registrar fecha y hora exacta de la acción.
  - [✅] Asociar la firma con el `id_empleado` y el tipo de acción.
  - [ ] Validar para evitar múltiples marcas de entrada/salida consecutivas.
<!-- - [ ] **Auditoría de Firmas:**
  - [ ] Registrar intentos de firma fallidos. -->

## 3. Módulo de Planificación y Excepciones de Asistencia

- [ ] **Asignación de Días Laborales:**
  - [ ] Crear interfaz para definir los días laborales por empleado o grupo.
  - [ ] (Opcional) Definir horarios de entrada/salida esperados.
<!-- - [ ] **Gestión de Ausencias y Permisos:**
  - [ ] Crear interfaz para registrar ausencias justificadas (permisos, enfermedad, etc.).
  - [ ] Incluir campos: Empleado, Tipo de Ausencia, Fechas, Motivo.
  - [ ] Excluir ausencias justificadas del conteo de días faltados. -->

<!-- ## 4. Módulo de Reportes

- [ ] **Reporte de Asistencia por Empleado:**
  - [ ] Implementar filtros por empleado y rango de fechas.
  - [ ] Mostrar: Días asistidos, faltados, permisos, etc.
  - [ ] Incluir detalle de horas de entrada y salida.
- [ ] **Reportes Diarios:**
  - [ ] Implementar filtro por fecha.
  - [ ] Listar personal que asistió en el día, separado por grupos.
  - [ ] Mostrar: Nombre, Grupo, Hora de Entrada, Hora de Salida.
- [ ] **Reportes Semanales:**
  - [ ] Implementar filtro por semana.
  - [ ] Resumir asistencia semanal por empleado y grupo.
- [ ] **Reportes Mensuales:**
  - [ ] Implementar filtro por mes y año.
  - [ ] Resumir asistencia mensual por empleado y grupo.
- [ ] **Exportación de Reportes:**
  - [ ] Añadir opción para exportar reportes a CSV o PDF. -->

<!-- ## 5. Consideraciones Técnicas Adicionales

- [ ] **Base de Datos:**
  - [ ] Modelar y crear tablas para empleados, grupos, asistencia y ausencias.
- [ ] **Seguridad:**
  - [ ] Proteger rutas y APIs en el proceso principal de Electron.
  - [ ] Validar todas las entradas de datos (usando Zod).
  - [ ] Implementar un manejo de errores robusto.
- [ ] **Interfaz de Usuario (React):**
  - [ ] Diseñar una interfaz intuitiva y responsiva.
  - [ ] Crear una navegación clara (ej. Sidebar).
  - [ ] Desarrollar componentes reutilizables.
- [ ] **Manejo de Errores y Logging:**
  - [ ] Mantener un logging exhaustivo en el proceso principal.
  - [ ] Mostrar mensajes de error amigables en la interfaz. -->