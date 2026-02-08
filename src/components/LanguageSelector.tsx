"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Language = "en" | "fr";

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
];

// Simple i18n translations
export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    askQuestion: "Ask a Question",
    reportIssue: "Report an Issue",
    dashboard: "Dashboard",
    home: "Home",

    // Common actions
    search: "Search...",
    submit: "Submit",
    cancel: "Cancel",
    next: "Next",
    back: "Back",
    loading: "Loading...",
    noResults: "No results found",

    // Q&A page
    typeQuestion: "Type your question about city services...",
    viewSources: "View Sources",
    askAnything: "Ask anything about Kingston city services",
    questionPlaceholder: "e.g., When is garbage collection in my area?",

    // Report page
    reportSubmitted: "Report submitted successfully",
    selectLocation: "Select location on map",
    uploadPhoto: "Upload Photo",
    description: "Description",
    issueType: "Issue Type",
    whereIsIssue: "Where is the issue?",
    describeIssue: "Describe the Issue",
    reviewSubmit: "Review & Submit",
    selectIssueType: "Select Issue Type",
    whatTypeOfIssue: "What type of issue are you reporting?",
    provideDetails: "Provide details about the issue",
    descriptionPlaceholder: "Please describe the issue in detail...",
    clickMapToSelect: "Click on the map to select the issue location",
    reviewYourReport: "Review Your Report",
    submitReport: "Submit Report",
    submitting: "Submitting...",

    // Issue types
    pothole: "Pothole",
    streetlight: "Streetlight",
    graffiti: "Graffiti",
    garbage: "Garbage/Litter",
    parking: "Parking Issue",
    noise: "Noise Complaint",
    water: "Water/Sewer",
    other: "Other",

    // Dashboard
    recentReports: "Recent Reports",
    allReports: "All Reports",
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    searchReports: "Search reports...",
    noReportsFound: "No reports found",

    // Misc
    disclaimer: "This is informational only. Verify with City for legal decisions.",
    welcomeTitle: "Your City, Simplified",
    welcomeSubtitle: "Get instant answers about Kingston city services, report issues, and track their resolution.",
  },
  fr: {
    // Navigation
    askQuestion: "Poser une question",
    reportIssue: "Signaler un problème",
    dashboard: "Tableau de bord",
    home: "Accueil",

    // Common actions
    search: "Rechercher...",
    submit: "Soumettre",
    cancel: "Annuler",
    next: "Suivant",
    back: "Retour",
    loading: "Chargement...",
    noResults: "Aucun résultat",

    // Q&A page
    typeQuestion: "Posez votre question sur les services municipaux...",
    viewSources: "Voir les sources",
    askAnything: "Posez vos questions sur les services de Kingston",
    questionPlaceholder: "ex: Quand est la collecte des ordures dans mon quartier?",

    // Report page
    reportSubmitted: "Rapport soumis avec succès",
    selectLocation: "Sélectionner l'emplacement sur la carte",
    uploadPhoto: "Télécharger une photo",
    description: "Description",
    issueType: "Type de problème",
    whereIsIssue: "Où se trouve le problème?",
    describeIssue: "Décrivez le problème",
    reviewSubmit: "Réviser et soumettre",
    selectIssueType: "Sélectionner le type de problème",
    whatTypeOfIssue: "Quel type de problème signalez-vous?",
    provideDetails: "Fournissez des détails sur le problème",
    descriptionPlaceholder: "Veuillez décrire le problème en détail...",
    clickMapToSelect: "Cliquez sur la carte pour sélectionner l'emplacement",
    reviewYourReport: "Révisez votre rapport",
    submitReport: "Soumettre le rapport",
    submitting: "Soumission...",

    // Issue types
    pothole: "Nid-de-poule",
    streetlight: "Éclairage de rue",
    graffiti: "Graffiti",
    garbage: "Ordures/Déchets",
    parking: "Problème de stationnement",
    noise: "Plainte de bruit",
    water: "Eau/Égout",
    other: "Autre",

    // Dashboard
    recentReports: "Rapports récents",
    allReports: "Tous les rapports",
    pending: "En attente",
    inProgress: "En cours",
    resolved: "Résolu",
    searchReports: "Rechercher des rapports...",
    noReportsFound: "Aucun rapport trouvé",

    // Misc
    disclaimer: "Ceci est informatif seulement. Vérifiez auprès de la Ville pour les décisions juridiques.",
    welcomeTitle: "Votre ville, simplifiée",
    welcomeSubtitle: "Obtenez des réponses instantanées sur les services de Kingston, signalez des problèmes et suivez leur résolution.",
  },
};

// Language Context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("veritas-language") as Language;
    if (saved && (saved === "en" || saved === "fr")) {
      setLanguageState(saved);
    }
    setIsHydrated(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("veritas-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  // Prevent hydration mismatch by rendering children only after hydration
  if (!isHydrated) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use translations
export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Fallback for components not wrapped in provider
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: (key: string) => translations.en[key] || key,
    };
  }
  return context;
}

interface LanguageSelectorProps {
  onChange?: (lang: Language) => void;
}

export function LanguageSelector({ onChange }: LanguageSelectorProps) {
  const { language, setLanguage } = useTranslation();

  const handleChange = (value: Language) => {
    setLanguage(value);
    onChange?.(value);
  };

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger
        className="w-[140px] focus-ring bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-700">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-slate-700">
            {lang.nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
