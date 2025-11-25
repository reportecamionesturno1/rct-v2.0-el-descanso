/********************************************************************
 *  config.js
 *  Configuración global del sistema RCT – Mina El Descanso
 *  Idiomas, estado global, constantes y preparación para integraciones.
 ********************************************************************/

/* ============================================================
   IDIOMA – CONFIGURACIÓN INICIAL
============================================================ */

const RCT_LANGS = ["es", "en"];

// Cargar idioma almacenado
let RCT_LANG = localStorage.getItem("rct_lang") || "es";
if (!RCT_LANGS.includes(RCT_LANG)) RCT_LANG = "es";

// Aplicar idioma al HTML
document.documentElement.setAttribute("lang", RCT_LANG);


/* ============================================================
   CAMBIO DE IDIOMA (ES / EN)
============================================================ */

function switchLang(lang) {
    if (!RCT_LANGS.includes(lang)) return;

    RCT_LANG = lang;
    localStorage.setItem("rct_lang", lang);

    // No recargamos la página: actualizamos textos dinámicamente
    applyTranslations(lang);
}


/* ============================================================
   ARCHIVOS DE TRADUCCIÓN
============================================================ */

async function loadTranslations(lang) {
    try {
        const res = await fetch(`${lang}.json`);
        const data = await res.json();
        return data;
    } catch (e) {
        console.error("❌ Error cargando traducciones:", e);
        return {};
    }
}

let RCT_I18N = {}; // Diccionario cargado

async function applyTranslations(lang) {
    RCT_I18N = await loadTranslations(lang);

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (RCT_I18N[key]) el.textContent = RCT_I18N[key];
    });

    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
        const key = el.dataset.i18nPh;
        if (RCT_I18N[key]) el.placeholder = RCT_I18N[key];
    });
}

// Cargar idioma actual al iniciar
document.addEventListener("DOMContentLoaded", () => {
    applyTranslations(RCT_LANG);
});


/* ============================================================
   CONFIG GLOBAL DEL SISTEMA
============================================================ */

window.RCT = {
    version: "4.0-final",
    maxHistory: 20,
    previewID: "previewContainer",

    // Control de tablas
    tables: {
        buses: "listaBuses",
        equipos: "listaEquipos",
    },

    // Identificadores de secciones
    tabs: [
        "tab-encabezado",
        "tab-equipos",
        "tab-seguridad",
        "tab-observ",
        "tab-resumen"
    ]
};


/* ============================================================
   SISTEMA DE HISTORIAL EN LOCALSTORAGE
============================================================ */

const RCT_HISTORY_KEY = "rct_history";

function loadHistory() {
    try {
        const data = JSON.parse(localStorage.getItem(RCT_HISTORY_KEY));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveHistory(arr) {
    localStorage.setItem(RCT_HISTORY_KEY, JSON.stringify(arr));
}


/* ============================================================
   ESTADO GLOBAL RCT_STATE
============================================================ */

window.RCT_STATE = {
    header: {
        fecha: "",
        grupo: "",
        turno: "",
        responsable: "",
        supervisores: "",
        equiposTaller: 0,
        cxoperador: 0
    },

    indicadores: {
        camOper: 0,
        camDown: 0,
        livianos: 0,
        livDown: 0
    },

    tablas: {
        buses: [],
        equipos: []
    },

    seguridad: {
        obs: "",
        lugar: "",
        hallazgos: 0,
        div: "NO"
    },

    observaciones: "",

    meta: {
        createdAt: "",
        updatedAt: ""
    }
};


/* ============================================================
   PREPARACIÓN PARA GOOGLE APPS SCRIPT (Future-ready)
============================================================ */

window.RCT_GAS = {
    enabled: false,
    url: "",
    sheetId: ""
};

