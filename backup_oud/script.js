const { useState, useMemo, useRef } = React;

// --- Data & Constants (as before) ---
const ZONES = [ { id: 'med', name: 'Méditerranée (zacht)', hdd: 1400, pool_temp: 22 }, { id: 'ouest', name: 'Zuid‑West / Atlantisch', hdd: 1900, pool_temp: 20 }, { id: 'paris', name: 'Noord / Parijs (Île-de-France)', hdd: 2200, pool_temp: 19 }, { id: 'centre', name: 'Centraal / Bourgogne', hdd: 2500, pool_temp: 19 }, { id: 'est', name: 'Oost / Elzas‑Lotharingen', hdd: 2800, pool_temp: 18 }, { id: 'mont', name: 'Bergen (koel)', hdd: 3400, pool_temp: 17 }, ];
const PV_YIELD = { med: 1450, ouest: 1250, paris: 1150, centre: 1200, est: 1150, mont: 1100 };
const DEFAULT_APPLIANCES = [ { key: 'fridge', label: 'Koelkast/vriezer', kwh: 250, on: true }, { key: 'wash', label: 'Wassen/drogen', kwh: 220, on: true }, { key: 'dish', label: 'Vaatwasser', kwh: 180, on: true }, { key: 'oven', label: 'Oven', kwh: 120, on: false }, { key: 'tv', label: 'TV/audio', kwh: 100, on: true }, { key: 'it', label: 'Computer/IT', kwh: 100, on: true }, { key: 'lights', label: 'Verlichting', kwh: 200, on: true } ];
const PRICE_DEFAULTS_USER = { elec: 0.25, gas: 1.20, fioul: 1.15, pellet: 0.60, wood: 85, propaan: 1.80, petroleum: 2.00 };
const ENERGY_UNITS = { elec: '€/kWh', gas: '€/m³', fioul: '€/L', pellet: '€/kg', wood: '€/stère', propaan: '€/L', petroleum: '€/L' };
const KWH_CONVERSION = { elec: 1, gas: 10, fioul: 10, pellet: 5, wood: 1800, propaan: 7.1, petroleum: 10 };
const HEAT_MAIN_DEF = [ { key: 'elec', label: 'Elektrisch (direct)', priceKey: 'elec' }, { key: 'hp', label: 'Warmtepomp (SCOP)', priceKey: 'elec' }, { key: 'gas', label: 'Aardgas (ketel η)', priceKey: 'gas' }, { key: 'fioul', label: 'Fioul (olie, η)', priceKey: 'fioul' }, { key: 'pellet', label: 'Pellet (η)', priceKey: 'pellet' }, { key: 'wood', label: 'Hout (η)', priceKey: 'wood' }, { key: 'propaan', label: 'Propaan (η)', priceKey: 'propaan' }, { key: 'petroleum', label: 'Petroleum (η)', priceKey: 'petroleum' } ];
const HEAT_AUX_DEF = [ { key: 'none', label: 'Geen bijverwarming', priceKey: null }, { key: 'inverter', label: 'Inverter‑airco (SCOP)', priceKey: 'elec' }, { key: 'elec', label: 'Elektrisch (direct)', priceKey: 'elec' }, { key: 'pellet', label: 'Pellet (η)', priceKey: 'pellet' }, { key: 'wood', label: 'Hout (η)', priceKey: 'wood' }, { key: 'propaan', label: 'Propaan (η)', priceKey: 'propaan' } ];
const DHW_TYPES_DEF = [ { key: 'elec', label: 'Boiler elektrisch', priceKey: 'elec' }, { key: 'gas', label: 'Gasgeiser/ketel (η)', priceKey: 'gas' }, { key: 'hp', label: 'WP‑boiler (SCOP)', priceKey: 'elec' } ];
const POOL_HEAT_DEF = [ { key: 'none', label: 'Geen verwarming', priceKey: null }, { key: 'elec', label: 'Elektrisch', priceKey: 'elec' }, { key: 'gas', label: 'Gas (η)', priceKey: 'gas' }, { key: 'hp', label: 'Warmtepomp (SCOP)', priceKey: 'elec' } ];
const U_PRESETS = { wall: {'Ongeïsoleerd (~1975)': 2.0, 'Matig (~5cm)': 0.8, 'Goed (~10cm)': 0.4, 'Zeer goed (15cm+)': 0.25}, roof: {'Ongeïsoleerd': 3.0, 'Matig (~10cm)': 0.5, 'Goed (~20cm)': 0.2, 'Zeer goed (30cm+)': 0.1}, floor: {'Ongeïsoleerd': 1.2, 'Matig (~5cm)': 0.5, 'Goed (~10cm)': 0.3, 'Zeer goed (15cm+)': 0.18}, win: {'Enkel glas': 5.8, 'Dubbel (~1975)': 2.9, 'HR (~1995)': 1.7, 'Triple, nieuw': 0.8} };
const FAQ_CONTENT = [ { q: "Hoe betrouwbaar is de uitkomst?", a: "De tool gebruikt fysisch onderbouwde formules en realistische default-waarden. Het blijft een benadering, geen officieel DPE/audit. Nauwkeurigheid stijgt met goede invoer." }, { q: "Wat betekenen U-waarde, R-waarde en Σ(U·A)?", a: "<b>U-waarde</b> (W/m²K): warmtedoorgang; hoe lager, hoe beter. <b>R-waarde</b> (m²K/W): warmteweerstand; hoe hoger, hoe beter. Het transmissieverlies wordt geschat via <b>Htr = Σ(U · A)</b>, in W/K." }, { q: "Wat is n (ACH) en Hvent?", a: "<b>n (ACH)</b> = luchtwisselingen per uur. Ventilatieverlies: <b>Hvent = 0,34 · n · V</b> (W/K), met V het verwarmde volume in m³. De factor 0,34 is een fysische constante voor lucht." }, { q: "Wat zijn HDD (graaddagen)?", a: "<b>HDD</b> (Heating Degree Days) is een maat voor de jaarlijkse stookbehoefte. Jaarwarmtevraag: <b>E ≈ H · HDD · 24 / 1000</b> (in kWh/j)." }, { q: "Wat is SCOP/COP?", a: "<b>SCOP</b> (Seasonal COP) is de seizoensprestatie van een warmtepomp. Elektriciteitsvraag ≈ warmtevraag / SCOP. Bij vorst daalt de momentane COP." } ];
const ICONS = { building: `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6\"><path d=\"M3.75 21.75a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zM4.5 9.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 15.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM8.25 2.25a.75.75 0 01.75.75v16.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM15.75 2.25a.75.75 0 01.75.75v16.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z\"></path></svg>`, fire: `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6\"><path d=\"M15.362 4.362a1.75 1.75 0 012.474 0 1.75 1.75 0 010 2.474l-5.333 5.333-3.724-3.724a.75.75 0 011.06-1.06l2.664 2.664 5.333-5.333a.75.75 0 01-1.06-1.06l-5.333 5.333-2.664-2.664a1.75 1.75 0 010-2.474 1.75 1.75 0 012.474 0l2.664 2.664 5.333-5.333z\"></path></svg>`, bolt: `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6\"><path d=\"M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.25 4.5h13.5c.828 0 1.5.672 1.5 1.5v3.75c0 .828-.672 1.5-1.5 1.5H5.25c-.828 0-1.5-.672-1.5-1.5V6c0-.828.672-1.5 1.5-1.5z\"></path></svg>`, beaker: `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6\"><path d=\"M9.75 21.75a.75.75 0 01-.75-.75V11.25a.75.75 0 011.5 0v9.75a.75.75 0 01-.75-.75zM14.25 21.75a.75.75 0 01-.75-.75V11.25a.75.75 0 011.5 0v9.75a.75.75 0 01-.75-.75zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 18a8.25 8.25 0 100-16.5 8.25 8.25 0 000 16.5z\"></path></svg>`, currency: `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6\"><path d=\"M12 1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 1.5zM18.75 6a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM12 21a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0112 21zM5.25 6a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5z\"></path></svg>`, faq: `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6\"><path d=\"M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z\"></path></svg>`, debug: `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6\"><path d=\"M11.42 15.17L17.17 20.92M5.58 11.42L11.33 17.17M12.75 5.58L18.5 11.33M6.92 6.92L12.67 12.67M3.08 15.17L8.83 20.92M9.75 3.08L15.5 8.83M16.58 5.58L22.33 11.33M11.33 1.25L17.08 7M18.5 1.25L24.25 7\"></path></svg>` };

function App() {
    // ...helpers, state, and calculations as before...

    // --- Floating Euro Button as React Component ---
    function FloatingEuroButton() {
        const costSummary = results
            ? `Jaarlijkse kosten: ${money(results.totalCost)} (${money(results.perMonth)}/maand)`
            : "Vul uw gegevens in voor een berekening.";

        return (
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    width: '100%',
                    background: 'linear-gradient(90deg, #fff 80%, #ffe600 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0.5rem 1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                }}
            >
                <button
                    style={{
                        background: 'var(--brand-color)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.3rem',
                        borderRadius: '40px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        padding: '0.5rem 1.5rem',
                        border: 'none',
                        cursor: results ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                    title="Bekijk direct uw jaarlijkse kosten"
                    aria-label="Bekijk kosten"
                    disabled={!results}
                >
                    <span style={{ fontSize: '1.7rem' }}>€</span>
                    <span>{costSummary}</span>
                </button>
            </div>
        );
    }

    // --- UI (the rest unchanged, except insert <FloatingEuroButton /> at the top) ---
    return (
        <div>
            <FloatingEuroButton />
            {/* ...the rest of your calculator UI... */}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);