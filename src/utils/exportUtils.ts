/**
 * Utilitaires d'exportation pour les commissions de recrutement et les établissements scolaires
 */

export interface ExportApplicationItem {
  id: string;
  createdAt: string;
  status: string;
  coverLetter?: string;
  job?: {
    title: string;
    schoolName: string;
    discipline?: string;
    city?: string;
  };
  candidate?: {
    fullName: string;
    discipline: string;
    level: string;
    experience: number;
    city: string;
    phone?: string;
    user?: {
      email: string;
    };
  };
}

const statusLabels: Record<string, string> = {
  'PENDING': 'En attente',
  'INTERVIEW': 'Entretien convenu',
  'ACCEPTED': 'Retenu / Accepté',
  'REJECTED': 'Non retenu',
};

/**
 * Exporte les candidatures au format CSV (compatible Excel avec BOM UTF-8)
 */
export function exportToCSV(applications: ExportApplicationItem[], filename = 'candidatures_edulink_ci.csv') {
  const headers = [
    'Nom & Prénom(s)',
    'Discipline',
    'Niveau / Diplôme',
    'Expérience (années)',
    'Ville',
    'Téléphone',
    'Email',
    'Poste Visié',
    'Établissement',
    'Statut Candidature',
    'Date Candidature'
  ];

  const rows = applications.map(app => [
    `"${(app.candidate?.fullName || '').replace(/"/g, '""')}"`,
    `"${(app.candidate?.discipline || '').replace(/"/g, '""')}"`,
    `"${(app.candidate?.level || '').replace(/"/g, '""')}"`,
    `"${app.candidate?.experience ?? 0}"`,
    `"${(app.candidate?.city || '').replace(/"/g, '""')}"`,
    `"${(app.candidate?.phone || '').replace(/"/g, '""')}"`,
    `"${(app.candidate?.user?.email || '').replace(/"/g, '""')}"`,
    `"${(app.job?.title || '').replace(/"/g, '""')}"`,
    `"${(app.job?.schoolName || '').replace(/"/g, '""')}"`,
    `"${statusLabels[app.status] || app.status}"`,
    `"${new Date(app.createdAt).toLocaleDateString('fr-FR')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporte et prépare la fiche officielle imprimable pour la commission de recrutement (Format PDF / Impression)
 */
export function exportToPrintPDF(applications: ExportApplicationItem[], schoolOrTitle = 'Commission de Recrutement') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Veuillez autoriser les fenêtres pop-up pour générer le rapport imprimable.');
    return;
  }

  const rowsHtml = applications.map((app, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
      <td style="padding: 10px 8px; font-weight: bold;">${idx + 1}</td>
      <td style="padding: 10px 8px;">
        <div style="font-weight: 600; color: #1e293b;">${app.candidate?.fullName || 'N/A'}</div>
        <div style="font-size: 11px; color: #64748b;">${app.candidate?.user?.email || ''} | ${app.candidate?.phone || ''}</div>
      </td>
      <td style="padding: 10px 8px;">${app.candidate?.discipline || 'N/A'}</td>
      <td style="padding: 10px 8px;">${app.candidate?.level || 'N/A'}</td>
      <td style="padding: 10px 8px; text-align: center;">${app.candidate?.experience || 0} an(s)</td>
      <td style="padding: 10px 8px;">${app.job?.title || 'N/A'}</td>
      <td style="padding: 10px 8px;">
        <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; background: ${
          app.status === 'ACCEPTED' ? '#dcfce7; color: #166534;' :
          app.status === 'INTERVIEW' ? '#dbeafe; color: #1e40af;' :
          app.status === 'REJECTED' ? '#fee2e2; color: #991b1b;' : '#fef3c7; color: #92400e;'
        }">
          ${statusLabels[app.status] || app.status}
        </span>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>EDULINK CI - Rapport de Recrutement</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #334155; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ea580c; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 22px; font-weight: 900; color: #ea580c; }
        .logo span { color: #1e293b; }
        .title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 5px; }
        .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #f8fafc; text-align: left; padding: 10px 8px; font-size: 12px; color: #475569; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; background: #fff7ed; border: 1px solid #fed7aa; padding: 12px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; color: #9a3412; font-weight: 600;">Document officiel généré pour la commission de recrutement.</span>
        <button onclick="window.print()" style="background: #ea580c; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">Imprimer / Enregistrer en PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="logo">EDULINK <span>CI</span></div>
          <div class="title">Procès-verbal de sélection des candidatures</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
          <div><strong>Filtre :</strong> ${schoolOrTitle}</div>
          <div><strong>Date d'extraction :</strong> ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div class="meta">
        Total des dossiers analysés : <strong>${applications.length}</strong> candidat(s)
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th>Candidat</th>
            <th>Discipline</th>
            <th>Diplôme / Niveau</th>
            <th>Expérience</th>
            <th>Poste</th>
            <th>Décision</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top: 50px; display: flex; justify-content: space-between;">
        <div style="width: 200px; text-align: center; border-top: 1px dashed #94a3b8; padding-top: 10px; font-size: 12px;">
          Signature du Responsable Recrutement
        </div>
        <div style="width: 200px; text-align: center; border-top: 1px dashed #94a3b8; padding-top: 10px; font-size: 12px;">
          Cachet de l'Établissement
        </div>
      </div>

      <div class="footer">
        <span>EDULINK CI - Plateforme de recrutement des enseignants de Côte d'Ivoire</span>
        <span>Page 1 / 1</span>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
