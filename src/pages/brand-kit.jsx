import { useState, useEffect, useRef, useCallback, useId } from 'react'
import Head from 'next/head'

/* ==========================================================================
   Durga Puja 2026.
   These Gregorian dates shift every year with the lunar calendar — confirm
   against the panjika before each season. This is the only place they live.
   ========================================================================== */
const MAHALAYA = '2026-10-11T00:00:00+05:30'

const PUJO_DAYS = [
  { bn: 'ষষ্ঠী', en: 'Shashthi', iso: '2026-10-17T00:00:00+05:30' },
  { bn: 'সপ্তমী', en: 'Saptami', iso: '2026-10-18T00:00:00+05:30' },
  { bn: 'অষ্টমী', en: 'Ashtami', iso: '2026-10-19T00:00:00+05:30' },
  { bn: 'নবমী', en: 'Navami', iso: '2026-10-20T00:00:00+05:30' },
  { bn: 'দশমী', en: 'Dashami', iso: '2026-10-21T00:00:00+05:30' },
]

/* ------------------------------------------------------------------ data -- */

const CORE = [
  { token: '--mk-obsidian', name: 'Obsidian', hex: '#0D1012', role: 'Base canvas — a cool rich black, never flat' },
  { token: '--mk-ink', name: 'Ink', hex: '#141819', role: 'Surface 1 — cards, panels' },
  { token: '--mk-slate', name: 'Slate', hex: '#1C2225', role: 'Surface 2 — elevated, hover' },
  { token: '--mk-bordeaux', name: 'Deep Bordeaux', hex: '#3F0D12', role: 'Warm surface, red bands' },
  { token: '--mk-bordeaux-deep', name: 'Bordeaux Deep', hex: '#260A0E', role: 'Cards on a red band — never black-on-red' },
  { token: '--mk-crimson-depth', name: 'Crimson Depth', hex: '#710014', role: 'Deep accent, dramatic grounds' },
  { token: '--mk-ruby', name: 'Ruby Red', hex: '#98111E', role: 'Secondary red, light-mode primary' },
  { token: '--mk-crimson', name: 'Crimson Silk', hex: '#D72638', role: 'The action colour — budgeted' },
  { token: '--mk-taxi', name: 'Taxi Yellow', hex: '#F2B33D', role: 'The Kolkata accent — taxi, protima, diya' },
  { token: '--mk-ash', name: 'Ash', hex: '#AFA2A0', role: 'Muted text, metadata, captions' },
  { token: '--mk-pearl', name: 'Soft Pearl', hex: '#F2F1ED', role: 'Body text, laal-paar white' },
  { token: '--mk-white', name: 'Pop White', hex: '#FCFBF8', role: 'Display, numerals, card titles' },
  { token: '--mk-blush', name: 'Soft Blush', hex: '#FBE4E3', role: 'Rare highlight' },
]

const CONTRAST = [
  { pair: 'Pop White on Obsidian', ratio: '18.5', grade: 'AAA', note: 'Display, numerals' },
  { pair: 'Soft Pearl on Obsidian', ratio: '16.9', grade: 'AAA', note: 'Body text' },
  { pair: 'Soft Pearl on Deep Bordeaux', ratio: '14.5', grade: 'AAA', note: 'Body on red surfaces' },
  { pair: 'Taxi Yellow on Obsidian', ratio: '10.3', grade: 'AAA', note: 'The accent that may carry small text' },
  { pair: 'Obsidian on Taxi Yellow', ratio: '10.3', grade: 'AAA', note: 'Yellow buttons, badges' },
  { pair: 'Ash on Obsidian', ratio: '7.2', grade: 'AA', note: 'Captions, metadata' },
  { pair: 'Soft Pearl on Crimson Silk', ratio: '4.4', grade: 'AA', note: 'Button labels, 16px and up' },
  { pair: 'Crimson Silk on Obsidian', ratio: '3.8', grade: 'Large only', note: 'Never body text — use Taxi instead' },
]

const SCALE = [
  { role: 'Title card', size: 104, lh: 0.95, ls: '-0.04em' },
  { role: 'Display', size: 72, lh: 1.0, ls: '-0.035em' },
  { role: 'H1', size: 52, lh: 1.05, ls: '-0.03em' },
  { role: 'H2', size: 38, lh: 1.1, ls: '-0.02em' },
  { role: 'H3', size: 26, lh: 1.2, ls: '-0.01em' },
]

const CURVES = [
  { name: 'Reveal', css: 'cubic-bezier(0.16, 1, 0.3, 1)', ms: 700, use: 'Entrances, band reveals' },
  { name: 'Move', css: 'cubic-bezier(0.65, 0, 0.35, 1)', ms: 320, use: 'Transitions, opening' },
  { name: 'Draw', css: 'cubic-bezier(0.32, 0.72, 0, 1)', ms: 900, use: 'The kolka, the alpona line' },
]

const NAV = [
  ['Countdown', 'countdown'], ['Mark', 'mark'], ['Colour', 'colour'], ['Type', 'type'],
  ['Motifs', 'motifs'], ['Emblems', 'emblems'], ['Icons', 'icons'], ['Components', 'components'],
]

/* ================================================================ emblems == */
/*  Filled, two-tone cultural marks in the alpona vocabulary: Pearl body with a
    Crimson accent, exactly as design/kolka_design_2.png does it. 64px grid.
    These are NOT UI icons — see ICONS below for those. design.md §7.            */

const P = 'var(--mk-pearl)'
const CR = 'var(--mk-crimson)'
const YL = 'var(--mk-taxi)'

function EP({ x, y, rot, L, w, fill = P }) {
  return (
    <g transform={`rotate(${rot} ${x} ${y}) translate(${x} ${y})`}>
      <path d={petalPath(L, w)} fill={fill} />
    </g>
  )
}

const EMBLEMS = {
  eyes: (
    <>
      <path d="M32 2 C37.5 9 37.5 18 32 25 C26.5 18 26.5 9 32 2Z" fill={P} />
      <circle cx="32" cy="14" r="3.4" fill={CR} />
      <path d="M1 31 C10 19 25 18 32 27 C25 23 11 25 1 31Z" fill={P} />
      <path d="M63 31 C54 19 39 18 32 27 C39 23 53 25 63 31Z" fill={P} />
      <path d="M1 47 C10 34 25 33 31 41 C25 52 10 54 1 47Z" fill={P} />
      <circle cx="17" cy="43" r="5.6" fill={CR} />
      <path d="M63 47 C54 34 39 33 33 41 C39 52 54 54 63 47Z" fill={P} />
      <circle cx="47" cy="43" r="5.6" fill={CR} />
      <circle cx="32" cy="58" r="3.2" fill={P} />
    </>
  ),
  mukut: (
    <>
      <path fill={P} d="M8 47 C8 40 10 35 12 31 C14 37 16 40 18 42 C18 33 20 21 24 12 C27 21 29 33 30 42
        C31 31 31 17 32 4 C33 17 33 31 34 42 C35 33 37 21 40 12 C44 21 46 33 46 42
        C48 40 50 37 52 31 C54 35 56 40 56 47Z" />
      <path d="M4 47 L60 47 C60 55 56 58 50 58 L14 58 C8 58 4 55 4 47Z" fill={P} />
      <circle cx="32" cy="52.5" r="4.2" fill={YL} />
      <circle cx="19" cy="52.5" r="2.6" fill={YL} /><circle cx="45" cy="52.5" r="2.6" fill={YL} />
      <circle cx="24" cy="8" r="2.2" fill={P} /><circle cx="40" cy="8" r="2.2" fill={P} />
    </>
  ),
  dhaak: (
    <>
      <EP x={22} y={27} rot={-18} L={16} w={4.2} /><EP x={32} y={25} rot={0} L={19} w={4.8} />
      <EP x={42} y={27} rot={18} L={16} w={4.2} />
      <path d="M12 29 C24 25 40 25 52 29 C56 34 56 48 52 53 C40 57 24 57 12 53 C8 48 8 34 12 29Z" fill={CR} />
      <ellipse cx="12" cy="41" rx="5" ry="14" fill={P} />
      <ellipse cx="52" cy="41" rx="5" ry="14" fill={P} />
      <path d="M18 30 L24 52 M26 29 L32 53 M34 29 L40 53 M42 30 L48 52"
        stroke={P} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </>
  ),
  dhunuchi: (
    <>
      <path d="M25 17 C20 10 28 7 24 1" stroke={P} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M32 16 C38 8 29 5 33 0" stroke={P} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M39 17 C44 10 36 7 40 1" stroke={P} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="23" rx="18" ry="4" fill={P} />
      <path d="M14 23 C16 37 22 45 32 45 C42 45 48 37 50 23Z" fill={P} />
      <circle cx="25" cy="24" r="3" fill={CR} /><circle cx="32" cy="25" r="3.6" fill={CR} />
      <circle cx="39" cy="24" r="3" fill={CR} />
      <path d="M28 45 L36 45 L35 53 L29 53Z" fill={P} />
      <path d="M19 62 C19 54 25 53 32 53 C39 53 45 54 45 62Z" fill={P} />
    </>
  ),
  shankha: (
    <>
      <path d="M18 50 L3 62 L15 44Z" fill={P} />
      <ellipse cx="35" cy="33" rx="20" ry="26" transform="rotate(-34 35 33)" fill={P} />
      <ellipse cx="27" cy="44" rx="5" ry="13" transform="rotate(-34 27 44)" fill={CR} />
      <path d="M44 12 C50 19 52 28 50 36" stroke={CR} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M37 9 C45 16 48 28 45 38" stroke={CR} strokeWidth="1.7" fill="none" strokeLinecap="round" />
    </>
  ),
  lotus: (
    <>
      <EP x={32} y={46} rot={0} L={40} w={10} /><EP x={32} y={46} rot={-36} L={34} w={9} />
      <EP x={32} y={46} rot={36} L={34} w={9} /><EP x={32} y={46} rot={-70} L={26} w={7.5} />
      <EP x={32} y={46} rot={70} L={26} w={7.5} />
      <path d="M4 48 C14 56 24 58 32 58 C40 58 50 56 60 48 C52 60 40 62 32 62 C24 62 12 60 4 48Z" fill={P} />
      <circle cx="32" cy="45" r="5" fill={CR} />
    </>
  ),
  diya: (
    <>
      <path d="M32 3 C25 16 21 25 21 30 C21 36 26 39 32 39 C38 39 43 36 43 30 C43 25 39 16 32 3Z" fill={YL} />
      <ellipse cx="32" cy="42" rx="26" ry="5" fill={P} />
      <path d="M6 42 C7 53 18 60 32 60 C46 60 57 53 58 42Z" fill={P} />
    </>
  ),
  kalash: (
    <>
      <EP x={19} y={25} rot={-58} L={21} w={5.5} /><EP x={45} y={25} rot={58} L={21} w={5.5} />
      <EP x={25} y={22} rot={-30} L={22} w={5.5} /><EP x={39} y={22} rot={30} L={22} w={5.5} />
      <EP x={32} y={20} rot={0} L={15} w={5} />
      <circle cx="32" cy="11" r="6" fill={P} />
      <path d="M27 11 C29 8 35 8 37 11" stroke={YL} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M10 25 L54 25 L51 33 L13 33Z" fill={P} />
      <path d="M15 33 C11 49 19 60 32 60 C45 60 53 49 49 33Z" fill={P} />
      <circle cx="32" cy="46" r="6" fill={CR} />
    </>
  ),
  trishul: (
    <>
      <path d="M32 2 C28.5 11 26.5 17 26.5 22 L37.5 22 C37.5 17 35.5 11 32 2Z" fill={P} />
      <path d="M13 22 C12 13 15 6 20 3 C19 11 20 17 22.5 22Z" fill={P} />
      <path d="M51 22 C52 13 49 6 44 3 C45 11 44 17 41.5 22Z" fill={P} />
      <path d="M11 22 L53 22 L53 28 L11 28Z" fill={P} />
      <path d="M29 28 L35 28 L34 62 L30 62Z" fill={P} />
      <circle cx="32" cy="37" r="4" fill={CR} />
    </>
  ),
  kash: (
    <>
      <path d="M32 33 C21 29 14 16 15 2 C26 7 32 19 32 33Z" fill={P} />
      <path d="M32 33 C43 29 50 16 49 2 C38 7 32 19 32 33Z" fill={P} />
      <path d="M30 62 L30 28 L34 28 L34 62Z" fill={P} />
      <circle cx="32" cy="27" r="3.2" fill={CR} />
    </>
  ),
  shiuli: (
    <>
      {[0, 60, 120, 180, 240, 300].map((d) => <EP key={d} x={32} y={26} rot={d} L={21} w={7.5} />)}
      <circle cx="32" cy="26" r="6" fill={CR} />
      <path d="M30.5 62 L30.5 30 L33.5 30 L33.5 62Z" fill={CR} />
    </>
  ),
}

const EMBLEM_LIST = [
  ['eyes', "Durga's eyes", 'চোখ', 'The most recognisable mark in Bengal. Brand moments, splash, empty states.'],
  ['mukut', 'Mukut', 'মুকুট', 'The crown. Premium, featured and awarded states.'],
  ['dhaak', 'Dhaak', 'ঢাক', 'Rhythm and arrival — the sound of the first morning. Live and now-playing.'],
  ['dhunuchi', 'Dhunuchi', 'ধুনুচি', 'Smoke and evening aarti. Atmosphere, ambience, evening listings.'],
  ['shankha', 'Shankha', 'শাঁখ', 'The call. Announcements, notifications, the start of something.'],
  ['lotus', 'Lotus', 'পদ্ম', 'Purity. The recurring secondary symbol beneath the kolka.'],
  ['diya', 'Diya', 'প্রদীপ', 'Hope and a light left on. Saved items, favourites.'],
  ['kalash', 'Kalash', 'কলস', 'Prosperity. Contribution, community funds, giving.'],
  ['trishul', 'Trishul', 'ত্রিশূল', 'Strength and protection. Account security, verified paras.'],
  ['kash', 'Kash phool', 'কাশফুল', 'The season turning. Dates, countdowns, what is coming.'],
  ['shiuli', 'Shiuli', 'শিউলি', 'Morning and the first day. New, unseen, just added.'],
]

/* ================================================================== icons == */
/*  UI utility. Line, 32px grid, 1.5px, no fills — the deliberate opposite of
    the emblems, so the two can never be confused. design.md §7.                 */

const ICONS = {
  howrah: (
    <>
      <path d="M1 24h30" /><path d="M7 24V6M25 24V6" /><path d="M7 6h18" />
      <path d="M7 6q9 8 18 0" /><path d="M7 14h18" />
      <path d="M1 24 7 19M31 24 25 19" /><path d="M11 14v10M16 14v10M21 14v10" />
    </>
  ),
  tram: (
    <>
      <rect x="5" y="9" width="22" height="14" rx="2" /><path d="M5 14h22" />
      <circle cx="10" cy="26" r="2.2" /><circle cx="22" cy="26" r="2.2" />
      <path d="M16 9V5l5-2" /><path d="M9 18h4M19 18h4" />
    </>
  ),
  taxi: (
    <>
      <path d="M3 22v-3q0-3 3-3l2.5-5q.7-1.5 2.5-1.5h10q1.8 0 2.5 1.5L26 16q3 0 3 3v3Z" />
      <path d="M8.5 16h15" /><circle cx="9" cy="22" r="2.4" /><circle cx="23" cy="22" r="2.4" />
      <rect x="13" y="4" width="6" height="3.5" rx="1" />
    </>
  ),
  rickshaw: (
    <>
      <circle cx="11" cy="22" r="6" /><circle cx="11" cy="22" r="1.5" />
      <path d="M7 16h11l2-7H10Z" /><path d="M10 9q1-5 6-5t5 5" />
      <path d="M20 11 30 6M18 16l10-4" />
    </>
  ),
  victoria: (
    <>
      <path d="M2 28h28" /><path d="M4 25v-7h24v7" />
      <path d="M11 18q0-6 5-6t5 6" /><path d="M16 12V8" />
      <path d="M5 18q0-3.5 3-3.5M27 18q0-3.5-3-3.5" /><path d="M11 25v-4M21 25v-4" />
    </>
  ),
  bhaar: (
    <>
      <path d="M10.5 13 12.5 25q.3 1.5 3.5 1.5t3.5-1.5L21.5 13Z" /><path d="M9 13h14" />
      <path d="M13.5 9q1.5-2 0-4M18.5 9q1.5-2 0-4" />
    </>
  ),
  phuchka: (
    <>
      <circle cx="16" cy="18" r="9" /><path d="M10 13q6-4 12 0" />
      <path d="M13 9.5q3-2 6 0" /><circle cx="13" cy="20" r="1" /><circle cx="19" cy="21" r="1" />
    </>
  ),
  lamp: (
    <>
      <path d="M16 29V13" /><path d="M11.5 29h9" />
      <path d="M12 13l2-6h4l2 6Z" /><path d="M16 7V4" /><circle cx="16" cy="2.5" r="1.2" />
      <path d="M12.5 15q-4 0-4 3M19.5 15q4 0 4 3" />
    </>
  ),
  boat: (
    <>
      <path d="M3 19h26l-3.5 6H6.5Z" /><path d="M16 19V4" /><path d="M16 6l8 5-8 3.5" />
      <path d="M2 29q3-2.5 6 0t6 0 6 0 6 0" />
    </>
  ),
  balcony: (
    <>
      <path d="M7 3h18v17H7Z" /><path d="M7 9h18M7 14h18" /><path d="M3 20h26" />
      <path d="M6 20v7M11 20v7M16 20v7M21 20v7M26 20v7" /><path d="M3 27h26" />
    </>
  ),
  book: (
    <>
      <path d="M16 8q-4-3-11-2v18q7-1 11 2Z" /><path d="M16 8q4-3 11-2v18q-7-1-11 2Z" />
      <path d="M16 8v18" />
    </>
  ),
  signboard: (
    <>
      <rect x="4" y="5" width="24" height="14" rx="1.5" /><path d="M16 19v6" /><path d="M10 28h12" />
      <path d="M8 10h16M8 14.5h9" />
    </>
  ),
}

const ICON_LIST = [
  ['howrah', 'Howrah Bridge', 'The city itself — map and location states'],
  ['tram', 'Tram', 'Transport, routes, getting there'],
  ['taxi', 'Ambassador taxi', 'Rides, directions, distance'],
  ['rickshaw', 'Hand-pulled rickshaw', 'North Kolkata, heritage walks'],
  ['victoria', 'Victoria Memorial', 'Landmarks, monuments, guided routes'],
  ['balcony', 'North Kolkata balcony', 'Neighbourhoods, paras, old houses'],
  ['boat', 'Hooghly boat', 'The river, the ghats, crossings'],
  ['bhaar', 'Cha in a bhaar', 'Food and drink, adda, places to sit'],
  ['phuchka', 'Phuchka', 'Street food, markets, Gariahat'],
  ['book', 'College Street', 'Stories, long-form, the archive'],
  ['signboard', 'Hand-painted signage', 'Listings, names, para clubs'],
  ['lamp', 'Street lamp', 'Night mode, after-dark listings'],
]


/* ========================================================= alpona library == */
/*  Six motifs read straight off design/kolka_design.png. Solid, symmetrical,
    built from teardrops and dot runs. 64 x 112 grid.                          */

const MOTIF_LIB = {
  finial: (
    <>
      <path d="M32 4 C26 18 22 27 22 33 C22 40 26 44 32 44 C38 44 42 40 42 33 C42 27 38 18 32 4Z" fill={P} />
      <circle cx="32" cy="62" r="12" fill="none" stroke={P} strokeWidth="5" />
      <circle cx="32" cy="62" r="4.5" fill={CR} />
      <path d="M13 80 C13 93 21 100 32 100 C43 100 51 93 51 80 C47 89 40 93 32 93 C24 93 17 89 13 80Z" fill={P} />
      <circle cx="20" cy="108" r="3" fill={P} /><circle cx="32" cy="109" r="3.5" fill={P} />
      <circle cx="44" cy="108" r="3" fill={P} />
    </>
  ),
  flame: (
    <>
      <path d="M32 2 C27 14 24 22 24 27 C24 33 28 36 32 36 C36 36 40 33 40 27 C40 22 37 14 32 2Z" fill={P} />
      <EP x={32} y={66} rot={0} L={28} w={10} />
      <EP x={32} y={66} rot={-52} L={24} w={8} /><EP x={32} y={66} rot={52} L={24} w={8} />
      <EP x={32} y={66} rot={-86} L={18} w={6.5} /><EP x={32} y={66} rot={86} L={18} w={6.5} />
      <circle cx="32" cy="66" r="6" fill={CR} />
      <circle cx="22" cy="82" r="3" fill={P} /><circle cx="42" cy="82" r="3" fill={P} />
      <circle cx="32" cy="92" r="3.8" fill={P} /><circle cx="32" cy="104" r="2.6" fill={P} />
    </>
  ),
  rosette: (
    <>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180
        return <circle key={i} cx={32 + Math.cos(a) * 20} cy={40 + Math.sin(a) * 20} r="5.5" fill={P} />
      })}
      <circle cx="32" cy="40" r="19" fill={P} />
      <circle cx="32" cy="40" r="9" fill={CR} />
      <circle cx="32" cy="76" r="4" fill={P} />
      <circle cx="20" cy="90" r="3.2" fill={P} /><circle cx="32" cy="92" r="3.2" fill={P} />
      <circle cx="44" cy="90" r="3.2" fill={P} />
      <circle cx="32" cy="106" r="2.6" fill={P} />
    </>
  ),
  star: (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
        <EP key={d} x={32} y={42} rot={d} L={26} w={9} />
      ))}
      <circle cx="32" cy="42" r="7" fill={CR} />
      <circle cx="32" cy="86" r="4" fill={P} /><circle cx="32" cy="102" r="2.8" fill={P} />
    </>
  ),
  beadrun: (
    <>
      <circle cx="32" cy="8" r="4" fill={P} />
      <ellipse cx="32" cy="34" rx="9" ry="14" fill={P} />
      <EP x={32} y={62} rot={0} L={12} w={5} />
      <EP x={32} y={62} rot={-60} L={14} w={5} /><EP x={32} y={62} rot={60} L={14} w={5} />
      <circle cx="32" cy="80" r="4" fill={CR} />
      <circle cx="32" cy="96" r="3.2" fill={P} /><circle cx="32" cy="108" r="2.4" fill={P} />
    </>
  ),
  curl: (
    <>
      <path d="M32 4 C25 20 20 32 20 40 C20 48 25 53 32 53 C39 53 44 48 44 40 C44 32 39 20 32 4Z" fill={P} />
      <path d="M32 56 C40 66 26 76 33 88 C37 95 33 100 29 100" fill="none" stroke={P}
        strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="32" cy="108" r="3.4" fill={P} />
    </>
  ),
}

const MOTIF_LIB_LIST = [
  ['finial', 'Finial', 'Section openers and the top of a feature panel'],
  ['flame', 'Flame', 'Celebration moments — a completed contribution, a milestone'],
  ['rosette', 'Rosette', 'Avatars, para badges, category markers'],
  ['star', 'Star flower', 'Ratings, highlights, editor picks'],
  ['beadrun', 'Bead run', 'Vertical dividers and timeline nodes'],
  ['curl', 'Curl', 'Quote marks, pull-quotes, end-of-article marks'],
]

/* ============================================================== the kolka == */
/*  Built from design/kolka_design.png and kolka_design_2.png: solid filled
    petals and dots radiating from a red disc, flanked by two spiral volutes
    with hanging leaves and budded stems. Filled, not stroked — see design.md §5.

    Two forms:
      Medallion — the full motif. Hero, mark stage, closing. One per viewport.
      Sprig     — a filled teardrop over two dots. Headings, nav, bullets.        */

const KC = 120, KCY = 116, KR = 25          /* centre and disc radius */

const petalPath = (L, w) =>
  `M0 0 C${-w} ${-0.34 * L} ${-w} ${-0.72 * L} 0 ${-L} C${w} ${-0.72 * L} ${w} ${-0.34 * L} 0 0 Z`

/* [angle from vertical, length, half-width] — the gap at ±90° is where the volutes sit */
const K_PETALS = [
  [0, 58, 10], [34, 44, 9], [-34, 44, 9], [66, 34, 7.5], [-66, 34, 7.5],
  [180, 48, 10], [143, 38, 8], [-143, 38, 8], [110, 30, 7], [-110, 30, 7],
]

const K_DOTS = [[120, 20, 6, 0], [120, 5, 4, 1], [120, 204, 6, 0], [120, 221, 4, 1]]

function Leaf({ x, y, rot, L, w, delay }) {
  return (
    <g transform={`rotate(${rot} ${x} ${y}) translate(${x} ${y})`}>
      <g className="k-grow" style={{ transitionDelay: `${delay}ms` }}>
        <path d={petalPath(L, w)} fill="currentColor" />
      </g>
    </g>
  )
}

function Volute() {
  return (
    <g className="k-volute">
      <path className="k-curl" pathLength="100" fill="none" stroke="currentColor"
        strokeWidth="4.5" strokeLinecap="round"
        d="M160 128 C182 140 202 140 213 128 C224 116 220 99 206 98 C195 97 189 107 196 113 C203 119 211 113 209 106" />
      <g className="k-pop" style={{ transitionDelay: '980ms' }}>
        <circle cx="205" cy="107" r="4.5" fill="currentColor" />
      </g>
      <path className="k-curl k-curl--stem" pathLength="100" fill="none" stroke="currentColor"
        strokeWidth="3.5" strokeLinecap="round" d="M215 118 C226 112 233 100 233 88" />
      <g className="k-pop" style={{ transitionDelay: '1060ms' }}>
        <circle cx="233" cy="82" r="6.5" fill="currentColor" />
      </g>
      <Leaf x={170} y={136} rot={200} L={30} w={7.5} delay={760} />
      <Leaf x={192} y={144} rot={218} L={28} w={7} delay={820} />
      <Leaf x={212} y={138} rot={236} L={26} w={6.5} delay={880} />
    </g>
  )
}

function Medallion({ open, size = 160, className = '' }) {
  return (
    <svg className={`kolka medallion ${open ? 'is-open' : ''} ${className}`}
      viewBox="0 0 240 240" width={size} height={size} aria-hidden="true">
      <g className="k-pearl">
        {K_PETALS.map(([a, L, w], i) => (
          <g key={i} transform={`rotate(${a} ${KC} ${KCY}) translate(${KC} ${KCY - KR})`}>
            <g className="k-petal" style={{ transitionDelay: `${140 + i * 38}ms` }}>
              <path d={petalPath(L, w)} fill="currentColor" />
            </g>
          </g>
        ))}
        <Volute />
        <g transform="translate(240 0) scale(-1 1)"><Volute /></g>
        {K_DOTS.map(([cx, cy, r, j], i) => (
          <g className="k-pop" key={i} style={{ transitionDelay: `${1120 + j * 90}ms` }}>
            <circle cx={cx} cy={cy} r={r} fill="currentColor" />
          </g>
        ))}
      </g>
      <g className="k-disc">
        <circle cx={KC} cy={KCY} r={KR} fill="var(--mk-crimson)" />
      </g>
    </svg>
  )
}

function Sprig({ size = 32, color = 'var(--mk-crimson)', className = '' }) {
  return (
    <svg className={`sprig ${className}`} viewBox="0 0 40 104"
      width={size * (40 / 104)} height={size} aria-hidden="true" fill={color}>
      <path d="M20 4 C13 22 8 34 8 43 C8 51 13 56 20 56 C27 56 32 51 32 43 C32 34 27 22 20 4 Z" />
      <circle cx="20" cy="74" r="5.5" /><circle cx="20" cy="92" r="3.5" />
    </svg>
  )
}

/* ---------------------------------------------------------- notch wing -- */
/*  The concave fillets that let a notch flow into the bezel instead of sitting
    on it. 'left' and 'right' sit beside a notch at the top edge; the two
    'corner' wings fill the gap where the outer notches meet the viewport's own
    rounded corner. Paths are the reference component's, unchanged.            */

const WING = {
  left: 'M 0 0 C 11.046 0 20 8.954 20 20 H 21 V -1 H 0 Z',
  right: 'M 20 0 C 8.954 0 0 8.954 0 20 H -1 V -1 H 20 Z',
  'corner-left': 'M 0 0 H 20 C 8.954 0 0 8.954 0 20 V 0 Z',
  'corner-right': 'M 20 0 H 0 C 11.046 0 20 8.954 20 20 V 0 Z',
}

function NotchWing({ side }) {
  return (
    <svg className={`nn-wing nn-wing--${side}`} viewBox="0 0 20 20" aria-hidden="true">
      <path d={WING[side]} fill="currentColor" />
    </svg>
  )
}

/* ------------------------------------------------------------ laal-paar -- */
/* The red border of a white saree, reduced to a band edge. Used sparingly.   */

function LaalPaar({ height = 22 }) {
  const pid = useId().replace(/:/g, '')           /* unique per instance */
  const mid = height / 2
  return (
    <div className="laalpaar" aria-hidden="true">
      {/* No viewBox: units are px, so the arches tile at a fixed size at any width. */}
      <svg className="laalpaar-art" width="100%" height={height} preserveAspectRatio="none">
        <defs>
          <pattern id={pid} width="18" height={height} patternUnits="userSpaceOnUse">
            <path d={`M4 ${mid + 4} q0 -7 5 -7 t5 7`} fill="none" stroke="var(--mk-ruby)" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill="var(--mk-pearl)" />
        <rect width="100%" height={height} fill={`url(#${pid})`} />
        <rect width="100%" height="1.6" y="3" fill="var(--mk-ruby)" />
        <rect width="100%" height="1.6" y={height - 4.6} fill="var(--mk-ruby)" />
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------ alpona rule -- */

function AlponaRule() {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div className="rule-wrap" ref={ref} aria-hidden="true">
      <svg className={`rule ${seen ? 'is-drawn' : ''}`} viewBox="0 0 600 44" preserveAspectRatio="none" fill="none">
        <path className="rule-line" pathLength="100" stroke="var(--mk-ash)" strokeWidth="1.25" strokeLinecap="round"
          d="M0 22 L452 22 C486 22 496 22 506 12 C516 2 536 4 543 15 C550 26 543 38 531 38 C521 38 515 30 519 24" />
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ band -- */

function Band({ id, title, bengali, lede, children, tone = 'base' }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <section className={`band band--${tone}`} id={id} ref={ref}>
      <div className="band-inner">
        <header className="band-head">
          <Sprig size={42} />
          <h2 className="band-title">
            {title}
            {/* Bengali only where the English heading is a transliteration of a
                Bengali word — never as a translation of an English one. */}
            {bengali && <span className="band-bn" lang="bn">{bengali}</span>}
          </h2>
        </header>
        {lede && <p className="band-lede">{lede}</p>}
        {children}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- countdown -- */

/* Deterministic so server and client render the same grass. Never Math.random
   in a component — it desynchronises hydration. */
function seeded(seed) {
  let x = seed
  return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648 }
}
const KAASH = (() => {
  const r = seeded(20261011)
  return Array.from({ length: 104 }, (_, i) => {
    const x = (i / 103) * 1280 - 40 + (r() - 0.5) * 26
    const h = 74 + r() * 132
    const lean = (r() - 0.5) * 30
    return { x, h, lean, o: 0.24 + r() * 0.5, front: r() > 0.66 }
  })
})()

/* A kaash plume is a dense soft spike, not a fern frond — many short barbs
   angled steeply up the stem, over a faint ellipse of mass. */
function Plume({ k, front }) {
  const tipX = k.x + k.lean
  const tipY = 460 - k.h * (front ? 1.16 : 1)
  const hh = k.h * (front ? 0.5 : 0.44)
  const barbs = []
  const n = 18
  for (let j = 0; j < n; j++) {
    const f = j / (n - 1)
    const py = tipY + f * hh
    const px = tipX - k.lean * f * 0.16
    const bl = (front ? 7.5 : 5.8) * (0.4 + (1 - f) * 0.75)
    barbs.push(
      <path key={`l${j}`} d={`M${px} ${py} Q${px - bl * 0.4} ${py - bl * 0.7} ${px - bl * 0.5} ${py - bl * 1.25}`} />,
      <path key={`r${j}`} d={`M${px} ${py} Q${px + bl * 0.4} ${py - bl * 0.7} ${px + bl * 0.5} ${py - bl * 1.25}`} />
    )
  }
  return (
    <g opacity={front ? Math.min(1, k.o + 0.2) : k.o * 0.66}>
      <ellipse cx={tipX} cy={tipY + hh / 2} rx={front ? 6.5 : 5} ry={hh / 2 + 4}
        transform={`rotate(${k.lean * 1.3} ${tipX} ${tipY + hh / 2})`}
        fill="var(--mk-pearl)" opacity="0.16" />
      <g stroke="var(--mk-pearl)" fill="none" strokeLinecap="round" strokeWidth={front ? 0.75 : 0.55}>
        <path d={`M${k.x} 462 Q${k.x + k.lean * 0.35} ${460 - k.h * 0.6} ${tipX} ${tipY}`}
          strokeWidth={front ? 1.1 : 0.8} />
        {barbs}
      </g>
    </g>
  )
}

const CLOUDS = [
  [180, 128, 210, 26, 0.10], [520, 92, 260, 22, 0.08], [860, 150, 190, 20, 0.09],
  [340, 196, 300, 18, 0.07], [980, 210, 240, 16, 0.06],
]

/* An autumn dusk over kaash phool: Monsoon Teal at the top, Warm Sand at the
   horizon. Drop a photograph in behind this and delete it — the scrim and the
   copy placement stay the same either way. */
function AutumnSky() {
  return (
    <svg className="sky" viewBox="0 0 1200 460" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="mk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12262A" />
          <stop offset="32%" stopColor="#111517" />
          <stop offset="58%" stopColor="#35131A" />
          <stop offset="78%" stopColor="#6E1520" />
          <stop offset="91%" stopColor="#A5674A" />
          <stop offset="100%" stopColor="#C08A62" />
        </linearGradient>
        <filter id="mk-soft" x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id="mk-glow" x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>

      <rect width="1200" height="460" fill="url(#mk-sky)" />

      <circle cx="946" cy="86" r="62" fill="var(--mk-taxi)" opacity="0.13" filter="url(#mk-glow)" />
      <circle cx="946" cy="86" r="21" fill="#F7EBD2" opacity="0.9" />

      <g filter="url(#mk-soft)">
        {CLOUDS.map(([cx, cy, rx, ry, o], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="var(--mk-pearl)" opacity={o} />
        ))}
        <ellipse cx="700" cy="352" rx="460" ry="34" fill="#C08A62" opacity="0.26" />
      </g>

      {KAASH.filter((k) => !k.front).map((k, i) => <Plume key={`b${i}`} k={k} front={false} />)}
      {KAASH.filter((k) => k.front).map((k, i) => <Plume key={`f${i}`} k={k} front />)}
    </svg>
  )
}

function useCountdown(iso) {
  const [left, setLeft] = useState(null)   /* null until mounted — keeps SSR stable */
  useEffect(() => {
    const target = new Date(iso).getTime()
    const tick = () => {
      const ms = target - Date.now()
      if (ms <= 0) return setLeft({ d: 0, h: 0, m: 0, s: 0, done: true })
      setLeft({
        d: Math.floor(ms / 86400000),
        h: Math.floor(ms / 3600000) % 24,
        m: Math.floor(ms / 60000) % 60,
        s: Math.floor(ms / 1000) % 60,
        done: false,
      })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [iso])
  return left
}

function Countdown() {
  const left = useCountdown(MAHALAYA)
  const pad = (n) => String(n).padStart(2, '0')
  const units = left
    ? [[String(left.d), 'days'], [pad(left.h), 'hours'], [pad(left.m), 'minutes'], [pad(left.s), 'seconds']]
    : [['--', 'days'], ['--', 'hours'], ['--', 'minutes'], ['--', 'seconds']]

  return (
    <section className="count" id="countdown">
      <div className="count-scene">
        <AutumnSky />
        <div className="count-scrim" aria-hidden="true" />
        <div className="count-copy">
          <p className="count-bn" lang="bn">পুজোয় বাড়ি ফিরছ তো?</p>
          <p className="count-home">Welcome home.</p>
          <div className="count-clock" role="timer" aria-live="off">
            {units.map(([v, label]) => (
              <div className="unit" key={label}>
                <span className="unit-num">{v}</span>
                <span className="unit-label">{label}</span>
              </div>
            ))}
          </div>
          <p className="count-sub">till Mahalaya, 11 October. The city has already started getting ready.</p>
        </div>
      </div>

      <div className="count-after">
        <ol className="count-days">
          {PUJO_DAYS.map((d) => {
            const dt = new Date(d.iso)
            return (
              <li className="count-day" key={d.en}>
                <span className="count-day-bn" lang="bn">{d.bn}</span>
                <span className="count-day-en">{d.en}</span>
                <span className="count-day-date">
                  {dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}
                </span>
              </li>
            )
          })}
        </ol>
        <p className="count-note">
          A ticking clock is information, not decoration — it and the title sequence are the only
          motion nobody has to ask for. The sky is drawn, not photographed: swap a real kaash-phool
          frame in behind the scrim and nothing else has to change. Every date lives in one constant
          and moves each year with the panjika.
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ page -- */

export default function BrandKit() {
  const [ready, setReady] = useState(false)
  const [copied, setCopied] = useState(null)
  const [markOpen, setMarkOpen] = useState(false)
  const [wght, setWght] = useState(600)
  const [wdth, setWdth] = useState(100)
  const [play, setPlay] = useState(0)
  const [curve, setCurve] = useState(CURVES[0])
  const [active, setActive] = useState(null)                  /* nav: current section id */
  const [pill, setPill] = useState({ x: 0, w: 0, on: false })  /* nav: active pill geometry */
  const [menuOpen, setMenuOpen] = useState(false)              /* nav: island drawer */
  const tabsRef = useRef(null)
  const tabRefs = useRef({})
  const searchRefs = useRef([])
  const menuId = useId()

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true))
    const onScroll = () => {
      /* scroll-spy: the last section whose top has crossed the nav line is current */
      let cur = null
      for (const [, id] of NAV) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 140) cur = id
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { cancelAnimationFrame(t); window.removeEventListener('scroll', onScroll) }
  }, [])

  /* nav: slide the pill under the current tab. Re-measured on resize and once
     the webfonts land, since both change tab widths. */
  useEffect(() => {
    const place = () => {
      const a = active && tabRefs.current[active]
      if (!a || !tabsRef.current) { setPill((v) => (v.on ? { ...v, on: false } : v)); return }
      setPill({ x: a.offsetLeft, w: a.offsetWidth, on: true })
    }
    place()
    window.addEventListener('resize', place)
    if (document.fonts?.ready) document.fonts.ready.then(place)
    return () => window.removeEventListener('resize', place)
  }, [active])

  /* nav: "/" focuses whichever search is on screen; Escape clears it and
     closes the island drawer */
  useEffect(() => {
    const onKey = (e) => {
      const input = searchRefs.current.find((el) => el && el.getClientRects().length > 0)
      const typing = /^(input|textarea|select)$/i.test(e.target?.tagName) || e.target?.isContentEditable
      if (e.key === '/' && input && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); input.focus() }
      if (e.key === 'Escape') {
        setMenuOpen(false)
        if (input && document.activeElement === input) { input.value = ''; input.blur() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const copy = useCallback(async (hex) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(hex)
      setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1400)
    } catch { setCopied(null) }
  }, [])

  return (
    <>
      <Head>
        <title>Brand kit — My Kolkata</title>
        <meta name="description" content="The living brand kit for My Kolkata: the kolka mark, colour, Bengali and Latin type, Durga Puja and Kolkata iconography, motion and components." />
        <link rel="preload" as="font" type="font/woff2" href="/fonts/clear-sans-display.woff2" crossOrigin="anonymous" />
        <link rel="preload" as="font" type="font/woff2" href="/fonts/clear-sans-text.woff2" crossOrigin="anonymous" />
      </Head>

      <main className="mk">

        {/* ------------------------------------------------- nav: the notch bar -- */}
        {/*  Three notches cut from a Pearl bezel — lockup, sections, search. Below
            1280px they fold into one island with a drawer; below 768px the bezel
            goes and the island sits flush with the top edge.                    */}
        <div className="bezel" aria-hidden="true" />
        <div className={`nn-scrim ${menuOpen ? 'is-open' : ''}`} aria-hidden="true" onClick={() => setMenuOpen(false)} />

        {/* desktop — left: lockup */}
        <aside className="nn nn-logo" aria-label="Brand">
          <a className="nn-brand" href="#top" aria-label="My Kolkata — back to top">
            <span className="nn-brand-box"><Sprig size={18} /></span>
            <span className="nn-brand-text">
              <span className="nn-brand-latin">MY KOLKATA</span>
              <span className="nn-brand-bn" lang="bn">আমার কলকাতা</span>
            </span>
          </a>
          <NotchWing side="right" />
          <NotchWing side="corner-left" />
        </aside>

        {/* desktop — centre: sections */}
        <header className="nn nn-menu">
          <NotchWing side="left" />
          <NotchWing side="right" />
          <nav className="nn-tabs" aria-label="Brand kit sections" ref={tabsRef}>
            <span
              className={`nn-pill ${pill.on ? 'is-on' : ''}`}
              style={{ transform: `translateX(${pill.x}px)`, width: pill.w }}
              aria-hidden="true"
            />
            {NAV.map(([label, href]) => (
              <a
                key={href}
                ref={(el) => { tabRefs.current[href] = el }}
                className={`nn-tab ${active === href ? 'is-active' : ''}`}
                href={`#${href}`}
                aria-current={active === href ? 'location' : undefined}
              >{label}</a>
            ))}
          </nav>
        </header>

        {/* desktop — right: search */}
        <aside className="nn nn-right" aria-label="Search">
          <NotchWing side="left" />
          <NotchWing side="corner-right" />
          <label className="nn-search">
            <span className="sr-only">Search the brand kit</span>
            <svg viewBox="0 0 24 24" className="nn-search-icon" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" />
            </svg>
            <input ref={(el) => { searchRefs.current[0] = el }} type="search" placeholder="Search" autoComplete="off" spellCheck={false} />
            <kbd className="nn-kbd" aria-hidden="true">/</kbd>
          </label>
        </aside>

        {/* below 1280px — one island */}
        <div className="nn nn-island">
          <NotchWing side="left" />
          <NotchWing side="right" />
          <div className="nn-island-row">
            <a className="nn-brand" href="#top" aria-label="My Kolkata — back to top">
              <span className="nn-brand-box"><Sprig size={18} /></span>
              <span className="nn-brand-text">
                <span className="nn-brand-latin">MY KOLKATA</span>
                <span className="nn-brand-bn" lang="bn">আমার কলকাতা</span>
              </span>
            </a>
            <button
              type="button"
              className={`nn-trigger ${menuOpen ? 'is-open' : ''}`}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label="Choose a section"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span>{NAV.find(([, id]) => id === active)?.[0] ?? 'Brand kit'}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            <label className="nn-search nn-search--island">
              <span className="sr-only">Search the brand kit</span>
              <svg viewBox="0 0 24 24" className="nn-search-icon" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" />
              </svg>
              <input ref={(el) => { searchRefs.current[1] = el }} type="search" placeholder="Search" autoComplete="off" spellCheck={false} />
            </label>
          </div>
          <div className={`nn-drawer ${menuOpen ? 'is-open' : ''}`} id={menuId}>
            <div className="nn-drawer-clip">
              <nav className="nn-drawer-list" aria-label="Brand kit sections">
                {NAV.map(([label, href]) => (
                  <a
                    key={href}
                    className={`nn-option ${active === href ? 'is-active' : ''}`}
                    href={`#${href}`}
                    aria-current={active === href ? 'location' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>{label}</span>
                    {active === href && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------- title card -- */}
        <section className={`title-card ${ready ? 'is-ready' : ''}`} id="top">
          <div className="letterbox letterbox--top" aria-hidden="true" />
          <div className="letterbox letterbox--bottom" aria-hidden="true" />
          <div className="title-inner">
            <Medallion open={ready} size={168} className="title-mark" />
            <h1 className="title-latin"><span>MY</span><span>KOLKATA</span></h1>
            <p className="title-bn" lang="bn">আমার কলকাতা</p>
            <p className="title-sub">
              A city, shot like a film. Every colour, letterform, line and curve the product is
              built from — and the reasons behind each one.
            </p>
          </div>
          <div className="title-meta">
            <span>Version 1.4</span>
            <span className="title-meta-sep" aria-hidden="true" />
            <span>Dark is the primary experience</span>
          </div>
        </section>

        <Countdown />

        {/* ---------------------------------------------------------------- mark -- */}
        <Band
          id="mark"
          title="The mark"
          bengali="কলকা"
          lede="A crimson disc with petals and dots opening around it, flanked by two spiral volutes — the alpona a Bengali household paints on its floor, drawn as a mark. It is filled rather than outlined, because that is how alpona is actually made."
        >
          <div className="mark-grid">
            <button
              type="button"
              className="mark-stage"
              onMouseEnter={() => setMarkOpen(true)}
              onMouseLeave={() => setMarkOpen(false)}
              onFocus={() => setMarkOpen(true)}
              onBlur={() => setMarkOpen(false)}
              onClick={() => setMarkOpen((v) => !v)}
              aria-pressed={markOpen}
              aria-label="Unfurl the kolka mark"
            >
              <Medallion open={markOpen} size={320} />
              <span className="mark-hint">{markOpen ? 'Unfurled' : 'Hover to unfurl'}</span>
            </button>

            <div className="mark-notes">
              <div className="lockup">
                <Medallion open size={76} />
                <div>
                  <p className="lockup-latin">MY KOLKATA</p>
                  <p className="lockup-bn" lang="bn">আমার কলকাতা</p>
                </div>
              </div>

              <dl className="spec">
                <div><dt>Disc</dt><dd>Crimson, r25 on a 240 grid. It lands first — alpona is painted from the centre out.</dd></div>
                <div><dt>Petals</dt><dd>Ten solid teardrops. The gaps at ±90° are where the volutes sit.</dd></div>
                <div><dt>Volutes</dt><dd>Two spiral scrolls, each with three hanging leaves and a budded stem</dd></div>
                <div><dt>Dots</dt><dd>Two above, two below, descending — the alpona signature</dd></div>
                <div><dt>Bloom</dt><dd>Disc, petals, volutes, leaves, buds, dots — 1.3s, in that order</dd></div>
                <div><dt>Below 56px</dt><dd>It becomes the sprig: one teardrop over two dots</dd></div>
                <div><dt>Never</dt><dd>Outlined, rotated, mirrored on the vertical, or set in gold</dd></div>
              </dl>

              <div className="mark-sizes">
                {[96, 140].map((sz) => (
                  <div className="mark-size" key={sz}>
                    <Medallion open size={sz} />
                    <span>Medallion {sz}px</span>
                  </div>
                ))}
                {[26, 40].map((sz) => (
                  <div className="mark-size" key={`s${sz}`}>
                    <Sprig size={sz} />
                    <span>Sprig {sz}px</span>
                  </div>
                ))}
              </div>
              <p className="note">It replaces every eyebrow label, numbered marker and arrow the system would otherwise need. Where you want to say <span className="em">look here</span>, you use the tick.</p>
            </div>
          </div>
        </Band>

        <AlponaRule />

        {/* -------------------------------------------------------------- colour -- */}
        <Band
          id="colour"
          title="Colour"
          lede="Red is treated as a material, not a hue — silk, hibiscus, pomegranate, sandstone, lac. Every red on screen should look like it has a surface. Select a swatch to copy its value."
        >
          <div className="swatches">
            {CORE.map((c) => (
              <button key={c.token} type="button" className="swatch" onClick={() => copy(c.hex)}
                aria-label={`Copy ${c.name}, ${c.hex}`}>
                <span className="swatch-chip" style={{ background: c.hex }} />
                <span className="swatch-body">
                  <span className="swatch-name">{c.name}</span>
                  <span className="swatch-hex">{copied === c.hex ? 'Copied' : c.hex}</span>
                  <span className="swatch-role">{c.role}</span>
                  <code className="swatch-token">{c.token}</code>
                </span>
              </button>
            ))}
          </div>

          <div className="retired">
            <span className="retired-chip" />
            <div>
              <h3 className="h3">Warm Sand is retired from the interface</h3>
              <p className="body">
                <code className="inline-code">#B38F6F</code> went muddy against Obsidian — it read as
                dust rather than warmth, and it dragged every caption down with it. Muted text is now
                <strong className="strong"> Ash</strong> <code className="inline-code">#AFA2A0</code>,
                a warm rose-grey that keeps the palette's temperature without the tan cast. Warm Sand
                survives only in photography and illustration, where a real surface carries it.
              </p>
            </div>
          </div>

          <div className="grade">
            <div className="grade-chip" />
            <div className="grade-body">
              <h3 className="h3">Monsoon Teal — the grade</h3>
              <p className="body">
                <code className="inline-code">#132A2E</code>. It never appears as a fill, a border or
                a text colour — only inside shadows and background gradients, giving the reds something
                cold to be warm against. If it ever reads as teal on screen, it is being misused.
              </p>
              <pre className="code"><code>box-shadow: 0 24px 60px -20px rgba(19, 42, 46, 0.7);</code></pre>
            </div>
          </div>

          <table className="table">
            <caption className="table-caption">Contrast, measured against the ground each pair actually sits on</caption>
            <thead><tr><th scope="col">Pair</th><th scope="col">Ratio</th><th scope="col">Grade</th><th scope="col">Use</th></tr></thead>
            <tbody>
              {CONTRAST.map((r) => (
                <tr key={r.pair}>
                  <th scope="row">{r.pair}</th>
                  <td className="num">{r.ratio}:1</td>
                  <td><span className={`grade-tag ${r.grade === 'Large only' ? 'is-warn' : ''}`}>{r.grade}</span></td>
                  <td className="muted">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Band>

        {/* ---------------------------------------------------------------- type -- */}
        <Band
          id="type"
          title="Type"
          lede="Clear Sans ships Regular only — there is no bold. Latin hierarchy is built from size, tracking and colour, never weight. Bengali is the family with a live weight axis, so Bengali carries the emphasis Latin cannot."
        >
          <div className="balance">
            <h3 className="h3">Where Bengali is allowed</h3>
            <div className="balance-grid">
              <ul className="rules">
                <li>The wordmark — আমার কলকাতা, set at 38% of the Latin, wght 500, in Ash. A whisper under the title, never a second headline.</li>
                <li>Words with no English equivalent: কলকা, আলপনা, ঢাক, ধুনুচি, কাশফুল, শিউলি, পুষ্পাঞ্জলি.</li>
                <li>Real content — the five days, a greeting, a line someone would actually say.</li>
                <li>Place and para names as people write them.</li>
              </ul>
              <ul className="rules is-dont">
                <li>Never as a translation label under an English heading. This section is called Type; there is no অক্ষর beneath it.</li>
                <li>Never to decorate a section that has no Bengali content.</li>
                <li>Never letter-spaced — it breaks the মাত্রা.</li>
                <li>Never at the same size and weight as the Latin it sits beside. One of the two leads.</li>
              </ul>
            </div>
          </div>

          <div className="specimen">
            <div className="specimen-head">
              <h3 className="h3">Clear Sans Display</h3><span className="muted">Latin headlines · 400 only</span>
            </div>
            {SCALE.map((s) => (
              <div className="row" key={s.role}>
                <span className="row-label">{s.role}<span className="row-spec">{s.size}px · {s.lh} · {s.ls}</span></span>
                <p className="row-sample display"
                  style={{ fontSize: `min(${s.size}px, ${Math.round(s.size / 2.3)}vw)`, lineHeight: s.lh, letterSpacing: s.ls }}>
                  These golden days
                </p>
              </div>
            ))}
          </div>

          <div className="specimen">
            <div className="specimen-head">
              <h3 className="h3">Clear Sans Text</h3><span className="muted">Body and UI · 400 only</span>
            </div>
            <p className="measure body-lg">
              The last week of Ashwin, the light changes. Kaash phool comes up along the tracks at
              Bagbazar, the shiuli drops overnight, and the whole city starts counting backwards.
            </p>
            <p className="measure body">
              Body sets at 16px on a 1.65 line, tracked a touch open at 0.01em, and never runs past
              72 characters. Captions drop to 14px and change colour to Ash rather than changing
              weight — because there is no weight to change to.
            </p>
            <p className="measure caption">Caption. 14px, Ash, 0.015em. This is what secondary information looks like.</p>
          </div>

          <div className="specimen">
            <div className="specimen-head">
              <h3 className="h3">Noto Sans Bengali</h3><span className="muted">Variable · wght 100–900 · wdth 62.5–100</span>
            </div>
            <p className="bengali-stage" lang="bn" style={{ fontVariationSettings: `'wght' ${wght}, 'wdth' ${wdth}` }}>
              আশ্বিনের শারদপ্রাতে
            </p>
            <div className="axes">
              <label className="axis">
                <span className="axis-name">Weight<span className="axis-val">{wght}</span></span>
                <input type="range" min="100" max="900" step="10" value={wght} onChange={(e) => setWght(+e.target.value)} />
              </label>
              <label className="axis">
                <span className="axis-name">Width<span className="axis-val">{wdth}</span></span>
                <input type="range" min="62.5" max="100" step="0.5" value={wdth} onChange={(e) => setWdth(+e.target.value)} />
              </label>
            </div>
            <ul className="rules">
              <li>Line-height 1.5 minimum, against 1.05 for Latin display.</li>
              <li>Set Bengali about 8% larger when it shares a line with Latin at the same rank.</li>
              <li>Compress with the width axis to 85 for tight slots. Below 80 it distorts.</li>
            </ul>
          </div>
        </Band>

        <AlponaRule />

        {/* -------------------------------------------------------------- motifs -- */}
        <Band
          id="motifs"
          title="Motifs"
          lede="Four structural devices, plus a library of six drawn motifs. Together they carry the culture so the interface does not have to shout it — the four shape sections and edges, the six are ornament you place deliberately."
          tone="deep"
        >
          <div className="motif-grid">
            <article className="motif">
              <h3 className="h3">Alpona <span className="motif-bn" lang="bn">আলপনা</span></h3>
              <p className="body">The rule between sections — a hairline that spends its last 90px becoming a curl and ends in a kolka. Draws once on entry.</p>
              <AlponaRule />
            </article>

            <article className="motif">
              <h3 className="h3">Laal-paar</h3>
              <p className="body">The red border of a white saree, reduced to a band edge. Used once or twice a page, never as a frame.</p>
              <div className="motif-art"><LaalPaar height={30} /></div>
            </article>

            <article className="motif">
              <h3 className="h3">Chalchitra</h3>
              <p className="body">The painted arch behind the idol, kept as bare geometry. It shapes feature panels and pandal-style cards.</p>
              <div className="motif-art">
                <svg viewBox="0 0 200 110" fill="none" className="motif-svg" aria-hidden="true">
                  <path d="M14 106 V62 C14 26 50 6 100 6 C150 6 186 26 186 62 V106" stroke="var(--mk-pearl)" strokeWidth="1.6" opacity="0.7" />
                  <path d="M32 106 V64 C32 36 60 20 100 20 C140 20 168 36 168 64 V106" stroke="var(--mk-pearl)" strokeWidth="1.2" opacity="0.4" />
                  {Array.from({ length: 9 }).map((_, i) => {
                    const a = Math.PI * (0.08 + (i * 0.84) / 8)
                    return <line key={i} x1={100 - Math.cos(a) * 60} y1={64 - Math.sin(a) * 44}
                      x2={100 - Math.cos(a) * 78} y2={64 - Math.sin(a) * 58}
                      stroke="var(--mk-pearl)" strokeWidth="1.1" opacity="0.35" />
                  })}
                </svg>
              </div>
            </article>

            <article className="motif">
              <h3 className="h3">Shola</h3>
              <p className="body">White pith filigree from the crown. The only white-on-red ornament in the system, and the only one allowed to be delicate.</p>
              <div className="motif-art">
                <svg viewBox="0 0 200 110" fill="none" className="motif-svg" aria-hidden="true">
                  <g transform="translate(100 58)" stroke="var(--mk-pearl)" strokeWidth="1.2">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
                      <path key={d} transform={`rotate(${d})`} d="M0 0 C-9 -14 -9 -30 0 -40 C9 -30 9 -14 0 0Z" opacity="0.75" />
                    ))}
                    <circle r="8" /><circle r="15" opacity="0.5" />
                  </g>
                </svg>
              </div>
            </article>
          </div>
        
          <h3 className="h3 sub">The alpona library</h3>
          <p className="body measure">
            Six motifs read straight off a sheet of hand-drawn alpona: solid, symmetrical, built
            from teardrops and descending dot runs. They are the vocabulary the kolka is made from,
            available on their own where a full medallion would be too much.
          </p>
          <div className="lib-grid">
            {MOTIF_LIB_LIST.map(([id, name, use]) => (
              <figure className="lib-cell" key={id}>
                <svg viewBox="0 0 64 112" className="lib-art" aria-hidden="true">{MOTIF_LIB[id]}</svg>
                <figcaption>
                  <span className="lib-name">{name}</span>
                  <span className="lib-use">{use}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Band>

        {/* --------------------------------------------------------------- icons -- */}
        <Band
          id="emblems"
          title="Emblems"
          lede="Filled, two-tone cultural marks in the alpona vocabulary — a Pearl body with one Crimson accent, exactly the way an alpona is painted around a red disc. These are not interface icons; they are the brand's cultural voice, used large and used rarely."
        >
          <div className="emblem-grid">
            {EMBLEM_LIST.map(([id, name, bn, use]) => (
              <figure className="emblem" key={id}>
                <svg viewBox="0 0 64 64" className="emblem-art" aria-hidden="true">{EMBLEMS[id]}</svg>
                <figcaption>
                  <span className="emblem-name">{name} <span className="emblem-bn" lang="bn">{bn}</span></span>
                  <span className="emblem-use">{use}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="note">
            A Pearl body with one accent. That accent is Crimson, except where the object itself is
            yellow — the diya's flame, the mukut's gems, the coconut's band — which is where Taxi
            Yellow lives. Never smaller than 40px, never outlined, never a third colour, and never
            used where a UI icon belongs. On paper the Pearl becomes Obsidian.
          </p>
        </Band>

        <Band
          id="icons"
          title="Icons"
          lede="The deliberate opposite of the emblems: line, 32px grid, 1.5px, no fills. Utility work — routes, places, food, night. An icon without a job does not ship, so each one below names something the product actually does."
        >
          <div className="icon-grid">
            {ICON_LIST.map(([id, name, use]) => (
              <figure className="icon-cell" key={id}>
                <svg viewBox="0 0 32 32" className={`icon ${id === 'taxi' ? 'icon--taxi' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  {ICONS[id]}
                </svg>
                <figcaption>
                  <span className="icon-name">{name}</span>
                  <span className="icon-use">{use}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="note">
            Crimson Silk for active states, Soft Pearl on dark, Obsidian on paper. Never two colours
            in one icon, never a filled variant, and never an icon carrying meaning on its own — it
            always sits beside a word.
          </p>
        </Band>

        {/* -------------------------------------------------------------- motion -- */}
        <Band
          id="motion"
          title="Motion"
          lede="Slow to start, decisive to finish. Nothing bounces and nothing spins. A page gets one piece of motion nobody asked for — the title sequence — plus the countdown, which is information."
        >
          <div className="motion-panel">
            <div className="curve-picker" role="group" aria-label="Easing curve">
              {CURVES.map((c) => (
                <button key={c.name} type="button" className={`curve-btn ${curve.name === c.name ? 'is-active' : ''}`}
                  onClick={() => { setCurve(c); setPlay((p) => p + 1) }} aria-pressed={curve.name === c.name}>
                  <span className="curve-name">{c.name}</span>
                  <span className="curve-ms">{c.ms}ms</span>
                </button>
              ))}
            </div>
            <div className="track" key={play}>
              <span className="runner" style={{ animationTimingFunction: curve.css, animationDuration: `${curve.ms}ms` }} />
            </div>
            <div className="motion-meta">
              <code className="inline-code">{curve.css}</code>
              <span className="muted">{curve.use}</span>
              <button type="button" className="btn btn--text" onClick={() => setPlay((p) => p + 1)}>Play again</button>
            </div>
          </div>

          <div className="duration-grid">
            {[['120ms', 'Focus rings, colour-only changes'], ['200ms', 'Hover — the standard'],
              ['320ms', 'Expand, open, reveal'], ['900ms', 'The full kolka unfurl'],
              ['700ms', 'Band entrance'], ['24s', 'Hero image zoom']].map(([d, u]) => (
              <div className="duration" key={d}><span className="duration-val">{d}</span><span className="duration-use">{u}</span></div>
            ))}
          </div>

          <p className="note">
            Banned outright: fade-and-slide-up on every section, hover transitions on every card in a
            grid, parallax on more than one element, particles, floating diyas, rotating chakras, and
            any looping ambient animation. Under <code className="inline-code">prefers-reduced-motion</code> the
            kolka renders fully unfurled, the hero does not zoom, and the alpona is drawn complete.
          </p>
        </Band>

        {/* ---------------------------------------------------------- components -- */}
        <Band
          id="components"
          title="Components"
          lede="The banner takes its scrim discipline and bottom-left anchor from Netflix. The caption device comes straight off a photograph of kaash phool. Neither takes its colour from anyone."
        >
          <h3 className="h3 sub">The banner</h3>
          <div className="banner">
            <div className="banner-img" />
            <div className="banner-scrim" aria-hidden="true" />
            <div className="banner-content">
              <Sprig size={38} />
              <h4 className="banner-title">DURGA PUJA</h4>
              <p className="banner-bn" lang="bn">আশ্বিনের শারদপ্রাতে</p>
              <p className="banner-lede">Five days. One city. Everyone comes home.</p>
              <div className="banner-actions">
                <button type="button" className="btn btn--primary">Explore the Pujo <span className="btn-arrow" aria-hidden="true">→</span></button>
                <button type="button" className="btn btn--secondary">Watch the film</button>
              </div>
            </div>
          </div>

          <h3 className="h3 sub">The film still</h3>
          <p className="body measure">A photograph cropped like a frame, with the title set into the picture rather than under it. Two settings: one word at the centre of the frame, or the same words spread across its width like a credit card. The grade is cool and quiet — the type does the work.</p>
          <div className="stills">
            <figure className="still still--bridge">
              <div className="still-img" />
              <div className="still-scrim" aria-hidden="true" />
              <figcaption className="still-title">
                <p className="still-kicker">ECHOES OF THE</p>
                <p className="still-word">GANGA</p>
              </figcaption>
            </figure>
            <figure className="still still--delta">
              <div className="still-img" />
              <div className="still-scrim" aria-hidden="true" />
              <figcaption className="still-spread" aria-label="Echoes of the Ganga">
                <span>ECHOES</span><span>OF</span><span>THE</span><span>GANGA</span>
              </figcaption>
            </figure>
          </div>

          <h3 className="h3 sub">The caption</h3>
          <p className="body measure">Two lines, a tick, and nothing else. The second line hangs indented from the first — the device is the indent, not an italic, because the type system has no italic to give.</p>
          <div className="capshot">
            <div className="capshot-img" />
            <div className="capshot-scrim" aria-hidden="true" />
            <figure className="capdev">
              <span className="capdev-tick" aria-hidden="true" />
              <div>
                <p className="capdev-1">Happiness is</p>
                <p className="capdev-2">these golden days coming back around.</p>
              </div>
            </figure>
          </div>

          <h3 className="h3 sub">Buttons</h3>
          <div className="btn-row">
            <button type="button" className="btn btn--primary">Save this place <span className="btn-arrow" aria-hidden="true">→</span></button>
            <button type="button" className="btn btn--secondary">Add to my list</button>
            <button type="button" className="btn btn--text">See all pandals</button>
          </div>
          <p className="note">One primary per view. The button does not scale on hover — the arrow moves. Focus is a 2px Crimson Silk ring at 2px offset, on every control, always.</p>

          <h3 className="h3 sub">Cards</h3>
          <div className="cards">
            {[
              { t: 'Kumortuli', s: 'North Kolkata', d: 'Where the goddess is built', img: '/street.jpg', icon: 'rickshaw' },
              { t: 'Bagbazar', s: 'Sarbojanin, est. 1919', d: 'The oldest crowd in the city', img: '/dkt.jpg', icon: 'dhaak' },
              { t: 'College Street', s: 'Boi Para', d: 'Coffee, and a mile of books', img: '/moc.jpg', icon: 'bhaar' },
            ].map((c) => (
              <article className="pcard" key={c.t} tabIndex={0}>
                <div className="pcard-media">
                  <div className="pcard-img" style={{ backgroundImage: `url(${c.img})` }} />
                  <div className="pcard-scrim" aria-hidden="true" />
                  <svg viewBox="0 0 32 32" className="pcard-icon" fill="none" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[c.icon]}</svg>
                </div>
                <div className="pcard-body">
                  <Sprig size={22} />
                  <div>
                    <h4 className="pcard-title">{c.t}</h4>
                    <p className="pcard-sub">{c.s}</p>
                    <p className="pcard-desc">{c.d}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <h3 className="h3 sub">Navigation and search</h3>
          <p className="body measure">The bar at the top of this page is the component. Three notches cut from a Pearl bezel — the lockup, the sections, search — joined to the frame by concave wings so they read as part of the screen's edge, not as a bar laid over it.</p>
          <div className="nav-spec">
            <dl className="spec">
              <div><dt>Bezel</dt><dd>8px Pearl frame, 16px inner radius. Notches are 40px (outer) and 44px (centre) with a 24px bottom radius.</dd></div>
              <div><dt>Wordmark</dt><dd>Sprig in a 28px box, then 12.5px Display tracked 0.18em, Bengali beneath at 10px wght 500.</dd></div>
              <div><dt>Sections</dt><dd>Pill tabs, 36px tall, 14px. Muted ink at rest, Obsidian on hover and when current.</dd></div>
              <div><dt>Current</dt><dd>One tonal pill (<code className="inline-code">#e4e2dc</code>) slides between tabs as you scroll — there is no bold; the pill carries the state.</dd></div>
              <div><dt>Search</dt><dd>Icon, field, and a <code className="inline-code">/</code> hint in the right notch. Underline grows on focus.</dd></div>
              <div><dt>Below 1280px</dt><dd>One island: lockup, the current section as a dropdown trigger, search. Below 768px the bezel goes.</dd></div>
              <div><dt>Never</dt><dd>Crimson on the notches — the sprig is the only red — or a shadow under them.</dd></div>
            </dl>
          </div>

          <h3 className="h3 sub">Radius encodes role</h3>
          <div className="radius-row">
            {[['0', 'Bands, full-bleed'], ['8', 'Inputs, chips'], ['12', 'Cards'], ['20', 'Panels, sheets'], ['28', 'Modals']].map(([r, u]) => (
              <div className="radius" key={r}>
                <div className="radius-box" style={{ borderRadius: `${r}px` }} />
                <span className="radius-val">{r}px</span><span className="radius-use">{u}</span>
              </div>
            ))}
          </div>
        </Band>

        {/* --------------------------------------------------------------- voice -- */}
        <Band id="voice" title="Voice"
          lede="Observant, not promotional. Name the place, the para, the time and the price — specificity is the whole tone."
          tone="deep">
          <div className="voice-grid">
            <div>
              <h3 className="h3">Write this</h3>
              <ul className="voice-list is-do">
                <li>Kumortuli, where the goddess is built</li>
                <li>Save this place → Saved</li>
                <li>Nothing saved yet. Start with a pandal near you.</li>
                <li>That address didn't match. Try a landmark or a metro station.</li>
                <li>Bagbazar Sarbojanin, since 1919. Free entry, busiest after 8pm.</li>
              </ul>
            </div>
            <div>
              <h3 className="h3">Not this</h3>
              <ul className="voice-list is-dont">
                <li>Discover the magic of Kolkata!</li>
                <li>Submit → Success</li>
                <li>No items to display.</li>
                <li>Something went wrong. Please try again later.</li>
                <li>Immerse yourself in a vibrant tapestry of culture.</li>
              </ul>
            </div>
          </div>
          <p className="note">Never explain Bengali culture to Bengalis. Write for someone who already belongs, and let the visitor follow.</p>
        </Band>

        <LaalPaar />

        {/* ------------------------------------------------------------- closing -- */}
        <section className="closing">
          <div className="closing-inner">
            <Medallion open size={150} />
            <p className="closing-line">SAME CITY.</p>
            <p className="closing-line">NEW STORIES.</p>
            <p className="closing-bn" lang="bn">পুজো আসছে।</p>
            <p className="closing-note">
              Everything in this system is quiet so that one thing can be loud — the kolka, the
              photograph, or the single crimson button. If two things are shouting on a screen,
              remove one.
            </p>
            <p className="closing-ref">Full specification in <code className="inline-code">/design.md</code></p>
          </div>
        </section>
      </main>

      <style jsx global>{`
        body { background: var(--mk-obsidian); color: var(--mk-pearl); }
      `}</style>

      <style jsx global>{`
        .mk {
          --edge: clamp(20px, 6vw, 80px);
          background: var(--mk-ground);
          color: var(--mk-pearl);
          font-family: var(--mk-text);
          font-weight: 400;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }
        .mk *:focus-visible { outline: 2px solid var(--mk-crimson); outline-offset: 2px; border-radius: 2px; }
        .mk .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
        }
        .mk .em { color: var(--mk-pearl); }
        .mk .strong { font-weight: 400; color: var(--mk-blush); }

        /* ------------------------------------------------------------ kolka -- */
        .mk .kolka { overflow: visible; color: var(--mk-pearl); }
        .mk .sprig { overflow: visible; }
        /* the disc lands first, then petals open outward — the order alpona is painted */
        .mk .medallion .k-disc {
          opacity: 0; transform: scale(0.2); transform-origin: 50% 50%; transform-box: fill-box;
          transition: opacity 300ms ease, transform 420ms var(--mk-ease-out);
        }
        .mk .medallion.is-open .k-disc { opacity: 1; transform: scale(1); }
        .mk .medallion .k-petal {
          transform: scaleY(0); transform-origin: 50% 100%; transform-box: fill-box;
          transition: transform 460ms var(--mk-ease-out);
        }
        .mk .medallion.is-open .k-petal { transform: scaleY(1); }
        .mk .medallion .k-curl {
          stroke-dasharray: 100; stroke-dashoffset: 100;
          transition: stroke-dashoffset 780ms var(--mk-ease-draw) 420ms;
        }
        .mk .medallion .k-curl--stem { transition-duration: 420ms; transition-delay: 900ms; }
        .mk .medallion.is-open .k-curl { stroke-dashoffset: 0; }
        .mk .medallion .k-grow {
          opacity: 0; transform: scaleY(0.2); transform-origin: 50% 100%; transform-box: fill-box;
          transition: opacity 260ms ease, transform 320ms var(--mk-ease-out);
        }
        .mk .medallion .k-pop {
          opacity: 0; transform: scale(0.2); transform-origin: 50% 50%; transform-box: fill-box;
          transition: opacity 260ms ease, transform 320ms var(--mk-ease-out);
        }
        .mk .medallion.is-open .k-grow { opacity: 1; transform: scaleY(1); }
        .mk .medallion.is-open .k-pop { opacity: 1; transform: scale(1); }

        /* --------------------------------------------------------- emblems -- */
        .mk .emblem-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--mk-4); }
        .mk .emblem {
          display: flex; gap: var(--mk-5); align-items: center; margin: 0; padding: var(--mk-5);
          border: 1px solid rgba(242,241,237,0.08); border-radius: var(--mk-r-md);
          background: var(--mk-ink); box-shadow: var(--mk-shadow-card);
          transition: border-color var(--mk-t-hover) var(--mk-ease-in-out),
                      background-color var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .emblem:hover { border-color: rgba(242,241,237,0.22); background: rgba(63,13,18,0.55); }
        .mk .emblem-art { width: 54px; height: 54px; flex: none; }
        .mk .emblem-name { display: block; font-size: 16px; }
        .mk .emblem-bn {
          font-family: var(--mk-bengali); font-variation-settings: 'wght' 500;
          font-size: 13px; color: var(--mk-ash); margin-left: var(--mk-1);
        }
        .mk .emblem-use { display: block; margin-top: 4px; font-size: 12.5px; line-height: 1.5; color: var(--mk-ash); }

        /* --------------------------------------------------- alpona library -- */
        .mk .lib-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: var(--mk-4); margin-top: var(--mk-5);
        }
        .mk .lib-cell {
          margin: 0; padding: var(--mk-5) var(--mk-4); text-align: center;
          border: 1px solid rgba(242,241,237,0.1); border-radius: var(--mk-r-md);
          background: var(--mk-bordeaux-deep); box-shadow: var(--mk-shadow-card);
        }
        .mk .lib-art { width: 46px; height: 80px; display: block; margin: 0 auto var(--mk-4); }
        .mk .lib-name { display: block; font-size: 15px; }
        .mk .lib-use { display: block; margin-top: 4px; font-size: 12px; line-height: 1.45; color: var(--mk-ash); }

        /* -------------------------------------------------------------- nav -- */
        /* The notch bar. Pearl on the dark page — the reference's dark-mode
           reading — with a tonal active pill. Brand type stays Regular, so the
           pill and colour carry the state rather than a synthesised bold.       */
        .mk {
          --nn-bg: var(--mk-pearl);
          --nn-bg-2: #e4e2dc;          /* pill, logo box — a step down from Pearl */
          --nn-fg: var(--mk-obsidian);
          --nn-muted: #6b6664;         /* 4.9:1 on Pearl */
          --nn-line: rgba(13, 16, 18, 0.18);
          --nn-wash: rgba(13, 16, 18, 0.06);
          --nn-bezel: 8px;
        }

        /* the bezel: a fixed Pearl frame with rounded inner corners, painted as a
           shadow so the page keeps scrolling underneath it */
        .mk .bezel {
          position: fixed; inset: var(--nn-bezel); z-index: 45; pointer-events: none;
          border-radius: 16px; box-shadow: 0 0 0 120px var(--nn-bg);
        }

        .mk .nn {
          position: fixed; z-index: 50; top: var(--nn-bezel);
          display: flex; align-items: flex-start;
          background: var(--nn-bg); color: var(--nn-fg); user-select: none;
        }
        .mk .nn-logo { left: var(--nn-bezel); height: 40px; padding: 0 20px; border-bottom-right-radius: 24px; }
        .mk .nn-menu { left: 50%; transform: translateX(-50%); height: 44px; padding: 0 16px; border-radius: 0 0 24px 24px; }
        .mk .nn-right { right: var(--nn-bezel); height: 40px; padding: 0 20px; border-bottom-left-radius: 24px; }

        .mk .nn-wing { position: absolute; width: 16px; height: 16px; color: var(--nn-bg); overflow: visible; pointer-events: none; }
        .mk .nn-wing--left { right: 100%; top: 0; }
        .mk .nn-wing--right { left: 100%; top: 0; }
        .mk .nn-wing--corner-left { left: 0; top: 100%; }
        .mk .nn-wing--corner-right { right: 0; top: 100%; }

        /* lockup */
        .mk .nn-brand { display: flex; align-items: center; gap: 8px; height: 40px; text-decoration: none; color: var(--nn-fg); }
        .mk .nn-brand-box { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; background: var(--nn-bg-2); }
        .mk .nn-brand-text { display: flex; flex-direction: column; line-height: 1; }
        .mk .nn-brand-latin { font-family: var(--mk-display); font-size: 12.5px; letter-spacing: 0.18em; }
        .mk .nn-brand-bn {
          font-family: var(--mk-bengali); font-variation-settings: 'wght' 500;
          font-size: 10px; line-height: 1.2; margin-top: 3px; color: var(--nn-muted);
        }

        /* sections — pill tabs with one sliding active pill */
        .mk .nn-tabs { position: relative; display: flex; align-items: center; gap: 4px; height: 44px; }
        .mk .nn-tab {
          position: relative; z-index: 1; display: flex; align-items: center; height: 36px; padding: 0 14px;
          border-radius: 999px; font-family: var(--mk-text); font-size: 14px; letter-spacing: 0.01em;
          color: var(--nn-muted); text-decoration: none; white-space: nowrap;
          transition: color var(--mk-t-fast) var(--mk-ease-in-out);
        }
        .mk .nn-tab:hover, .mk .nn-tab.is-active { color: var(--nn-fg); }
        .mk .nn-pill {
          position: absolute; left: 0; top: 4px; height: 36px; border-radius: 999px;
          background: var(--nn-bg-2); opacity: 0;
          transition: transform var(--mk-t-reveal) var(--mk-ease-out), width var(--mk-t-reveal) var(--mk-ease-out),
                      opacity var(--mk-t-fast) var(--mk-ease-in-out);
        }
        .mk .nn-pill.is-on { opacity: 1; }

        /* search */
        .mk .nn-search { position: relative; display: flex; align-items: center; gap: 8px; height: 40px; }
        .mk .nn-search-icon { width: 16px; height: 16px; fill: none; stroke: var(--nn-muted); stroke-width: 1.75; flex: none; }
        .mk .nn-search input {
          width: 120px; background: none; border: 0; outline: none; padding: 0;
          font-family: var(--mk-text); font-size: 14px; color: var(--nn-fg);
          transition: width var(--mk-t-hover) var(--mk-ease-out);
        }
        .mk .nn-search input::placeholder { color: var(--nn-muted); }
        .mk .nn-search input::-webkit-search-cancel-button { -webkit-appearance: none; }
        .mk .nn-search::after {
          content: ''; position: absolute; left: 24px; right: 0; bottom: 6px; height: 1px;
          background: var(--nn-fg); transform: scaleX(0); transform-origin: left;
          transition: transform var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .nn-search:focus-within::after { transform: scaleX(1); }
        .mk .nn-kbd {
          font-family: var(--mk-text); font-size: 11px; line-height: 1.3; color: var(--nn-muted);
          padding: 1px 6px; border: 1px solid var(--nn-line); border-radius: 5px;
          transition: opacity var(--mk-t-fast) var(--mk-ease-in-out);
        }
        .mk .nn-search:focus-within .nn-kbd { opacity: 0; }

        /* island — one notch, a trigger, a drawer */
        .mk .nn-island { display: none; left: 50%; transform: translateX(-50%); flex-direction: column; align-items: stretch; padding: 0 16px; border-radius: 0 0 24px 24px; }
        .mk .nn-island-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; height: 40px; }
        .mk .nn-trigger {
          flex: 1 1 auto; display: flex; align-items: center; justify-content: center; gap: 6px; height: 34px; padding: 0 10px;
          border: 0; border-radius: 999px; white-space: nowrap;
          background: none; font-family: var(--mk-text); font-size: 14px; color: var(--nn-fg); cursor: pointer;
          transition: background var(--mk-t-fast) var(--mk-ease-in-out);
        }
        .mk .nn-trigger:hover { background: var(--nn-wash); }
        .mk .nn-trigger svg { width: 14px; height: 14px; fill: none; stroke: var(--nn-muted); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform var(--mk-t-hover) var(--mk-ease-in-out); }
        .mk .nn-trigger.is-open svg { transform: rotate(180deg); }
        .mk .nn-drawer {
          display: grid; grid-template-rows: 0fr; opacity: 0; pointer-events: none;
          transition: grid-template-rows var(--mk-t-hover) var(--mk-ease-out), opacity var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .nn-drawer.is-open { grid-template-rows: 1fr; opacity: 1; pointer-events: auto; }
        .mk .nn-drawer-clip { overflow: hidden; }
        .mk .nn-drawer-list { display: flex; flex-direction: column; gap: 2px; padding: 6px 2px 10px; }
        .mk .nn-option {
          display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px;
          border-radius: 12px; font-family: var(--mk-text); font-size: 14px; color: var(--nn-muted); text-decoration: none;
          transition: background var(--mk-t-fast) var(--mk-ease-in-out), color var(--mk-t-fast) var(--mk-ease-in-out);
        }
        .mk .nn-option:hover { background: var(--nn-wash); color: var(--nn-fg); }
        .mk .nn-option.is-active { background: var(--nn-bg-2); color: var(--nn-fg); }
        .mk .nn-option svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.25; stroke-linecap: round; stroke-linejoin: round; }
        .mk .nn-scrim {
          position: fixed; inset: 0; z-index: 44; background: rgba(0, 0, 0, 0.4);
          -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
          opacity: 0; pointer-events: none; transition: opacity var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .nn-scrim.is-open { opacity: 1; pointer-events: auto; }

        /* focus lives inside a light surface, so the page's crimson ring is swapped for ink */
        .mk .nn :focus-visible, .mk .nn-search input:focus-visible { outline: 2px solid rgba(13, 16, 18, 0.4); outline-offset: 1px; border-radius: 999px; }
        .mk .nn-search input:focus-visible { outline: none; }

        @media (max-width: 1279px) {
          .mk .nn-logo, .mk .nn-menu, .mk .nn-right { display: none; }
          .mk .nn-island { display: flex; }
        }
        @media (max-width: 767px) {
          .mk { --nn-bezel: 0px; }
          .mk .bezel { display: none; }
          .mk .nn-wing { width: 10px; height: 10px; }
          .mk .nn-island-row { gap: 12px; }
          .mk .nn-search--island input { width: 0; }
          .mk .nn-search--island:focus-within input { width: 110px; }
          .mk .nn-search--island::after { display: none; }
        }
        @media (max-width: 639px) {
          .mk .nn-brand-text { display: none; }
          .mk .nn-trigger { font-size: 13px; }
        }

        /* ------------------------------------------------------- title card -- */
        .mk .title-card {
          position: relative; min-height: 100svh; display: flex; flex-direction: column;
          justify-content: center; padding: var(--mk-11) var(--edge) var(--mk-9); overflow: hidden;
        }
        .mk .letterbox {
          position: absolute; left: 0; right: 0; height: 14vh; background: var(--mk-obsidian);
          z-index: 3; transition: transform 900ms var(--mk-ease-out);
        }
        .mk .letterbox--top { top: 0; }
        .mk .letterbox--bottom { bottom: 0; }
        .mk .title-card.is-ready .letterbox--top { transform: translateY(-100%); }
        .mk .title-card.is-ready .letterbox--bottom { transform: translateY(100%); }
        .mk .title-inner { position: relative; z-index: 2; }
        .mk .title-latin span { display: block; }
        .mk .title-inner > * {
          opacity: 0; transform: translateY(12px);
          transition: opacity var(--mk-t-band) var(--mk-ease-out), transform var(--mk-t-band) var(--mk-ease-out);
        }
        .mk .title-card.is-ready .title-mark { opacity: 1; transform: none; transition-delay: 340ms; }
        .mk .title-card.is-ready .title-latin { opacity: 1; transform: none; transition-delay: 460ms; }
        .mk .title-card.is-ready .title-bn { opacity: 1; transform: none; transition-delay: 580ms; }
        .mk .title-card.is-ready .title-sub { opacity: 1; transform: none; transition-delay: 700ms; }
        .mk .title-latin {
          font-family: var(--mk-display); font-weight: 400; color: var(--mk-white);
          font-size: clamp(44px, 11vw, 104px); line-height: 0.95; letter-spacing: -0.04em;
          margin: var(--mk-4) 0 0;
        }
        /* the wordmark's Bengali sits at ~38% of the Latin — a whisper, not a headline */
        .mk .title-bn {
          font-family: var(--mk-bengali); font-variation-settings: 'wght' 500;
          font-size: clamp(17px, 4.2vw, 40px); line-height: 1.5; color: var(--mk-ash);
          margin: var(--mk-3) 0 0;
        }
        .mk .title-sub {
          max-width: 46ch; font-size: clamp(15px, 2vw, 19px); line-height: 1.65;
          color: var(--mk-ash); margin: var(--mk-6) 0 0;
        }
        .mk .title-meta {
          position: relative; z-index: 2; display: flex; align-items: center; gap: var(--mk-4);
          margin-top: var(--mk-9); font-size: 13px; letter-spacing: 0.02em; color: var(--mk-ash);
          opacity: 0; transition: opacity 600ms var(--mk-ease-out) 900ms; flex-wrap: wrap;
        }
        .mk .title-card.is-ready .title-meta { opacity: 1; }
        .mk .title-meta > span { white-space: nowrap; }
        .mk .title-meta-sep { width: 28px; height: 1px; background: rgba(175,162,160,0.45); }

        /* -------------------------------------------------------- countdown -- */
        .mk .count { padding: 0 0 clamp(48px, 7vw, 96px); }
        .mk .count-scene {
          position: relative; overflow: hidden; width: 100%;
          aspect-ratio: 21 / 9; min-height: 480px;
          border-top: 1px solid rgba(242,241,237,0.07);
        }
        .mk .sky { position: absolute; inset: 0; width: 100%; height: 100%; }
        .mk .count-scrim {
          position: absolute; inset: 0;
          background:
            linear-gradient(90deg, rgba(10,13,14,0.88) 0%, rgba(10,13,14,0.44) 48%, rgba(10,13,14,0) 78%),
            linear-gradient(0deg, rgba(10,13,14,0.86) 0%, rgba(38,10,14,0.3) 34%, rgba(38,10,14,0) 58%);
        }
        .mk .count-copy {
          position: absolute; left: 0; bottom: 0;
          padding: clamp(24px, 5vw, 64px);
          max-width: min(800px, 94%);
        }
        .mk .count-bn {
          font-family: var(--mk-bengali); font-variation-settings: 'wght' 500;
          font-size: clamp(15px, 2.1vw, 20px); line-height: 1.5;
          color: var(--mk-blush); margin: 0 0 var(--mk-2);
        }
        .mk .count-home {
          font-family: var(--mk-display); font-weight: 400;
          font-size: clamp(32px, 5.4vw, 60px); line-height: 1.02; letter-spacing: -0.035em;
          color: var(--mk-pearl); margin: 0 0 var(--mk-5);
        }
        /* no box — the numerals carry the weight themselves */
        .mk .count-clock { display: flex; gap: clamp(16px, 3.2vw, 44px); flex-wrap: wrap; align-items: flex-start; }
        .mk .unit { display: flex; flex-direction: column; gap: 6px; }
        .mk .unit-num {
          font-family: var(--mk-display); color: var(--mk-white);
          font-size: clamp(40px, 6.6vw, 84px); line-height: 0.86; letter-spacing: -0.05em;
          font-variant-numeric: tabular-nums;
          text-shadow: 0 14px 34px rgba(0, 0, 0, 0.6);
        }
        .mk .unit-label { font-size: 11px; letter-spacing: 0.14em; color: var(--mk-taxi); }

        .mk .count-sub {
          max-width: 46ch; font-size: clamp(13px, 1.6vw, 15px); line-height: 1.6;
          color: var(--mk-ash); margin: var(--mk-4) 0 0;
        }
        .mk .count-after { max-width: 1440px; margin: 0 auto; padding: clamp(40px, 6vw, 72px) var(--edge) 0; }
        .mk .count-days {
          display: flex; flex-wrap: wrap; gap: clamp(16px, 4vw, 52px);
          list-style: none; margin: 0; padding: 0;
        }
        .mk .count-day { display: flex; flex-direction: column; gap: 2px; }
        .mk .count-day-bn {
          font-family: var(--mk-bengali); font-variation-settings: 'wght' 600;
          font-size: 21px; line-height: 1.5; color: var(--mk-pearl);
        }
        .mk .count-day-en { font-size: 13px; letter-spacing: 0.04em; color: var(--mk-ash); }
        .mk .count-day-date { font-size: 13px; color: var(--mk-ash); }
        .mk .count-note {
          max-width: 72ch; font-size: 15px; line-height: 1.7; color: var(--mk-ash);
          margin: var(--mk-7) 0 0; padding-left: var(--mk-4);
          border-left: 2px solid rgba(242, 241, 237, 0.16);
        }

        /* ------------------------------------------------------------ bands -- */
        .mk .band { padding: clamp(64px, 10vw, 128px) var(--edge); }
        .mk .band--deep {
          background: radial-gradient(900px 460px at 84% 0%, rgba(113, 0, 20, 0.26), transparent 62%), var(--mk-bordeaux);
        }
        .mk .band-inner { max-width: 1440px; margin: 0 auto; }
        .mk .band-head { display: flex; align-items: center; gap: var(--mk-4); }
        .mk .band-title {
          font-family: var(--mk-display); font-weight: 400; color: var(--mk-white);
          font-size: clamp(30px, 5vw, 52px); line-height: 1.05; letter-spacing: -0.03em;
          margin: 0; display: flex; align-items: baseline; gap: var(--mk-4); flex-wrap: wrap;
        }
        .mk .band-bn {
          font-family: var(--mk-bengali); font-variation-settings: 'wght' 500;
          font-size: 0.46em; line-height: 1.5; color: var(--mk-ash); letter-spacing: 0;
        }
        .mk .band-lede {
          max-width: 68ch; font-size: clamp(16px, 2vw, 19px); line-height: 1.65;
          color: var(--mk-pearl); margin: var(--mk-6) 0 var(--mk-8);
        }
        .mk .h3 {
          font-family: var(--mk-display); font-weight: 400; color: var(--mk-white);
          font-size: clamp(20px, 2.6vw, 26px); line-height: 1.2; letter-spacing: -0.01em;
          margin: 0 0 var(--mk-3);
        }
        .mk .h3.sub { margin-top: var(--mk-9); }
        .mk .motif-bn {
          font-family: var(--mk-bengali); font-variation-settings: 'wght' 500;
          font-size: 0.66em; color: var(--mk-ash); margin-left: var(--mk-2);
        }
        .mk .body { font-size: 16px; line-height: 1.65; letter-spacing: 0.01em; margin: 0 0 var(--mk-4); }
        .mk .body-lg { font-size: 19px; line-height: 1.65; margin: 0 0 var(--mk-5); }
        .mk .caption { font-size: 14px; line-height: 1.5; letter-spacing: 0.015em; color: var(--mk-ash); margin: 0; }
        .mk .measure { max-width: 68ch; }
        .mk .muted { color: var(--mk-ash); font-size: 14px; }
        .mk .note {
          max-width: 72ch; font-size: 15px; line-height: 1.7; color: var(--mk-ash);
          margin: var(--mk-6) 0 0; padding-left: var(--mk-4); border-left: 2px solid rgba(242, 241, 237, 0.16);
        }
        .mk .inline-code {
          font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 0.9em;
          color: var(--mk-blush); background: rgba(242,241,237,0.06); padding: 1px 5px; border-radius: 4px;
        }
        .mk .code {
          font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 13px; color: var(--mk-ash);
          background: rgba(9, 11, 12, 0.7); border: 1px solid rgba(242,241,237,0.08);
          border-radius: var(--mk-r-sm); padding: var(--mk-4); overflow-x: auto; margin: var(--mk-4) 0 0;
        }

        /* ------------------------------------------------------ alpona rule -- */
        .mk .rule-wrap { max-width: 1440px; margin: 0 auto; padding: 0 var(--edge); }
        .mk .rule { width: 100%; height: 44px; display: block; }
        .mk .rule .rule-line {
          stroke-dasharray: 100; stroke-dashoffset: 100; opacity: 0.4;
          transition: stroke-dashoffset 1500ms var(--mk-ease-draw);
        }
        .mk .rule.is-drawn .rule-line { stroke-dashoffset: 0; }

        /* --------------------------------------------------------- laalpaar -- */
        .mk .laalpaar { width: 100%; line-height: 0; }
        .mk .laalpaar-art { width: 100%; display: block; }

        /* ------------------------------------------------------------- mark -- */
        .mk .mark-grid { display: grid; grid-template-columns: minmax(0, 380px) minmax(0, 1fr); gap: var(--mk-8); align-items: start; }
        .mk .mark-stage {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: var(--mk-5); min-height: 420px; width: 100%;
          background: var(--mk-ink); border: 1px solid rgba(242,241,237,0.1);
          border-radius: var(--mk-r-lg); cursor: pointer; color: inherit; font: inherit;
          transition: border-color var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .mark-stage:hover { border-color: rgba(215,38,56,0.45); }
        .mk .mark-hint { font-size: 13px; letter-spacing: 0.02em; color: var(--mk-ash); }
        .mk .lockup { display: flex; align-items: center; gap: var(--mk-4); margin-bottom: var(--mk-7); }
        .mk .lockup-latin { font-family: var(--mk-display); font-size: 28px; letter-spacing: 0.14em; margin: 0; }
        .mk .lockup-bn {
          font-family: var(--mk-bengali); font-variation-settings: 'wght' 500;
          font-size: 14px; line-height: 1.5; color: var(--mk-ash); margin: 3px 0 0;
        }
        .mk .spec { margin: 0; display: grid; gap: var(--mk-3); }
        .mk .spec > div { display: grid; grid-template-columns: 130px minmax(0,1fr); gap: var(--mk-4); align-items: baseline; }
        .mk .spec dt { font-size: 13px; letter-spacing: 0.02em; color: var(--mk-ash); }
        .mk .spec dd { margin: 0; font-size: 15px; line-height: 1.6; }
        .mk .mark-sizes { display: flex; align-items: flex-end; gap: var(--mk-6); margin: var(--mk-7) 0 0; flex-wrap: wrap; }
        .mk .mark-size { display: flex; flex-direction: column; align-items: center; gap: var(--mk-2); }
        .mk .mark-size span { font-size: 12px; color: var(--mk-ash); }

        /* ----------------------------------------------------------- colour -- */
        .mk .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: var(--mk-4); }
        .mk .swatch {
          display: flex; flex-direction: column; text-align: left;
          background: rgba(242,241,237,0.03); border: 1px solid rgba(242,241,237,0.08);
          border-radius: var(--mk-r-md); overflow: hidden; cursor: pointer; color: inherit; font: inherit; padding: 0;
          transition: border-color var(--mk-t-hover) var(--mk-ease-in-out), transform var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .swatch:hover { border-color: rgba(242,241,237,0.24); transform: translateY(-2px); }
        .mk .swatch-chip { display: block; height: 96px; width: 100%; }
        .mk .swatch-body { display: block; padding: var(--mk-4); }
        .mk .swatch-name { display: block; font-size: 16px; }
        .mk .swatch-hex {
          display: block; margin-top: 2px; font-family: ui-monospace, 'SF Mono', Menlo, monospace;
          font-size: 13px; color: var(--mk-ash);
        }
        .mk .swatch-role { display: block; margin-top: var(--mk-3); font-size: 13px; line-height: 1.5; color: var(--mk-ash); }
        .mk .swatch-token {
          display: block; margin-top: var(--mk-2); font-family: ui-monospace, 'SF Mono', Menlo, monospace;
          font-size: 11px; color: rgba(175,162,160,0.7);
        }
        .mk .retired, .mk .grade {
          display: grid; grid-template-columns: 120px minmax(0,1fr); gap: var(--mk-6);
          margin-top: var(--mk-8); padding: var(--mk-6);
          border: 1px solid rgba(242,241,237,0.08); border-radius: var(--mk-r-lg);
        }
        .mk .retired { background: rgba(179,143,111,0.07); }
        .mk .retired-chip {
          border-radius: var(--mk-r-md); background: var(--mk-sand); min-height: 120px;
          position: relative; overflow: hidden;
        }
        .mk .retired-chip::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent 47%, rgba(22,22,22,0.75) 47%, rgba(22,22,22,0.75) 53%, transparent 53%);
        }
        .mk .grade { background: linear-gradient(120deg, rgba(19,42,46,0.9), rgba(22,22,22,0.5)); }
        .mk .grade-chip { border-radius: var(--mk-r-md); background: var(--mk-monsoon); box-shadow: var(--mk-shadow-panel); min-height: 120px; }
        .mk .retired p, .mk .grade-body p { max-width: 68ch; }
        .mk .table { width: 100%; border-collapse: collapse; margin-top: var(--mk-8); font-size: 15px; }
        .mk .table-caption { text-align: left; font-size: 14px; color: var(--mk-ash); padding-bottom: var(--mk-4); }
        .mk .table th, .mk .table td {
          text-align: left; padding: var(--mk-3) var(--mk-4) var(--mk-3) 0;
          border-bottom: 1px solid rgba(242,241,237,0.08); font-weight: 400;
        }
        .mk .table thead th { font-size: 13px; letter-spacing: 0.02em; color: var(--mk-ash); }
        .mk .num { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 14px; }
        .mk .grade-tag {
          display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px;
          background: rgba(242,241,237,0.08); color: var(--mk-pearl);
        }
        .mk .grade-tag.is-warn { background: rgba(242,179,61,0.16); color: var(--mk-taxi); }

        /* ------------------------------------------------------------- type -- */
        .mk .balance { margin-bottom: var(--mk-9); }
        .mk .balance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--mk-7); }
        .mk .specimen { padding: var(--mk-6) 0 var(--mk-8); border-top: 1px solid rgba(242,241,237,0.08); }
        .mk .specimen-head { display: flex; align-items: baseline; gap: var(--mk-4); flex-wrap: wrap; margin-bottom: var(--mk-6); }
        .mk .specimen-head .h3 { margin-bottom: 0; }
        .mk .row { padding: var(--mk-4) 0; border-top: 1px solid rgba(242,241,237,0.05); }
        .mk .row-label {
          display: flex; gap: var(--mk-3); align-items: baseline; flex-wrap: wrap;
          font-size: 13px; letter-spacing: 0.02em; color: var(--mk-ash); margin-bottom: var(--mk-2);
        }
        .mk .row-spec { color: rgba(175,162,160,0.8); font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 11px; }
        .mk .row-sample { margin: 0; }
        .mk .display { font-family: var(--mk-display); font-weight: 400; }
        .mk .bengali-stage {
          font-family: var(--mk-bengali); font-size: clamp(30px, 7vw, 68px); line-height: 1.5;
          margin: 0 0 var(--mk-6); color: var(--mk-pearl);
        }
        .mk .axes { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--mk-6); max-width: 640px; }
        .mk .axis { display: block; }
        .mk .axis-name { display: flex; justify-content: space-between; font-size: 13px; letter-spacing: 0.02em; color: var(--mk-ash); margin-bottom: var(--mk-2); }
        .mk .axis-val { font-family: ui-monospace, 'SF Mono', Menlo, monospace; color: var(--mk-taxi); }
        .mk .axis input[type='range'] { width: 100%; appearance: none; height: 2px; background: rgba(242,241,237,0.2); border-radius: 2px; }
        .mk .axis input[type='range']::-webkit-slider-thumb {
          appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--mk-crimson); cursor: pointer; border: 0;
        }
        .mk .axis input[type='range']::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%; background: var(--mk-crimson); cursor: pointer; border: 0;
        }
        .mk .rules, .mk .voice-list { margin: var(--mk-5) 0 0; padding: 0; list-style: none; max-width: 68ch; }
        .mk .rules li {
          position: relative; padding-left: var(--mk-5); margin-bottom: var(--mk-3);
          font-size: 15px; line-height: 1.6;
        }
        .mk .rules li::before {
          content: ''; position: absolute; left: 0; top: 0.45em; width: 2px; height: 14px;
          background: rgba(242, 241, 237, 0.3);
        }
        .mk .rules.is-dont li { color: var(--mk-ash); }
        .mk .rules.is-dont li::before { background: rgba(175,162,160,0.45); }

        /* ----------------------------------------------------------- motifs -- */
        .mk .motif-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--mk-6); }
        .mk .motif {
          padding: var(--mk-6); border: 1px solid rgba(242,241,237,0.1);
          border-radius: var(--mk-r-lg); background: var(--mk-bordeaux-deep);
          box-shadow: var(--mk-shadow-card);
        }
        .mk .motif .rule-wrap { padding: 0; }
        .mk .motif-art { margin-top: var(--mk-4); }
        .mk .motif-svg { width: 100%; height: auto; }

        /* ------------------------------------------------------------ icons -- */
        .mk .iconset + .iconset { margin-top: var(--mk-4); }
        .mk .icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: var(--mk-4); }
        .mk .icon-cell {
          display: flex; gap: var(--mk-4); align-items: flex-start; margin: 0;
          padding: var(--mk-4); border: 1px solid rgba(242,241,237,0.08); border-radius: var(--mk-r-md);
          transition: border-color var(--mk-t-hover) var(--mk-ease-in-out), color var(--mk-t-hover) var(--mk-ease-in-out);
          color: var(--mk-pearl);
        }
        .mk .icon-cell:hover { border-color: rgba(242,179,61,0.4); color: var(--mk-taxi); }
        .mk .icon { width: 32px; height: 32px; flex: none; }
        .mk .icon--taxi { color: var(--mk-taxi); }
        .mk .icon-name { display: block; font-size: 15px; color: var(--mk-pearl); }
        .mk .icon-use { display: block; margin-top: 3px; font-size: 12px; line-height: 1.45; color: var(--mk-ash); }

        /* ----------------------------------------------------------- motion -- */
        .mk .motion-panel { padding: var(--mk-6); border: 1px solid rgba(242,241,237,0.1); border-radius: var(--mk-r-lg); background: var(--mk-ink); box-shadow: var(--mk-shadow-card); }
        .mk .curve-picker { display: flex; gap: var(--mk-3); flex-wrap: wrap; }
        .mk .curve-btn {
          display: flex; flex-direction: column; gap: 2px; text-align: left; padding: var(--mk-3) var(--mk-5);
          background: transparent; border: 1px solid rgba(242,241,237,0.16); border-radius: var(--mk-r-sm);
          cursor: pointer; color: var(--mk-ash); font: inherit;
          transition: border-color var(--mk-t-hover) var(--mk-ease-in-out), color var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .curve-btn:hover { color: var(--mk-pearl); border-color: rgba(242,241,237,0.4); }
        .mk .curve-btn.is-active { border-color: var(--mk-taxi); color: var(--mk-white); }
        .mk .curve-name { font-size: 15px; }
        .mk .curve-ms { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 11px; }
        .mk .track { position: relative; height: 2px; margin: var(--mk-8) 0 var(--mk-5); background: rgba(242,241,237,0.14); border-radius: 2px; }
        .mk .runner {
          position: absolute; top: 50%; left: 0; width: 14px; height: 14px; border-radius: 50%;
          background: var(--mk-crimson); transform: translate(0, -50%);
          animation-name: mk-run; animation-fill-mode: both;
        }
        @keyframes mk-run { from { left: 0; } to { left: calc(100% - 14px); } }
        .mk .motion-meta { display: flex; align-items: center; gap: var(--mk-5); flex-wrap: wrap; }
        .mk .duration-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: var(--mk-4); margin-top: var(--mk-7); }
        .mk .duration { padding: var(--mk-4) 0; border-top: 1px solid rgba(242,241,237,0.1); }
        .mk .duration-val { display: block; font-family: var(--mk-display); font-size: 24px; letter-spacing: -0.01em; }
        .mk .duration-use { display: block; margin-top: var(--mk-1); font-size: 13px; line-height: 1.5; color: var(--mk-ash); }

        /* ------------------------------------------------------- components -- */
        .mk .banner {
          position: relative; overflow: hidden; border-radius: var(--mk-r-lg);
          aspect-ratio: 2.39 / 1; min-height: 320px; box-shadow: var(--mk-shadow-panel);
        }
        .mk .banner-img {
          position: absolute; inset: 0;
          background: url('/hero-bg.jpg') center/cover no-repeat, var(--mk-crimson-depth);
          filter: saturate(1.04) contrast(1.16) brightness(1.03);
          transform: scale(1.02); animation: mk-slowzoom 24s var(--mk-ease-in-out) infinite alternate;
        }
        @keyframes mk-slowzoom { from { transform: scale(1.02); } to { transform: scale(1.09); } }
        .mk .banner-scrim, .mk .capshot-scrim {
          position: absolute; inset: 0;
          background:
            linear-gradient(90deg, rgba(10,13,14,0.93) 0%, rgba(10,13,14,0.54) 46%, rgba(10,13,14,0) 78%),
            linear-gradient(0deg, rgba(10,13,14,0.94) 0%, rgba(38,10,14,0.28) 32%, rgba(38,10,14,0) 56%),
            linear-gradient(0deg, rgba(19,42,46,0.26), rgba(19,42,46,0.26));
        }
        .mk .banner-content { position: absolute; left: 0; bottom: 0; padding: clamp(20px, 4vw, 48px); max-width: min(560px, 92%); }
        .mk .banner-title {
          font-family: var(--mk-display); font-weight: 400; font-size: clamp(28px, 5vw, 52px);
          line-height: 1.05; letter-spacing: -0.03em; margin: var(--mk-2) 0 0;
        }
        .mk .banner-bn {
          font-family: var(--mk-bengali); font-variation-settings: 'wght' 500;
          font-size: clamp(14px, 2vw, 19px); line-height: 1.5; color: var(--mk-blush); margin: var(--mk-2) 0 0;
        }
        .mk .banner-lede { font-size: clamp(14px, 1.8vw, 17px); line-height: 1.6; margin: var(--mk-4) 0 0; }
        .mk .banner-actions { display: flex; gap: var(--mk-3); flex-wrap: wrap; margin-top: var(--mk-5); }

        /* --------------------------------------------------------- film still -- */
        /* design/image copy 8.png — the photograph is the frame and the title is
           set into it. A cool monsoon grade, a soft centre scrim, nothing else.   */
        .mk .stills { display: grid; grid-template-columns: 1fr 1fr; gap: var(--mk-3); margin-top: var(--mk-5); }
        .mk .still {
          position: relative; overflow: hidden; margin: 0; border-radius: var(--mk-r-lg);
          aspect-ratio: 16 / 10; background: var(--mk-monsoon); box-shadow: var(--mk-shadow-card);
        }
        .mk .still-img {
          position: absolute; inset: 0; background-position: center; background-size: cover;
          filter: saturate(0.72) contrast(1.06) brightness(0.92);
        }
        .mk .still--bridge .still-img { background-image: url('/hwh.jpg'); }
        .mk .still--delta .still-img { background-image: url('/sundarban.jpg'); background-position: center 40%; }
        .mk .still-scrim {
          position: absolute; inset: 0;
          background:
            radial-gradient(70% 60% at 50% 48%, rgba(10, 13, 14, 0.36), transparent 72%),
            linear-gradient(0deg, rgba(10, 13, 14, 0.5), transparent 42%),
            linear-gradient(0deg, rgba(19, 42, 46, 0.22), rgba(19, 42, 46, 0.22));
        }
        .mk .still-title {
          position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; color: var(--mk-white); padding-bottom: 6%;
        }
        .mk .still-kicker { font-family: var(--mk-display); font-size: clamp(10px, 1.1vw, 13px); letter-spacing: 0.22em; margin: 0 0 4px; }
        .mk .still-word { font-family: var(--mk-display); font-size: clamp(56px, 8.5vw, 124px); line-height: 0.9; letter-spacing: -0.035em; margin: 0; }
        .mk .still-spread {
          position: absolute; left: 0; right: 0; bottom: 20%; margin: 0 auto; width: min(64%, 440px);
          display: flex; justify-content: space-between; color: var(--mk-white);
          font-family: var(--mk-display); font-size: clamp(11px, 1.2vw, 14px); letter-spacing: 0.16em;
        }

        .mk .capshot {
          position: relative; overflow: hidden; border-radius: var(--mk-r-lg);
          aspect-ratio: 2.6 / 1; min-height: 240px; margin-top: var(--mk-5);
        }
        .mk .capshot-img {
          position: absolute; inset: 0;
          background: url('/maidan.jpg') center/cover no-repeat, var(--mk-bordeaux);
          filter: saturate(0.96) contrast(1.14);
        }
        .mk .capdev { position: absolute; left: 0; bottom: 0; display: flex; gap: var(--mk-3); padding: clamp(20px, 4vw, 44px); margin: 0; }
        .mk .capdev-tick { width: 3px; align-self: stretch; background: var(--mk-crimson); flex: none; }
        .mk .capdev-1 { font-size: clamp(16px, 2.2vw, 21px); line-height: 1.4; margin: 0; }
        .mk .capdev-2 {
          font-family: var(--mk-display); font-size: clamp(19px, 3vw, 30px); line-height: 1.3;
          letter-spacing: -0.015em; color: var(--mk-blush); margin: var(--mk-1) 0 0 var(--mk-6);
        }

        .mk .btn-row { display: flex; gap: var(--mk-4); flex-wrap: wrap; align-items: center; }
        .mk .btn {
          display: inline-flex; align-items: center; gap: var(--mk-2); min-height: 44px;
          padding: 12px 26px; border-radius: var(--mk-r-sm); font-family: var(--mk-text);
          font-size: 16px; font-weight: 400; letter-spacing: 0.01em; cursor: pointer; border: 1px solid transparent;
          transition: background-color var(--mk-t-hover) var(--mk-ease-in-out),
                      border-color var(--mk-t-hover) var(--mk-ease-in-out), color var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .btn--primary { background: var(--mk-crimson); color: var(--mk-pearl); }
        .mk .btn--primary:hover { background: var(--mk-ruby); }
        .mk .btn--secondary { background: transparent; border-color: rgba(242,241,237,0.22); color: var(--mk-pearl); }
        .mk .btn--secondary:hover { border-color: rgba(242,241,237,0.45); background: rgba(242,241,237,0.04); }
        .mk .btn--text { position: relative; background: none; padding: 12px 0; color: var(--mk-pearl); }
        .mk .btn--text::after {
          content: ''; position: absolute; left: 0; bottom: 8px; height: 1px; width: 100%;
          background: var(--mk-crimson); transform: scaleX(0); transform-origin: left;
          transition: transform var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .btn--text:hover::after { transform: scaleX(1); }
        .mk .btn-arrow { transition: transform var(--mk-t-hover) var(--mk-ease-in-out); }
        .mk .btn:hover .btn-arrow { transform: translateX(4px); }

        .mk .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--mk-5); }
        .mk .pcard { cursor: pointer; }
                .mk .pcard-media {
          position: relative; overflow: hidden; border-radius: 14px; aspect-ratio: 16 / 10;
          background: var(--mk-ink); box-shadow: var(--mk-shadow-card);
          transition: transform var(--mk-t-hover) var(--mk-ease-out),
                      box-shadow var(--mk-t-hover) var(--mk-ease-out);
        }
        .mk .pcard-img {
          position: absolute; inset: 0; background-size: cover; background-position: center;
          filter: saturate(1.06) contrast(1.18) brightness(1.05);
          transition: transform var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .pcard-scrim {
          position: absolute; inset: 0; opacity: 0.8;
          background: linear-gradient(0deg, rgba(10,13,14,0.82), rgba(38,10,14,0.16) 42%, rgba(10,13,14,0) 66%);
          transition: opacity var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .pcard-icon {
          position: absolute; right: var(--mk-4); top: var(--mk-4); width: 26px; height: 26px;
          color: var(--mk-pearl); opacity: 0.75;
        }
                .mk .pcard:hover .pcard-img, .mk .pcard:focus-visible .pcard-img { transform: scale(1.05); }
        .mk .pcard:hover .pcard-media, .mk .pcard:focus-visible .pcard-media {
          transform: translateY(-4px); box-shadow: 0 30px 58px -24px rgba(0, 0, 0, 1);
        }
        .mk .pcard:hover .pcard-sub, .mk .pcard:focus-visible .pcard-sub { color: var(--mk-taxi); }
        .mk .pcard:hover .pcard-scrim, .mk .pcard:focus-visible .pcard-scrim { opacity: 1; }
        .mk .pcard-body { display: flex; gap: var(--mk-2); align-items: flex-start; margin-top: var(--mk-4); }
        .mk .pcard-title {
          font-family: var(--mk-display); font-weight: 400; color: var(--mk-white);
          font-size: 22px; letter-spacing: -0.01em;
          margin: 0; transition: transform var(--mk-t-hover) var(--mk-ease-in-out);
        }
        .mk .pcard:hover .pcard-title { transform: translateY(-2px); }
        .mk .pcard-sub { font-size: 13px; letter-spacing: 0.02em; color: var(--mk-ash); margin: 2px 0 0;
          transition: color var(--mk-t-hover) var(--mk-ease-in-out); }
        .mk .pcard-desc { font-size: 15px; line-height: 1.55; margin: var(--mk-2) 0 0; }

        .mk .nav-spec { margin-top: var(--mk-5); }
        .mk .radius-row { display: flex; gap: var(--mk-6); flex-wrap: wrap; }
        .mk .radius { display: flex; flex-direction: column; gap: var(--mk-2); }
        .mk .radius-box { width: 84px; height: 60px; background: var(--mk-bordeaux); border: 1px solid rgba(242,241,237,0.14); }
        .mk .radius-val { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 13px; color: var(--mk-ash); }
        .mk .radius-use { font-size: 13px; color: var(--mk-ash); max-width: 12ch; line-height: 1.4; }

        /* ------------------------------------------------------------ voice -- */
        .mk .voice-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--mk-8); }
        .mk .voice-list li { position: relative; padding-left: var(--mk-5); margin-bottom: var(--mk-4); font-size: 16px; line-height: 1.6; }
        .mk .voice-list.is-do li::before {
          content: ''; position: absolute; left: 0; top: 0.4em; width: 2px; height: 16px; background: rgba(242, 241, 237, 0.34);
        }
        .mk .voice-list.is-dont li { color: var(--mk-ash); text-decoration: line-through; text-decoration-color: rgba(175,162,160,0.4); }

        /* ---------------------------------------------------------- closing -- */
        .mk .closing {
          padding: clamp(96px, 14vw, 180px) var(--edge);
          background: radial-gradient(760px 460px at 18% 32%, rgba(113,0,20,0.28), transparent 62%), var(--mk-obsidian);
        }
        .mk .closing-inner { max-width: 1440px; margin: 0 auto; }
        .mk .closing-line {
          font-family: var(--mk-display); font-weight: 400; color: var(--mk-white); font-size: clamp(36px, 8vw, 84px);
          line-height: 1.0; letter-spacing: -0.04em; margin: 0;
        }
        .mk .closing-bn {
          font-family: var(--mk-bengali); font-variation-settings: 'wght' 500;
          font-size: clamp(18px, 3vw, 32px); line-height: 1.5; color: var(--mk-blush); margin: var(--mk-5) 0 0;
        }
        .mk .closing-note { max-width: 56ch; font-size: 17px; line-height: 1.7; color: var(--mk-ash); margin: var(--mk-7) 0 0; }
        .mk .closing-ref { font-size: 14px; color: var(--mk-ash); margin: var(--mk-6) 0 0; }

        /* -------------------------------------------------------- responsive -- */
        @media (max-width: 900px) {
          .mk .mark-grid { grid-template-columns: 1fr; }
          .mk .retired, .mk .grade { grid-template-columns: 1fr; }
          .mk .retired-chip, .mk .grade-chip { min-height: 80px; }
          .mk .spec > div { grid-template-columns: 1fr; gap: 2px; }
          .mk .table { font-size: 14px; display: block; overflow-x: auto; white-space: nowrap; }
          .mk .banner { aspect-ratio: 4 / 5; }
          .mk .banner-content { max-width: 100%; }
          .mk .capshot { aspect-ratio: 3 / 2; }
          .mk .stills { grid-template-columns: 1fr; }
          .mk .still-word { font-size: clamp(56px, 18vw, 96px); }
          .mk .still-kicker, .mk .still-spread { font-size: 11px; }
          .mk .still-spread { width: 72%; }
          .mk .count-scene { aspect-ratio: 4 / 5; min-height: 0; }
        }

        /* --------------------------------------------------- reduced motion -- */
        @media (prefers-reduced-motion: reduce) {
          .mk { scroll-behavior: auto; }
          .mk .medallion .k-curl { stroke-dashoffset: 0 !important; transition: none !important; }
          .mk .medallion .k-petal, .mk .medallion .k-grow, .mk .medallion .k-pop, .mk .medallion .k-disc {
            opacity: 1 !important; transform: none !important; transition: none !important;
          }
          .mk .rule .rule-line { stroke-dashoffset: 0 !important; transition: none !important; }
          .mk .letterbox { display: none; }
          .mk .title-inner > *, .mk .title-meta { opacity: 1 !important; transform: none !important; transition: none !important; }
          .mk .banner-img { animation: none !important; transform: none !important; }
          .mk .runner { animation-duration: 1ms !important; }
          .mk * { transition-duration: 0.01ms !important; }
        }
      `}</style>
    </>
  )
}
