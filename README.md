# Cognitive Focus Assistant 🧠🚀
> **Enterprise-Grade Mobile Solution for Cognitive Productivity**

Este sistema es un asistente de enfoque cognitivo diseñado bajo estándares de arquitectura limpia y principios SOLID. No es solo un temporizador; es una herramienta de gestión de carga mental diseñada para maximizar la eficiencia del usuario mediante la segregación de responsabilidades y una interfaz de usuario intuitiva.

---

## 🏗️ Arquitectura del Sistema

La aplicación sigue una **Clean Architecture**, dividida en capas para garantizar que la lógica de negocio sea independiente de la interfaz de usuario y de las bases de datos externas.

* **Layer 1: Domain (Core)**: Contiene las entidades de negocio (Tareas, Sesiones de Enfoque) y las reglas lógicas puras.
* **Layer 2: Use Cases (Application)**: Orquestadores de la lógica (ej. "Iniciar Sesión Pomodoro").
* **Layer 3: Interface Adapters (Presenters/Controllers)**: Convierte los datos para la UI.
* **Layer 4: Frameworks & Drivers (UI/External)**: Implementación de la base de datos local y la interfaz móvil.

---

## ✨ Características Principales
- ⏱ **Smart Pomodoro:** Ciclos de trabajo personalizables con transiciones automáticas.
- 🚫 **Distraction Blocker:** Bloqueo de dominios mediante manipulación segura del archivo de hosts de Windows.
- 📊 **Productivity Analytics:** Visualización de datos de enfoque semanales usando Matplotlib.
- 🔒 **Security First:** Los procesos de bloqueo requieren elevación de privilegios controlada.

---

## 🛠️ Stack Tecnológico

* **Lenguaje/Framework:** JS/React Native.
* **Gestión de Estado:** Implementación modular para evitar fugas de memoria (Memory Leaks).
* **Persistencia de Datos:** Cifrado local de datos sensibles del usuario.
* **Seguridad:** Validación de entradas mediante Regex y sanitización de hilos de ejecución.

---

## 🛡️ Auditoría de Ciberseguridad & QA

El software ha sido diseñado bajo el principio de **Security by Design**:
1.  **Sanitización de Datos:** Prevención de ataques de inyección en bases de datos locales (SQLite/NoSQL).
2.  **Principio de Menor Privilegio:** La app solo solicita permisos estrictamente necesarios del sistema operativo.
3.  **Encapsulamiento:** Las variables sensibles están protegidas mediante cierres (closures) y modificadores de acceso privados.

---

### Pasos para desplegar en entorno local:

1. **Clonar el repositorio:**
   ```powershell
   git clone [https://github.com/dpalominodev/cognitive-focus-assistant.git]
   cd cognitive-focus-assistant

2. **Descargar dependencias necesarias**
   ```powershell
   npm install
   npx expo install --fix
