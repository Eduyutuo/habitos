# 🕹️ Dashboard de Seguimiento de Hábitos Gamificado ("Convertí la disciplina en un juego divertido")

Este proyecto fue generado a partir del análisis visual de los fotogramas del video de demostración. Es una aplicación web completa construida con **HTML5, CSS3 y JavaScript puro**, lista para usarse de forma inmediata en cualquier navegador sin necesidad de instalar dependencias ni frameworks.

---

## 🌟 Características Implementadas

1. **Diseño Arcade Neón (Dark Theme):**
   - Interfaz en modo oscuro con acentos luminosos idénticos a los del video.
   - Código de colores por semanas:
     - **Semana 1:** Verde lima neón (`#9ef01a`)
     - **Semana 2:** Coral / Naranja fuego (`#ff6b6b`)
     - **Semana 3:** Cian neón (`#00f5d4`)
     - **Semana 4:** Lavanda / Púrpura neón (`#c77dff`)
     - **Semana 5:** Ámbar / Dorado neón (`#ffb703`)

2. **Matriz de Hábitos Diarios (31 Días):**
   - 10 hábitos preconfigurados extraídos directamente del video:
     1. Entrenar en el Gym 🏋️
     2. Tomar agua 💧
     3. No usar redes sociales ❌
     4. Correr más de 5 km 🏃
     5. Leer 10 Páginas Diarias 📕
     6. No más Fap 🚫
     7. Agradecer a Dios 🙏
     8. Dormir 8:30 PM ⏱️
     9. Contabilizar mis macros 🥑
     10. Levantarme 5 AM ⏰
   - **Edición y Adición:** Puedes hacer clic en el nombre de cualquier hábito para editarlo, añadir nuevos con el botón `+ Nuevo Hábito` o eliminarlos con la `✕`.
   - **Checkboxes Neón:** Celdas cuadradas interactivas con efecto glowing al marcar.
   - **Columnas fijas:** El número, nombre y porcentaje mensual quedan anclados mientras te desplazas horizontalmente por los 31 días.

3. **Gráfico Superior de Progreso Diario:**
   - 31 barras dinámicas que calculan automáticamente el porcentaje de cumplimiento de cada día.
   - Cambio de color según rendimiento: Coral (<40%), Naranja (40-69%), Dorado (70-99%) y Cian brillante (100% perfecto).

4. **Motor de Gamificación en Tiempo Real:**
   - **Puntos de Experiencia (XP):** +10 XP por cada casilla marcada y +50 XP bonus por días con 100% de cumplimiento.
   - **Niveles y Rangos:** Progresión desde *Novato Disciplinado* hasta *Leyenda del Enfoque*.
   - **Contador de Racha Activa:** Detecta días consecutivos de consistencia.
   - **Efectos de Sonido Arcade:** Síntesis de audio con Web Audio API (no requiere archivos externos y se puede silenciar).
   - **Celebración con Confeti:** Al completar metas y días perfectos.

5. **Paneles Inferiores (Dashboard de Control):**
   - **Resumen de Hábitos Diarios:**
     - Gauge circular de progreso global.
     - Contador de hábitos completados vs. totales.
     - Tabla de métricas (% Completado, Completado, Incompleto, Objetivo).
     - Campo de entrada editable para meta mensual ("Escribe tu meta aquí 📝").
     - Curva SVG con gradiente de tendencia diaria en el mes.
   - **Resumen de Hábitos Semanales:**
     - Barras de rendimiento promedio para cada una de las 5 semanas.
     - Lista de verificación semanal interactiva con tachado de completado.
   - **Objetivos del Mes y Notas (Fotograma 10):**
     - Lista de metas mensuales.
     - Área de notas y reflexiones del mes con autoguardado.

6. **Pestañas de Navegación Inferiores (Estilo Hoja de Cálculo):**
   - Pestañas para cada mes: *Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre*.
   - Pestaña de *Instrucciones* con guía rápida emergente.
   - Pestaña de *Seguimiento de Objetivos*.

7. **Persistencia y Exportación Multi-formato:**
   - Todo se almacena automáticamente en el `localStorage` de tu navegador; tus marcas no se pierden al recargar o cerrar.
   - Botón **"💾 Guardar / Exportar"** con ventana modal para elegir el formato de descarga:
     1. **Excel (.xlsx):** Libro de cálculo nativo con hojas para la matriz mensual, métricas del mes y tareas/objetivos. Funciona 100% offline gracias a `xlsx.full.min.js`.
     2. **CSV (.csv):** Archivo universal de valores separados por comas con codificación UTF-8 BOM (`\uFEFF`) para compatibilidad directa e inmediata con Microsoft Excel en español, Google Sheets y LibreOffice.
     3. **JSON (.json):** Respaldo técnico completo con opción de restaurar o transferir datos mediante el botón de importación.

---

## 🚀 Cómo Ejecutar la Aplicación

Tienes dos opciones muy sencillas:

### Opción 1: Directo desde el explorador (Recomendada)
Haz doble clic sobre el archivo **`index.html`** dentro de esta carpeta para abrirlo en Chrome, Edge, Brave o Firefox.

### Opción 2: Con servidor local de Python
Abre una terminal en esta carpeta y ejecuta:
```bash
python -m http.server 3000
```
Luego abre tu navegador en: [http://localhost:3000](http://localhost:3000)
