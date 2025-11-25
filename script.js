/********************************************************************
 * script.js – PARTE 1/5
 * Navegación, captura inicial de valores, helpers y base del sistema.
 ********************************************************************/

/* ============================================================
   1. SISTEMA DE PESTAÑAS (UX sin scroll gigante)
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const tabs = document.querySelectorAll(".tab");
    const sections = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {

            // Quitar 'active' de todas las pestañas
            tabs.forEach(t => t.classList.remove("active"));

            // Activar la pestaña actual
            tab.classList.add("active");

            // Ocultar todas las secciones
            sections.forEach(sec => sec.classList.remove("active"));

            // Mostrar la sección seleccionada
            const id = tab.getAttribute("data-target");
            document.getElementById(id).classList.add("active");
        });
    });

});

/* ============================================================
   2. HELPERS – Funciones para leer/escribir valores
============================================================ */

function getVal(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    return el.value;
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val;
}

function getNum(id) {
    const v = parseFloat(getVal(id));
    return isNaN(v) ? 0 : v;
}

function setNum(id, val) {
    setVal(id, Number(val));
}

/* ============================================================
   3. ACTUALIZAR RCT_STATE DESDE EL FORMULARIO
============================================================ */

function updateHeaderFromDOM() {
    RCT_STATE.header = {
        fecha: getVal("fecha"),
        grupo: getVal("grupo"),
        turno: getVal("turno"),
        responsable: getVal("responsable"),
        supervisores: getVal("supervisores"),
        equiposTaller: getNum("equiposTaller"),
        cxoperador: getNum("cxoperador")
    };
}

function updateIndicadoresFromDOM() {
    RCT_STATE.indicadores = {
        camOper: getNum("camOper"),
        camDown: getNum("camDown"),
        livianos: getNum("livianos"),
        livDown: getNum("livDown")
    };
}

function updateSeguridadFromDOM() {
    RCT_STATE.seguridad = {
        obs: getVal("segObs"),
        lugar: getVal("segLugar"),
        hallazgos: getNum("segHallazgos"),
        div: getVal("segDiv")
    };
}

function updateObservacionesFromDOM() {
    RCT_STATE.observaciones = getVal("observaciones");
}

/* ============================================================
   4. FUNCIÓN GENERAL PARA ACTUALIZAR TODO RCT_STATE
============================================================ */

function updateAllState() {

    updateHeaderFromDOM();
    updateIndicadoresFromDOM();
    updateSeguridadFromDOM();
    updateObservacionesFromDOM();

    // Las tablas (buses, equipos, etc.) se actualizarán en PARTE 2/5

    RCT_STATE.meta.updatedAt = new Date().toISOString();

    return RCT_STATE;
}

/* ============================================================
   5. AUTO-ACTUALIZACIÓN DEL ESTADO AL ESCRIBIR
============================================================ */

document.addEventListener("input", () => {
    updateAllState();
    // preview dinámico vendrá en PARTE 3/5
});

/* ============================================================
   6. INICIALIZACIÓN AUTOMÁTICA DE FECHA
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    if (!getVal("fecha")) {
        const hoy = new Date().toISOString().substring(0,10);
        setVal("fecha", hoy);
        RCT_STATE.header.fecha = hoy;
    }

});
/* ============================================================
   7. HISTORIAL DE REPORTES EN LOCALSTORAGE
============================================================ */

/********************************************************************
 * script.js – PARTE 2/5
 * Tablas dinámicas: Buses + Equipos Varados
 * Integración con RCT_STATE y dashboard.
 ********************************************************************/


/* ============================================================
   1. AGREGAR BUS
============================================================ */

function agregarBus() {
    const bahia = getVal("busBahia").trim();
    const hora = getVal("busHora").trim();

    if (!bahia || !hora) {
        alert("Debes ingresar la bahía y la hora.");
        return;
    }

    const entry = { bahia, hora };

    // Guardar en RCT_STATE
    if (!Array.isArray(RCT_STATE.tablas.buses)) {
        RCT_STATE.tablas.buses = [];
    }
    RCT_STATE.tablas.buses.push(entry);

    // Refrescar lista visual
    renderTablaBuses();
    updateAllState();

    // Limpiar campos
    setVal("busBahia", "");
    setVal("busHora", "");
}

/* Render tabla de buses */
function renderTablaBuses() {
    const tbody = document.querySelector("#listaBuses tbody");
    tbody.innerHTML = "";

    RCT_STATE.tablas.buses.forEach((item, index) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.bahia}</td>
            <td>${item.hora}</td>
            <td>
                <button class="delete-btn" onclick="deleteBus(${index})">X</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function deleteBus(i) {
    RCT_STATE.tablas.buses.splice(i, 1);
    renderTablaBuses();
    updateAllState();
}



/* ============================================================
   2. AGREGAR EQUIPO VARADO
============================================================ */

function agregarEquipo() {
    const equipo = getVal("eqCamion").trim();
    const ubicacion = getVal("eqUbicacion").trim();
    const razon = getVal("eqRazon").trim();

    if (!equipo || !ubicacion || !razon) {
        alert("Debes completar todos los campos del equipo.");
        return;
    }

    const entry = { equipo, ubicacion, razon };

    if (!Array.isArray(RCT_STATE.tablas.equipos)) {
        RCT_STATE.tablas.equipos = [];
    }
    RCT_STATE.tablas.equipos.push(entry);

    renderTablaEquipos();
    updateAllState();

    setVal("eqCamion", "");
    setVal("eqUbicacion", "");
    setVal("eqRazon", "");
}

/* Tabla equipos varados */
function renderTablaEquipos() {
    const tbody = document.querySelector("#listaEquipos tbody");
    tbody.innerHTML = "";

    RCT_STATE.tablas.equipos.forEach((item, index) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.equipo}</td>
            <td>${item.ubicacion}</td>
            <td>${item.razon}</td>
            <td>
                <button class="delete-btn" onclick="deleteEquipo(${index})">X</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function deleteEquipo(i) {
    RCT_STATE.tablas.equipos.splice(i, 1);
    renderTablaEquipos();
    updateAllState();
}



/* ============================================================
   3. RESTAURAR TABLAS DESDE RCT_STATE (cuando carga historial)
============================================================ */

function restoreTablesFromState() {
    renderTablaBuses();
    renderTablaEquipos();
}



/* ============================================================
   4. VINCULAR EVENTOS AL CARGAR LA PÁGINA
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    // Cuando se cambian indicadores → recalcular dashboard
    const numericInputs = ["camOper", "camDown", "livianos", "livDown"];

    numericInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => {
                updateAllState();
                actualizarDashboard();
            });
        }
    });
});


/* ============================================================
   5. DASHBOARD – Cálculo automático
============================================================ */

function actualizarDashboard() {

    const oper = parseInt(RCT_STATE.indicadores.camOper) || 0;
    const down = parseInt(RCT_STATE.indicadores.camDown) || 0;
    const liv = parseInt(RCT_STATE.indicadores.livianos) || 0;
    const livdown = parseInt(RCT_STATE.indicadores.livDown) || 0;

    const total = oper + down;
    const disponibilidad = total > 0 ? (oper / total) * 100 : 0;

    // Mostrar valores
    setText("dashOperativos", oper);
    setText("dashDown", down);
    setText("dashHallazgos", RCT_STATE.seguridad.hallazgos || 0);
    setText("dashDisp", disponibilidad.toFixed(1) + "%");
}

/* Helper para actualizar texto */
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

/* ============================================================
   6. INICIALIZAR DASHBOARD AL CARGAR LA PÁGINA
============================================================ */

/********************************************************************
 * script.js – PARTE 3/5
 * renderPreview() – Formato RCT moderno, gris, una sola hoja
 ********************************************************************/

/**
 * Genera el HTML del reporte RCT dentro de #previewContainer
 * usando la información almacenada en RCT_STATE.
 */
function renderPreview() {
    const containerId = (window.RCT && RCT.previewID) ? RCT.previewID : "previewContainer";
    const container = document.getElementById(containerId);
    if (!container) return;

    // Aseguro tener el estado actualizado antes de pintar
    updateAllState();

    const h = RCT_STATE.header || {};
    const ind = RCT_STATE.indicadores || {};
    const tab = RCT_STATE.tablas || {};
    const seg = RCT_STATE.seguridad || {};
    const obs = RCT_STATE.observaciones || "";

    const fecha = h.fecha || "";
    const turno = (h.turno || "").toString().toUpperCase();
    const grupo = h.grupo || "";
    const responsable = h.responsable || "";
    const supervisores = h.supervisores || "";
    const equiposTaller = h.equiposTaller || 0;
    const cxoperador = h.cxoperador || 0;

    const camOper = Number(ind.camOper) || 0;
    const camDown = Number(ind.camDown) || 0;
    const livianos = Number(ind.livianos) || 0;
    const livDown = Number(ind.livDown) || 0;

    const totalCam = camOper + camDown;
    const livOper = livianos - livDown;
    const disp = totalCam > 0 ? (camOper / totalCam) * 100 : 0;

    const buses = Array.isArray(tab.buses) ? tab.buses : [];
    const equipos = Array.isArray(tab.equipos) ? tab.equipos : [];

    const hasBuses = buses.length > 0;
    const hasEquipos = equipos.length > 0;
    const hasObs = obs && obs.trim().length > 0;

    /* ================================
       Bloque 1 – ENCABEZADO
    ================================= */
    let html = `
        <table class="rct-table">
            <tr>
                <th colspan="4" style="text-align:center;">
                    REPORTE CAMBIO DE TURNO – MINA EL DESCANSO
                </th>
            </tr>
            <tr>
                <td><strong>Fecha:</strong> ${fecha}</td>
                <td><strong>Turno:</strong> ${turno}</td>
                <td><strong>Grupo:</strong> ${grupo}</td>
                <td><strong>Responsable RCT:</strong> ${responsable}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>Supervisores:</strong> ${supervisores}</td>
                <td><strong>Camiones x operador (1ra hr):</strong> ${cxoperador}</td>
                <td><strong>Equipos en taller:</strong> ${equiposTaller}</td>
            </tr>
        </table>
    `;

    /* ================================
       Bloque 2 – PRODUCTIVIDAD / INDICADORES
    ================================= */
    html += `
        <table class="rct-table">
            <tr>
                <th colspan="4" style="text-align:center;">PRODUCTIVIDAD / INDICADORES</th>
            </tr>
            <tr>
                <td><strong>Camiones operativos:</strong> ${camOper}</td>
                <td><strong>Camiones DOWN:</strong> ${camDown}</td>
                <td><strong>Total camiones:</strong> ${totalCam}</td>
                <td><strong>Disponibilidad:</strong> ${disp.toFixed(1)}%</td>
            </tr>
            <tr>
                <td><strong>Equipos livianos:</strong> ${livianos}</td>
                <td><strong>Livianos DOWN:</strong> ${livDown}</td>
                <td><strong>Livianos operativos:</strong> ${livOper}</td>
                <td><strong>Hallazgos de seguridad:</strong> ${seg.hallazgos || 0}</td>
            </tr>
        </table>
    `;

    /* ================================
       Bloque 3 – EQUIPOS VARADOS EN CAMPO
    ================================= */
    if (hasEquipos) {
        html += `
            <table class="rct-table">
                <tr>
                    <th colspan="3" style="text-align:center;">EQUIPOS VARADOS EN CAMPO</th>
                </tr>
                <tr>
                    <th>Camión / Equipo</th>
                    <th>Ubicación</th>
                    <th>Razón</th>
                </tr>
        `;

        equipos.forEach(eq => {
            html += `
                <tr>
                    <td>${eq.equipo || ""}</td>
                    <td>${eq.ubicacion || ""}</td>
                    <td>${eq.razon || ""}</td>
                </tr>
            `;
        });

        html += `</table>`;
    }

    /* ================================
       Bloque 4 – HORA LLEGADA BUSES A BAHÍAS
    ================================= */
    if (hasBuses) {
        html += `
            <table class="rct-table">
                <tr>
                    <th colspan="2" style="text-align:center;">HORA LLEGADA BUSES A BAHÍAS</th>
                </tr>
                <tr>
                    <th>Bahía</th>
                    <th>Hora</th>
                </tr>
        `;

        buses.forEach(b => {
            html += `
                <tr>
                    <td>${b.bahia || ""}</td>
                    <td>${b.hora || ""}</td>
                </tr>
            `;
        });

        html += `</table>`;
    }

    /* ================================
       Bloque 5 – SEGURIDAD
    ================================= */
    const segTieneAlgo =
        (seg.obs && seg.obs.trim().length > 0) ||
        (seg.lugar && seg.lugar.trim().length > 0) ||
        (seg.hallazgos && seg.hallazgos > 0);

    if (segTieneAlgo) {
        html += `
            <table class="rct-table">
                <tr>
                    <th colspan="4" style="text-align:center;">SEGURIDAD</th>
                </tr>
                <tr>
                    <td colspan="4"><strong>Observación:</strong> ${seg.obs || ""}</td>
                </tr>
                <tr>
                    <td colspan="2"><strong>Lugar:</strong> ${seg.lugar || ""}</td>
                    <td><strong>N° hallazgos:</strong> ${seg.hallazgos || 0}</td>
                    <td><strong>¿Se divulgó?:</strong> ${seg.div || "NO"}</td>
                </tr>
            </table>
        `;
    }

    /* ================================
       Bloque 6 – OBSERVACIONES GENERALES
    ================================= */
    if (hasObs) {
        const obsHTML = obs.replace(/\n/g, "<br>");
        html += `
            <table class="rct-table">
                <tr>
                    <th style="text-align:center;">OBSERVACIONES / COMENTARIOS DEL TURNO</th>
                </tr>
                <tr>
                    <td>${obsHTML}</td>
                </tr>
            </table>
        `;
    }

    // Inyectar el HTML final en el contenedor
    container.innerHTML = html;
}

/* ============================================================
   Refrescar preview y dashboard cuando se edita algo
============================================================ */

// Además del listener de la PARTE 1/5 que ya hace updateAllState(),
// aquí añado un listener extra para refrescar el preview y el dashboard.
document.addEventListener("input", () => {
    actualizarDashboard();
    renderPreview();
});

// Y al cargar la página, pintamos un preview inicial
document.addEventListener("DOMContentLoaded", () => {
    actualizarDashboard();
    renderPreview();
});
/********************************************************************
 * script.js – PARTE 4/5
 * Sistema de traducción i18n básico
 ********************************************************************/

/********************************************************************
 * script.js – PARTE 4/5
 * Exportar: Imprimir, PDF, JPG, Excel, CSV, JSON
 ********************************************************************/

/* ============================================================
   Helpers para exportaciones
============================================================ */

function getReportFileNameBase() {
    const h = RCT_STATE.header || {};
    const fecha = (h.fecha || "").replace(/[^0-9\-]/g, "");
    const turno = (h.turno || "").toString().toUpperCase();
    let base = "RCT_Mina_El_Descanso";

    if (fecha) base += "_" + fecha;
    if (turno) base += "_" + turno;

    return base;
}

function ensurePreviewReady() {
    const containerId = (window.RCT && RCT.previewID) ? RCT.previewID : "previewContainer";
    const container = document.getElementById(containerId);
    if (!container) {
        alert("No se encontró el contenedor de previsualización.");
        return null;
    }
    if (!container.innerHTML || container.innerHTML.trim().length === 0) {
        // Intento regenerar preview
        renderPreview();
    }
    if (!container.innerHTML || container.innerHTML.trim().length === 0) {
        alert("El reporte aún no tiene información para exportar.");
        return null;
    }
    return container;
}

/* ============================================================
   Imprimir / PDF – abrir ventana nueva con solo el reporte
============================================================ */

function openPrintWindow() {
    const container = ensurePreviewReady();
    if (!container) return;

    const contenido = container.innerHTML;
    const win = window.open("", "_blank", "width=1200,height=800");

    if (!win) {
        alert("El navegador bloqueó la ventana emergente. Habilita las ventanas emergentes para continuar.");
        return;
    }

    // Estilos básicos para que el reporte se vea bien al imprimir
    const printStyles = `
        <style>
            body {
                font-family: "Inter", sans-serif;
                font-size: 12px;
                padding: 20px;
                background: #ffffff;
            }
            .rct-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
            }
            .rct-table th {
                background: #E0E0E0;
                padding: 6px;
                border: 1px solid #BDBDBD;
                font-size: 12px;
            }
            .rct-table td {
                padding: 6px;
                border: 1px solid #BDBDBD;
                font-size: 12px;
            }
        </style>
    `;

    win.document.open();
    win.document.write(`
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Reporte RCT – Impresión</title>
                ${printStyles}
            </head>
            <body>
                ${contenido}
                <script>
                    window.onload = function() {
                        window.focus();
                        window.print();
                    };
                <\/script>
            </body>
        </html>
    `);
    win.document.close();
}

function imprimir() {
    openPrintWindow();
}

/**
 * exportPDF usa la misma lógica de impresión;
 * el usuario selecciona "Guardar como PDF" en el diálogo.
 */
function exportPDF() {
    openPrintWindow();
}

/* ============================================================
   JPG – html2canvas (si está disponible)
============================================================ */

function exportJPG() {
    const container = ensurePreviewReady();
    if (!container) return;

    if (typeof html2canvas !== "function") {
        alert("Para generar JPG se requiere html2canvas. Asegúrate de cargar la librería.");
        return;
    }

    html2canvas(container, { scale: 2 }).then(canvas => {
        const link = document.createElement("a");
        link.download = getReportFileNameBase() + ".jpg";
        link.href = canvas.toDataURL("image/jpeg", 0.92);
        link.click();
    }).catch(err => {
        console.error("Error generando JPG:", err);
        alert("Ocurrió un error al generar la imagen JPG.");
    });
}

/* ============================================================
   Excel – usando HTML como .xls sencillo
============================================================ */

function exportExcel() {
    const container = ensurePreviewReady();
    if (!container) return;

    const html = `
        <html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body>
                ${container.innerHTML}
            </body>
        </html>
    `;

    const blob = new Blob([html], {
        type: "application/vnd.ms-excel"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getReportFileNameBase() + ".xls";
    link.click();
    URL.revokeObjectURL(url);
}

/* ============================================================
   CSV – recorriendo las tablas .rct-table
============================================================ */

function exportCSV() {
    const container = ensurePreviewReady();
    if (!container) return;

    const tables = container.querySelectorAll(".rct-table");
    if (!tables.length) {
        alert("No hay tablas para exportar a CSV.");
        return;
    }

    let csv = "";
    tables.forEach((table, tIndex) => {
        if (tIndex > 0) csv += "\n\n";

        const rows = table.querySelectorAll("tr");
        rows.forEach(row => {
            const cells = row.querySelectorAll("th,td");
            const rowData = [];
            cells.forEach(cell => {
                let text = cell.innerText.replace(/\r?\n|\r/g, " ").trim();
                // Escapar comillas
                if (text.indexOf(",") >= 0 || text.indexOf("\"") >= 0) {
                    text = '"' + text.replace(/"/g, '""') + '"';
                }
                rowData.push(text);
            });
            csv += rowData.join(",") + "\n";
        });
    });

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getReportFileNameBase() + ".csv";
    link.click();
    URL.revokeObjectURL(url);
}

/* ============================================================
   JSON – estado completo RCT_STATE
============================================================ */

function exportJSON() {
    // Aseguro que el estado esté actualizado
    updateAllState();

    const jsonStr = JSON.stringify(RCT_STATE, null, 2);
    const blob = new Blob([jsonStr], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getReportFileNameBase() + ".json";
    link.click();
    URL.revokeObjectURL(url);
}
/* ============================================================
   SISTEMA DE TRADUCCIÓN i18n BÁSICO
============================================================ */

/********************************************************************
 * script.js – PARTE 5/5 (FINAL)
 * Guardado – Historial – Nuevo día – Cargar
 ********************************************************************/


/* ============================================================
   1. GUARDAR REPORTE EN LOCALSTORAGE
============================================================ */

function saveReport() {
    updateAllState();

    let logs = [];
    try {
        logs = JSON.parse(localStorage.getItem("RCT_HISTORY")) || [];
    } catch (e) {
        logs = [];
    }

    const entry = {
        id: "RCT-" + Date.now(),
        fecha: RCT_STATE.header.fecha || "",
        turno: RCT_STATE.header.turno || "",
        grupo: RCT_STATE.header.grupo || "",
        timestamp: new Date().toLocaleString(),
        data: JSON.parse(JSON.stringify(RCT_STATE))
    };

    logs.unshift(entry);
    if (logs.length > 15) logs.pop();

    localStorage.setItem("RCT_HISTORY", JSON.stringify(logs));

    alert("Reporte guardado en historial.");
    renderHistory();
}


/* ============================================================
   2. MOSTRAR HISTORIAL EN EL MODAL
============================================================ */

function renderHistory() {
    const list = document.getElementById("historyList");
    if (!list) return;

    let logs = [];
    try {
        logs = JSON.parse(localStorage.getItem("RCT_HISTORY")) || [];
    } catch (e) {
        logs = [];
    }

    list.innerHTML = "";

    if (!logs.length) {
        list.innerHTML = `<li class="empty">No hay reportes guardados.</li>`;
        return;
    }

    logs.forEach(entry => {
        const li = document.createElement("li");
        li.classList.add("history-item");

        li.innerHTML = `
            <div class="hist-main">
                <strong>${entry.fecha || "(sin fecha)"} – ${entry.turno}</strong>
                <span>${entry.timestamp}</span>
            </div>
            <button class="load-btn" onclick="loadReport('${entry.id}')">Cargar</button>
        `;

        list.appendChild(li);
    });
}


/* ============================================================
   3. CARGAR REPORTE DEL HISTORIAL
============================================================ */

function loadReport(id) {
    let logs = [];
    try {
        logs = JSON.parse(localStorage.getItem("RCT_HISTORY")) || [];
    } catch (e) {
        logs = [];
    }

    const entry = logs.find(x => x.id === id);
    if (!entry) {
        alert("No se encontró el reporte.");
        return;
    }

    RCT_STATE = JSON.parse(JSON.stringify(entry.data));

    // Restaurar campos UI
    setVal("fecha", RCT_STATE.header.fecha);
    setVal("grupo", RCT_STATE.header.grupo);
    setVal("turno", RCT_STATE.header.turno);
    setVal("supervisores", RCT_STATE.header.supervisores);
    setVal("responsable", RCT_STATE.header.responsable);
    setVal("camiones_x_operador", RCT_STATE.header.cxoperador);
    setVal("equipos_taller", RCT_STATE.header.equiposTaller);

    setVal("operativos_camiones", RCT_STATE.indicadores.camOper);
    setVal("down_camiones", RCT_STATE.indicadores.camDown);
    setVal("equipos_livianos", RCT_STATE.indicadores.livianos);
    setVal("equipos_livianos_down", RCT_STATE.indicadores.livDown);

    setVal("observaciones", RCT_STATE.observaciones);
    setVal("segComentario", RCT_STATE.seguridad.obs);
    setVal("segLugar", RCT_STATE.seguridad.lugar);
    setVal("segHallazgos", RCT_STATE.seguridad.hallazgos);

    restoreTablesFromState(); // Parte 2/5

    actualizarDashboard();
    renderPreview();

    closeHistoryModal();
}


/* ============================================================
   4. NUEVO DÍA – LIMPIEZA INTELIGENTE
============================================================ */

function newDay() {

    const ok = confirm(`
¿Iniciar un nuevo día?

Se limpiarán:
✔ Equipos varados
✔ Buses
✔ Comentarios de seguridad
✔ Observaciones

Se mantendrán:
✔ Vacaciones
✔ Últimos incidentes
✔ Campos fijos (capataz, in-house, roster, etc.)
    `);

    if (!ok) return;

    // Limpieza selectiva
    RCT_STATE.tablas.buses = [];
    RCT_STATE.tablas.equipos = [];

    RCT_STATE.seguridad.obs = "";
    RCT_STATE.seguridad.hallazgos = 0;
    RCT_STATE.seguridad.lugar = "";
    RCT_STATE.observaciones = "";

    // Mantener indicadores y otros campos fijos (lo que pediste)
    // Nada más se toca.

    // Restaurar interfaz
    document.querySelector("#listaBuses tbody").innerHTML = "";
    document.querySelector("#listaEquipos tbody").innerHTML = "";
    setVal("segComentario", "");
    setVal("observaciones", "");

    actualizarDashboard();
    renderPreview();

    alert("Nuevo día iniciado.");
}


/* ============================================================
   5. ABRIR / CERRAR MODAL DEL HISTORIAL
============================================================ */

function openHistoryModal() {
    document.getElementById("historyModal").classList.add("open");
    renderHistory();
}

function closeHistoryModal() {
    document.getElementById("historyModal").classList.remove("open");
}


/* ============================================================
   6. EVENTOS DE BOTONES
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const btnSave = document.getElementById("btnSave");
    const btnNew = document.getElementById("btnNew");
    const btnHistory = document.getElementById("btnHistory");

    if (btnSave) btnSave.onclick = saveReport;
    if (btnNew) btnNew.onclick = newDay;
    if (btnHistory) btnHistory.onclick = openHistoryModal;

    const closeBtn = document.getElementById("historyClose");
    if (closeBtn) closeBtn.onclick = closeHistoryModal;
});
/********************************************************************
 * config.js
 * Configuración general del sistema RCT Digital – Mina El Descanso
 ********************************************************************/