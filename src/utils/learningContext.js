import { createContext, useContext } from 'react';

/**
 * Contexto de la capa pedagógica. Vive fuera de LearningLayer.jsx para que ese
 * archivo exporte solo componentes (requisito de react-refresh).
 */
export const LearningContext = createContext(null);

const FALLBACK = {
  learnMode: false,
  setLearnMode: () => {},
  glossary: null,
  openGlossary: () => {},
  closeGlossary: () => {},
  tourRunning: false,
  startTour: () => {},
  endTour: () => {}
};

/** Fuera del provider devuelve un contexto inerte: la capa simplemente no aparece. */
export const useLearning = () => useContext(LearningContext) || FALLBACK;
