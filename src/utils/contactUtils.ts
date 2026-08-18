/**
 * Helpers pour la gestion robuste des contacts (Téléphone, WhatsApp, Email, SMS)
 * adaptés aux formats de numérotation de Côte d'Ivoire (10 chiffres, +225)
 */

export interface FormattedPhone {
  raw: string;
  cleanDigits: string;
  international: string;
  formattedDisplay: string;
  whatsappUrl: string;
  telUrl: string;
  smsUrl: string;
}

/**
 * Nettoie et formate les numéros de téléphone ivoiriens (+225)
 */
export function formatIvorianPhone(phoneStr: string, customMessage?: string): FormattedPhone {
  if (!phoneStr) {
    return {
      raw: '',
      cleanDigits: '',
      international: '',
      formattedDisplay: 'Non renseigné',
      whatsappUrl: '',
      telUrl: '',
      smsUrl: ''
    };
  }

  // Extraire uniquement les chiffres (garder le + si présent)
  const raw = phoneStr.trim();
  let digits = raw.replace(/\D/g, '');

  // Si commence par 225, enlever le 225 pour analyser la base
  if (digits.startsWith('225') && digits.length >= 10) {
    digits = digits.substring(3);
  }

  // En Côte d'Ivoire, les numéros ont 10 chiffres (depuis le passage à 10 chiffres en 2021)
  // Préfixes mobiles : 01 (Moov), 05 (MTN), 07 (Orange)
  // Préfixes fixes : 21 (Moov), 25 (MTN), 27 (Orange)
  let internationalNumber = '';
  if (digits.length === 10) {
    internationalNumber = `225${digits}`;
  } else if (digits.length === 8) {
    // Ancien format 8 chiffres (fallback de sécurité) : ajouter 07 par défaut ou garder 225
    internationalNumber = `225${digits}`;
  } else if (digits.length > 0) {
    internationalNumber = digits.startsWith('225') ? digits : `225${digits}`;
  } else {
    internationalNumber = '';
  }

  // Format d'affichage soigné : +225 07 00 00 00 00
  let formattedDisplay = raw;
  if (digits.length === 10) {
    formattedDisplay = `+225 ${digits.substring(0, 2)} ${digits.substring(2, 4)} ${digits.substring(4, 6)} ${digits.substring(6, 8)} ${digits.substring(8, 10)}`;
  } else if (internationalNumber) {
    formattedDisplay = `+${internationalNumber}`;
  }

  const defaultMsg = encodeURIComponent(
    customMessage || "Bonjour, je vous contacte depuis la plateforme EDULINK CI concernant une opportunité d'enseignement."
  );

  const whatsappUrl = internationalNumber ? `https://wa.me/${internationalNumber}?text=${defaultMsg}` : '';
  const telUrl = internationalNumber ? `tel:+${internationalNumber}` : `tel:${digits}`;
  const smsUrl = internationalNumber ? `sms:+${internationalNumber}?body=${defaultMsg}` : '';

  return {
    raw,
    cleanDigits: digits,
    international: internationalNumber,
    formattedDisplay,
    whatsappUrl,
    telUrl,
    smsUrl
  };
}

export interface EmailOptions {
  recipientEmail: string;
  recipientName?: string;
  subject?: string;
  body?: string;
  gmailUrl: string;
  outlookUrl: string;
  yahooUrl: string;
  mailtoUrl: string;
}

/**
 * Prépare les URLs de redirection Webmail (Gmail, Outlook, Yahoo) et le mailto natif
 */
export function prepareEmailLinks(
  email: string,
  recipientName: string = 'Enseignant',
  contextTitle?: string
): EmailOptions {
  const cleanEmail = (email || '').trim();
  const subjectText = contextTitle 
    ? `[EDULINK CI] Prise de contact : ${contextTitle}`
    : `[EDULINK CI] Prise de contact & Opportunité d'enseignement`;
  
  const bodyText = `Bonjour ${recipientName},\n\nJe vous contacte via la plateforme EDULINK CI suite à la consultation de votre profil.\n\nCordialement,\n`;

  const encSubject = encodeURIComponent(subjectText);
  const encBody = encodeURIComponent(bodyText);
  const encEmail = encodeURIComponent(cleanEmail);

  return {
    recipientEmail: cleanEmail,
    recipientName,
    subject: subjectText,
    body: bodyText,
    gmailUrl: `https://mail.google.com/mail/?view=cm&fs=1&to=${encEmail}&su=${encSubject}&body=${encBody}`,
    outlookUrl: `https://outlook.live.com/mail/0/deeplink/compose?to=${encEmail}&subject=${encSubject}&body=${encBody}`,
    yahooUrl: `https://compose.mail.yahoo.com/?to=${encEmail}&subject=${encSubject}&body=${encBody}`,
    mailtoUrl: `mailto:${cleanEmail}?subject=${encSubject}&body=${encBody}`
  };
}

/**
 * Copie sécurisée dans le presse-papier avec fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    return false;
  }
}
