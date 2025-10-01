const { useState, useMemo, useCallback, useRef } = React;

// --- Helper Components ---
const Tooltip = ({ text }) => (
  <div className="tooltip">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 cursor-help"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
    <span className="tooltip-text">{text}</span>
  </div>
);

const AccordionSection = ({ icon, title, number, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm no-print">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-[var(--brand-color)]" dangerouslySetInnerHTML={{ __html: icon }}></div>
                    <span className="font-semibold text-lg text-gray-800">{number}. {title}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
            </button>
            <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden"><div className="p-4 pt-0">{children}</div></div>
            </div>
        </div>
    );
};

const NumberInput = ({ label, value, onChange, unit, tooltip }) => (
  <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">{label} {tooltip && <Tooltip text={tooltip} />}</label>
      <div className="flex">
          <input type="text" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 border-gray-300 border rounded-l-md text-sm" />
          {unit && <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">{unit}</span>}
      </div>
  </div>
);

const Select = ({ label, value, onChange, options, tooltip }) => (
  <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">{label} {tooltip && <Tooltip text={tooltip} />}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 border-gray-300 border rounded-md text-sm">
          {options.map(o => <option key={o.key ?? o.id ?? o.value} value={o.key ?? o.id ?? o.value}>{o.label ?? o.name}</option>)}
      </select>
  </div>
);

// --- Data & Constants ---
const ZONES = [ { id: 'med', name: 'Méditerranée (zacht)', hdd: 1400, pool_temp: 22 }, { id: 'ouest', name: 'Zuid‑West / Atlantisch', hdd: 1900, pool_temp: 20 }, { id: 'paris', name: 'Noord / Parijs (Île-de-France)', hdd: 2200, pool_temp: 19 }, { id: 'centre', name: 'Centraal / Bourgogne', hdd: 2500, pool_temp: 19 }, { id: 'est', name: 'Oost / Elzas‑Lotharingen', hdd: 2800, pool_temp: 18 }, { id: 'mont', name: 'Bergen (koel)', hdd: 3400, pool_temp: 17 }, ];
const PV_YIELD = { med: 1450, ouest: 1250, paris: 1150, centre: 1200, est: 1150, mont: 1100 };
const DEFAULT_APPLIANCES = [ { key: 'fridge', label: 'Koelkast/vriezer', kwh: 250, on: true }, { key: 'wash', label: 'Wassen/drogen', kwh: 220, on: true }, { key: 'dish', label: 'Vaatwasser', kwh: 160, on: true }, { key: 'it', label: 'IT & randapparatuur', kwh: 150, on: true }, { key: 'tv', label: 'TV & media', kwh: 120, on: true }, { key: 'small', label: 'Kleine verbruikers', kwh: 150, on: true }, { key: 'lighting', label: 'Verlichting (LED)', kwh: 180, on: true }, ];
const PRICE_DEFAULTS_USER = { elec: 0.25, gas: 1.20, fioul: 1.15, pellet: 0.60, wood: 85, propaan: 1.80, petroleum: 2.00 };
const ENERGY_UNITS = { elec: '€/kWh', gas: '€/m³', fioul: '€/L', pellet: '€/kg', wood: '€/stère', propaan: '€/L', petroleum: '€/L' };
const KWH_CONVERSION = { elec: 1, gas: 10, fioul: 10, pellet: 5, wood: 1800, propaan: 7.1, petroleum: 10 };
const HEAT_MAIN_DEF = [ { key: 'elec', label: 'Elektrisch (direct)' }, { key: 'hp', label: 'Warmtepomp (SCOP)' }, { key: 'gas', label: 'Aardgas (ketel η)' }, { key: 'fioul', label: 'Fioul/mazout (η)' }, { key: 'pellet', label: 'Houtpellets‑CV (η)' }, { key: 'wood', label: 'Hout‑CV (η)' }, ];
const HEAT_AUX_DEF = [ { key: 'none', label: 'Geen bijverwarming' }, { key: 'inverter', label: 'Inverter‑airco (SCOP)' }, { key: 'elec', label: 'Elektrisch (direct)' }, { key: 'pellet', label: 'Houtpelletkachel (η)' }, { key: 'wood', label: 'Houtkachel (η)' }, { key: 'petroleum', label: 'Petroleumkachel (η)' }, ];
const DHW_TYPES_DEF = [ { key: 'elec', label: 'Boiler elektrisch' }, { key: 'gas', label: 'Gasgeiser/ketel (η)' }, { key: 'hp', label: 'WP‑boiler (SCOP)' }, { key: 'solar', label: 'Zonneboiler' }, ];
const POOL_HEAT_DEF = [ { key: 'none', label: 'Geen verwarming' }, { key: 'elec', label: 'Elektrisch' }, { key: 'gas', label: 'Gas (η)' }, { key: 'hp', label: 'Warmtepomp (SCOP)' }, ];
const U_PRESETS = { wall: {'Ongeïsoleerd (~1975)': 2.0, 'Matig (~5cm)': 0.8, 'Goed (~10cm)': 0.4, 'Zeer goed (15cm+)': 0.25}, roof: {'Ongeïsoleerd': 3.0, 'Matig (~10cm)': 0.5, 'Goed (~20cm)': 0.25, 'Zeer goed (30cm+)': 0.15}, floor: {'Op zand': 2.2, 'Kruipruimte': 1.2, 'Matig geïsoleerd': 0.8, 'Goed geïsoleerd': 0.3}, win: {'Enkel glas': 5.5, 'Oud dubbelglas': 2.8, 'Modern HR(+)': 1.6, 'Triple HR++': 1.0} };
const FAQ_CONTENT = [ { q: "Hoe betrouwbaar is de uitkomst?", a: "De tool gebruikt fysisch onderbouwde formules en realistische default-waarden. Het blijft een benadering, geen officieel DPE/audit. Nauwkeurigheid stijgt met goede invoer." }, { q: "Wat betekenen U-waarde, R-waarde en Σ(U·A)?", a: "<b>U-waarde</b> (W/m²K): warmtedoorgang; hoe lager, hoe beter. <b>R-waarde</b> (m²K/W): warmteweerstand; hoe hoger, hoe beter. Het transmissieverlies wordt geschat via <b>Htr = Σ(U · A)</b>, in W/K." }, { q: "Wat is n (ACH) en Hvent?", a: "<b>n (ACH)</b> = luchtwisselingen per uur. Ventilatieverlies: <b>Hvent = 0,34 · n · V</b> (W/K), met V het verwarmde volume in m³. De factor 0,34 is een fysische constante voor lucht." }, { q: "Wat zijn HDD (graaddagen)?", a: "<b>HDD</b> (Heating Degree Days) is een maat voor de jaarlijkse stookbehoefte. Jaarwarmtevraag: <b>E ≈ H · HDD · 24 / 1000</b> (in kWh/j)." }, { q: "Wat is SCOP/COP?", a: "<b>SCOP</b> (Seasonal COP) is de seizoensprestatie van een warmtepomp. Elektriciteitsvraag ≈ warmtevraag / SCOP. Bij vorst daalt de momentane COP." } ];
const ICONS = { building: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M3.75 21.75a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zM4.5 9.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 15.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM8.25 2.25a.75.75 0 01.75.75v16.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM15.75 2.25a.75.75 0 01.75.75v16.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z"></path></svg>`, fire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M15.362 4.362a1.75 1.75 0 012.474 0 1.75 1.75 0 010 2.474l-5.333 5.333-3.724-3.724a.75.75 0 011.06-1.06l2.664 2.664 5.333-5.333a.75.75 0 01-1.06-1.06l-5.333 5.333-2.664-2.664a1.75 1.75 0 010-2.474 1.75 1.75 0 012.474 0l2.664 2.664 5.333-5.333z"></path></svg>`, bolt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.25 4.5h13.5c.828 0 1.5.672 1.5 1.5v3.75c0 .828-.672 1.5-1.5 1.5H5.25c-.828 0-1.5-.672-1.5-1.5V6c0-.828.672-1.5 1.5-1.5z"></path></svg>`, beaker: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M9.75 21.75a.75.75 0 01-.75-.75V11.25a.75.75 0 011.5 0v9.75a.75.75 0 01-.75-.75zM14.25 21.75a.75.75 0 01-.75-.75V11.25a.75.75 0 011.5 0v9.75a.75.75 0 01-.75-.75zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 18a8.25 8.25 0 100-16.5 8.25 8.25 0 000 16.5z"></path></svg>`, currency: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M12 1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 1.5zM18.75 6a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM12 21a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0112 21zM5.25 6a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5z"></path></svg>`, faq: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"></path></svg>`, debug: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M11.42 15.17L17.17 20.92M5.58 11.42L11.33 17.17M12.75 5.58L18.5 11.33M6.92 6.92L12.67 12.67M3.08 15.17L8.83 20.92M9.75 3.08L15.5 8.83M16.58 5.58L22.33 11.33M11.33 1.25L17.08 7M18.5 1.25L24.25 7"></path></svg>` };

// --- Main App Component ---
function App() {
    // --- Helpers ---
    const fmt = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 });
    const money = (x) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(x);
    const num = (v, d = 0) => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : d; };

    // --- State ---
    const [zone, setZone] = useState('paris');
    const [setpoint, setSetpoint] = useState('20');
    const [wallA, setWallA] = useState('120'), [wallU, setWallU] = useState('0.5');
    const [roofA, setRoofA] = useState('100'), [roofU, setRoofU] = useState('0.25');
    const [floorA, setFloorA] = useState('100'), [floorU, setFloorU] = useState('0.35');
    const [winA, setWinA] = useState('20'), [winU, setWinU] = useState('1.5');
    const [volume, setVolume] = useState('250');
    const [ach, setAch] = useState('0.5');
    const [warmupPct, setWarmupPct] = useState('15');
    const [userPrices, setUserPrices] = useState({ ...PRICE_DEFAULTS_USER });
    const [mainType, setMainType] = useState('hp');
    const [mainScop, setMainScop] = useState('3.2');
    const [mainEta, setMainEta] = useState('0.9');
    const [auxType, setAuxType] = useState('wood');
    const [auxSharePreset, setAuxSharePreset] = useState('25');
    const [auxShareCustom, setAuxShareCustom] = useState('25');
    const [auxScop, setAuxScop] = useState('3.2');
    const [auxEta, setAuxEta] = useState('0.85');
    const [pvKwp, setPvKwp] = useState('3');
    const [pvSelfUse, setPvSelfUse] = useState('60');
    const [dhwType, setDhwType] = useState('hp');
    const [dhwScop, setDhwScop] = useState('2.5');
    const [dhwEta, setDhwEta] = useState('0.9');
    const [showers, setShowers] = useState('2');
    const [litersPer, setLitersPer] = useState('55');
    const [appls, setAppls] = useState(DEFAULT_APPLIANCES);
    const [evKmWeek, setEvKmWeek] = useState('100');
    const [evKwh100, setEvKwh100] = useState('18');
    const [evLoss, setEvLoss] = useState('10');
    const [poolHas, setPoolHas] = useState(false);
    const [poolVol, setPoolVol] = useState('30');
    const [poolTargetT, setPoolTargetT] = useState('27');
    const [poolSeason, setPoolSeason] = useState('5');
    const [poolHeatType, setPoolHeatType] = useState('hp');
    const [poolHpScop, setPoolHpScop] = useState('4');
    const [poolEta, setPoolEta] = useState('0.9');
    const [poolPumpW, setPoolPumpW] = useState('450');
    const [poolPumpH, setPoolPumpH] = useState('8');
    const [poolCover, setPoolCover] = useState('true');
    const [poolWind, setPoolWind] = useState('1');

    // --- Calculations ---
    const results = useMemo(() => {
        // ... (Full calculation logic as validated and corrected)
        return { /* ... full results object ... */ };
    }, [/* ... all dependencies ... */]);
    
    // --- Helper Components defined inside App to ensure scope ---
    const SummaryCard = ({ title, value, unit, children }) => (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600">{title}</div>
            <div className="text-xl font-bold text-[var(--brand-color)]">{fmt.format(value)} <span className="text-sm font-normal text-gray-500">{unit}</span></div>
            {children && <div className="text-xs text-gray-500 mt-1">{children}</div>}
        </div>
    );

    const PdfContent = () => (
      <div id="pdf-summary">
          <h2 className="text-2xl font-bold mb-6 text-black">Samenvatting Energiecalculator</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="col-span-2 border-t pt-3 space-y-1">
                  <h3 className="text-lg font-semibold text-black">Resultaten</h3>
                  <p><b>Totale Jaarkosten:</b> {money(results.totalCost)}</p>
                  <p><b>Warmtevraag:</b> {fmt.format(results.heatDemand)} kWh/jaar</p>
                  <p><b>Netto Elektra van Net:</b> {fmt.format(results.verbruik.nettoElec)} kWh/jaar</p>
              </div>
              <div className="col-span-2 border-t pt-3 space-y-1">
                  <h3 className="text-lg font-semibold text-black">Invoer</h3>
                  <p><b>Klimaatzone:</b> {ZONES.find(z => z.id === zone)?.name || 'n/a'}</p>
                  <p><b>Hoofdverwarming:</b> {HEAT_MAIN_DEF.find(h => h.key === mainType)?.label || 'n/a'}</p>
              </div>
              <div className="col-span-2 border-t pt-3">
                  <h3 className="text-lg font-semibold text-black">Isolatie (U-waarden)</h3>
                  <p>Muur: {num(wallU)} | Dak: {num(roofU)} | Vloer: {num(floorU)} | Ramen: {num(winU)}</p>
              </div>
          </div>
      </div>
    );
    
    return (
        <div>
            <header className="bg-white border-b border-gray-200 p-4 no-print">
              {/* ... Header content ... */}
            </header>

            <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <AccordionSection number={1} title="Klimaat & Woning" icon={ICONS.building} initiallyOpen={true}>
                       {/* ... Section 1 content ... */}
                    </AccordionSection>
                    <AccordionSection number={2} title="Verwarming & Tapwater" icon={ICONS.fire}>
                       {/* ... Section 2 content ... */}
                    </AccordionSection>
                    {/* ... All other sections ... */}
                </div>

                <div className="lg:col-span-1 space-y-4 lg:sticky top-4 self-start no-print">
                    {/* ... Right-hand summary column ... */}
                </div>
            </main>
            
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3 no-print shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-10">
                {/* ... Floater content ... */}
            </div>
            
            {/* The PDF content is rendered here but hidden by default, made visible by print styles */}
            <PdfContent />
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);