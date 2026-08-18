import React from 'react';
import { FileText } from 'lucide-react';

export interface GoogleFormEmbedProps {
  /**
   * L'URL publique du Google Form (ex: https://docs.google.com/forms/d/e/.../viewform)
   */
  formUrl: string;
  /**
   * Titre optionnel pour l'attribut title de l'iframe (accessibilité)
   */
  title?: string;
  /**
   * Hauteur de l'iframe (défaut: 800px)
   */
  height?: string | number;
  /**
   * Classes CSS additionnelles pour le conteneur
   */
  className?: string;
}

/**
 * Composant réutilisable pour intégrer un Google Form (ex: questionnaires, recrutement)
 */
export default function GoogleFormEmbed({
  formUrl,
  title = 'Formulaire Google',
  height = '800px',
  className = ''
}: GoogleFormEmbedProps) {
  if (!formUrl) {
    return null;
  }

  // S'assurer que le paramètre embedded=true est présent pour un affichage optimal
  const embedUrl = formUrl.includes('embedded=true')
    ? formUrl
    : formUrl.includes('?')
      ? `${formUrl}&embedded=true`
      : `${formUrl}?embedded=true`;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-inner ${className}`}>
      {/* Indicateur de chargement en arrière-plan */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-0">
        <FileText className="w-8 h-8 mb-2 opacity-50 animate-pulse" />
        <span className="text-xs font-medium">Chargement du formulaire...</span>
      </div>

      <iframe
        src={embedUrl}
        width="100%"
        height={height}
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title={title}
        className="w-full relative z-10 bg-transparent"
        style={{ border: 'none', minHeight: height }}
      >
        Chargement du formulaire Google…
      </iframe>
    </div>
  );
}
