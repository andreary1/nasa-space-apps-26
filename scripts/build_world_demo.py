# -*- coding: utf-8 -*-
"""
Builder for World-Scale Planetary Analog Engine with 3D Rotating Globe.
"""

import os
import json
from pathlib import Path

HTML_CONTENT = r'''<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planetary Analog Engine • Global Earth Explorer ↔ Marte & Lua</title>
  
  <!-- Typography: Inter + JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          colors: {
            space: {
              950: '#030712',
              900: '#070d1a',
              850: '#0c1527',
              800: '#111e36',
              750: '#16233f',
              700: '#1b2d4f',
            },
            mars: {
              400: '#fb923c',
              500: '#f97316',
              600: '#ea580c',
            },
            moon: {
              300: '#7dd3fc',
              400: '#38bdf8',
              500: '#0284c7',
            },
            earth: {
              400: '#34d399',
              500: '#10b981',
              600: '#059669',
            }
          }
        }
      }
    }
  </script>

  <style>
    :root {
      --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
      --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    body {
      background-color: #030712;
      color: #f3f4f6;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
      background-image: 
        radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        radial-gradient(ellipse 90% 60% at 50% -20%, rgba(16, 185, 129, 0.09), transparent 70%),
        radial-gradient(ellipse 60% 40% at 85% 25%, rgba(56, 189, 248, 0.05), transparent 60%),
        radial-gradient(ellipse 60% 40% at 15% 75%, rgba(249, 115, 22, 0.04), transparent 60%);
      background-size: 32px 32px, 100% 100%, 100% 100%, 100% 100%;
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #070d1a; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
    ::-webkit-scrollbar-thumb:hover { background: #334155; }

    .spotlight-card {
      position: relative;
      background: radial-gradient(700px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.045), transparent 40%);
      transition: border-color 0.25s var(--ease-out-expo), box-shadow 0.25s var(--ease-out-expo), transform 0.2s var(--ease-out-expo);
    }
    .spotlight-card:hover {
      box-shadow: 0 12px 32px -10px rgba(0, 0, 0, 0.7), 0 0 22px -5px rgba(16, 185, 129, 0.12);
      transform: translateY(-2px);
    }

    .border-beam-card {
      position: relative;
      border-radius: 1rem;
      padding: 1px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.08);
    }
    .border-beam-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: conic-gradient(from 0deg, transparent 0 320deg, #10b981 350deg, #38bdf8 360deg);
      animation: rotate-beam 6s linear infinite;
      z-index: 0;
    }
    .border-beam-content {
      position: relative;
      z-index: 1;
      background: #070d1a;
      border-radius: calc(1rem - 1px);
    }
    @keyframes rotate-beam {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .glass-panel {
      background: rgba(8, 14, 28, 0.78);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 20px 40px -15px rgba(0, 0, 0, 0.7);
    }

    .glass-subpanel {
      background: rgba(3, 7, 18, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .glass-input {
      background: rgba(3, 7, 18, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.2s var(--ease-out-expo);
    }
    .glass-input:focus {
      border-color: rgba(16, 185, 129, 0.6);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
      outline: none;
    }

    .shiny-text {
      background: linear-gradient(110deg, #ffffff 30%, #a7f3d0 50%, #ffffff 70%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shine 5s ease-in-out infinite;
    }
    @keyframes shine {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    #toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .toast-msg {
      pointer-events: auto;
      transform: translateY(20px) scale(0.95);
      opacity: 0;
      transition: all 0.3s var(--ease-spring);
    }
    .toast-msg.show {
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    /* Pulse beacon */
    @keyframes pulseRing {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(2.4); opacity: 0; }
    }
  </style>
</head>

<body class="min-h-screen p-3 md:p-6 lg:p-8 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">

  <!-- TOAST CONTAINER -->
  <div id="toast-container"></div>

  <div class="max-w-[1540px] mx-auto w-full space-y-6">

    <!-- TOP MISSION HUD -->
    <header class="glass-panel rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10 shadow-2xl relative overflow-hidden">
      <div class="absolute -top-12 -left-12 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-12 -right-12 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="space-y-1.5 relative z-10">
        <div class="flex items-center gap-2.5 flex-wrap">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs shadow-emerald-500/20">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Global Planetary Telemetry Active
          </span>
          <span class="text-xs text-slate-500 font-mono hidden sm:inline">•</span>
          <span class="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:inline">COPERNICUS GLO-30 / LOLA RDR / HiRISE DTM</span>
          <span class="text-xs text-slate-500 font-mono hidden md:inline">•</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono font-medium hidden md:inline">Bagnold Scaling β ≈ 2.82×</span>
        </div>
        <h1 class="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span class="shiny-text">Planetary Analog Engine</span>
          <span class="text-[11px] px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-slate-300 font-medium">Global World Edition</span>
        </h1>
        <p class="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Cruzamento estatístico e morfometria comparativa em escala global entre análogos da Terra (Nordeste/Brasil e Mundiais) e feições planetárias de Marte (dunas) e da Lua (crateras).
        </p>
      </div>

      <!-- Telemetry Stats Pills -->
      <div class="flex items-center gap-3 relative z-10 flex-wrap sm:flex-nowrap">
        <div class="glass-subpanel px-3.5 py-2 rounded-xl text-right border-white/5 shadow-inner">
          <div class="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Análogos Mundiais</div>
          <div class="text-base md:text-lg font-bold font-mono text-emerald-400" id="total-sites-count">24 Sítios</div>
        </div>
        <div class="h-8 w-px bg-white/10 hidden sm:block"></div>
        <div class="glass-subpanel px-3.5 py-2 rounded-xl text-right border-white/5 shadow-inner">
          <div class="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Alvos Espaciais</div>
          <div class="text-base md:text-lg font-bold font-mono text-sky-400">17 Alvos (LOLA/HiRISE)</div>
        </div>
        <div class="h-8 w-px bg-white/10 hidden sm:block"></div>
        <button onclick="scrollToRectMap()" class="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
          <span>Explorar Mapa</span>
        </button>
      </div>
    </header>

    <!-- SECTION 0: INTERACTIVE 3D ROTATING GLOBE HERO -->
    <section class="glass-panel rounded-2xl p-5 md:p-6 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
      
      <!-- GLOBE CANVAS CONTAINER -->
      <div class="w-full lg:w-[480px] flex flex-col items-center justify-center relative select-none">
        <div class="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px]">
          <!-- Glow ambient aura behind globe -->
          <div class="absolute inset-4 rounded-full bg-sky-500/15 blur-2xl pointer-events-none"></div>
          <div class="absolute inset-8 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
          
          <canvas id="globe-canvas" width="400" height="400" class="relative z-10 w-full h-full cursor-grab active:cursor-grabbing block"></canvas>

          <!-- Interactive Tooltip on Globe Hover -->
          <div id="globe-tooltip" class="absolute pointer-events-none opacity-0 transition-opacity duration-150 glass-panel px-3 py-1.5 rounded-xl text-xs space-y-0.5 border-white/20 shadow-xl z-30">
            <div id="globe-tooltip-title" class="font-bold text-white text-xs">Localidade</div>
            <div id="globe-tooltip-sub" class="text-[10px] text-slate-300 font-mono">Coords</div>
          </div>
        </div>
        <div class="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Globo Interativo: Arraste para girar • Clique num análogo para inspecionar</span>
        </div>
      </div>

      <!-- GLOBE HERO COPY & QUICK TELEMETRY -->
      <div class="flex-1 space-y-4 relative z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <span>🌐</span>
          <span>Varredura Planetária Orbital Global</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
          Onde a Terra Encontra o Cosmos:<br/>
          <span class="text-emerald-400">Análogos Terrestres de Marte e da Lua</span>
        </h2>
        <p class="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
          A rotação do globo mapeia em tempo real os <strong>24 sítios de referência planetária</strong> da Terra. De campos de dunas hiperáridas no Nordeste brasileiro, Saara e Namíbia, a crateras de impacto preservadas no Canadá, Arizona, Índia e no Escudo Brasileiro.
        </p>

        <!-- Quick Summary Metrics -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div class="glass-subpanel p-3 rounded-xl border-white/5">
            <div class="text-[9px] font-mono text-slate-400 uppercase">Dunas (Marte)</div>
            <div class="text-base font-bold text-amber-400 font-mono">8 Campos</div>
            <div class="text-[10px] text-slate-500 font-mono">NE, Saara, Namíbia</div>
          </div>
          <div class="glass-subpanel p-3 rounded-xl border-white/5">
            <div class="text-[9px] font-mono text-slate-400 uppercase">Crateras (Lua)</div>
            <div class="text-base font-bold text-sky-400 font-mono">16 Sítios</div>
            <div class="text-[10px] text-slate-500 font-mono">Brasil, EUA, Canadá</div>
          </div>
          <div class="glass-subpanel p-3 rounded-xl border-white/5">
            <div class="text-[9px] font-mono text-slate-400 uppercase">Precisão DTM</div>
            <div class="text-base font-bold text-emerald-400 font-mono">4m a 60m</div>
            <div class="text-[10px] text-slate-500 font-mono">HiRISE / SLDEM</div>
          </div>
          <div class="glass-subpanel p-3 rounded-xl border-white/5">
            <div class="text-[9px] font-mono text-slate-400 uppercase">Normalização</div>
            <div class="text-base font-bold text-purple-400 font-mono">WED + Cos</div>
            <div class="text-[10px] text-slate-500 font-mono">Bagnold Physics</div>
          </div>
        </div>

        <div class="pt-2 flex items-center gap-3">
          <button onclick="scrollToRectMap()" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg">
            <span>🗺️ Desdobrar Mapa Retangular Completo</span>
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- SECTION 1: EXPANDED RECTANGULAR WORLD MAP CONSOLE -->
    <section id="rect-map-section" class="glass-panel rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Console Cartográfico de Cobertura Global (EPSG:4326)</span>
          </div>
          <h2 class="text-base md:text-lg font-bold text-white mt-0.5">Distribuição Mundial das Feições Terrestres Análogas</h2>
        </div>

        <!-- Transitions.dev Segmented Controls -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Viewport Mode -->
          <div class="inline-flex rounded-xl p-1 bg-space-950 border border-white/10 text-xs font-medium">
            <button onclick="setMapViewMode('mundo')" id="btn-view-mundo" class="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold shadow-xs transition-all duration-200 cursor-pointer">🌍 Mundo Inteiro</button>
            <button onclick="setMapViewMode('brasil')" id="btn-view-br" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all duration-200 cursor-pointer">🇧🇷 América do Sul / Brasil</button>
            <button onclick="setMapViewMode('nordeste')" id="btn-view-ne" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all duration-200 cursor-pointer">🗺️ Foco: Nordeste</button>
          </div>
          <!-- Feature Filter -->
          <div class="inline-flex rounded-xl p-1 bg-space-950 border border-white/10 text-xs font-medium">
            <button onclick="setMapFilter('all')" id="filter-all" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-white font-semibold shadow-xs transition-all cursor-pointer">Todos (24)</button>
            <button onclick="setMapFilter('dune')" id="filter-dune" class="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">🏜️ Dunas (8)</button>
            <button onclick="setMapFilter('crater')" id="filter-crater" class="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">🌑 Crateras (16)</button>
          </div>
        </div>
      </div>

      <!-- INTERACTIVE RECTANGULAR MAP CANVAS -->
      <div class="relative w-full rounded-xl overflow-hidden border border-white/10 bg-[#020617] shadow-inner select-none">
        
        <svg id="world-map-svg" viewBox="0 0 960 480" class="w-full h-auto max-h-[500px] block" onmousemove="handleMapHover(event)">
          <defs>
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0369a1" stop-opacity="0.18"/>
              <stop offset="100%" stop-color="#082f49" stop-opacity="0.05"/>
            </linearGradient>
            <filter id="glowDune" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#f97316" flood-opacity="0.95"/>
            </filter>
            <filter id="glowCrater" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#38bdf8" flood-opacity="0.95"/>
            </filter>
          </defs>

          <!-- Ocean background -->
          <rect x="0" y="0" width="960" height="480" fill="url(#oceanGrad)" />

          <!-- Dynamic Landmass Polygon Layer -->
          <g id="map-basemap-layer"></g>

          <!-- Cartographic Coordinate Grid -->
          <g id="map-grid-layer"></g>

          <!-- Region & Country Labels Layer -->
          <g id="map-labels-layer"></g>

          <!-- Targeting Radar Ring for Active Site -->
          <g id="map-reticle-layer"></g>

          <!-- Georeferenced Pins Layer -->
          <g id="map-pins-layer"></g>
        </svg>

        <!-- Dynamic HUD Tooltip on Pin Hover -->
        <div id="map-pin-tooltip" class="absolute pointer-events-none opacity-0 transition-opacity duration-150 glass-panel px-3 py-2 rounded-xl text-xs space-y-0.5 border-white/20 shadow-xl z-30">
          <div id="tooltip-title" class="font-bold text-white">Localidade</div>
          <div id="tooltip-sub" class="text-[10px] text-slate-300 font-mono">Coords</div>
        </div>

        <!-- Floating Map Legend -->
        <div class="absolute bottom-3 left-3 glass-panel rounded-xl p-3 text-xs space-y-1.5 border-white/10 shadow-lg pointer-events-auto">
          <div class="font-mono text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Legenda de Feições Mundiais</div>
          <div class="flex items-center gap-2 text-slate-300 text-[11px]">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/80"></span>
            <span><strong>Duna Terrestre</strong> ↔ Alvo Marciano (Bagnold Scaled 2.82×)</span>
          </div>
          <div class="flex items-center gap-2 text-slate-300 text-[11px]">
            <span class="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/80"></span>
            <span><strong>Cratera / Afloramento</strong> ↔ Alvo Lunar (LOLA / SLDEM)</span>
          </div>
        </div>

        <!-- Live Coordinate HUD (Mouse Position) -->
        <div class="absolute top-3 right-3 glass-panel rounded-lg px-3 py-1.5 text-[10px] font-mono text-slate-400 border-white/10 flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span id="map-coord-display">CRS: EPSG:4326 | WGS84 Global</span>
        </div>
      </div>
    </section>

    <!-- SECTION 2: SITE TELEMETRY DOCK (REACTBITS SPOTLIGHT) -->
    <section class="space-y-2">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Catálogo de Sítios Terrestres (24 Feições)</h2>
        <span class="text-[11px] text-slate-500 font-mono">Clique num análogo para exibir o comparativo ("No que é parecido" vs "No que NÃO é")</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5" id="site-selector">
        <!-- Rendered via JS -->
      </div>
    </section>

    <!-- SECTION 3: DEEP COMPARATIVE DIAGNOSTIC ("NO QUE É PARECIDO" vs "NO QUE NÃO É") -->
    <section class="space-y-4" id="comparison-card-section">
      
      <!-- SITE DETAILS & SCORE HEADER -->
      <div class="glass-panel rounded-2xl p-5 md:p-6 border border-white/10 shadow-2xl space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span id="badge-body" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider">
                Terra ↔ Lua
              </span>
              <span id="badge-cat" class="px-2.5 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-slate-300 font-mono">
                Cratera de Impacto
              </span>
              <span id="badge-region" class="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                Brasil
              </span>
            </div>
            <h3 id="pair-title" class="text-xl md:text-2xl font-bold text-white tracking-tight">Domo de Araguainha ↔ Censorinus</h3>
            <div id="site-coords" class="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span>📍 Lat: -16.800°, Lon: -52.980° (GO/MT, Brasil)</span>
            </div>
          </div>

          <!-- SCORE GAUGE CARD WITH REACTBITS BORDER BEAM -->
          <div class="border-beam-card min-w-[210px] shadow-2xl">
            <div class="border-beam-content p-4 text-right">
              <div class="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Score de Similaridade</div>
              <div id="score-display" class="text-3xl font-black font-mono text-emerald-400 tracking-tight my-0.5">0.6603</div>
              <div class="text-[10px] text-slate-400 font-mono" id="distance-display">WED: 0.842 | Cos: 0.941</div>
            </div>
          </div>
        </div>

        <section aria-labelledby="geo-context-title" class="p-4 md:p-5 rounded-xl border border-sky-500/20 bg-space-950/60 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h3 id="geo-context-title" class="text-sm font-bold text-sky-300">Sobre este local</h3>
            <span id="geo-context-status" class="text-xs text-slate-400"></span>
          </div>
          <p id="geo-context-summary" class="text-sm text-slate-300 leading-relaxed" aria-live="polite"></p>
          <dl id="geo-context-facts" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"></dl>
          <p id="geo-climate-period" class="text-xs text-slate-400 leading-relaxed"></p>
          <div id="geo-context-sources" class="text-xs text-slate-400 flex flex-wrap gap-2"></div>
        </section>

        <!-- DUAL DIAGNOSTIC CARDS: "NO QUE É PARECIDO" vs "NO QUE NÃO É PARECIDO" -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- POSITIVE CONVERGENCE CARD -->
          <div class="p-4 md:p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 relative overflow-hidden">
            <div class="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <span class="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs">✓</span>
              <span>No que É PARECIDO (Convergências Físicas)</span>
            </div>
            <div class="text-xs text-slate-300 space-y-2 leading-relaxed" id="similarities-content">
              <!-- Injected via JS -->
            </div>
          </div>

          <!-- NEGATIVE DIVERGENCE CARD -->
          <div class="p-4 md:p-5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3 relative overflow-hidden">
            <div class="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <span class="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs">✕</span>
              <span>No que NÃO É PARECIDO (Efeito do Ambiente Terrestre)</span>
            </div>
            <div class="text-xs text-slate-300 space-y-2 leading-relaxed" id="differences-content">
              <!-- Injected via JS -->
            </div>
          </div>

        </div>

      </div>

    </section>

    <!-- SECTION 4: GENERAL COMPARISONS STUDIO & GLOBAL BENCHMARK -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-6" id="general-comparisons-section">
      
      <!-- LEFT 8 COLS: SCIENTIFIC VISUALIZATIONS & METRICS -->
      <div class="lg:col-span-8 glass-panel rounded-2xl p-5 md:p-6 border border-white/10 shadow-2xl space-y-6">
        
        <!-- STUDIO TAB TOGGLE: 3 MODES (PROFILE vs BARS vs RADAR) -->
        <div class="space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="inline-flex rounded-xl p-1 bg-space-950 border border-white/10 text-xs font-medium">
              <button onclick="setStudioTab('profile')" id="tab-btn-profile" class="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold transition-all cursor-pointer">
                📈 Perfil Topográfico (DEM)
              </button>
              <button onclick="setStudioTab('bars')" id="tab-btn-bars" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">
                📊 Decomposição Morfométrica
              </button>
              <button onclick="setStudioTab('radar')" id="tab-btn-radar" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">
                🕸️ Radar Multidimensional
              </button>
            </div>
            <div class="flex items-center gap-3 text-xs font-mono">
              <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Sítio Terrestre</span>
              <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-sky-400" id="legend-planet-dot"></span> Alvo Planetário</span>
            </div>
          </div>

          <!-- TAB 1: INTERACTIVE TOPOGRAPHIC PROFILE -->
          <div id="studio-profile-view" class="bg-space-950 border border-white/10 rounded-xl p-4 space-y-2 shadow-inner">
            <div id="svg-container" class="w-full h-44 flex items-center justify-center"></div>
            <div class="flex flex-wrap justify-between items-center text-[10px] text-slate-400 px-1 border-t border-white/5 pt-2 font-mono">
              <span id="topo-left-label" class="text-emerald-400 font-semibold">Cota Borda: +180m</span>
              <span id="topo-center-label" class="text-slate-300">Diâmetro D = 14.3 km | Declividade P90 = 22.0°</span>
              <span id="topo-right-label" class="text-emerald-400 font-semibold">Profundidade: -250m</span>
            </div>
          </div>

          <!-- TAB 2: MULTI-BAR DECOMPOSITION STUDIO -->
          <div id="studio-bars-view" class="bg-space-950 border border-white/10 rounded-xl p-4 space-y-2.5 shadow-inner hidden">
            <div class="text-[11px] text-slate-400 font-mono mb-2 flex justify-between">
              <span>Morfometria Normalizada por Atributo</span>
              <span>Barra Superior: Terra | Barra Inferior: Alvo Planetário</span>
            </div>
            <div id="feature-bars-container" class="space-y-2"></div>
          </div>

          <!-- TAB 3: RADAR / SPIDER CHART STUDIO -->
          <div id="studio-radar-view" class="bg-space-950 border border-white/10 rounded-xl p-4 space-y-2 shadow-inner hidden">
            <div class="flex justify-between items-center text-[11px] text-slate-400 font-mono mb-1">
              <span>Impressão Digital Morfométrica (Comparação Radial)</span>
              <span class="text-emerald-400">Verde: Terra | Azul/Laranja: Alvo</span>
            </div>
            <div id="radar-svg-container" class="w-full h-56 flex items-center justify-center"></div>
          </div>
        </div>

        <!-- DETAILED METRICS TABLE -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Tabela Comparativa de Atributos Físicos</h4>
            <span class="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10" id="metrics-type-label">11 métricas contratuais</span>
          </div>
          <div class="overflow-x-auto rounded-xl border border-white/10 bg-space-950">
            <table class="w-full text-left text-xs">
              <thead class="bg-white/5 border-b border-white/10 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th class="p-3 font-semibold">Parâmetro Físico</th>
                  <th class="p-3 font-semibold text-emerald-400">Sítio Terrestre</th>
                  <th class="p-3 font-semibold text-sky-400" id="th-planet-name">Alvo Planetário</th>
                  <th class="p-3 font-semibold text-slate-400">Diferença (Δ)</th>
                  <th class="p-3 font-semibold text-right">Peso Contratual</th>
                </tr>
              </thead>
              <tbody id="metrics-table-body" class="divide-y divide-white/5 font-mono text-[11px]">
                <!-- Injected via JS -->
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- RIGHT 4 COLS: TOP MATCHES & ENGINE MATH -->
      <div class="lg:col-span-4 glass-panel rounded-2xl p-5 md:p-6 border border-white/10 shadow-2xl space-y-5">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-1 font-mono">Algoritmo Estatístico</span>
          <h3 class="text-base font-bold text-white">Ranking de Candidatos Planetários</h3>
          <p class="text-xs text-slate-400 mt-1">Classificação baseada em Distância Euclidiana Ponderada (WED) e Cosseno:</p>
        </div>

        <!-- TOP MATCHES LIST -->
        <div class="space-y-2.5" id="top-matches-list">
          <!-- Injected via JS -->
        </div>

        <!-- FORMULA BREAKDOWN CARD -->
        <div class="p-4 rounded-xl bg-space-950 border border-white/10 text-xs space-y-3 font-mono">
          <div class="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            <span>Formulação do Cruzamento de Dados</span>
          </div>
          <div class="text-[11px] text-slate-300 space-y-1">
            <div class="text-slate-400">Distância Euclidiana Ponderada:</div>
            <div class="text-sky-300 bg-white/5 p-1.5 rounded text-[10px]">WED = √( Σ wᵢ · ( xᵢ - yᵢ )² )</div>
          </div>
          <div class="text-[11px] text-slate-300 space-y-1">
            <div class="text-slate-400">Escalonamento de Bagnold (Dunas Marte):</div>
            <div class="text-amber-300 bg-white/5 p-1.5 rounded text-[10px]">λ_Marte = 2.82 × λ_Terra</div>
          </div>
          <div class="text-[11px] text-slate-300 space-y-1">
            <div class="text-slate-400">Score Híbrido Final:</div>
            <div class="text-emerald-300 bg-white/5 p-1.5 rounded text-[10px]">S = 0.60·e^(-2.2·WED) + 0.40·cos(θ)</div>
          </div>
        </div>

      </div>

    </section>

    <!-- SECTION 5: INGESTION CONSOLE & PARAMETER SANDBOX -->
    <section id="form-section" class="glass-panel rounded-2xl p-5 md:p-6 border border-white/10 shadow-2xl space-y-5 relative overflow-hidden">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Módulo de Ingestão e Cruzamento</span>
          </div>
          <h3 class="text-base md:text-lg font-bold text-white mt-0.5">Adicionar Nova Localidade ao Motor</h3>
          <p class="text-xs text-slate-400">Insira coordenadas e parâmetros morfométricos para calcular a similaridade instantaneamente.</p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <div class="inline-flex rounded-xl p-1 bg-space-950 border border-white/10 text-xs font-medium">
            <button onclick="setFormType('crater')" id="btn-form-crater" class="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold transition-all cursor-pointer">
              🌑 Cratera (11 métricas)
            </button>
            <button onclick="setFormType('dune')" id="btn-form-dune" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">
              🏜️ Duna (7 métricas)
            </button>
          </div>
        </div>
      </div>

      <!-- PRESET CHIPS -->
      <div class="space-y-1.5 relative z-10">
        <label class="block text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Preenchimento Rápido com Presets Validados:</label>
        <div class="flex flex-wrap gap-2">
          <button onclick="fillPreset('barringer')" class="px-3 py-1.5 rounded-lg text-xs font-mono bg-space-950 border border-white/10 hover:border-sky-500/50 text-sky-300 transition-all cursor-pointer">
            🌑 Barringer Meteor Crater (EUA)
          </button>
          <button onclick="fillPreset('santa_marta')" class="px-3 py-1.5 rounded-lg text-xs font-mono bg-space-950 border border-white/10 hover:border-sky-500/50 text-sky-300 transition-all cursor-pointer">
            🌑 Cratera de Santa Marta (PI)
          </button>
          <button onclick="fillPreset('erg_chebbi')" class="px-3 py-1.5 rounded-lg text-xs font-mono bg-space-950 border border-white/10 hover:border-amber-500/50 text-amber-300 transition-all cursor-pointer">
            🏜️ Erg Chebbi / Saara (Marrocos)
          </button>
          <button onclick="fillPreset('sossusvlei')" class="px-3 py-1.5 rounded-lg text-xs font-mono bg-space-950 border border-white/10 hover:border-amber-500/50 text-amber-300 transition-all cursor-pointer">
            🏜️ Sossusvlei (Namíbia)
          </button>
          <button onclick="fillPreset('shackleton_analog')" class="px-3 py-1.5 rounded-lg text-xs font-mono bg-space-950 border border-white/10 hover:border-emerald-500/50 text-emerald-300 transition-all cursor-pointer">
            🌑 Análogo Polar Shackleton
          </button>
        </div>
      </div>

      <!-- BASIC GEO FIELDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Nome da Localidade</label>
          <input type="text" id="input-name" placeholder="Ex: Cratera de Colônia" class="glass-input w-full rounded-xl px-3.5 py-2 text-xs text-white" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">País / UF</label>
          <input type="text" id="input-uf" placeholder="Ex: Brasil / CE, EUA / AZ" class="glass-input w-full rounded-xl px-3.5 py-2 text-xs text-white uppercase font-mono" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Latitude (Graus Decimais)</label>
          <input type="number" step="0.0001" id="input-lat" placeholder="Ex: 35.027" class="glass-input w-full rounded-xl px-3.5 py-2 text-xs text-white font-mono" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Longitude (Graus Decimais)</label>
          <input type="number" step="0.0001" id="input-lon" placeholder="Ex: -111.022" class="glass-input w-full rounded-xl px-3.5 py-2 text-xs text-white font-mono" />
        </div>
      </div>

      <!-- 11 CONTRACTUAL CRATER FIELDS -->
      <div id="crater-form-fields" class="space-y-4 relative z-10">
        <div class="text-xs font-bold uppercase tracking-wider text-sky-400 border-b border-white/10 pb-1 font-mono">
          11 Parâmetros Morfométricos Oficiais de Crateras
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">diametro_m (Diâmetro)</label>
            <input type="number" id="c-diametro_m" placeholder="Ex: 3640" oninput="autoCalcCraterRatios()" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">profundidade_m (Piso à Borda)</label>
            <input type="number" id="c-profundidade_m" placeholder="Ex: 260" oninput="autoCalcCraterRatios()" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">razao_dD (Profundidade / Diâmetro)</label>
            <input type="number" step="0.0001" id="c-razao_dD" placeholder="Auto calculado" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-slate-300 font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">altura_borda_m (Borda ao Entorno)</label>
            <input type="number" id="c-altura_borda_m" placeholder="Ex: 115" oninput="autoCalcCraterRatios()" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">razao_borda_D (Borda / Diâmetro)</label>
            <input type="number" step="0.0001" id="c-razao_borda_D" placeholder="Auto calculado" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-slate-300 font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">borda_variacao_m (Variação da Borda)</label>
            <input type="number" step="0.1" id="c-borda_variacao_m" placeholder="Ex: 48.5" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">borda_raio_cv (CV Raio da Borda)</label>
            <input type="number" step="0.001" id="c-borda_raio_cv" placeholder="Ex: 0.021" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">declividade_parede_media (°)</label>
            <input type="number" step="0.1" id="c-declividade_parede_media" placeholder="Ex: 18.2" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">declividade_parede_p90 (°)</label>
            <input type="number" step="0.1" id="c-declividade_parede_p90" placeholder="Ex: 26.5" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">circularidade (4πA/P²)</label>
            <input type="number" step="0.001" id="c-circularidade" placeholder="Ex: 0.962" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">coerencia_borda (Fração 72 rad)</label>
            <input type="number" step="0.001" id="c-coerencia_borda" placeholder="Ex: 0.930" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
        </div>
      </div>

      <!-- 7 CONTRACTUAL DUNE FIELDS -->
      <div id="dune-form-fields" class="space-y-4 relative z-10 hidden">
        <div class="text-xs font-bold uppercase tracking-wider text-amber-500 border-b border-white/10 pb-1 font-mono">
          7 Parâmetros Morfométricos de Campos de Dunas
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">altura_media (m)</label>
            <input type="number" step="0.1" id="d-altura_media" placeholder="Ex: 7.8" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">altura_p90 (m)</label>
            <input type="number" step="0.1" id="d-altura_p90" placeholder="Ex: 13.4" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">comprimento_onda λ (m)</label>
            <input type="number" step="1" id="d-comprimento_onda" placeholder="Ex: 310" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">orientacao_azimute (°)</label>
            <input type="number" step="1" id="d-orientacao_azimute" placeholder="Ex: 168" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">densidade_dunas (cristas/km²)</label>
            <input type="number" step="0.1" id="d-densidade_dunas" placeholder="Ex: 4.8" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">espacamento_medio (m)</label>
            <input type="number" step="1" id="d-espacamento_medio" placeholder="Ex: 350" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">indice_aridez</label>
            <input type="number" step="0.01" id="d-indice_aridez" placeholder="Ex: 0.38" class="glass-input w-full rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
        </div>
      </div>

      <!-- SUBMISSION BAR -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10 relative z-10">
        <span class="text-xs text-slate-400 font-mono">Recálculo automático e atualização em tempo real sem recarregar a página.</span>
        <div class="flex items-center gap-3">
          <button onclick="exportCurrentSiteJson()" class="px-4 py-2.5 rounded-xl text-xs font-semibold glass-panel border-white/10 hover:border-emerald-500/50 transition-all text-slate-200 active:scale-95 cursor-pointer">
            💾 Copiar JSON do Sítio
          </button>
          <button onclick="addNewSiteFromForm()" class="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer">
            <span>🚀 Executar Cruzamento de Dados</span>
          </button>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="text-center py-4 text-xs font-mono text-slate-500 border-t border-white/5">
      NASA Space Apps Challenge • Planetary Analog Engine • Algoritmo Estatístico Ponderado com Escalonamento de Bagnold
    </footer>

  </div>

  <script>
    // =========================================================================
    // DADOS DE REFERÊNCIA OFICIAIS (LUA & MARTE) COM DADOS DOS TIFFS
    // =========================================================================
    const MOON_CRATER_REFERENCES = [
      { id: "shackleton", name: "Shackleton (Polo Sul - Artemis)", diameter_m: 20924, depth_m: 3970.8, depth_diameter_ratio: 0.1898, rim_height_m: 1312.9, rim_height_diameter_ratio: 0.0627, rim_variation_m: 660.8, rim_radius_cv: 0.019, mean_wall_slope: 30.3, wall_slope_p90: 33.6, circularity: 0.994, rim_coherence: 0.972 },
      { id: "cabeus", name: "Cabeus (Polo Sul - LCROSS)", diameter_m: 100600, depth_m: 3751.8, depth_diameter_ratio: 0.0373, rim_height_m: 484.8, rim_height_diameter_ratio: 0.0048, rim_variation_m: 1633.6, rim_radius_cv: 0.035, mean_wall_slope: 12.4, wall_slope_p90: 35.0, circularity: 0.940, rim_coherence: 0.880 },
      { id: "copernicus", name: "Copernicus (Cratera Complexa)", diameter_m: 96100, depth_m: 3525.2, depth_diameter_ratio: 0.0367, rim_height_m: 759.2, rim_height_diameter_ratio: 0.0079, rim_variation_m: 235.0, rim_radius_cv: 0.035, mean_wall_slope: 13.7, wall_slope_p90: 29.3, circularity: 0.940, rim_coherence: 0.880 },
      { id: "tycho", name: "Tycho (Cratera com Raios de Ejecta)", diameter_m: 85300, depth_m: 4348.0, depth_diameter_ratio: 0.0510, rim_height_m: 657.5, rim_height_diameter_ratio: 0.0077, rim_variation_m: 470.0, rim_radius_cv: 0.035, mean_wall_slope: 15.3, wall_slope_p90: 31.1, circularity: 0.940, rim_coherence: 0.880 },
      { id: "de_gerlache", name: "De Gerlache (Polo Sul)", diameter_m: 32612, depth_m: 2797.3, depth_diameter_ratio: 0.0858, rim_height_m: 688.5, rim_height_diameter_ratio: 0.0211, rim_variation_m: 589.4, rim_radius_cv: 0.016, mean_wall_slope: 21.0, wall_slope_p90: 25.0, circularity: 0.992, rim_coherence: 0.917 },
      { id: "censorinus", name: "Censorinus (Cratera Simples)", diameter_m: 4139, depth_m: 984.0, depth_diameter_ratio: 0.2378, rim_height_m: 298.2, rim_height_diameter_ratio: 0.0720, rim_variation_m: 121.2, rim_radius_cv: 0.012, mean_wall_slope: 36.8, wall_slope_p90: 41.9, circularity: 0.998, rim_coherence: 1.000 },
      { id: "bessel", name: "Bessel (Mare Serenitatis)", diameter_m: 15311, depth_m: 1747.6, depth_diameter_ratio: 0.1141, rim_height_m: 427.3, rim_height_diameter_ratio: 0.0279, rim_variation_m: 255.3, rim_radius_cv: 0.009, mean_wall_slope: 25.9, wall_slope_p90: 35.1, circularity: 0.997, rim_coherence: 1.000 },
      { id: "alfraganus", name: "Alfraganus", diameter_m: 20591, depth_m: 3500.6, depth_diameter_ratio: 0.1700, rim_height_m: 935.2, rim_height_diameter_ratio: 0.0454, rim_variation_m: 584.6, rim_radius_cv: 0.013, mean_wall_slope: 31.6, wall_slope_p90: 34.9, circularity: 0.996, rim_coherence: 1.000 },
      { id: "aristarchus", name: "Aristarchus (Cratera Complexa)", diameter_m: 40481, depth_m: 3109.0, depth_diameter_ratio: 0.0768, rim_height_m: 837.6, rim_height_diameter_ratio: 0.0207, rim_variation_m: 577.5, rim_radius_cv: 0.011, mean_wall_slope: 17.5, wall_slope_p90: 29.3, circularity: 0.994, rim_coherence: 0.944 }
    ];

    const MARS_DUNE_REFERENCES = [
      { id: "namib_dune_gale", name: "Namib Dune (Gale Crater)", mean_height: 5.0, height_p90: 8.0, wavelength: 85.0, crest_azimuth: 170.0, dune_density: 8.5, mean_spacing: 90.0, aridity_index: 0.0 },
      { id: "bagnold_dunes_gale", name: "Bagnold Dunes Field (MSL)", mean_height: 6.5, height_p90: 12.0, wavelength: 90.0, crest_azimuth: 165.0, dune_density: 11.0, mean_spacing: 95.0, aridity_index: 0.0 },
      { id: "nili_patera", name: "Nili Patera Dune Field", mean_height: 22.4, height_p90: 31.0, wavelength: 120.0, crest_azimuth: 155.0, dune_density: 7.0, mean_spacing: 130.0, aridity_index: 0.0 },
      { id: "proctor_crater", name: "Proctor Crater Dunes", mean_height: 15.0, height_p90: 26.0, wavelength: 180.0, crest_azimuth: 140.0, dune_density: 4.5, mean_spacing: 190.0, aridity_index: 0.0 },
      { id: "olympia_undae", name: "Olympia Undae (Erg Polar Norte)", mean_height: 12.0, height_p90: 18.0, wavelength: 120.0, crest_azimuth: 85.0, dune_density: 14.5, mean_spacing: 125.0, aridity_index: 0.0 },
      { id: "kaiser_crater", name: "Kaiser Crater (Megadunas)", mean_height: 25.0, height_p90: 38.0, wavelength: 180.0, crest_azimuth: 135.0, dune_density: 6.0, mean_spacing: 190.0, aridity_index: 0.0 },
      { id: "hellespontus", name: "Hellespontus (Dunas Barcanoides)", mean_height: 16.0, height_p90: 24.0, wavelength: 140.0, crest_azimuth: 150.0, dune_density: 8.0, mean_spacing: 145.0, aridity_index: 0.0 }
    ];

    // =========================================================================
    // BANCO DE DADOS DOS SÍTIOS TERRESTRES (24 ANÁLOGOS GLOBAIS)
    // =========================================================================
    let SITES_DATA = [
      {
        id: "jericoacoara",
        name: "Jericoacoara",
        uf: "CE, Brasil",
        category: "Campo de Dunas Barcanas",
        type: "dune",
        body: "mars",
        lat: -2.825,
        lon: -40.490,
        metrics: { mean_height: 6.0, height_p90: 10.7, wavelength: 297, crest_azimuth: 173, dune_density: 3.99, mean_spacing: 392, aridity_index: 0.468 },
        similarities: [
          "Morfologia clássica de dunas barcanas em crescente com face de deslizamento nítida (slip face).",
          "Comprimento de onda médio (297m) converge perfeitamente para as dunas de Gale (~100m) aplicando a escala de Bagnold β ≈ 2.82×.",
          "Migração ativa induzida por regime eólico unidirecional constante (ventos alísios)."
        ],
        differences: [
          "Gravidade terrestre (1.0g) limita a altura das dunas a ~10m, enquanto em Marte (0.38g) atingem mais de 25m.",
          "Presença de lagoas interdunares e umidade freática, inexistentes na superfície atual de Marte.",
          "Areia quartzosa limpa com alta reflexão solar vs grãos basálticos escuros ricos em piroxênio/olivinass em Marte."
        ]
      },
      {
        id: "lencois",
        name: "Lençóis Maranhenses",
        uf: "MA, Brasil",
        category: "Campo de Dunas Barcanoides",
        type: "dune",
        body: "mars",
        lat: -2.600,
        lon: -43.000,
        metrics: { mean_height: 6.3, height_p90: 11.0, wavelength: 312, crest_azimuth: 161, dune_density: 6.58, mean_spacing: 367, aridity_index: 0.764 },
        similarities: [
          "Padrão regular de cristas contínuas barcanoides transversais semelhante a Nili Patera.",
          "Densidade espacial de cristas de ~6.5/km², alta periodicidade geométrica.",
          "Razão de aspecto crista/espaçamento altamente convergente após escalonamento gravitacional."
        ],
        differences: [
          "Regime hidrológico com precipitação pluviométrica sazonal superior a 1500mm/ano.",
          "Estabilização pontual por biofilmes e vegetação de restinga nas margens do campo.",
          "Atmosfera terrestre densa (1013 mbar) com transporte saliente muito mais contínuo que em Marte (6 mbar)."
        ]
      },
      {
        id: "rosado",
        name: "Dunas do Rosado",
        uf: "RN, Brasil",
        category: "Campo de Dunas Transversais",
        type: "dune",
        body: "mars",
        lat: -5.030,
        lon: -36.845,
        metrics: { mean_height: 6.3, height_p90: 11.7, wavelength: 335, crest_azimuth: 167, dune_density: 4.79, mean_spacing: 377, aridity_index: 0.322 },
        similarities: [
          "Coloração avermelhada/rosada marcante decorrente de recobrimento por óxidos de ferro (hematita/goethita), idêntica ao espectro de areias marcianas.",
          "Azimute de cristas coerente (167°) com cristas transversais de Gale Crater.",
          "Baixo índice de umidade e alta mobilidade eólica em semiárido costeiro."
        ],
        differences: [
          "Matriz mineralógica de quartzo recoberto por argilas ferruginosas vs areia máfica basáltica marciana.",
          "Ventos costeiros de brisa marítima diária vs tempestades planetárias sazonais de poeira em Marte.",
          "Camada limite atmosférica mais espessa na Terra."
        ]
      },
      {
        id: "ibiraba",
        name: "Dunas de Ibiraba (S. Francisco)",
        uf: "BA, Brasil",
        category: "Campo de Dunas Fósseis",
        type: "dune",
        body: "mars",
        lat: -10.710,
        lon: -42.800,
        metrics: { mean_height: 6.7, height_p90: 13.1, wavelength: 345, crest_azimuth: 115, dune_density: 4.56, mean_spacing: 488, aridity_index: 0.237 },
        similarities: [
          "Dunas paleoeólicas com cristas degradadas, análogas aos campos de dunas fósseis e litificados em crateras antigas de Marte.",
          "Índice de aridez baixo (0.237), em pleno sertão semiárido da Caatinga.",
          "Espaçamento amplo entre cristas de quase 500m."
        ],
        differences: [
          "Cobertura esparsa de vegetação xerofítica (Caatinga) que retém o avanço ativo da areia.",
          "Interação fluvial antiga com o paleocanal do Rio São Francisco.",
          "Ausência de gelo sazonal de CO2 que atua nas dunas marcianas de altas latitudes."
        ]
      },
      {
        id: "erg_chebbi",
        name: "Erg Chebbi (Saara)",
        uf: "Marrocos",
        category: "Mega-Erg de Dunas Estrela",
        type: "dune",
        body: "mars",
        lat: 31.150,
        lon: -3.983,
        metrics: { mean_height: 28.0, height_p90: 45.0, wavelength: 420, crest_azimuth: 145, dune_density: 2.10, mean_spacing: 520, aridity_index: 0.040 },
        similarities: [
          "Hiperaridez extrema e altura monumental (até 45m), compatível com as megadunas de Proctor e Kaiser em Marte.",
          "Ausência quase total de vegetação e substrato rochoso desértico circundante.",
          "Rupturas de crista multidirecionais associadas a ventos sazonais variáveis."
        ],
        differences: [
          "Pressão atmosférica terrestre sustenta saltamento contínuo em velocidades de vento moderadas (15 km/h) vs >80 km/h necessários em Marte.",
          "Temperatura superficial diurna atinge +45°C vs temperaturas médias negativas marcianas (-60°C).",
          "Origem sedimentar em bacia intracontinental terrestre."
        ]
      },
      {
        id: "sossusvlei",
        name: "Sossusvlei (Deserto do Namibe)",
        uf: "Namíbia",
        category: "Megadunas Lineares e Barcanoides",
        type: "dune",
        body: "mars",
        lat: -24.727,
        lon: 15.340,
        metrics: { mean_height: 35.0, height_p90: 58.0, wavelength: 510, crest_azimuth: 155, dune_density: 1.80, mean_spacing: 620, aridity_index: 0.020 },
        similarities: [
          "Uma das maiores altitudes de dunas da Terra, convergente com as megadunas basálticas de Marte.",
          "Intensa oxidação ferrosa com coloração vermelho-tijolo profunda idêntica ao regolito marciano.",
          "Superfície plana interdunar de sal e argila (vlei) semelhante aos leitos evaporíticos de Marte."
        ],
        differences: [
          "Nevoeiro costeiro matinal frequente (neblina de advecção do Atlântico).",
          "Idade geológica extremamente antiga com estabilização estrutural profunda.",
          "Gravidade 1.0g impede a formação de ondulações de vento de escala métrica (TARs)."
        ]
      },
      {
        id: "rub_al_khali",
        name: "Rub' al Khali (Quarto Vazio)",
        uf: "Arábia Saudita",
        category: "Mar Contínuo de Areia (Erg Global)",
        type: "dune",
        body: "mars",
        lat: 20.000,
        lon: 50.000,
        metrics: { mean_height: 22.0, height_p90: 36.0, wavelength: 380, crest_azimuth: 80, dune_density: 3.20, mean_spacing: 410, aridity_index: 0.015 },
        similarities: [
          "Maior mar de areia contínuo da Terra, melhor análogo para Olympia Undae (o mar circumpolar de Marte).",
          "Uniformidade estatística e periodicidade geométrica de alta coerência espacial.",
          "Condições hiperáridas sem interferência biogênica superficial."
        ],
        differences: [
          "Em Olympia Undae (Marte), as dunas interagem sazonalmente com calotas de gelo seco (dióxido de carbono).",
          "Ventos terrestres contínuos monçônicos vs tempestades de poeira globais em Marte.",
          "Inexistência de sublimação criogênica no deserto arábico."
        ]
      },
      {
        id: "white_sands",
        name: "White Sands",
        uf: "Novo México, EUA",
        category: "Campo de Dunas de Gesso Ativo",
        type: "dune",
        body: "mars",
        lat: 32.780,
        lon: -106.320,
        metrics: { mean_height: 8.5, height_p90: 14.0, wavelength: 260, crest_azimuth: 65, dune_density: 5.80, mean_spacing: 310, aridity_index: 0.180 },
        similarities: [
          "Composição mineralógica rara de gesso hidratado (sulfato de cálcio), idêntica aos depósitos de sulfatos descobertos pelo rover Opportunity e OMEGA em Marte.",
          "Morfometria de dunas barcanas ativas que migram sobre leito evaporítico plano.",
          "Análogo preferencial da NASA para calibração de espectrometria mineral de sulfatos."
        ],
        differences: [
          "Presença de água líquida freática a menos de 1 metro de profundidade que cimenta a base das dunas.",
          "Albedo óptico extremamente alto (branco puro) contrastando com as dunas escuras basálticas marcianas.",
          "Ciclos de dissolução e recristalização por orvalho diário."
        ]
      },
      {
        id: "canion_apertados",
        name: "Cânion dos Apertados (Currais Novos)",
        uf: "RN, Brasil",
        category: "Garganta e Afloramento Íngreme",
        type: "crater",
        body: "moon",
        lat: -6.342,
        lon: -36.502,
        metrics: { diameter_m: 2548, depth_m: 185.0, depth_diameter_ratio: 0.0726, rim_height_m: 65.0, rim_height_diameter_ratio: 0.0255, rim_variation_m: 82.0, rim_radius_cv: 0.042, mean_wall_slope: 16.8, wall_slope_p90: 28.4, circularity: 0.880, rim_coherence: 0.850 },
        similarities: [
          "Declividade de parede acentuada (P90 = 28.4°), muito próxima da inclinação das paredes internas de Censorinus e Shackleton.",
          "Afloramentos rochosos graníticos e quartzíticos expostos com fraturamento em bloco.",
          "Perfil topográfico transversal em 'V' íngreme análogo a bordas de crateras jovens."
        ],
        differences: [
          "Origem erosiva fluvial (escavado pelo Rio Picuí) e não impacto meteorítico hiperveloz.",
          "Morfologia longitudinal alongada e não circular.",
          "Intensa fragmentação mecânica associada ao clima semiárido terrestre."
        ]
      },
      {
        id: "vale_vulcanico",
        name: "Vale Vulcânico (Cerro Corá)",
        uf: "RN, Brasil",
        category: "Estrutura Vulcânica Circular",
        type: "crater",
        body: "moon",
        lat: -6.081,
        lon: -36.403,
        metrics: { diameter_m: 2585, depth_m: 210.0, depth_diameter_ratio: 0.0812, rim_height_m: 78.0, rim_height_diameter_ratio: 0.0301, rim_variation_m: 95.0, rim_radius_cv: 0.035, mean_wall_slope: 18.2, wall_slope_p90: 31.0, circularity: 0.895, rim_coherence: 0.880 },
        similarities: [
          "Geometria semicircular bem definida com soerguimento perimetral de borda.",
          "Declividade de parede alta (31° no P90) análoga a crateras de transição simples-complexa.",
          "Litologia basáltica correlacionada aos basaltos dos mares lunares (Mare Serenitatis)."
        ],
        differences: [
          "Gênese magmática vulcanotectônica terciária (Formação Macau) e não colisão cinética de asteroides.",
          "Inexistência de brechas de impacto (impactitos) ou minerais de choque (stishovita/coesita).",
          "Erosão diferencial intempérica pronunciada."
        ]
      },
      {
        id: "pico_cabugi",
        name: "Pico do Cabugi",
        uf: "RN, Brasil",
        category: "Plug Vulcânico Cônico",
        type: "crater",
        body: "moon",
        lat: -5.710,
        lon: -36.320,
        metrics: { diameter_m: 1250, depth_m: 195.0, depth_diameter_ratio: 0.1560, rim_height_m: 140.0, rim_height_diameter_ratio: 0.1120, rim_variation_m: 62.0, rim_radius_cv: 0.029, mean_wall_slope: 24.5, wall_slope_p90: 38.2, circularity: 0.925, rim_coherence: 0.910 },
        similarities: [
          "Declividade extrema (P90 = 38.2°), compatível com as paredes mais íngremes da cratera Shackleton (36-41°).",
          "Geometria circular cônica com contraste topográfico agudo em relação ao terreno circundante.",
          "Constituído por álcali-basaltos de afinidade mantle-derived semelhantes ao regolito lunar."
        ],
        differences: [
          "Topografia positiva (elevação em relevo residual) vs cratera de impacto que é uma depressão escavada.",
          "Depósito de talus de encosta terrestre com deslizamento gravitacional ativo.",
          "Estrutura de conduto vulcânico desmantelado pela erosão."
        ]
      },
      {
        id: "pedra_cariri",
        name: "Pedra Cariri (Geopark Araripe)",
        uf: "CE, Brasil",
        category: "Depressão e Afloramento Estrutural",
        type: "crater",
        body: "moon",
        lat: -7.090,
        lon: -39.700,
        metrics: { diameter_m: 3120, depth_m: 140.0, depth_diameter_ratio: 0.0448, rim_height_m: 55.0, rim_height_diameter_ratio: 0.0176, rim_variation_m: 70.0, rim_radius_cv: 0.048, mean_wall_slope: 14.1, wall_slope_p90: 23.5, circularity: 0.875, rim_coherence: 0.840 },
        similarities: [
          "Presença de escarpamentos íngremes com quebra de declive súbita típica de bordas de colapso.",
          "Razão de aspecto e circularidade aproximada correlata a crateras lunares erodidas.",
          "Sedimentologia estratificada comparável a camadas de ejeção em crateras da Lua."
        ],
        differences: [
          "Origem sedimentar lacustre e marinha em bacia do rifte cretáceo do Araripe.",
          "Riquíssimo conteúdo fóssil fóssil terrestre (ictiofauna e pterossauros), ausente no espaço.",
          "Erosão laminar por águas superficiais."
        ]
      },
      {
        id: "morro_chapeu",
        name: "Morro do Chapéu (Tanque / Pedreira)",
        uf: "BA, Brasil",
        category: "Platô Sedimentar Circular",
        type: "crater",
        body: "moon",
        lat: -11.550,
        lon: -41.200,
        metrics: { diameter_m: 4800, depth_m: 175.0, depth_diameter_ratio: 0.0365, rim_height_m: 90.0, rim_height_diameter_ratio: 0.0187, rim_variation_m: 85.0, rim_radius_cv: 0.052, mean_wall_slope: 15.3, wall_slope_p90: 25.1, circularity: 0.890, rim_coherence: 0.860 },
        similarities: [
          "Estrutura circular de grande diâmetro com piso interno aplainado e bordas tabulares.",
          "Morfometria de diâmetro (4.8 km) análoga a crateras de transição como Censorinus.",
          "Afloramentos quartzíticos de alta dureza resistentes à intempérie."
        ],
        differences: [
          "Relevo do tipo mesa/inselberg residual cárstico e sedimentar da Chapada Diamantina.",
          "Inexistência de cones de estilhaçamento (shatter cones) ou feições de choque.",
          "Idade proterozoica de sedimentação sem choque meteórico comprovado."
        ]
      },
      {
        id: "serra_cangalha",
        name: "Serra da Cangalha",
        uf: "TO/MA, Brasil",
        category: "Cratera de Impacto Complexa",
        type: "crater",
        body: "moon",
        lat: -8.083,
        lon: -46.867,
        metrics: { diameter_m: 14337, depth_m: 250.0, depth_diameter_ratio: 0.0174, rim_height_m: 180.0, rim_height_diameter_ratio: 0.0125, rim_variation_m: 140.5, rim_radius_cv: 0.038, mean_wall_slope: 12.4, wall_slope_p90: 22.0, circularity: 0.942, rim_coherence: 0.910 },
        similarities: [
          "Cratera de impacto meteorítico comprovada com soerguimento central (central peak) e anel interno idêntico a crateras complexas lunares como Tycho e Copernicus.",
          "Presença confirmada de cones de estilhaçamento (shatter cones) e quartzo com deformação planar (PDFs).",
          "Alta circularidade (0.942) preservada na estrutura estrutural subterrânea."
        ],
        differences: [
          "Bordas erodidas por centenas de milhões de anos de chuvas tropicais na Bacia do Parnaíba.",
          "Profundidade original significativamente assoreada por sedimentos cenozóicos.",
          "Revestimento por cobertura vegetal de Cerrado."
        ]
      },
      {
        id: "riachao",
        name: "Anel de Riachão",
        uf: "MA, Brasil",
        category: "Cratera de Impacto Simples",
        type: "crater",
        body: "moon",
        lat: -7.717,
        lon: -46.650,
        metrics: { diameter_m: 4100, depth_m: 120.0, depth_diameter_ratio: 0.0293, rim_height_m: 60.0, rim_height_diameter_ratio: 0.0146, rim_variation_m: 65.0, rim_radius_cv: 0.030, mean_wall_slope: 11.8, wall_slope_p90: 19.5, circularity: 0.955, rim_coherence: 0.920 },
        similarities: [
          "Estrutura de impacto comprovada de morfologia circular quase perfeita (circularidade = 0.955).",
          "Diâmetro de 4.1 km perfeitamente comparável a crateras lunares simples como Censorinus (4.13 km).",
          "Brechas de impacto e arenitos deformados expostos na crista."
        ],
        differences: [
          "Piso preenchido por sedimentos coluviais e aluviais com perda da bacia profunda original.",
          "Ausência de raios de ejecta brilhantes externos (destruídos pela erosão eólica/hídrica na Terra).",
          "Menor contraste de elevação em relação ao terreno circundante."
        ]
      },
      {
        id: "araguainha",
        name: "Domo de Araguainha",
        uf: "GO/MT, Brasil",
        category: "Cratera de Impacto Multianelar",
        type: "crater",
        body: "moon",
        lat: -16.783,
        lon: -52.983,
        metrics: { diameter_m: 41277, depth_m: 160.2, depth_diameter_ratio: 0.0039, rim_height_m: 49.1, rim_height_diameter_ratio: 0.0012, rim_variation_m: 292.3, rim_radius_cv: 0.076, mean_wall_slope: 4.5, wall_slope_p90: 8.7, circularity: 0.866, rim_coherence: 0.828 },
        similarities: [
          "Maior estrutura de impacto da América do Sul (41.3 km), análogo de crateras de grande porte e bacias de impacto lunares como Aristarchus e Cabeus.",
          "Núcleo central soerguido granítico com feições extremas de metamorfismo de choque (impact melts).",
          "Padrão multianelar concêntrico com falhas normais periféricas idêntico ao colapso de bacias lunares."
        ],
        differences: [
          "O Rio Araguaia e seus afluentes cortam transversalmente a cratera, erodindo o relevo original.",
          "Idade de ~254 milhões de anos com histórico severo de intemperismo químico úmido.",
          "A profundidade topográfica atual é modesta (~160m) devido ao arrasamento erosivo regional."
        ]
      },
      {
        id: "vargeao",
        name: "Domo de Vargeão",
        uf: "SC, Brasil",
        category: "Cratera de Impacto em Basalto",
        type: "crater",
        body: "moon",
        lat: -26.833,
        lon: -52.117,
        metrics: { diameter_m: 12400, depth_m: 220.0, depth_diameter_ratio: 0.0177, rim_height_m: 150.0, rim_height_diameter_ratio: 0.0121, rim_variation_m: 110.0, rim_radius_cv: 0.041, mean_wall_slope: 13.5, wall_slope_p90: 24.2, circularity: 0.938, rim_coherence: 0.905 },
        similarities: [
          "Impacto em derrames basálticos da Formação Serra Geral, análogo direto para impactos nos mares basálticos da Lua (Mare Serenitatis/Imbrium).",
          "Estrutura complexa com anel de colapso circular bem preservado no relevo de Santa Catarina.",
          "Presença de pseudotaquilitos e vidro de impacto (impact glass)."
        ],
        differences: [
          "Clima subtropical úmido com densa Mata Atlântica e solos agrícolas sobrepostos.",
          "Fracionamento em espinha de peixe decorrente de juntas de resfriamento do basalto terrestre.",
          "Erosão de encosta vigorosa."
        ]
      },
      {
        id: "vista_alegre",
        name: "Cratera de Vista Alegre",
        uf: "PR, Brasil",
        category: "Cratera de Impacto Circular",
        type: "crater",
        body: "moon",
        lat: -25.950,
        lon: -52.683,
        metrics: { diameter_m: 9500, depth_m: 190.0, depth_diameter_ratio: 0.0200, rim_height_m: 120.0, rim_height_diameter_ratio: 0.0126, rim_variation_m: 98.0, rim_radius_cv: 0.035, mean_wall_slope: 14.8, wall_slope_p90: 25.0, circularity: 0.945, rim_coherence: 0.915 },
        similarities: [
          "Outra estrutura de impacto formada diretamente em alvo basáltico, com alta circularidade (0.945).",
          "Declividade de parede média de ~15°, consistente com crateras lunares de médio porte.",
          "Bordas elevadas distintas que se destacam na topografia do planalto paranaense."
        ],
        differences: [
          "Assoreamento sedimentar no interior da depressão circular.",
          "Rápida meteorização química dos minerais de ferro-magnésio basálticos no clima quente e úmido.",
          "Drenagem radial centrípeta interna inexistente na Lua."
        ]
      },
      {
        id: "santa_marta",
        name: "Cratera de Santa Marta",
        uf: "PI, Brasil",
        category: "Cratera com Pico Central",
        type: "crater",
        body: "moon",
        lat: -10.167,
        lon: -45.250,
        metrics: { diameter_m: 9949, depth_m: 179.8, depth_diameter_ratio: 0.0181, rim_height_m: 56.6, rim_height_diameter_ratio: 0.0057, rim_variation_m: 142.5, rim_radius_cv: 0.038, mean_wall_slope: 6.7, wall_slope_p90: 18.2, circularity: 0.942, rim_coherence: 0.472 },
        similarities: [
          "Cratera de impacto complexa com pico central soerguido e terraços evidentes na geologia do Piauí.",
          "Diâmetro de ~10 km perfeitamente análogo à transição morfométrica lunar simples-complexa.",
          "Brechas de impacto e deformação por ondas de choque atestadas em laboratório."
        ],
        differences: [
          "Borda oriental fortemente erodida com perda da continuidade circular perimetral (coerência de 0.472).",
          "Sedimentação interior pós-impacto que nivelou parte da calha anular.",
          "Vegetação do Cerrado e solos latossólicos sobre o anel."
        ]
      },
      {
        id: "barringer",
        name: "Barringer Meteor Crater",
        uf: "Arizona, EUA",
        category: "Cratera de Impacto Simples Canônica",
        type: "crater",
        body: "moon",
        lat: 35.027,
        lon: -111.022,
        metrics: { diameter_m: 1186, depth_m: 170.0, depth_diameter_ratio: 0.1433, rim_height_m: 45.0, rim_height_diameter_ratio: 0.0379, rim_variation_m: 22.0, rim_radius_cv: 0.014, mean_wall_slope: 32.0, wall_slope_p90: 38.5, circularity: 0.985, rim_coherence: 0.990 },
        similarities: [
          "O análogo de impacto simples mais perfeito do planeta Terra. Morfometria em tigela (bowl-shaped) praticamente idêntica a Censorinus e Shackleton.",
          "Razão profundidade/diâmetro (0.143) de alta fidelidade com crateras lunares jovens não colapsadas.",
          "Bordas afiadas elevadas 45m acima da planície do deserto do Colorado com manto de ejeção invertido preservado."
        ],
        differences: [
          "Formada pelo impacto de um meteorito metálico ferro-níquel há apenas 50.000 anos (extremamente recente em termos geológicos).",
          "Atmosfera terrestre desacelerou e vaporizou parte do bólido original antes do solo.",
          "Fundo plano gerado por sedimentação lacustre durante o Pleistoceno tardio."
        ]
      },
      {
        id: "vredefort",
        name: "Vredefort Dome",
        uf: "África do Sul",
        category: "Maior Estrutura de Impacto da Terra",
        type: "crater",
        body: "moon",
        lat: -27.000,
        lon: 27.500,
        metrics: { diameter_m: 160000, depth_m: 450.0, depth_diameter_ratio: 0.0028, rim_height_m: 120.0, rim_height_diameter_ratio: 0.0008, rim_variation_m: 380.0, rim_radius_cv: 0.080, mean_wall_slope: 6.0, wall_slope_p90: 12.0, circularity: 0.840, rim_coherence: 0.760 },
        similarities: [
          "Melhor análogo terrestre para bacias de impacto multianelares gigantes da Lua (como Mare Orientale e Imbrium Basin).",
          "Exibe soerguimento crustal colossal com granitos do manto superior expostos no domo central.",
          "Geração de megabrechas e fundidos por impacto em escala quilométrica."
        ],
        differences: [
          "Idade superior a 2 bilhões de anos (Paleoproterozoico), com quilômetros de relevo superficial removidos por erosão tectônica global.",
          "A topografia de borda externa desapareceu quase por completo, restando apenas a cicatriz estrutural profunda (raiz do impacto).",
          "Deformações tectônicas continentais posteriores sobrepostas."
        ]
      },
      {
        id: "chicxulub",
        name: "Chicxulub Crater",
        uf: "Yucatán, México",
        category: "Cratera com Anel de Picos (K-Pg)",
        type: "crater",
        body: "moon",
        lat: 21.400,
        lon: -89.517,
        metrics: { diameter_m: 180000, depth_m: 350.0, depth_diameter_ratio: 0.0019, rim_height_m: 80.0, rim_height_diameter_ratio: 0.0004, rim_variation_m: 410.0, rim_radius_cv: 0.085, mean_wall_slope: 4.0, wall_slope_p90: 8.5, circularity: 0.820, rim_coherence: 0.720 },
        similarities: [
          "Análogo principal de crateras lunares complexas com anel de picos (peak ring) como Schrödinger Basin.",
          "Energia cinética equivalente ao evento de extinção massiva dos dinossauros (K-Pg há 66 Ma).",
          "Morfologia de colapso gravitacional dinâmico de alta energia identificada em imageamento geofísico sísmico 3D."
        ],
        differences: [
          "Cratera completamente soterrada por quase 1 km de rochas carbonáticas pós-impacto e pelo Golfo do México.",
          "Expressão topográfica superficial invisível a olho nu, detectável apenas por anéis de cenotes (dolinas cársticas) e gravimetria.",
          "Impacto ocorrido em plataforma marinha rasa com geração de megatsunamis."
        ]
      },
      {
        id: "pingualuit",
        name: "Pingualuit Crater",
        uf: "Quebec, Canadá",
        category: "Cratera Circular em Escudo Cristalino",
        type: "crater",
        body: "moon",
        lat: 61.278,
        lon: -73.667,
        metrics: { diameter_m: 3440, depth_m: 400.0, depth_diameter_ratio: 0.1163, rim_height_m: 160.0, rim_height_diameter_ratio: 0.0465, rim_variation_m: 35.0, rim_radius_cv: 0.015, mean_wall_slope: 28.0, wall_slope_p90: 36.5, circularity: 0.988, rim_coherence: 0.980 },
        similarities: [
          "Circularidade quase perfeita (0.988) com borda proeminente elevada 160m sobre a tundra ártica canadense.",
          "Paredes íngremes de até 36.5° em granito sólido, idênticas à inclinação de crateras simples da Lua.",
          "Preservação excepcional devido à resistência do escudo cristalino pré-cambriano."
        ],
        differences: [
          "Abrigou lagos glaciais e atualmente contém um dos lagos de água doce mais puros e profundos (267m) da Terra.",
          "Passou por ciclos de glaciações continentais que limparam os depósitos externos de ejecta.",
          "Solo congelado (permafrost) circundante."
        ]
      },
      {
        id: "lonar",
        name: "Lonar Crater",
        uf: "Maharashtra, Índia",
        category: "Cratera de Impacto em Basalto",
        type: "crater",
        body: "moon",
        lat: 19.976,
        lon: 76.508,
        metrics: { diameter_m: 1830, depth_m: 150.0, depth_diameter_ratio: 0.0820, rim_height_m: 30.0, rim_height_diameter_ratio: 0.0164, rim_variation_m: 28.0, rim_radius_cv: 0.018, mean_wall_slope: 26.5, wall_slope_p90: 34.0, circularity: 0.980, rim_coherence: 0.960 },
        similarities: [
          "Uma das únicas crateras de impacto simples da Terra preservada diretamente nos basaltos dos Trapps do Decã, tornando-se o melhor análogo mineralógico para os mares basálticos da Lua.",
          "Minerais de choque preservados: plagioclásio transformado em maskelyneíte idêntico às amostras das missões Apollo.",
          "Perfil em tigela com borda contínua preservada e declividade de parede de até 34°."
        ],
        differences: [
          "Fundo ocupado por um lago salino alcalino hipersalino com ecossistema de extremófilos.",
          "Intemperismo subtropical com alteração de basaltos para esmectitas e cloritas na Terra.",
          "Idade pleistocênica recente com erosão hídrica em curso nas paredes."
        ]
      }
    ];

    let currentSiteIndex = 0;
    let currentMapFilter = "all";
    let currentViewMode = "mundo";
    let currentStudioTab = "profile";
    let activeFormType = "crater";
    let previousScore = 0.6603;

    // Pesos Oficiais
    const CRATER_WEIGHTS = {
      diameter_m: 0.10,
      depth_m: 0.12,
      depth_diameter_ratio: 0.15,
      rim_height_m: 0.08,
      rim_height_diameter_ratio: 0.08,
      rim_variation_m: 0.07,
      rim_radius_cv: 0.08,
      mean_wall_slope: 0.12,
      wall_slope_p90: 0.10,
      circularity: 0.05,
      rim_coherence: 0.05
    };

    const DUNE_WEIGHTS = {
      mean_height: 0.15,
      height_p90: 0.15,
      wavelength: 0.20,
      crest_azimuth: 0.10,
      dune_density: 0.15,
      mean_spacing: 0.15,
      aridity_index: 0.10
    };

    const PARAM_LABELS = {
      diameter_m: "Diâmetro (m)",
      depth_m: "Profundidade (m)",
      depth_diameter_ratio: "Razão d/D",
      rim_height_m: "Altura Borda (m)",
      rim_height_diameter_ratio: "Razão Borda/D",
      rim_variation_m: "Variação Borda (m)",
      rim_radius_cv: "CV Raio Borda",
      mean_wall_slope: "Declividade Média (°)",
      wall_slope_p90: "Declividade P90 (°)",
      circularity: "Circularidade",
      rim_coherence: "Coerência Borda",
      mean_height: "Altura Média (m)",
      height_p90: "Altura P90 (m)",
      wavelength: "Comprimento Onda λ (m)",
      crest_azimuth: "Azimute Crista (°)",
      dune_density: "Densidade Cristas (/km²)",
      mean_spacing: "Espaçamento Médio (m)",
      aridity_index: "Índice de Aridez"
    };

    // =========================================================================
    // MOTOR DE CÁLCULO ESTATÍSTICO COM FÍSICA DE BAGNOLD
    // =========================================================================
    function calculateMatch(earthMetrics, targetMetrics, type) {
      const weights = type === "crater" ? CRATER_WEIGHTS : DUNE_WEIGHTS;
      let weightedSqSum = 0;
      let dotProd = 0, normA = 0, normB = 0;
      const bagnoldBeta = 2.82;

      for (const [key, weight] of Object.entries(weights)) {
        let valEarth = Number(earthMetrics[key]) || 0;
        let valPlanet = Number(targetMetrics[key]) || 0;

        if (type === "dune" && (key === "wavelength" || key === "mean_spacing" || key === "mean_height")) {
          valPlanet = valPlanet * bagnoldBeta;
        }

        const maxVal = Math.max(Math.abs(valEarth), Math.abs(valPlanet), 1e-4);
        const normEarth = valEarth / maxVal;
        const normTarget = valPlanet / maxVal;

        const diff = normEarth - normTarget;
        weightedSqSum += weight * (diff * diff);

        dotProd += (weight * normEarth) * (weight * normTarget);
        normA += Math.pow(weight * normEarth, 2);
        normB += Math.pow(weight * normTarget, 2);
      }

      const wed = Math.sqrt(weightedSqSum);
      const cosineSim = (normA > 0 && normB > 0) ? Math.max(0, Math.min(1, dotProd / (Math.sqrt(normA) * Math.sqrt(normB)))) : 0;
      
      const k = 2.2;
      const eucScore = Math.exp(-k * wed);
      const finalScore = 0.6 * eucScore + 0.4 * cosineSim;

      return { score: finalScore, wed: wed, cosine: cosineSim };
    }

    // =========================================================================
    // GLOBO 3D INTERATIVO EM CANVAS (PROJEÇÃO ORTOGRÁFICA ROTAÇÃO SUAVE)
    // =========================================================================
    let globeRotation = -40; // Ângulo inicial centrado nas Américas / Atlântico
    let isDraggingGlobe = false;
    let lastMouseX = 0;
    let hoveredGlobePinIndex = -1;

    // Coordenadas simplificadas dos continentes para projeção 3D
    const CONTINENT_POLYS = [
      // América do Sul
      [[-78, 10], [-73, 11], [-60, 8], [-50, -1], [-35, -5], [-35, -9], [-39, -15], [-44, -23], [-48, -28], [-53, -33], [-65, -45], [-68, -55], [-75, -50], [-73, -40], [-71, -30], [-77, -10], [-80, -2], [-77, 8]],
      // América do Norte
      [[-165, 65], [-140, 70], [-120, 75], [-90, 75], [-80, 60], [-60, 50], [-70, 42], [-75, 35], [-80, 25], [-97, 20], [-105, 23], [-115, 32], [-124, 40], [-125, 50], [-135, 58], [-160, 58]],
      // África
      [[-17, 30], [-10, 36], [10, 37], [25, 32], [32, 31], [43, 12], [51, 10], [40, -5], [35, -20], [30, -32], [20, -35], [17, -33], [12, -18], [9, 4], [-5, 5], [-15, 12]],
      // Eurásia
      [[-9, 38], [-9, 43], [2, 51], [10, 54], [25, 71], [40, 68], [60, 73], [100, 77], [140, 72], [170, 66], [160, 55], [140, 50], [130, 42], [120, 32], [105, 20], [80, 15], [70, 22], [55, 25], [35, 32], [28, 41], [15, 40]],
      // Austrália
      [[114, -22], [123, -15], [135, -12], [142, -11], [153, -28], [150, -37], [138, -35], [115, -34], [113, -25]],
      // Antártica (Borda)
      [[-180, -75], [-120, -78], [-60, -70], [0, -72], [60, -68], [120, -70], [180, -75]]
    ];

    function initGlobe() {
      const canvas = document.getElementById("globe-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      function drawGlobe() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const R = canvas.width * 0.40;

        // Fundo estrelado suave
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        for (let i = 0; i < 40; i++) {
          const sx = (i * 97) % canvas.width;
          const sy = (i * 131) % canvas.height;
          if (Math.hypot(sx - cx, sy - cy) > R + 10) {
            ctx.fillRect(sx, sy, 1.2, 1.2);
          }
        }

        // Atmosfera e Esfera do Globo
        const oceanGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
        oceanGrad.addColorStop(0, "#0c1f38");
        oceanGrad.addColorStop(0.7, "#081324");
        oceanGrad.addColorStop(1, "#030814");

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 2 * Math.PI);
        ctx.fillStyle = oceanGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(56, 189, 248, 0.5)";
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.restore();

        // Clip para a esfera (não desenhar fora do círculo)
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 2 * Math.PI);
        ctx.clip();

        // Grade de Paralelos e Meridianos
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;

        // Paralelos
        [-60, -30, 0, 30, 60].forEach(lat => {
          ctx.beginPath();
          let started = false;
          for (let lon = -180; lon <= 180; lon += 5) {
            const p = projectOrtho(lon, lat, globeRotation, R, cx, cy);
            if (p) {
              if (!started) { ctx.moveTo(p.x, p.y); started = true; }
              else { ctx.lineTo(p.x, p.y); }
            } else { started = false; }
          }
          ctx.stroke();
        });

        // Continentes
        CONTINENT_POLYS.forEach(poly => {
          ctx.beginPath();
          let started = false;
          poly.forEach(pt => {
            const p = projectOrtho(pt[0], pt[1], globeRotation, R, cx, cy);
            if (p) {
              if (!started) { ctx.moveTo(p.x, p.y); started = true; }
              else { ctx.lineTo(p.x, p.y); }
            } else {
              started = false;
            }
          });
          ctx.fillStyle = "rgba(16, 185, 129, 0.18)";
          ctx.fill();
          ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        // Sítios Terrestres no Globo
        SITES_DATA.forEach((s, idx) => {
          if (currentMapFilter !== "all" && s.type !== currentMapFilter) return;

          const p = projectOrtho(s.lon, s.lat, globeRotation, R, cx, cy);
          if (!p) return; // Lado oculto do globo

          const isSelected = idx === currentSiteIndex;
          const isHovered = idx === hoveredGlobePinIndex;
          const color = s.type === "dune" ? "#f97316" : "#38bdf8";

          // Pulso concêntrico se selecionado
          if (isSelected) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, 14, 0, 2 * Math.PI);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 2]);
            ctx.stroke();
            ctx.restore();
          }

          // Ponto do sítio
          ctx.beginPath();
          ctx.arc(p.x, p.y, isSelected ? 5.5 : (isHovered ? 5 : 3.5), 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.fill();

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        ctx.restore(); // Fecha o clip da esfera

        // Rotação contínua lenta automática se não estiver arrastando
        if (!isDraggingGlobe) {
          globeRotation += 0.22;
          if (globeRotation > 180) globeRotation -= 360;
        }

        requestAnimationFrame(drawGlobe);
      }

      // Projeção ortográfica
      function projectOrtho(lon, lat, l0, R, cx, cy) {
        const radLat = (lat * Math.PI) / 180;
        const radLon = (lon * Math.PI) / 180;
        const radL0 = (l0 * Math.PI) / 180;

        const cosC = Math.cos(radLat) * Math.cos(radLon - radL0);
        if (cosC <= 0) return null; // Hemisfério traseiro

        const x = cx + R * Math.cos(radLat) * Math.sin(radLon - radL0);
        const y = cy - R * Math.sin(radLat);
        return { x, y };
      }

      // Interações de Mouse no Globo
      canvas.addEventListener("mousedown", e => {
        isDraggingGlobe = true;
        lastMouseX = e.clientX;
      });

      window.addEventListener("mouseup", () => {
        isDraggingGlobe = false;
      });

      window.addEventListener("mousemove", e => {
        if (isDraggingGlobe) {
          const dx = e.clientX - lastMouseX;
          globeRotation += dx * 0.45;
          lastMouseX = e.clientX;
        }

        // Checar hover em pinos do globo
        const rect = canvas.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width) * canvas.width;
        const my = ((e.clientY - rect.top) / rect.height) * canvas.height;
        const cx = canvas.width / 2, cy = canvas.height / 2, R = canvas.width * 0.40;

        let found = -1;
        SITES_DATA.forEach((s, idx) => {
          if (currentMapFilter !== "all" && s.type !== currentMapFilter) return;
          const p = projectOrtho(s.lon, s.lat, globeRotation, R, cx, cy);
          if (p && Math.hypot(p.x - mx, p.y - my) < 9) {
            found = idx;
          }
        });

        hoveredGlobePinIndex = found;
        const tt = document.getElementById("globe-tooltip");
        if (found >= 0) {
          canvas.style.cursor = "pointer";
          const site = SITES_DATA[found];
          document.getElementById("globe-tooltip-title").textContent = site.name;
          document.getElementById("globe-tooltip-sub").textContent = `${site.type === 'dune' ? '🏜️ DUNA' : '🌑 CRATERA'} | ${site.uf}`;
          tt.style.left = `${(mx / canvas.width) * rect.width + 12}px`;
          tt.style.top = `${(my / canvas.height) * rect.height - 10}px`;
          tt.classList.remove("opacity-0");
        } else {
          canvas.style.cursor = isDraggingGlobe ? "grabbing" : "grab";
          tt.classList.add("opacity-0");
        }
      });

      canvas.addEventListener("click", e => {
        if (hoveredGlobePinIndex >= 0) {
          selectSite(hoveredGlobePinIndex);
          scrollToRectMap();
        }
      });

      drawGlobe();
    }

    // =========================================================================
    // PROJEÇÃO CARTOGRÁFICA RETANGULAR MUNDIAL (EPSG:4326)
    // =========================================================================
    const BOUNDS = {
      mundo:    { minLon: -180.0, maxLon: 180.0, minLat: -65.0, maxLat: 75.0, w: 960, h: 480 },
      brasil:   { minLon: -85.0,  maxLon: -30.0, minLat: -35.0, maxLat: 10.0, w: 960, h: 480 },
      nordeste: { minLon: -48.5,  maxLon: -34.0, minLat: -16.0, maxLat: -1.8, w: 960, h: 480 }
    };

    function projectCoords(lon, lat) {
      const b = BOUNDS[currentViewMode];
      const x = ((lon - b.minLon) / (b.maxLon - b.minLon)) * (b.w - 80) + 40;
      const y = ((b.maxLat - lat) / (b.maxLat - b.minLat)) * (b.h - 60) + 30;
      return { x: Math.max(15, Math.min(b.w - 15, x)), y: Math.max(15, Math.min(b.h - 15, y)) };
    }

    function renderBaseMap() {
      const basemap = document.getElementById("map-basemap-layer");
      const grid = document.getElementById("map-grid-layer");
      const labels = document.getElementById("map-labels-layer");
      const b = BOUNDS[currentViewMode];

      if (currentViewMode === "nordeste") {
        const coastPoints = [
          [-44.3, -2.5], [-43.0, -2.6], [-41.8, -2.85], [-40.85, -2.9], [-40.49, -2.825],
          [-39.0, -3.4], [-38.5, -3.72], [-37.7, -4.5], [-37.25, -4.85], [-36.845, -5.03],
          [-36.63, -5.11], [-35.46, -5.19], [-35.2, -5.79], [-34.8, -7.15], [-34.9, -8.1],
          [-35.7, -9.66], [-37.05, -10.9], [-38.5, -12.97], [-39.05, -14.8], [-39.2, -15.8],
          [-43.5, -15.8], [-46.5, -14.5], [-47.8, -10.0], [-47.5, -5.5], [-45.5, -3.0]
        ];

        const ptsStr = coastPoints.map(p => {
          const pt = projectCoords(p[0], p[1]);
          return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
        }).join(" ");

        basemap.innerHTML = `
          <polygon points="${ptsStr}" fill="#0b1329" fill-opacity="0.9" stroke="#334155" stroke-opacity="0.8" stroke-width="1.5" />
        `;

        labels.innerHTML = `
          <text x="${projectCoords(-39.5, -5.2).x}" y="${projectCoords(-39.5, -5.2).y}" fill="#94a3b8" opacity="0.45" font-size="12" font-weight="bold" text-anchor="middle">CEARÁ</text>
          <text x="${projectCoords(-36.5, -5.8).x}" y="${projectCoords(-36.5, -5.8).y}" fill="#94a3b8" opacity="0.45" font-size="10" font-weight="bold" text-anchor="middle">RIO G. NORTE</text>
          <text x="${projectCoords(-45.0, -5.0).x}" y="${projectCoords(-45.0, -5.0).y}" fill="#94a3b8" opacity="0.45" font-size="11" font-weight="bold" text-anchor="middle">MARANHÃO</text>
          <text x="${projectCoords(-42.5, -7.2).x}" y="${projectCoords(-42.5, -7.2).y}" fill="#94a3b8" opacity="0.45" font-size="11" font-weight="bold" text-anchor="middle">PIAUÍ</text>
          <text x="${projectCoords(-41.5, -12.5).x}" y="${projectCoords(-41.5, -12.5).y}" fill="#94a3b8" opacity="0.45" font-size="13" font-weight="bold" text-anchor="middle">BAHIA</text>
        `;

        grid.innerHTML = [-46, -42, -38, -35].map(lon => {
          const pt = projectCoords(lon, -1.8);
          const pb = projectCoords(lon, -16.0);
          return `<line x1="${pt.x}" y1="20" x2="${pb.x}" y2="460" stroke="#1e293b" stroke-dasharray="3 3"/>
                  <text x="${pt.x}" y="472" fill="#475569" font-size="9" font-mono text-anchor="middle">${Math.abs(lon)}°W</text>`;
        }).concat([-3, -6, -9, -12, -15].map(lat => {
          const pl = projectCoords(-48.5, lat);
          return `<line x1="30" y1="${pl.y}" x2="930" y2="${pl.y}" stroke="#1e293b" stroke-dasharray="3 3"/>
                  <text x="25" y="${pl.y + 3}" fill="#475569" font-size="9" font-mono text-anchor="end">${Math.abs(lat)}°S</text>`;
        })).join("");

      } else if (currentViewMode === "brasil") {
        const saPoints = [
          [-78, 10], [-73, 11], [-60, 8], [-50, -1], [-35, -5], [-35, -9], [-39, -15],
          [-44, -23], [-48, -28], [-53, -33], [-65, -45], [-68, -55], [-75, -50], [-73, -40],
          [-71, -30], [-77, -10], [-80, -2], [-77, 8]
        ];

        const ptsStr = saPoints.map(p => {
          const pt = projectCoords(p[0], p[1]);
          return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
        }).join(" ");

        basemap.innerHTML = `
          <polygon points="${ptsStr}" fill="#0b1329" fill-opacity="0.85" stroke="#334155" stroke-opacity="0.75" stroke-width="1.5" />
        `;

        labels.innerHTML = `
          <text x="${projectCoords(-42.0, -7.0).x}" y="${projectCoords(-42.0, -7.0).y}" fill="#94a3b8" opacity="0.45" font-size="12" font-weight="bold">NORDESTE</text>
          <text x="${projectCoords(-52.0, -15.0).x}" y="${projectCoords(-52.0, -15.0).y}" fill="#94a3b8" opacity="0.45" font-size="12" font-weight="bold">CENTRO-OESTE</text>
          <text x="${projectCoords(-48.0, -24.0).x}" y="${projectCoords(-48.0, -24.0).y}" fill="#94a3b8" opacity="0.45" font-size="12" font-weight="bold">SUDESTE / SUL</text>
        `;

        grid.innerHTML = [-70, -55, -40].map(lon => {
          const pt = projectCoords(lon, 10.0);
          return `<line x1="${pt.x}" y1="20" x2="${pt.x}" y2="460" stroke="#1e293b" stroke-dasharray="3 3"/>
                  <text x="${pt.x}" y="472" fill="#475569" font-size="9" font-mono text-anchor="middle">${Math.abs(lon)}°W</text>`;
        }).concat([0, -12, -24].map(lat => {
          const pl = projectCoords(-85.0, lat);
          return `<line x1="30" y1="${pl.y}" x2="930" y2="${pl.y}" stroke="#1e293b" stroke-dasharray="3 3"/>
                  <text x="25" y="${pl.y + 3}" fill="#475569" font-size="9" font-mono text-anchor="end">${Math.abs(lat)}°S</text>`;
        })).join("");

      } else {
        // MODO MUNDO INTEIRO (WORLD GLOBE RECTANGULAR)
        const worldPolys = [
          // América do Norte
          [[-165, 65], [-140, 70], [-120, 75], [-90, 75], [-80, 60], [-60, 50], [-70, 42], [-75, 35], [-80, 25], [-97, 20], [-105, 23], [-115, 32], [-124, 40], [-125, 50], [-135, 58], [-160, 58]],
          // América do Sul
          [[-78, 10], [-73, 11], [-60, 8], [-50, -1], [-35, -5], [-35, -9], [-39, -15], [-44, -23], [-48, -28], [-53, -33], [-65, -45], [-68, -55], [-75, -50], [-73, -40], [-71, -30], [-77, -10], [-80, -2], [-77, 8]],
          // África
          [[-17, 30], [-10, 36], [10, 37], [25, 32], [32, 31], [43, 12], [51, 10], [40, -5], [35, -20], [30, -32], [20, -35], [17, -33], [12, -18], [9, 4], [-5, 5], [-15, 12]],
          // Europa + Ásia (Eurásia)
          [[-9, 38], [-9, 43], [2, 51], [10, 54], [25, 71], [40, 68], [60, 73], [100, 77], [140, 72], [170, 66], [160, 55], [140, 50], [130, 42], [120, 32], [105, 20], [80, 15], [70, 22], [55, 25], [35, 32], [28, 41], [15, 40]],
          // Austrália
          [[114, -22], [123, -15], [135, -12], [142, -11], [153, -28], [150, -37], [138, -35], [115, -34], [113, -25]]
        ];

        basemap.innerHTML = worldPolys.map(poly => {
          const ptsStr = poly.map(p => {
            const pt = projectCoords(p[0], p[1]);
            return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          }).join(" ");
          return `<polygon points="${ptsStr}" fill="#0b1329" fill-opacity="0.85" stroke="#334155" stroke-opacity="0.65" stroke-width="1.2" />`;
        }).join("");

        labels.innerHTML = `
          <text x="${projectCoords(-100, 45).x}" y="${projectCoords(-100, 45).y}" fill="#94a3b8" opacity="0.35" font-size="11" font-weight="bold">AMÉRICA DO NORTE</text>
          <text x="${projectCoords(-55, -15).x}" y="${projectCoords(-55, -15).y}" fill="#94a3b8" opacity="0.45" font-size="12" font-weight="bold">AMÉRICA DO SUL</text>
          <text x="${projectCoords(20, 10).x}" y="${projectCoords(20, 10).y}" fill="#94a3b8" opacity="0.45" font-size="12" font-weight="bold">ÁFRICA</text>
          <text x="${projectCoords(80, 45).x}" y="${projectCoords(80, 45).y}" fill="#94a3b8" opacity="0.45" font-size="12" font-weight="bold">EURÁSIA</text>
          <text x="${projectCoords(135, -25).x}" y="${projectCoords(135, -25).y}" fill="#94a3b8" opacity="0.35" font-size="10" font-weight="bold">AUSTRÁLIA</text>
        `;

        grid.innerHTML = [-120, -60, 0, 60, 120].map(lon => {
          const pt = projectCoords(lon, 75.0);
          return `<line x1="${pt.x}" y1="20" x2="${pt.x}" y2="460" stroke="#1e293b" stroke-dasharray="3 3"/>
                  <text x="${pt.x}" y="472" fill="#475569" font-size="9" font-mono text-anchor="middle">${lon}°</text>`;
        }).concat([60, 30, 0, -30, -60].map(lat => {
          const pl = projectCoords(-180.0, lat);
          return `<line x1="30" y1="${pl.y}" x2="930" y2="${pl.y}" stroke="#1e293b" stroke-dasharray="3 3"/>
                  <text x="25" y="${pl.y + 3}" fill="#475569" font-size="9" font-mono text-anchor="end">${lat}°</text>`;
        })).join("");
      }
    }

    function renderMapPins() {
      const g = document.getElementById("map-pins-layer");
      const reticleLayer = document.getElementById("map-reticle-layer");
      g.innerHTML = "";
      reticleLayer.innerHTML = "";
      const b = BOUNDS[currentViewMode];

      SITES_DATA.forEach((s, idx) => {
        if (currentMapFilter !== "all" && s.type !== currentMapFilter) return;

        if (currentViewMode !== "mundo") {
          if (s.lon < b.minLon || s.lon > b.maxLon || s.lat < b.minLat || s.lat > b.maxLat) {
            return;
          }
        }

        const pos = projectCoords(s.lon, s.lat);
        const isSelected = idx === currentSiteIndex;
        const color = s.type === "dune" ? "#f97316" : "#38bdf8";
        const filterId = s.type === "dune" ? "url(#glowDune)" : "url(#glowCrater)";

        // Targeting reticle for selected pin
        if (isSelected) {
          reticleLayer.innerHTML = `
            <circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="22" fill="none" stroke="${color}" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="4 2">
              <animateTransform attributeName="transform" type="rotate" from="0 ${pos.x.toFixed(1)} ${pos.y.toFixed(1)}" to="360 ${pos.x.toFixed(1)} ${pos.y.toFixed(1)}" dur="10s" repeatCount="indefinite"/>
            </circle>
            <circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="14" fill="${color}" fill-opacity="0.18">
              <animate attributeName="r" values="8;22;8" dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <line x1="${(pos.x - 26).toFixed(1)}" y1="${pos.y.toFixed(1)}" x2="${(pos.x - 16).toFixed(1)}" y2="${pos.y.toFixed(1)}" stroke="${color}" stroke-width="1.5"/>
            <line x1="${(pos.x + 16).toFixed(1)}" y1="${pos.y.toFixed(1)}" x2="${(pos.x + 26).toFixed(1)}" y2="${pos.y.toFixed(1)}" stroke="${color}" stroke-width="1.5"/>
            <line x1="${pos.x.toFixed(1)}" y1="${(pos.y - 26).toFixed(1)}" x2="${pos.x.toFixed(1)}" y2="${(pos.y - 16).toFixed(1)}" stroke="${color}" stroke-width="1.5"/>
            <line x1="${pos.x.toFixed(1)}" y1="${(pos.y + 16).toFixed(1)}" x2="${pos.x.toFixed(1)}" y2="${(pos.y + 26).toFixed(1)}" stroke="${color}" stroke-width="1.5"/>
          `;
        }

        const pinGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        pinGroup.setAttribute("class", "cursor-pointer group");
        pinGroup.setAttribute("onclick", `selectSite(${idx})`);
        pinGroup.setAttribute("onmouseenter", `showPinTooltip(event, ${idx})`);
        pinGroup.setAttribute("onmouseleave", `hidePinTooltip()`);

        pinGroup.innerHTML = `
          <circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="${isSelected ? 7 : 5}" fill="${color}" stroke="#ffffff" stroke-width="${isSelected ? 2.5 : 1.5}" filter="${filterId}" class="transition-transform duration-200 group-hover:scale-125" />
          <text x="${(pos.x + 9).toFixed(1)}" y="${(pos.y + 3.5).toFixed(1)}" fill="#ffffff" font-size="${isSelected ? '11' : '9.5'}" font-weight="${isSelected ? '700' : '500'}" 
                style="text-shadow: 0 1px 4px rgba(0,0,0,0.95);">${s.name}</text>
        `;

        g.appendChild(pinGroup);
      });
    }

    function showPinTooltip(e, idx) {
      const site = SITES_DATA[idx];
      const tooltip = document.getElementById("map-pin-tooltip");
      document.getElementById("tooltip-title").textContent = `${site.name} (${site.uf})`;
      document.getElementById("tooltip-sub").textContent = `${site.type === 'dune' ? '🏜️ DUNA' : '🌑 CRATERA'} | Lat: ${site.lat.toFixed(2)}°, Lon: ${site.lon.toFixed(2)}°`;
      
      const mapBox = document.getElementById("world-map-svg").getBoundingClientRect();
      const pos = projectCoords(site.lon, site.lat);
      const svgW = 960, svgH = 480;
      
      const screenX = (pos.x / svgW) * mapBox.width;
      const screenY = (pos.y / svgH) * mapBox.height;

      tooltip.style.left = `${screenX + 15}px`;
      tooltip.style.top = `${screenY - 10}px`;
      tooltip.classList.remove("opacity-0");
    }

    function hidePinTooltip() {
      document.getElementById("map-pin-tooltip").classList.add("opacity-0");
    }

    function handleMapHover(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 960;
      const y = ((e.clientY - rect.top) / rect.height) * 480;
      const b = BOUNDS[currentViewMode];
      
      const lon = b.minLon + ((x - 40) / (b.w - 80)) * (b.maxLon - b.minLon);
      const lat = b.maxLat - ((y - 30) / (b.h - 60)) * (b.maxLat - b.minLat);
      
      document.getElementById("map-coord-display").textContent = `Lat: ${lat.toFixed(2)}° | Lon: ${lon.toFixed(2)}° (WGS84)`;
    }

    function setMapViewMode(mode) {
      currentViewMode = mode;
      ["mundo", "brasil", "nordeste"].forEach(m => {
        const btn = document.getElementById(`btn-view-${m === 'brasil' ? 'br' : (m === 'nordeste' ? 'ne' : 'mundo')}`);
        if (btn) {
          btn.className = m === mode 
            ? "px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold shadow-xs transition-all duration-200 cursor-pointer"
            : "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all duration-200 cursor-pointer";
        }
      });

      renderBaseMap();
      renderMapPins();
    }

    function setMapFilter(filter) {
      currentMapFilter = filter;
      ["all", "dune", "crater"].forEach(f => {
        const btn = document.getElementById(`filter-${f}`);
        if (btn) {
          btn.className = f === filter 
            ? "px-2.5 py-1.5 rounded-lg bg-slate-800 text-white font-semibold shadow-xs transition-all cursor-pointer"
            : "px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer";
        }
      });
      renderMapPins();
    }

    // =========================================================================
    // SELETOR DE SÍTIOS (DOCK STYLE)
    // =========================================================================
    function renderSelectors() {
      const container = document.getElementById("site-selector");
      container.innerHTML = SITES_DATA.map((s, idx) => `
        <button onclick="selectSite(${idx})" class="spotlight-card text-left p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
          idx === currentSiteIndex
            ? 'glass-panel border-emerald-500 shadow-md ring-1 ring-emerald-500/50 bg-emerald-500/5'
            : 'glass-panel border-white/5 hover:border-white/20 opacity-80 hover:opacity-100'
        }">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="font-bold text-[9px] uppercase font-mono tracking-wider ${s.body === 'mars' ? 'text-amber-400' : 'text-sky-400'}">${s.type === 'dune' ? 'DUNA' : 'CRATERA'}</span>
            <span class="text-[9px] font-mono text-slate-400 truncate max-w-[60px]">${s.uf.split(',')[0]}</span>
          </div>
          <div class="font-bold text-xs truncate text-white">${s.name}</div>
        </button>
      `).join("");
      document.getElementById("total-sites-count").textContent = `${SITES_DATA.length} Sítios`;
    }

    // =========================================================================
    // TICKER NUMÉRICO ANIMADO
    // =========================================================================
    function animateValue(id, start, end, duration = 600, decimals = 4) {
      const el = document.getElementById(id);
      if (!el) return;
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * ease;
        el.textContent = current.toFixed(decimals);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = end.toFixed(decimals);
        }
      };
      window.requestAnimationFrame(step);
    }

    // =========================================================================
    // DETALHES DO MATCHING & DIAGNÓSTICO COMPARATIVO ("NO QUE É PARECIDO" vs "NO QUE NÃO É")
    // =========================================================================
    const GEOGRAPHICAL_CONTEXT = __GEOGRAPHICAL_CONTEXT_JSON__;

    function renderGeographicalContext(site) {
      const context = GEOGRAPHICAL_CONTEXT.sites[site.id];
      document.getElementById('geo-context-status').textContent = context
        ? (context.review_status === 'reviewed' ? 'Revisado manualmente' : 'Pendente de revisão')
        : 'Sem ficha cadastrada';
      document.getElementById('geo-context-summary').textContent = context?.summary
        || 'Contexto ainda não cadastrado para esta localidade.';
      const climate = context?.climatology;
      document.getElementById('geo-climate-period').textContent = climate
        ? `NASA POWER · ${climate.period} · ${climate.scope}` : '';
      const facts = document.getElementById('geo-context-facts');
      facts.replaceChildren();
      for (const [key, label] of [['climate', 'Clima'], ['biome', 'Bioma'], ['vegetation', 'Vegetação'], ['nearby_locality', 'Localidades de referência'], ['geology', 'Geologia']]) {
        if (typeof context?.[key] !== 'string' || !context[key].trim()) continue;
        const group = document.createElement('div');
        const term = document.createElement('dt');
        term.className = 'text-slate-500 mb-1';
        term.textContent = label;
        const value = document.createElement('dd');
        value.className = 'text-slate-300';
        value.textContent = context[key];
        group.append(term, value);
        const evidence = context.field_sources?.[key];
        if (evidence) {
          const note = document.createElement('p');
          note.className = 'text-slate-500 mt-1 leading-relaxed';
          note.textContent = evidence.scope;
          group.append(note);
          if (/^https?:\/\//i.test(evidence.url)) {
            const link = document.createElement('a');
            link.textContent = 'Fonte: ' + evidence.title;
            link.href = evidence.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'block mt-1 text-sky-400 underline';
            group.append(link);
          }
        }
        facts.append(group);
      }
      const sources = document.getElementById('geo-context-sources');
      sources.replaceChildren();
      for (const source of context?.sources || []) {
        const safeUrl = typeof source.url === 'string' && /^https?:\/\//i.test(source.url);
        const element = document.createElement(safeUrl ? 'a' : 'span');
        element.textContent = source.title;
        if (safeUrl) {
          element.href = source.url;
          element.target = '_blank';
          element.rel = 'noopener noreferrer';
          element.className = 'underline hover:text-sky-300';
        }
        sources.append(element);
      }
    }

    function renderDetail() {
      const site = SITES_DATA[currentSiteIndex];
      renderGeographicalContext(site);
      const targets = site.type === "crater" ? MOON_CRATER_REFERENCES : MARS_DUNE_REFERENCES;

      // Executa o matching estatístico
      const matches = targets.map(t => {
        const m = calculateMatch(site.metrics, t, site.type);
        return { target: t, ...m };
      }).sort((a, b) => b.score - a.score);

      const best = matches[0];

      // Atualiza cabeçalho
      document.getElementById("badge-body").textContent = site.body === "mars" ? "Terra ↔ Marte (Duna)" : "Terra ↔ Lua (Cratera)";
      document.getElementById("badge-body").className = `px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
        site.body === "mars" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
      }`;
      document.getElementById("badge-cat").textContent = site.category;
      document.getElementById("badge-region").textContent = site.uf;
      document.getElementById("pair-title").textContent = `${site.name} ↔ ${best.target.name}`;
      document.getElementById("site-coords").textContent = `📍 Lat: ${site.lat.toFixed(3)}°, Lon: ${site.lon.toFixed(3)}° (${site.uf})`;
      
      // Animated score ticker
      animateValue("score-display", previousScore, best.score, 600, 4);
      previousScore = best.score;

      document.getElementById("distance-display").textContent = `WED: ${best.wed.toFixed(3)} | Cos: ${best.cosine.toFixed(3)}`;

      // Injeta diagnósticos: "No que é parecido" vs "No que NÃO é parecido"
      const simContainer = document.getElementById("similarities-content");
      const diffContainer = document.getElementById("differences-content");

      simContainer.innerHTML = (site.similarities || [
        "Convergência morfométrica e geométrica alta com o alvo planetário.",
        "Perfil topográfico dimensional compatível sob normalização estatística."
      ]).map(txt => `
        <div class="flex items-start gap-2">
          <span class="text-emerald-400 font-bold">•</span>
          <span>${txt}</span>
        </div>
      `).join("");

      diffContainer.innerHTML = (site.differences || [
        "Erosão eólica e hídrica terrestre atuando sobre a morfologia ao longo de milhões de anos.",
        "Diferença gravitacional de 1.0g na Terra vs baixa gravidade no corpo planetário."
      ]).map(txt => `
        <div class="flex items-start gap-2">
          <span class="text-rose-400 font-bold">•</span>
          <span>${txt}</span>
        </div>
      `).join("");

      // Atualiza legenda dos estúdios
      const planetDot = document.getElementById("legend-planet-dot");
      if (planetDot) {
        planetDot.className = `w-2.5 h-2.5 rounded-full ${site.body === 'mars' ? 'bg-amber-500' : 'bg-sky-400'}`;
      }
      const thPlanet = document.getElementById("th-planet-name");
      if (thPlanet) {
        thPlanet.className = `p-3 font-semibold ${site.body === 'mars' ? 'text-amber-400' : 'text-sky-400'}`;
        thPlanet.textContent = `Alvo Planetário (${best.target.name.split(" ")[0]})`;
      }
      document.getElementById("metrics-type-label").textContent = site.type === "crater" ? "11 métricas contratuais" : "7 métricas de dunas";

      // Renderiza os 3 estúdios visuais
      renderDynamicFigure(site, best.target);
      renderFeatureBars(site, best.target);
      renderRadarChart(site.metrics, best.target, site.type);

      // Renderiza Top Matches List
      const topMatchesContainer = document.getElementById("top-matches-list");
      topMatchesContainer.innerHTML = matches.slice(0, 5).map((m, rank) => `
        <div class="spotlight-card p-3 rounded-xl border border-white/5 bg-space-950/70 hover:border-white/15 transition-all">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="font-bold font-mono ${rank === 0 ? 'text-emerald-400' : 'text-slate-300'}">#${rank + 1} ${m.target.name}</span>
            <span class="font-mono text-[10px] ${m.score > 0.6 ? 'text-emerald-400 font-bold' : 'text-slate-400'}">${m.score.toFixed(4)}</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-1">
            <div class="h-1.5 rounded-full ${rank === 0 ? 'bg-emerald-400' : 'bg-sky-500'}" style="width: ${(m.score * 100).toFixed(1)}%"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>WED: ${m.wed.toFixed(3)}</span>
            <span>Cos: ${m.cosine.toFixed(3)}</span>
          </div>
        </div>
      `).join("");

      // Renderiza Tabela de Métricas
      const tableBody = document.getElementById("metrics-table-body");
      const weights = site.type === "crater" ? CRATER_WEIGHTS : DUNE_WEIGHTS;

      tableBody.innerHTML = Object.keys(weights).map(key => {
        const valEarth = site.metrics[key];
        let valTarget = best.target[key];
        const isBagnoldScaled = (site.type === "dune" && (key === "wavelength" || key === "mean_spacing" || key === "mean_height"));
        
        let diffStr = "-";
        if (typeof valEarth === "number" && typeof valTarget === "number") {
          const compTarget = isBagnoldScaled ? valTarget * 2.82 : valTarget;
          const diffPct = ((valEarth - compTarget) / Math.max(Math.abs(compTarget), 1e-4)) * 100;
          diffStr = `${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}%`;
        }

        return `
          <tr class="hover:bg-white/[0.02] transition-colors">
            <td class="p-3 text-slate-300 font-medium">${PARAM_LABELS[key] || key}</td>
            <td class="p-3 text-emerald-400 font-semibold">${typeof valEarth === 'number' ? (Number.isInteger(valEarth) ? valEarth : valEarth.toFixed(3)) : valEarth}</td>
            <td class="p-3 ${site.body === 'mars' ? 'text-amber-400' : 'text-sky-400'}">
              ${typeof valTarget === 'number' ? (Number.isInteger(valTarget) ? valTarget : valTarget.toFixed(3)) : valTarget}
              ${isBagnoldScaled ? '<span class="text-[9px] text-amber-500/80 font-mono ml-1">(2.82×)</span>' : ''}
            </td>
            <td class="p-3 text-slate-400 font-mono text-[10px]">${diffStr}</td>
            <td class="p-3 text-right text-slate-400">${(weights[key] * 100).toFixed(0)}%</td>
          </tr>
        `;
      }).join("");
    }

    // =========================================================================
    // ESTÚDIO 1: PERFIL TOPOGRÁFICO (DEM 2D)
    // =========================================================================
    function renderDynamicFigure(site, target) {
      const container = document.getElementById("svg-container");
      
      if (site.type === "crater") {
        document.getElementById("topo-left-label").textContent = `Cota Borda: +${site.metrics.rim_height_m}m`;
        document.getElementById("topo-center-label").textContent = `Diâmetro D = ${(site.metrics.diameter_m / 1000).toFixed(1)} km | Declividade P90 = ${site.metrics.declividade_parede_p90}°`;
        document.getElementById("topo-right-label").textContent = `Profundidade: -${site.metrics.depth_m}m`;

        container.innerHTML = `
          <svg viewBox="0 0 680 160" class="w-full h-full">
            <defs>
              <linearGradient id="craterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#059669" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <line x1="40" y1="30" x2="640" y2="30" stroke="#1e293b" stroke-dasharray="2 2"/>
            <line x1="40" y1="80" x2="640" y2="80" stroke="#1e293b" stroke-dasharray="2 2"/>
            <line x1="40" y1="130" x2="640" y2="130" stroke="#1e293b" stroke-dasharray="2 2"/>

            <!-- Curva Alvo Planetário -->
            <path d="M 50,80 Q 140,80 180,45 Q 230,140 340,140 Q 450,140 500,45 Q 540,80 630,80" 
                  fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4 3" opacity="0.75" />

            <!-- Curva Sítio Terrestre -->
            <path d="M 50,80 Q 150,80 190,40 Q 240,135 340,135 Q 440,135 490,40 Q 530,80 630,80 L 630,150 L 50,150 Z" fill="url(#craterGrad)" />
            <path d="M 50,80 Q 150,80 190,40 Q 240,135 340,135 Q 440,135 490,40 Q 530,80 630,80" fill="none" stroke="#10b981" stroke-width="2.5" />

            <circle cx="190" cy="40" r="3.5" fill="#10b981" />
            <circle cx="490" cy="40" r="3.5" fill="#10b981" />
            <circle cx="340" cy="135" r="3.5" fill="#10b981" />

            <text x="190" y="28" fill="#10b981" font-size="10" font-family="monospace" text-anchor="middle">+${site.metrics.rim_height_m}m</text>
            <text x="340" y="152" fill="#10b981" font-size="10" font-family="monospace" text-anchor="middle">Piso: -${site.metrics.depth_m}m</text>
            <text x="490" y="28" fill="#10b981" font-size="10" font-family="monospace" text-anchor="middle">Borda</text>
          </svg>
        `;
      } else {
        document.getElementById("topo-left-label").textContent = `Altura Média: ${site.metrics.mean_height}m`;
        document.getElementById("topo-center-label").textContent = `Comprimento Onda λ = ${site.metrics.wavelength}m | Azimute = ${site.metrics.crest_azimuth}°`;
        document.getElementById("topo-right-label").textContent = `Espaçamento: ${site.metrics.mean_spacing}m`;

        container.innerHTML = `
          <svg viewBox="0 0 680 160" class="w-full h-full">
            <defs>
              <linearGradient id="duneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#f97316" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#c2410c" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <line x1="40" y1="120" x2="640" y2="120" stroke="#1e293b" stroke-dasharray="2 2"/>
            <line x1="40" y1="50" x2="640" y2="50" stroke="#1e293b" stroke-dasharray="2 2"/>

            <path d="M 50,120 C 130,120 180,65 240,65 C 265,65 270,120 310,120 C 390,120 440,65 500,65 C 525,65 530,120 570,120" 
                  fill="none" stroke="#fb923c" stroke-width="1.8" stroke-dasharray="4 3" opacity="0.75" />

            <path d="M 50,120 C 120,120 170,55 220,55 C 240,55 245,120 280,120 C 350,120 400,55 450,55 C 470,55 475,120 510,120 L 510,145 L 50,145 Z" fill="url(#duneGrad)" />
            <path d="M 50,120 C 120,120 170,55 220,55 C 240,55 245,120 280,120 C 350,120 400,55 450,55 C 470,55 475,120 510,120" fill="none" stroke="#f97316" stroke-width="2.5" />

            <circle cx="220" cy="55" r="3.5" fill="#f97316" />
            <circle cx="450" cy="55" r="3.5" fill="#f97316" />

            <text x="220" y="42" fill="#f97316" font-size="10" font-family="monospace" text-anchor="middle">Crista (+${site.metrics.mean_height}m)</text>
            <text x="335" y="105" fill="#94a3b8" font-size="9" font-family="monospace" text-anchor="middle">λ = ${site.metrics.wavelength}m (Bagnold Scaled)</text>
          </svg>
        `;
      }
    }

    // =========================================================================
    // ESTÚDIO 2: DECOMPOSIÇÃO EM BARRAS
    // =========================================================================
    function renderFeatureBars(site, target) {
      const container = document.getElementById("feature-bars-container");
      const weights = site.type === "crater" ? CRATER_WEIGHTS : DUNE_WEIGHTS;

      container.innerHTML = Object.keys(weights).map(key => {
        let valEarth = Number(site.metrics[key]) || 0;
        let valPlanet = Number(target[key]) || 0;

        if (site.type === "dune" && (key === "wavelength" || key === "mean_spacing" || key === "mean_height")) {
          valPlanet = valPlanet * 2.82;
        }

        const maxVal = Math.max(Math.abs(valEarth), Math.abs(valPlanet), 1e-4);
        const normE = Math.min(100, Math.max(0, (valEarth / maxVal) * 100));
        const normP = Math.min(100, Math.max(0, (valPlanet / maxVal) * 100));
        const planetColor = site.body === 'mars' ? 'bg-amber-500' : 'bg-sky-400';

        return `
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-mono">
              <span class="text-slate-300">${PARAM_LABELS[key] || key}</span>
              <div class="flex gap-3">
                <span class="text-emerald-400">${Number.isInteger(valEarth) ? valEarth : valEarth.toFixed(2)}</span>
                <span class="${site.body === 'mars' ? 'text-amber-400' : 'text-sky-400'}">${Number.isInteger(valPlanet) ? valPlanet : valPlanet.toFixed(2)}</span>
              </div>
            </div>
            <div class="space-y-0.5">
              <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div class="h-1.5 rounded-full bg-emerald-500 transition-all duration-300" style="width: ${normE.toFixed(1)}%"></div>
              </div>
              <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div class="h-1.5 rounded-full ${planetColor} transition-all duration-300" style="width: ${normP.toFixed(1)}%"></div>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

    // =========================================================================
    // ESTÚDIO 3: RADAR MULTIDIMENSIONAL
    // =========================================================================
    function renderRadarChart(earthMetrics, targetMetrics, type) {
      const container = document.getElementById("radar-svg-container");
      const weights = type === "crater" ? CRATER_WEIGHTS : DUNE_WEIGHTS;
      const keys = Object.keys(weights);
      const totalAxes = keys.length;
      
      const cx = 200, cy = 110, r = 85;
      const angleStep = (Math.PI * 2) / totalAxes;

      const rings = [0.25, 0.50, 0.75, 1.00].map(level => {
        const pts = [];
        for (let i = 0; i < totalAxes; i++) {
          const angle = i * angleStep - Math.PI / 2;
          const x = cx + Math.cos(angle) * (r * level);
          const y = cy + Math.sin(angle) * (r * level);
          pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }
        return `<polygon points="${pts.join(' ')}" fill="none" stroke="#1e293b" stroke-dasharray="2 2" stroke-width="1"/>`;
      }).join("");

      const axes = keys.map((key, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x2 = cx + Math.cos(angle) * r;
        const y2 = cy + Math.sin(angle) * r;
        const lx = cx + Math.cos(angle) * (r + 18);
        const ly = cy + Math.sin(angle) * (r + 18);
        const shortLabel = (PARAM_LABELS[key] || key).split(" ")[0].slice(0, 8);

        return `
          <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#334155" stroke-opacity="0.5"/>
          <text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" fill="#64748b" font-size="8" font-family="monospace" text-anchor="middle">${shortLabel}</text>
        `;
      }).join("");

      const ptsEarth = [];
      const ptsTarget = [];

      keys.forEach((key, i) => {
        let valEarth = Number(earthMetrics[key]) || 0;
        let valPlanet = Number(targetMetrics[key]) || 0;

        if (type === "dune" && (key === "wavelength" || key === "mean_spacing" || key === "mean_height")) {
          valPlanet = valPlanet * 2.82;
        }

        const maxVal = Math.max(Math.abs(valEarth), Math.abs(valPlanet), 1e-4);
        const normE = Math.min(1.0, Math.max(0.05, valEarth / maxVal));
        const normP = Math.min(1.0, Math.max(0.05, valPlanet / maxVal));

        const angle = i * angleStep - Math.PI / 2;
        ptsEarth.push(`${(cx + Math.cos(angle) * (r * normE)).toFixed(1)},${(cy + Math.sin(angle) * (r * normE)).toFixed(1)}`);
        ptsTarget.push(`${(cx + Math.cos(angle) * (r * normP)).toFixed(1)},${(cy + Math.sin(angle) * (r * normP)).toFixed(1)}`);
      });

      const targetStroke = type === "crater" ? "#38bdf8" : "#fb923c";
      const targetFill = type === "crater" ? "rgba(56, 189, 248, 0.2)" : "rgba(251, 146, 60, 0.2)";

      container.innerHTML = `
        <svg viewBox="0 0 400 220" class="w-full h-full">
          ${rings}
          ${axes}
          <polygon points="${ptsTarget.join(' ')}" fill="${targetFill}" stroke="${targetStroke}" stroke-width="1.8" stroke-dasharray="3 2" />
          <polygon points="${ptsEarth.join(' ')}" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="2.2" />
          <circle cx="${cx}" cy="${cy}" r="2" fill="#ffffff" />
        </svg>
      `;
    }

    function setStudioTab(tab) {
      currentStudioTab = tab;
      ["profile", "bars", "radar"].forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const view = document.getElementById(`studio-${t}-view`);
        if (t === tab) {
          btn.className = "px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold transition-all cursor-pointer";
          view.classList.remove("hidden");
        } else {
          btn.className = "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer";
          view.classList.add("hidden");
        }
      });
    }

    function selectSite(idx) {
      currentSiteIndex = idx;
      const site = SITES_DATA[idx];

      // Auto alternar projeção caso o sítio esteja fora da visão atual
      if (currentViewMode === "nordeste") {
        if (site.lon < -48.5 || site.lon > -34.0 || site.lat < -16.0 || site.lat > -1.8) {
          if (site.uf.includes("Brasil") || site.uf.includes("BR") || site.lon < -30) {
            setMapViewMode("brasil");
          } else {
            setMapViewMode("mundo");
          }
        }
      }

      renderSelectors();
      renderMapPins();
      renderDetail();
    }

    function setFormType(type) {
      activeFormType = type;
      const btnC = document.getElementById("btn-form-crater");
      const btnD = document.getElementById("btn-form-dune");
      const fieldsC = document.getElementById("crater-form-fields");
      const fieldsD = document.getElementById("dune-form-fields");

      if (type === "crater") {
        btnC.className = "px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold transition-all cursor-pointer";
        btnD.className = "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer";
        fieldsC.classList.remove("hidden");
        fieldsD.classList.add("hidden");
      } else {
        btnD.className = "px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold transition-all cursor-pointer";
        btnC.className = "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer";
        fieldsD.classList.remove("hidden");
        fieldsC.classList.add("hidden");
      }
    }

    function autoCalcCraterRatios() {
      const diam = parseFloat(document.getElementById("c-diametro_m").value) || 0;
      const depth = parseFloat(document.getElementById("c-profundidade_m").value) || 0;
      const rim = parseFloat(document.getElementById("c-altura_borda_m").value) || 0;

      if (diam > 0) {
        if (depth > 0) document.getElementById("c-razao_dD").value = (depth / diam).toFixed(4);
        if (rim > 0) document.getElementById("c-razao_borda_D").value = (rim / diam).toFixed(4);
      }
    }

    const PRESETS = {
      barringer: {
        name: "Barringer Meteor Crater",
        uf: "EUA / AZ",
        lat: 35.027,
        lon: -111.022,
        type: "crater",
        metrics: { diameter_m: 1186, depth_m: 170.0, depth_diameter_ratio: 0.1433, rim_height_m: 45.0, rim_height_diameter_ratio: 0.0379, rim_variation_m: 22.0, rim_radius_cv: 0.014, mean_wall_slope: 32.0, wall_slope_p90: 38.5, circularity: 0.985, rim_coherence: 0.990 }
      },
      santa_marta: {
        name: "Cratera de Santa Marta",
        uf: "Brasil / PI",
        lat: -10.167,
        lon: -45.250,
        type: "crater",
        metrics: { diameter_m: 9949, depth_m: 179.8, depth_diameter_ratio: 0.0181, rim_height_m: 56.6, rim_height_diameter_ratio: 0.0057, rim_variation_m: 142.5, rim_radius_cv: 0.038, mean_wall_slope: 6.7, wall_slope_p90: 18.2, circularity: 0.942, rim_coherence: 0.472 }
      },
      erg_chebbi: {
        name: "Erg Chebbi (Saara)",
        uf: "Marrocos",
        lat: 31.150,
        lon: -3.983,
        type: "dune",
        metrics: { mean_height: 28.0, height_p90: 45.0, wavelength: 420, crest_azimuth: 145, dune_density: 2.10, mean_spacing: 520, aridity_index: 0.040 }
      },
      sossusvlei: {
        name: "Sossusvlei",
        uf: "Namíbia",
        lat: -24.727,
        lon: 15.340,
        type: "dune",
        metrics: { mean_height: 35.0, height_p90: 58.0, wavelength: 510, crest_azimuth: 155, dune_density: 1.80, mean_spacing: 620, aridity_index: 0.020 }
      },
      shackleton_analog: {
        name: "Análogo Polar Shackleton",
        uf: "Brasil / RN",
        lat: -6.280,
        lon: -36.490,
        type: "crater",
        metrics: { diameter_m: 4500, depth_m: 850.0, depth_diameter_ratio: 0.1888, rim_height_m: 270.0, rim_height_diameter_ratio: 0.0600, rim_variation_m: 130.0, rim_radius_cv: 0.018, mean_wall_slope: 29.5, wall_slope_p90: 34.2, circularity: 0.985, rim_coherence: 0.960 }
      }
    };

    function fillPreset(key) {
      const p = PRESETS[key];
      if (!p) return;

      document.getElementById("input-name").value = p.name;
      document.getElementById("input-uf").value = p.uf;
      document.getElementById("input-lat").value = p.lat;
      document.getElementById("input-lon").value = p.lon;

      setFormType(p.type);

      if (p.type === "crater") {
        document.getElementById("c-diametro_m").value = p.metrics.diameter_m;
        document.getElementById("c-profundidade_m").value = p.metrics.depth_m;
        document.getElementById("c-razao_dD").value = p.metrics.depth_diameter_ratio;
        document.getElementById("c-altura_borda_m").value = p.metrics.rim_height_m;
        document.getElementById("c-razao_borda_D").value = p.metrics.rim_height_diameter_ratio;
        document.getElementById("c-borda_variacao_m").value = p.metrics.rim_variation_m;
        document.getElementById("c-borda_raio_cv").value = p.metrics.rim_radius_cv;
        document.getElementById("c-declividade_parede_media").value = p.metrics.mean_wall_slope;
        document.getElementById("c-declividade_parede_p90").value = p.metrics.wall_slope_p90;
        document.getElementById("c-circularidade").value = p.metrics.circularity;
        document.getElementById("c-coerencia_borda").value = p.metrics.rim_coherence;
      } else {
        document.getElementById("d-altura_media").value = p.metrics.mean_height;
        document.getElementById("d-altura_p90").value = p.metrics.height_p90;
        document.getElementById("d-comprimento_onda").value = p.metrics.wavelength;
        document.getElementById("d-orientacao_azimute").value = p.metrics.crest_azimuth;
        document.getElementById("d-densidade_dunas").value = p.metrics.dune_density;
        document.getElementById("d-espacamento_medio").value = p.metrics.mean_spacing;
        document.getElementById("d-indice_aridez").value = p.metrics.aridity_index;
      }

      showToast(`Preset "${p.name}" carregado com sucesso!`);
    }

    function addNewSiteFromForm() {
      const name = document.getElementById("input-name").value.trim();
      const uf = document.getElementById("input-uf").value.trim() || "Global";
      const lat = parseFloat(document.getElementById("input-lat").value);
      const lon = parseFloat(document.getElementById("input-lon").value);

      if (!name || isNaN(lat) || isNaN(lon)) {
        showToast("Preencha Nome, Latitude e Longitude da localidade.", "error");
        return;
      }

      const id = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
      let metrics = {};

      if (activeFormType === "crater") {
        metrics = {
          diameter_m: parseFloat(document.getElementById("c-diametro_m").value) || 3000,
          depth_m: parseFloat(document.getElementById("c-profundidade_m").value) || 200,
          depth_diameter_ratio: parseFloat(document.getElementById("c-razao_dD").value) || 0.06,
          rim_height_m: parseFloat(document.getElementById("c-altura_borda_m").value) || 80,
          rim_height_diameter_ratio: parseFloat(document.getElementById("c-razao_borda_D").value) || 0.02,
          rim_variation_m: parseFloat(document.getElementById("c-borda_variacao_m").value) || 50,
          rim_radius_cv: parseFloat(document.getElementById("c-borda_raio_cv").value) || 0.03,
          mean_wall_slope: parseFloat(document.getElementById("c-declividade_parede_media").value) || 16,
          wall_slope_p90: parseFloat(document.getElementById("c-declividade_parede_p90").value) || 25,
          circularity: parseFloat(document.getElementById("c-circularidade").value) || 0.92,
          rim_coherence: parseFloat(document.getElementById("c-coerencia_borda").value) || 0.88
        };
      } else {
        metrics = {
          mean_height: parseFloat(document.getElementById("d-altura_media").value) || 7,
          height_p90: parseFloat(document.getElementById("d-altura_p90").value) || 12,
          wavelength: parseFloat(document.getElementById("d-comprimento_onda").value) || 300,
          crest_azimuth: parseFloat(document.getElementById("d-orientacao_azimute").value) || 160,
          dune_density: parseFloat(document.getElementById("d-densidade_dunas").value) || 5,
          mean_spacing: parseFloat(document.getElementById("d-espacamento_medio").value) || 350,
          aridity_index: parseFloat(document.getElementById("d-indice_aridez").value) || 0.35
        };
      }

      const newSite = {
        id: id,
        name: name,
        uf: uf,
        category: activeFormType === "crater" ? "Cratera de Impacto" : "Campo de Dunas",
        type: activeFormType,
        body: activeFormType === "crater" ? "moon" : "mars",
        lat: lat,
        lon: lon,
        metrics: metrics,
        similarities: [
          "Morfometria cadastrada compatível com alvos de catálogo.",
          "Valores de curvatura e razão adimensional calculados via motor."
        ],
        differences: [
          "Intemperismo superficial terrestre ativo.",
          "Ambiente deposicional condicionado pela atmosfera local."
        ]
      };

      SITES_DATA.unshift(newSite);
      currentSiteIndex = 0;

      setMapViewMode('mundo');
      renderSelectors();
      renderDetail();
      renderMapPins();
      showToast(`Localidade "${name}" adicionada ao catálogo mundial!`);
      scrollToComparison();
    }

    function exportCurrentSiteJson() {
      const site = SITES_DATA[currentSiteIndex];
      const jsonStr = JSON.stringify(site, null, 2);
      navigator.clipboard.writeText(jsonStr).then(() => {
        showToast("JSON do sítio copiado para a área de transferência!");
      }).catch(() => {
        prompt("Copie o JSON do sítio:", jsonStr);
      });
    }

    function scrollToRectMap() {
      document.getElementById("rect-map-section").scrollIntoView({ behavior: 'smooth' });
    }

    function scrollToComparison() {
      document.getElementById("comparison-card-section").scrollIntoView({ behavior: 'smooth' });
    }

    function showToast(message, type = "success") {
      const container = document.getElementById("toast-container");
      const toast = document.createElement("div");
      toast.className = `toast-msg glass-panel px-4 py-3 rounded-xl border text-xs font-mono shadow-2xl flex items-center gap-2.5 ${
        type === "success" ? "border-emerald-500/50 text-emerald-300" : "border-rose-500/50 text-rose-300"
      }`;
      toast.innerHTML = `
        <span class="text-sm font-bold">${type === "success" ? "✓" : "⚠"}</span>
        <span>${message}</span>
      `;
      container.appendChild(toast);
      
      requestAnimationFrame(() => toast.classList.add("show"));
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // Spotlight cursor tracking (ReactBits)
    document.addEventListener("mousemove", e => {
      document.querySelectorAll(".spotlight-card").forEach(card => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
    });

    // Inicialização geral
    initGlobe();
    renderBaseMap();
    renderSelectors();
    renderDetail();
  </script>
</body>
</html>
'''

def render_html():
    catalog = Path(__file__).resolve().parents[1] / "data/earth/geographical_context.json"
    context = json.loads(catalog.read_text(encoding="utf-8"))
    payload = json.dumps(context, ensure_ascii=False).replace("<", "\\u003c")
    return HTML_CONTENT.replace("__GEOGRAPHICAL_CONTEXT_JSON__", payload)


def build():
    rendered = render_html()
    dest1 = os.path.abspath("deliverables/demo/index.html")
    dest2 = r"C:\Users\corre\.gemini\antigravity\brain\55bdf316-4566-4b24-9470-557a8cd94845\analog_explorer.html"

    os.makedirs(os.path.dirname(dest1), exist_ok=True)
    with open(dest1, "w", encoding="utf-8") as f:
        f.write(rendered)
    print(f"Generated: {dest1} ({len(rendered)} bytes)")

    if os.path.exists(os.path.dirname(dest2)):
        with open(dest2, "w", encoding="utf-8") as f:
            f.write(rendered)
        print(f"Generated artifact: {dest2} ({len(rendered)} bytes)")

if __name__ == "__main__":
    build()
