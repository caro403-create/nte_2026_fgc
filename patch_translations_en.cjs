const fs = require('fs');
const file = '/Users/carolain/Desktop/nte_fgc/src/utils/translations.js';
let content = fs.readFileSync(file, 'utf8');

const enAdd = `
    // Map popups
    popupUnknown: "Unknown",
    popupAridityExtreme: "Extreme Drought",
    popupAridityExtremeDesc: "Critical fire risk and rapid spread.",
    popupAriditySevere: "Severe Drought",
    popupAriditySevereDesc: "High vulnerability, very dry vegetation.",
    popupAridityModerate: "Moderate Drought",
    popupAridityModerateDesc: "Water deficit, caution advised.",
    popupAridityNormal: "Normal",
    popupAridityNormalDesc: "Stable moisture conditions.",
    popupAridityWet: "Wet",
    popupAridityWetDesc: "Wet terrain. Low ignition risk.",
    popupDroughtArid: "Arid Soil",
    popupDroughtAridDesc: "Deep critical deficit (0-2m). Highly flammable fuel.",
    popupDroughtVeryDry: "Very Dry Soil",
    popupDroughtVeryDryDesc: "Poor water retention in subsoil. High risk.",
    popupDroughtDry: "Dry Soil",
    popupDroughtDryDesc: "Reduced moisture in roots.",
    popupDroughtWet: "Wet Soil",
    popupDroughtWetDesc: "Adequate subsoil moisture. Low risk.",
    popupErosionCritical: "Critical Slope",
    popupErosionCriticalDesc: "Severe inclination ({val}°). Fire spreads much faster uphill.",
    popupErosionModerate: "Moderate Slope",
    popupErosionModerateDesc: "Medium inclination ({val}°). Risk of rapid spread.",
    popupErosionFlat: "Flat Terrain",
    popupErosionFlatDesc: "Gentle inclination ({val}°). Predictable fire behavior.",
    popupForestDense: "Dense Forest",
    popupForestDenseDesc: "High biomass and closed canopy. High fuel load in dry season.",
    popupForestSparse: "Sparse Forest",
    popupForestSparseDesc: "Fragmented or transitioning forest cover.",
    popupForestNone: "No Cover",
    popupForestNoneDesc: "Deforested areas, savanna, or agriculture.",
    popupBurnedScar: "Burn Scar",
    popupBurnedScarDesc: "Destruction of vegetation cover by fire was detected around <b>{date}</b> (Day {val} of the year). This area exhibits eroded soil and loss of water retention.",
    popupNoDataGeneric: "No data at this coordinate",
    popupNoDataBurned: "No recent historical burn scars detected at this point (MODIS satellite).",
    popupNoDataForest: "No dense dry forest cover at this point.",
    popupConsulting: "Consulting...",
    popupConnectionError: "Connection Error",
`;

content = content.replace('    footerText: "Project', enAdd + '\n    footerText: "Project');
fs.writeFileSync(file, content);
console.log('English translations injected');
