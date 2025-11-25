# RCT – Mina El Descanso (rct-v2.0-el-descanso)

Esta es la **versión 2.0** del sistema digital **Reporte de Cambio de Turno (RCT)** para la mina **El Descanso**.  
Representa una mejora superior frente a las versiones anteriores (1.0 y 1.1), con un motor completamente optimizado, diseño profesional, KPIs actualizados en tiempo real y un formato de reporte altamente mejorado.

> Proyecto desarrollado en **colaboración** entre **Alex Ramírez** y **Diego Fuentes**, trabajando juntos para evolucionar este sistema hasta su versión final de uso operativo.

---

## 🌐 Demo en línea (GitHub Pages)

👉 **https://reportecamionesturno1.github.io/rct-v2.0-el-descanso/**

Repositorio:

👉 **https://github.com/reportecamionesturno1/rct-v2.0-el-descanso**

---

## 📁 Archivos principales de esta versión

- **index.html** → estructura, tabs, layout y modal de historial  
  :contentReference[oaicite:3]{index=3}

- **script.js** → lógica completa: estado, KPIs, historial, preview dinámico y exportaciones  
  :contentReference[oaicite:4]{index=4}

- **style.css** → diseño profesional, modo oscuro, responsive, tarjetas KPI y estilos del sistema  
  :contentReference[oaicite:5]{index=5}

---

## 🚀 ¿Qué incluye la versión 2.0?

### 🔥 Mejoras principales sobre la 1.1
- KPIs recalculados en tiempo real y de forma más precisa.
- Preview completo tipo **formato mina**, con logos, cabecera, indicadores, tablas y observaciones.
- Mejor motor de historial (hasta 15 reportes guardados localmente).
- Exportaciones más estables:
  - **JPG** (alta resolución)
  - **PDF** desde impresión dedicada
  - **Excel** con varias hojas
  - **CSV**
  - **JSON** (estado completo)
- Mejoras visuales: colores Drummond, tarjetas KPI con colores corporativos, sombras, responsive y dark mode.
- Cálculo inteligente de:
  - Disponibilidad
  - Livianos operativos
  - Hallazgos (automáticos según equipos varados)
- Nuevos componentes:  
  - Modal de historial mejorado  
  - Botones de acción optimizados  
  - Flujo "Nuevo día" mucho más controlado  

---

## 🧾 Funcionalidades completas

- Formulario organizado por pestañas:
  - **Encabezado**
  - **Equipos**
  - **Observaciones**
  - **Resumen / Exportaciones**
- Tablas dinámicas:
  - Buses con hora de llegada
  - Equipos varados con ubicación y razón
- KPIs:
  - Operativos
  - Down
  - Hallazgos de seguridad
  - Disponibilidad %
- Preview profesional totalmente generado con JavaScript.
- Historial local con indicador de guardado.
- Exportaciones completas: PDF, JPG, Excel, CSV, JSON.
- Modo oscuro integrado.
- Diseño responsivo para celular operario.

---

## 🧱 Estructura del proyecto
rct-v2.0-el-descanso/
│
├── index.html
├── script.js
├── style.css
├── config.js (opcional según versiones)
└── assets/
├── img/
│ ├── logo-drummond.png
│ └── yo-estoy-con.png
└── lang/
├── es.json
└── en.json


---

## 🛠 Tecnologías implementadas

- **HTML5 / CSS3 / JavaScript**
- **SheetJS (XLSX)** para Excel
- **html2canvas** para JPG
- **jsPDF** para PDF
- **LocalStorage** para historial
- **Bootstrap 5 (CDN)** para soporte visual
- **Modo oscuro / Light Mode** nativo con CSS variables

---

