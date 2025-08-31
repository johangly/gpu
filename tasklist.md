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


## 3. Módulo de Planificación y Excepciones de Asistencia

- [ ] **Asignación de Días Laborales:**
  - [ ] Crear interfaz para definir los días laborales por empleado o grupo.
  - [ ] (Opcional) Definir horarios de entrada/salida esperados.


## 4. Implementación de Horarios y Reportes

### 1. Estructura de la base de datos

- [✅] **Modelo para Grupos/Roles:**
  - [✅] Crear tabla con id y nombre (VARCHAR).
- [✅] **Modelo para Horarios:**
  - [✅] Crear tabla con los siguientes campos:
    - id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
    - grupo_id (INTEGER, FOREIGN KEY que referencia a la tabla de Grupos)
    - dia_semana (INTEGER)
    - hora_inicio (TIME)
    - hora_fin (TIME)
- [✅] **Modificar modelo de Empleado (o Usuario):**
  - [✅] Añadir clave foránea grupo_id que lo asocie a un grupo.

### 2. Backend (Lógica de la aplicación)

- [ ] **API para Grupos y Horarios:**
  - [ ] Crear rutas y controladores para gestionar los Grupos.
  - [ ] Crear rutas y controladores para gestionar los Horarios.
  - [ ] Implementar lógica para guardar los datos del formulario de horarios en la tabla Horarios.
- [ ] **API de Reportes:**
  - [ ] Crear un nuevo endpoint para generar reportes de asistencia.
  - [ ] La ruta debe aceptar parámetros como grupo_id, fecha_inicio y fecha_fin.
  - [ ] Dentro del controlador, implementar la lógica para:
    - Obtener todos los empleados de un grupo_id.
    - Obtener el horario de ese grupo para el rango de fechas.
    - Comparar los registros de tu modelo de Asistencia con el horario.
    - Identificar a los empleados que no tienen un registro de entrada para los días laborables según su horario.
    - Generar un objeto o arreglo con la información completa: nombre del empleado, día, estado (Asistió o Inasistente), y la hora de entrada y salida si asistió.

### 3. Frontend (Interfaz de usuario)

- [ ] **Formulario de Horarios:**
  - [ ] Crear una vista o componente para crear y editar horarios de grupo.
  - [ ] Implementar los checkboxes para los días de la semana y los campos de time para las horas de inicio y fin, como se discutió.
  - [ ] Conectar el formulario con el endpoint de la API de Horarios.
- [ ] **Vista de Reportes:**
  - [ ] Crear una vista para los reportes de asistencia.
  - [ ] Añadir un selector de fechas (fecha_inicio y fecha_fin) y un dropdown para seleccionar el grupo.
  - [ ] Conectar estos controles con el endpoint de la API de Reportes.
  - [ ] Mostrar los datos en una tabla que sea fácil de leer.
- [ ] **Funcionalidad de Impresión:**
  - [ ] Añadir un botón de "Imprimir" en la vista de reportes.
  - [ ] Aplicar estilos CSS @media print para ocultar elementos de la interfaz (botones, menús, etc.) y optimizar la tabla para una impresión clara.
