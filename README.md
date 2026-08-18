# Sistema Avanzado de Autenticación, Roles, Perfil & Exportación CSV

## 📌 Nombre del Proyecto
**AuthPortal Pro** - Plataforma Frontend de Gestión de Usuarios y Autenticación SPA con Exportación CSV.

## 🎯 Objetivo de la Actividad
Implementar una solución web modularizada en JavaScript puro (ES6+), HTML5 y CSS3 que extienda el flujo clásico de autenticación incorporando **exportación de usuarios a CSV**, **diferenciación de roles**, **perfil editable**, **recuperación de contraseña**, **recordar sesión**, **validación inline**, **notificaciones toast** e **historial de accesos**.

---

## 🚀 Nuevas Funcionalidades Adicionales Implementadas

1. **Exportación de Usuarios a Archivo CSV**:
   - Función exclusiva para cuentas con rol **Administrador**.
   - Genera dinámicamente un archivo estructurado con formato `.csv` codificado en UTF-8 conteniendo Nombre, Usuario, Correo, Rol y Fecha de Registro de todos los usuarios registrados.

2. **Recuperación de Contraseña**:
   - Flujo de verificación de 2 pasos por correo o nombre de usuario.
   - Permite ingresar una nueva clave validando los requisitos de seguridad requeridos.

3. **Recordar Sesión (Persistencia Prolongada)**:
   - Checkbox en el login para mantener abierta la sesión en `localStorage` con metadata de caducidad.

4. **Validación en Tiempo Real (Inline)**:
   - Retroalimentación inmediata en los campos de formulario mediante eventos `input` sin necesidad de presionar el botón de envío.

5. **Diferentes Roles de Usuario**:
   - Selección de rol (**Usuario Estándar** vs **Administrador**) al momento del registro.
   - Restricción de acceso: Solo el **Administrador** puede visualizar la pestaña de gestión de usuarios y ejecutar la exportación CSV o eliminar cuentas.

6. **Perfil del Usuario**:
   - Módulo independiente que permite consultar y modificar el Nombre Completo y Correo Electrónico del usuario activo.

7. **Notificaciones Toast**:
   - Sistema de notificaciones contextuales flotantes (Éxito, Error e Información) que aparecen en la esquina inferior de la pantalla.

8. **Historial de Accesos**:
   - Registro en tiempo real de cada intento de inicio de sesión (exitosos y fallidos), incluyendo fecha/hora, dirección IP simulada y navegador utilizado.

---

## 🛠️ Tecnologías Utilizadas
- **HTML5**: Semántica accesible y etiquetas interactivas.
- **CSS3 Moderno**: CSS Grid, Flexbox, Variables Custom Properties, Soporte de Temas (Claro/Oscuro).
- **JavaScript Puro (ES6+)**: Manipulación del DOM, RegEx, Blobs / DataURIs para descarga CSV y `localStorage`.

---

## 💻 Instrucciones para Ejecutar Localmente

1. Descarga y descomprime el paquete de archivos.
2. Mantén la siguiente estructura en la misma carpeta:
   - `index.html`
   - `styles.css`
   - `app.js`
3. Abre `index.html` en tu navegador.
4. *Nota*: Para probar las funciones de Administrador, puedes usar las credenciales de semilla creadas automáticamente:
   - **Usuario**: `admin`
   - **Contraseña**: `AdminPass123!`

---

## 🌐 Instrucciones para Publicar en GitHub Pages / Netlify

1. Sube los archivos a tu repositorio de GitHub.
2. En GitHub, dirígete a **Settings > Pages**, elige la rama `main` y guarda.
3. ¡Obtendrás la URL pública al instante!

---

## 🤖 Uso de Inteligencia Artificial

- **Prompt Utilizado**: *"Adiciona al proyecto una opción para exportar la información de los usuarios a un archivo CSV. También adiciona las siguientes funcionalidades: Recuperación de contraseña, Recordar sesión, Validación en tiempo real, Diferentes roles de usuario, Perfil del usuario, Notificaciones, Historial de accesos."*
- **Aportes de la IA**: Generación de la función de codificación URI para la descarga del archivo CSV, maquetación de notificaciones Toast y tablas dinámicas.
- **Decision del Equipo**: Se configuró un usuario Administrador por defecto (`admin`) para permitir probar inmediatamente la función de exportación CSV y la tabla de gestión sin necesidad de un flujo backend.
