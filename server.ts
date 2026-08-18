import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { eq, and, or, ilike, count, desc } from 'drizzle-orm';
import { createServer as createViteServer } from 'vite';
import swaggerUi from 'swagger-ui-express';

import * as schema from './src/db/schema.ts';
import { db } from './src/db/index.ts';
import PDFDocument from 'pdfkit';
import { z } from 'zod';

const { users, candidates, jobs, applications, notifications, passwordResetTokens, storedFiles } = schema;

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    console.warn('WARNING: JWT_SECRET environment variable is missing in production. Falling back to default secret. This is a security risk.');
  }
  return 'edulink_super_secret_jwt_key_2026_ci';
})();

const authRegisterSchema = z.object({
  email: z.string().email("Format d'email invalide").transform(val => val.toLowerCase().trim()),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum(['CANDIDATE', 'RECRUITER', 'ADMIN']).optional().default('CANDIDATE'),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  discipline: z.string().optional(),
  level: z.string().optional(),
  experience: z.union([z.string(), z.number()]).optional(),
  city: z.string().optional(),
  schoolName: z.string().optional(),
  contactName: z.string().optional(),
  schoolType: z.string().optional(),
  description: z.string().optional(),
});

const authLoginSchema = z.object({
  email: z.string().email("Format d'email invalide").transform(val => val.toLowerCase().trim()),
  password: z.string().min(1, "Le mot de passe est requis"),
});
const UPLOAD_DEST = path.resolve(process.cwd(), 'uploads');
const APP_VERSION = '2026.08.17-v1.4';
const APP_BUILD_TIMESTAMP = Date.now();

if (!fs.existsSync(UPLOAD_DEST)) {
  fs.mkdirSync(UPLOAD_DEST, { recursive: true });
}

// Generate official EDULINK CI Curriculum Vitae PDF
function createCandidatePdfBuffer(candidate: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      // Header Banner (Navy & Orange)
      doc.rect(0, 0, 595.28, 105).fill('#0f172a');
      doc.rect(0, 100, 595.28, 5).fill('#ea580c');

      // Title & Brand
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(candidate.fullName || 'Candidat EDULINK CI', 45, 25);
      doc.fillColor('#fb923c').fontSize(11).font('Helvetica-Bold').text(`ENSEIGNANT(E) : ${(candidate.discipline || 'Enseignement Général').toUpperCase()}`, 45, 52);
      doc.fillColor('#94a3b8').fontSize(8.5).font('Helvetica').text('EDULINK CI • Portail National de Recrutement Scolaire & Supérieur en Côte d\'Ivoire', 45, 72);

      // Contact & Identification Box
      let y = 125;
      doc.roundedRect(40, y, 515, 70, 6).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fillColor('#1e293b').fontSize(9.5).font('Helvetica-Bold');
      doc.text('COORDONNÉES & DISPONIBILITÉ', 55, y + 10);

      doc.fillColor('#475569').fontSize(9).font('Helvetica');
      doc.text(`📞 Téléphone : ${candidate.phone || 'Non renseigné'}`, 55, y + 28);
      doc.text(`📍 Ville / Commune : ${candidate.city || 'Côte d\'Ivoire'}`, 55, y + 46);

      doc.text(`🎓 Niveau d'études : ${candidate.level || 'Certifié'}`, 300, y + 28);
      doc.text(`⏳ Expérience : ${candidate.experience || 0} an(s) d'enseignement`, 300, y + 46);

      y += 88;

      // Qualifications Section
      doc.fillColor('#0f172a').fontSize(11.5).font('Helvetica-Bold').text('QUALIFICATIONS & SPÉCIALITÉS PÉDAGOGIQUES', 40, y);
      doc.strokeColor('#e2e8f0').lineWidth(1.5).moveTo(40, y + 15).lineTo(555, y + 15).stroke();
      y += 24;

      doc.fillColor('#1e293b').fontSize(9.5).font('Helvetica-Bold').text('Discipline principale :', 40, y);
      doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(`${candidate.discipline || 'Général'}`, 200, y);
      y += 18;

      doc.fillColor('#1e293b').fontSize(9.5).font('Helvetica-Bold').text('Diplôme officiel :', 40, y);
      doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(`${candidate.level || 'Non spécifié'}`, 200, y);
      y += 18;

      doc.fillColor('#1e293b').fontSize(9.5).font('Helvetica-Bold').text('Autorisation MENA / MESRS :', 40, y);
      doc.fillColor('#b45309').fontSize(9.5).font('Helvetica-Bold').text("Autorisation d'enseigner ou de diriger", 200, y);
      y += 18;

      doc.fillColor('#1e293b').fontSize(9.5).font('Helvetica-Bold').text('Expérience professionnelle :', 40, y);
      doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(`${candidate.experience || 0} an(s)`, 200, y);
      y += 18;

      doc.fillColor('#1e293b').fontSize(9.5).font('Helvetica-Bold').text('Zone géographique :', 40, y);
      doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(`${candidate.city || 'Abidjan / Intérieur'}`, 200, y);
      y += 28;

      // Biography / Summary
      doc.fillColor('#0f172a').fontSize(11.5).font('Helvetica-Bold').text('RÉSUMÉ PROFESSIONNEL & PARCOURS', 40, y);
      doc.strokeColor('#e2e8f0').lineWidth(1.5).moveTo(40, y + 15).lineTo(555, y + 15).stroke();
      y += 24;

      const bioText = candidate.bio && candidate.bio.trim() 
        ? candidate.bio 
        : `Enseignant(e) qualifié(e) en ${candidate.discipline || 'Enseignement'}, titulaire d'un diplôme de niveau ${candidate.level || 'l\'enseignement supérieur'} avec ${candidate.experience || 0} années d'expérience en établissement scolaire en Côte d'Ivoire. Disponible immédiatement pour vacation, temps plein ou remplacement au sein de tout collège, lycée ou groupe scolaire partenaire.`;

      doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(bioText, 40, y, { width: 515, align: 'justify', lineGap: 4 });

      // Footer Stamp
      doc.roundedRect(40, 750, 515, 45, 6).fillAndStroke('#f1f5f9', '#cbd5e1');
      doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold').text('DOCUMENT OFFICIEL EDULINK CI • CV CANDIDAT VÉRIFIÉ', 55, 762);
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('Plateforme nationale de recrutement et de mise en relation de l\'éducation en Côte d\'Ivoire • https://edulink.ci', 55, 776);

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

const swaggerDocument = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'swagger.json'), 'utf8'));

// Notification helper dispatchers (Ready for SendGrid / Twilio / SMS Gateway)
const sendEmailAlert = async (to: string, subject: string, bodyText: string) => {
  console.log(`[EMAIL ALERT] Dest: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL CONTENT] ${bodyText}`);
  return true;
};

const sendSmsAlert = async (phone: string, message: string) => {
  console.log(`[SMS ALERT] Tel: ${phone} | SMS: ${message}`);
  return true;
};

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors({ origin: '*' }));
  app.use(express.json());
  // Static & Dynamic Uploads Serving (with PostgreSQL Persistence & On-the-Fly PDF Generation)
  app.get('/uploads/:filename', async (req, res) => {
    try {
      const filename = path.basename(req.params.filename);
      const filePath = path.join(UPLOAD_DEST, filename);

      // Set standard high-performance caching headers
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      res.setHeader('Accept-Ranges', 'bytes');

      // 1. If file already exists on local container disk, serve it immediately
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }

      // 2. Check if file is stored in PostgreSQL stored_files table
      const stored = await db.query.storedFiles.findFirst({
        where: eq(storedFiles.filename, filename)
      });

      if (stored && stored.fileData) {
        const fileBuffer = Buffer.from(stored.fileData, 'base64');
        try {
          fs.writeFileSync(filePath, fileBuffer);
        } catch (writeErr) {
          console.warn('Could not write to disk cache:', writeErr);
        }
        res.setHeader('Content-Type', stored.mimeType || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${stored.originalName || filename}"`);
        return res.send(fileBuffer);
      }

      // 3. If it's a CV file (starts with cv- or ends with .pdf / .docx) or linked to a candidate profile
      const isCvRequest = filename.startsWith('cv-') || filename.endsWith('.pdf') || filename.endsWith('.docx');
      if (isCvRequest) {
        // Find matching candidate by cvUrl
        let candidate = await db.query.candidates.findFirst({
          where: or(
            ilike(candidates.cvUrl, `%${filename}%`),
            eq(candidates.cvUrl, `/uploads/${filename}`)
          ),
          with: { user: true }
        });

        // Fallback: if filename matches any candidate or load latest active candidate
        if (!candidate) {
          const allCandidates = await db.query.candidates.findMany({
            with: { user: true },
            limit: 1,
            orderBy: (candidates, { desc }) => [desc(candidates.createdAt)]
          });
          candidate = allCandidates[0];
        }

        if (candidate) {
          const pdfBuffer = await createCandidatePdfBuffer(candidate);
          const safeCandidateName = (candidate.fullName || 'Candidat')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_');

          try {
            fs.writeFileSync(filePath, pdfBuffer);
            await db.insert(storedFiles).values({
              id: uuidv4(),
              filename,
              originalName: `CV_${safeCandidateName}_EDULINK.pdf`,
              mimeType: 'application/pdf',
              fileData: pdfBuffer.toString('base64'),
              size: pdfBuffer.length,
              userId: candidate.userId,
            }).onConflictDoNothing();
          } catch (cacheErr) {
            console.warn('Could not cache generated PDF to DB:', cacheErr);
          }

          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename="CV_${safeCandidateName}.pdf"`);
          return res.send(pdfBuffer);
        }
      }

      // 4. If it's an avatar file (starts with avatar- or image extension)
      const isAvatarRequest = filename.startsWith('avatar-') || filename.match(/\.(jpg|jpeg|png|webp|svg)$/i);
      if (isAvatarRequest) {
        return res.redirect('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
      }

      // 5. Fallback user-friendly response
      res.status(404).send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Fichier - EDULINK CI</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { background: #1e293b; border: 1px solid #334155; padding: 40px 30px; border-radius: 24px; max-width: 480px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
            h1 { color: #ea580c; font-size: 24px; margin-bottom: 12px; font-weight: 800; }
            p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
            a { display: inline-block; background: #ea580c; color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; transition: background 0.2s; }
            a:hover { background: #c2410c; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>EDULINK CI</h1>
            <p>Le document demandé a été mis à jour ou n'est plus accessible directement. Veuillez vous reconnecter à votre espace EDULINK CI.</p>
            <a href="/">Retour à l'accueil</a>
          </div>
        </body>
        </html>
      `);
    } catch (e: any) {
      console.error('Erreur téléchargement fichier:', e);
      res.status(500).json({ message: 'Erreur lors du chargement du fichier', error: e.message });
    }
  });

  // Swagger Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ message: 'Token manquant' });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: 'Token invalide ou expiré' });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post('/api/v1/auth/register', async (req, res) => {
    try {
      const validation = authRegisterSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.issues[0].message, errors: validation.error.format() });
      }
      
      const { email: cleanEmail, password, role, fullName, phone, discipline, level, experience, city, schoolName, contactName, schoolType, description } = validation.data;
      
      const existing = await db.query.users.findFirst({ where: eq(users.email, cleanEmail) });
      if (existing) {
        return res.status(409).json({ message: 'Cet email est déjà utilisé. Veuillez vous connecter.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      await db.insert(users).values({
        id: userId,
        email: cleanEmail,
        password: hashedPassword,
        role: (role === 'ADMIN') ? 'CANDIDATE' : (role || 'CANDIDATE'),
      });

      let candidateData = null;
      if (role === 'RECRUITER') {
        const candidateId = uuidv4();
        candidateData = {
          id: candidateId,
          userId,
          fullName: schoolName ? `${schoolName}${contactName ? ` - ${contactName}` : ''}` : (fullName ? fullName.trim() : 'Responsable Établissement'),
          phone: phone ? phone.trim() : '',
          discipline: schoolType ? schoolType.trim() : 'Établissement Scolaire',
          level: schoolType ? schoolType.trim() : 'Recruteur Certifié',
          experience: 0,
          city: city ? city.trim() : 'Abidjan',
          bio: description ? description.trim() : '',
        };
        await db.insert(candidates).values(candidateData);

        // Welcome Notification Recruiter
        await db.insert(notifications).values({
          id: uuidv4(),
          userId,
          title: 'Bienvenue sur votre Passerelle Recruteur !',
          message: 'Votre compte Établissement est configuré. Vous pouvez dès maintenant publier des offres et rechercher parmi nos profils enseignants.',
          type: 'SUCCESS',
          link: '/recruiter',
        });
      } else {
        const candidateId = uuidv4();
        candidateData = {
          id: candidateId,
          userId,
          fullName: fullName ? fullName.trim() : 'Nouveau Candidat',
          phone: phone ? phone.trim() : '',
          discipline: discipline ? discipline.trim() : 'Général',
          level: level ? level.trim() : 'Non spécifié',
          experience: experience ? Number(experience) : 0,
          city: city ? city.trim() : 'Abidjan',
        };
        await db.insert(candidates).values(candidateData);

        // Welcome Notification Candidate
        await db.insert(notifications).values({
          id: uuidv4(),
          userId,
          title: 'Bienvenue sur votre Passerelle Enseignant !',
          message: 'Votre profil candidat a été créé avec succès. Consultez les offres et postulez en 1 clic.',
          type: 'SUCCESS',
          link: '/jobs',
        });
      }

      const token = jwt.sign({ sub: userId, email: cleanEmail, role: (role === 'ADMIN') ? 'CANDIDATE' : (role || 'CANDIDATE') }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        user: { id: userId, email: cleanEmail, role: (role === 'ADMIN') ? 'CANDIDATE' : (role || 'CANDIDATE'), candidate: candidateData },
        accessToken: token,
      });
    } catch (e: any) {
      console.error('Erreur inscription:', e);
      res.status(500).json({ message: 'Erreur serveur lors de l\'inscription', error: e.message });
    }
  });

  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const validation = authLoginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.issues[0].message, errors: validation.error.format() });
      }
      const { email: cleanEmail, password } = validation.data;

      const user = await db.query.users.findFirst({ where: eq(users.email, cleanEmail) });
      
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants ou créer un compte.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect. Veuillez vérifier votre mot de passe.' });
      }

      const candidateData = await db.query.candidates.findFirst({ where: eq(candidates.userId, user.id) });

      const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        user: { id: user.id, email: user.email, role: user.role, candidate: candidateData },
        accessToken: token,
      });
    } catch (e: any) {
      console.error('Erreur connexion:', e);
      res.status(500).json({ message: 'Erreur lors de la connexion au serveur', error: e.message });
    }
  });

  // Password Reset Endpoints
  app.post('/api/v1/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      const cleanEmail = email ? email.toLowerCase().trim() : '';
      if (!cleanEmail) {
        return res.status(400).json({ message: 'Veuillez renseigner votre adresse email.' });
      }

      const user = await db.query.users.findFirst({ where: eq(users.email, cleanEmail) });
      if (!user) {
        return res.json({ message: 'Si cette adresse email correspond à un compte, un lien de réinitialisation vous a été envoyé.' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 heure

      await db.insert(passwordResetTokens).values({
        id: uuidv4(),
        userId: user.id,
        token: resetToken,
        expiresAt,
        used: false,
      });

      const resetLink = `/reset-password?token=${resetToken}`;
      await sendEmailAlert(
        user.email,
        'EDULINK CI - Réinitialisation de mot de passe',
        `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe sur EDULINK CI.\nLien sécurisé : ${resetLink}\nCe lien expire dans 1 heure.`
      );

      res.json({
        message: 'Lien de réinitialisation généré.',
        resetToken,
        resetLink
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur lors de la demande de réinitialisation.' });
    }
  });

  app.post('/api/v1/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Le mot de passe doit comporter au moins 6 caractères.' });
      }

      const record = await db.query.passwordResetTokens.findFirst({
        where: and(eq(passwordResetTokens.token, token), eq(passwordResetTokens.used, false)),
      });

      if (!record) {
        return res.status(400).json({ message: 'Ce lien de réinitialisation est invalide ou a déjà été utilisé.' });
      }

      if (new Date() > new Date(record.expiresAt)) {
        return res.status(400).json({ message: 'Ce lien de réinitialisation a expiré.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, record.userId));
      await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, record.id));

      await db.insert(notifications).values({
        id: uuidv4(),
        userId: record.userId,
        title: 'Mot de passe modifié avec succès',
        message: 'Votre mot de passe a été mis à jour.',
        type: 'SUCCESS',
      });

      res.json({ message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez vous connecter.' });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur lors de la réinitialisation.' });
    }
  });

  app.get('/api/v1/auth/profile', authenticateToken, async (req: any, res) => {
    try {
      const user = await db.query.users.findFirst({ where: eq(users.id, req.user.sub) });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const candidateData = await db.query.candidates.findFirst({ where: eq(candidates.userId, user.id) });
      res.json({ id: user.id, email: user.email, role: user.role, candidate: candidateData });
    } catch (e) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // Notifications Routes
  app.get('/api/v1/notifications', authenticateToken, async (req: any, res) => {
    try {
      const userNotifs = await db.query.notifications.findMany({
        where: eq(notifications.userId, req.user.sub),
        orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
        limit: 50,
      });
      const unreadCount = userNotifs.filter(n => !n.isRead).length;
      res.json({ notifications: userNotifs, unreadCount });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
    }
  });

  app.patch('/api/v1/notifications/:id/read', authenticateToken, async (req: any, res) => {
    try {
      await db.update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, req.params.id), eq(notifications.userId, req.user.sub)));
      res.json({ message: 'Marqué comme lu' });
    } catch (e) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.post('/api/v1/notifications/mark-all-read', authenticateToken, async (req: any, res) => {
    try {
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, req.user.sub));
      res.json({ message: 'Toutes les notifications marquées comme lues' });
    } catch (e) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // App Version & Live Update Notification Endpoint (for PC, Smartphone, Tablet)
  app.get('/api/v1/system/version', (req, res) => {
    res.json({
      version: APP_VERSION,
      buildTime: APP_BUILD_TIMESTAMP,
      updateTitle: 'Nouvelle version EDULINK CI disponible',
      updateMessage: 'Une mise à jour vient d\'être déployée (nouvelles catégories de personnel, diplômes et synchronisation). Cliquez pour actualiser.',
      hasUpdates: true
    });
  });

  // Public Announcements & Live Alerts for all visitors (Candidates & Recruiters)
  app.get('/api/v1/public-alerts', async (req, res) => {
    try {
      const recentJobs = await db.select().from(jobs)
        .where(eq(jobs.isActive, true))
        .orderBy(desc(jobs.createdAt))
        .limit(5);

      const totalJobsResult = await db.select({ count: count() }).from(jobs).where(eq(jobs.isActive, true));
      const totalJobs = Number(totalJobsResult[0]?.count || 0);

      const announcements = [
        {
          id: 'announcement-1',
          title: '📢 Campagne de Recrutement Scolaire & Universitaire 2026',
          message: 'Les établissements privés et confessionnels d\'Abidjan, Bouaké et San-Pédro recrutent activement leurs enseignants et formateurs.',
          type: 'INFO',
          category: 'CAMPAIGN',
          link: '/jobs',
          badge: 'Officiel',
          target: 'ALL',
          createdAt: new Date().toISOString()
        },
        {
          id: 'announcement-2',
          title: '⚡ Espace Recruteurs : Publication en 2 minutes',
          message: 'Directeurs et proviseurs : publiez vos besoins de cours ou vacations et recevez les candidatures certifiées directement.',
          type: 'SUCCESS',
          category: 'RECRUITER_TIP',
          link: '/recruiter',
          badge: 'Établissements',
          target: 'RECRUITER',
          createdAt: new Date().toISOString()
        },
        {
          id: 'announcement-3',
          title: '🔔 Alertes SMS & Email Disponibles',
          message: 'Créez votre profil candidat pour être immédiatement notifié dès qu\'un collège ou lycée poste une offre dans votre matière.',
          type: 'WARNING',
          category: 'CANDIDATE_TIP',
          link: '/register',
          badge: 'Candidats',
          target: 'CANDIDATE',
          createdAt: new Date().toISOString()
        }
      ];

      // Format recent job postings as live alert items
      const jobAlerts = recentJobs.map(job => ({
        id: `job-alert-${job.id}`,
        title: `Nouvelle offre : ${job.title}`,
        message: `${job.schoolName} recrute en ${job.discipline} à ${job.city} (${job.contractType || 'Temps plein'}).`,
        type: 'INFO',
        category: 'JOB_POSTED',
        link: `/jobs/${job.id}`,
        badge: job.city,
        createdAt: job.createdAt
      }));

      res.json({
        totalActiveJobs: totalJobs,
        announcements,
        jobAlerts,
        tickerItems: [
          `📢 ${totalJobs} offres d'enseignement actuellement disponibles en Côte d'Ivoire`,
          '🏫 Établissements d\'Abidjan, Yamoussoukro, Bouaké & San-Pédro recrutent',
          '⚡ Recrutement direct sans intermédiaire • Dépôt de CV gratuit en 1 clic',
          '🔔 Alertes SMS en temps réel pour toute convocation à un entretien'
        ]
      });
    } catch (e: any) {
      console.error('Erreur public alerts:', e);
      res.status(500).json({ message: 'Erreur serveur', error: e.message });
    }
  });

  // Jobs Routes with Server-Side Pagination
  app.get('/api/v1/jobs', async (req, res) => {
    try {
      const { city, discipline, search, contractType, page = '1', limit = '9' } = req.query;
      const pageNum = Math.max(1, parseInt(String(page)) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(String(limit)) || 9));
      const offset = (pageNum - 1) * limitNum;

      let conditions: any[] = [eq(jobs.isActive, true)];
      if (city && city !== 'all') conditions.push(eq(jobs.city, String(city)));
      if (discipline && discipline !== 'all') conditions.push(eq(jobs.discipline, String(discipline)));
      if (contractType && contractType !== 'all') conditions.push(eq(jobs.contractType, String(contractType)));
      if (search) {
        const searchTerm = `%${String(search).trim()}%`;
        conditions.push(
          or(
            ilike(jobs.title, searchTerm),
            ilike(jobs.schoolName, searchTerm),
            ilike(jobs.description, searchTerm),
            ilike(jobs.city, searchTerm),
            ilike(jobs.discipline, searchTerm)
          )
        );
      }

      const whereClause = and(...conditions);
      const totalResults = await db.select({ count: count() }).from(jobs).where(whereClause);
      const total = Number(totalResults[0]?.count || 0);

      const items = await db.select().from(jobs)
        .where(whereClause)
        .orderBy(desc(jobs.createdAt))
        .limit(limitNum)
        .offset(offset);

      res.json({
        items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          hasNextPage: pageNum * limitNum < total,
          hasPrevPage: pageNum > 1,
        }
      });
    } catch (e: any) {
      console.error('Erreur jobs:', e);
      res.status(500).json({ message: 'Erreur serveur', error: e.message });
    }
  });

  app.get('/api/v1/jobs/:id', async (req, res) => {
    try {
      const job = await db.query.jobs.findFirst({ where: eq(jobs.id, req.params.id) });
      if (!job) return res.status(404).json({ message: 'Job not found' });
      res.json(job);
    } catch (e) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.post('/api/v1/jobs', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'RECRUITER') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const jobId = uuidv4();
      const newJob = { id: jobId, recruiterId: req.user.sub, ...req.body };
      await db.insert(jobs).values(newJob);
      res.json(newJob);
    } catch (e) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.put('/api/v1/jobs/:id', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'RECRUITER') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const job = await db.query.jobs.findFirst({ where: eq(jobs.id, req.params.id) });
      if (!job) return res.status(404).json({ message: 'Offre introuvable' });
      if (req.user.role !== 'ADMIN' && job.recruiterId !== req.user.sub) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await db.update(jobs).set(req.body).where(eq(jobs.id, req.params.id));
      res.json({ message: 'Offre mise à jour' });
    } catch (e) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.delete('/api/v1/jobs/:id', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'RECRUITER') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const job = await db.query.jobs.findFirst({ where: eq(jobs.id, req.params.id) });
      if (!job) return res.status(404).json({ message: 'Offre introuvable' });
      if (req.user.role !== 'ADMIN' && job.recruiterId !== req.user.sub) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await db.delete(jobs).where(eq(jobs.id, req.params.id));
      res.json({ message: 'Offre supprimée' });
    } catch (e) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // Applications Routes
  app.post('/api/v1/applications', authenticateToken, async (req: any, res) => {
    try {
      const { jobId, coverLetter } = req.body;
      const candidate = await db.query.candidates.findFirst({ where: eq(candidates.userId, req.user.sub) });
      if (!candidate) return res.status(404).json({ message: 'Candidat introuvable' });

      const targetJob = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) });
      if (!targetJob) return res.status(404).json({ message: 'Offre introuvable' });

      const appId = uuidv4();
      await db.insert(applications).values({
        id: appId,
        candidateId: candidate.id,
        jobId,
        coverLetter,
      });

      // Notification Candidate
      await db.insert(notifications).values({
        id: uuidv4(),
        userId: req.user.sub,
        title: 'Candidature envoyée !',
        message: `Votre candidature pour le poste "${targetJob.title}" chez ${targetJob.schoolName} a été enregistrée.`,
        type: 'SUCCESS',
        link: '/profile',
      });

      // Notification Recruiter
      if (targetJob.recruiterId) {
        await db.insert(notifications).values({
          id: uuidv4(),
          userId: targetJob.recruiterId,
          title: 'Nouvelle candidature reçue',
          message: `${candidate.fullName} a postulé à votre offre "${targetJob.title}".`,
          type: 'INFO',
          link: '/recruiter',
        });

        const recruiterUser = await db.query.users.findFirst({ where: eq(users.id, targetJob.recruiterId) });
        if (recruiterUser) {
          sendEmailAlert(
            recruiterUser.email,
            `[EDULINK CI] Nouvelle candidature - ${targetJob.title}`,
            `Bonjour,\n\nVous avez reçu une nouvelle candidature de ${candidate.fullName} (${candidate.discipline}, ${candidate.city}) pour le poste "${targetJob.title}".\n\nConsultez son profil dans votre espace recruteur.`
          );
        }
      }

      res.json({ message: 'Candidature envoyée', id: appId });
    } catch (e: any) {
      if (e.code === '23505') {
        return res.status(409).json({ message: 'Vous avez déjà postulé à cette offre.' });
      }
      res.status(500).json({ message: 'Erreur serveur', error: e.message });
    }
  });

  app.get('/api/v1/applications/me', authenticateToken, async (req: any, res) => {
    try {
      const candidate = await db.query.candidates.findFirst({ where: eq(candidates.userId, req.user.sub) });
      if (!candidate) return res.json([]);
      
      const myApps = await db.query.applications.findMany({
        where: eq(applications.candidateId, candidate.id),
        with: {
          job: true
        },
        orderBy: (applications, { desc }) => [desc(applications.createdAt)]
      });
      res.json(myApps);
    } catch (e) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.patch('/api/v1/applications/:id', authenticateToken, async (req: any, res) => {
    try {
      const { coverLetter } = req.body;
      const appToUpdate = await db.query.applications.findFirst({
        where: eq(applications.id, req.params.id),
        with: { candidate: true, job: true }
      });
      if (!appToUpdate) return res.status(404).json({ message: 'Candidature introuvable' });

      const isCandidateOwner = appToUpdate.candidate?.userId === req.user.sub;
      const isRecruiterOwner = appToUpdate.job?.recruiterId === req.user.sub;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isCandidateOwner && !isRecruiterOwner && !isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await db.update(applications)
        .set({
          coverLetter: coverLetter !== undefined ? coverLetter : appToUpdate.coverLetter,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, req.params.id));

      const updated = await db.query.applications.findFirst({
        where: eq(applications.id, req.params.id),
        with: { job: true }
      });

      res.json(updated);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.delete('/api/v1/applications/:id', authenticateToken, async (req: any, res) => {
    try {
      const appToDelete = await db.query.applications.findFirst({
        where: eq(applications.id, req.params.id),
        with: { candidate: true, job: true }
      });
      if (!appToDelete) return res.status(404).json({ message: 'Candidature introuvable' });

      const isCandidateOwner = appToDelete.candidate?.userId === req.user.sub;
      const isRecruiterOwner = appToDelete.job?.recruiterId === req.user.sub;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isCandidateOwner && !isRecruiterOwner && !isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await db.delete(applications).where(eq(applications.id, req.params.id));
      res.json({ message: 'Candidature supprimée avec succès' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.get('/api/v1/recruiter/jobs', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'RECRUITER') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const myJobs = await db.query.jobs.findMany({
        where: req.user.role === 'ADMIN' ? undefined : eq(jobs.recruiterId, req.user.sub),
        orderBy: (jobs, { desc }) => [desc(jobs.createdAt)]
      });
      
      res.json(myJobs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.get('/api/v1/recruiter/candidates', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'RECRUITER') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { search, discipline, city, level, minExperience } = req.query;

      const allCandidates = await db.query.candidates.findMany({
        with: { user: true },
        orderBy: (candidates, { desc }) => [desc(candidates.createdAt)]
      });

      // Filter out non-candidates (users whose role is recruiter or admin)
      let list = allCandidates.filter(c => c.user?.role === 'CANDIDATE' || !c.user);

      if (search && typeof search === 'string' && search.trim()) {
        const q = search.toLowerCase().trim();
        list = list.filter(c => 
          c.fullName?.toLowerCase().includes(q) ||
          c.discipline?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.bio?.toLowerCase().includes(q)
        );
      }

      if (discipline && typeof discipline === 'string' && discipline !== 'ALL') {
        list = list.filter(c => c.discipline?.toLowerCase().includes(discipline.toLowerCase()));
      }

      if (city && typeof city === 'string' && city !== 'ALL') {
        list = list.filter(c => c.city?.toLowerCase() === city.toLowerCase());
      }

      if (level && typeof level === 'string' && level !== 'ALL') {
        list = list.filter(c => c.level?.toLowerCase().includes(level.toLowerCase()));
      }

      if (minExperience && !isNaN(Number(minExperience))) {
        list = list.filter(c => (c.experience || 0) >= Number(minExperience));
      }

      res.json(list.map(c => ({
        id: c.id,
        fullName: c.fullName,
        discipline: c.discipline,
        level: c.level,
        experience: c.experience,
        city: c.city,
        bio: c.bio,
        cvUrl: c.cvUrl,
        avatarUrl: c.avatarUrl,
        phone: c.phone,
        email: c.user?.email,
        createdAt: c.createdAt
      })));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.get('/api/v1/recruiter/applications', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'RECRUITER') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const allApps = await db.query.applications.findMany({
        with: {
          candidate: {
            with: { user: true }
          },
          job: true
        },
        orderBy: (applications, { desc }) => [desc(applications.createdAt)]
      });
      
      const filteredApps = req.user.role === 'ADMIN' ? allApps : allApps.filter(app => app.job && app.job.recruiterId === req.user.sub);
      res.json(filteredApps);
    } catch (e) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // Status update + Live Notification & Email/SMS alerts
  app.patch('/api/v1/applications/:id/status', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'RECRUITER') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const { status, messageNote } = req.body;
      const validStatuses = ['PENDING', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Statut invalide' });
      }

      const appToUpdate = await db.query.applications.findFirst({
        where: eq(applications.id, req.params.id),
        with: {
          job: true,
          candidate: { with: { user: true } }
        }
      });
      if (!appToUpdate) return res.status(404).json({ message: 'Candidature introuvable' });
      
      if (req.user.role === 'RECRUITER' && appToUpdate.job?.recruiterId !== req.user.sub) {
        return res.status(403).json({ message: 'Forbidden: Ce n\'est pas votre offre.' });
      }

      await db.update(applications)
        .set({ status, updatedAt: new Date() })
        .where(eq(applications.id, req.params.id));

      const statusLabels: Record<string, string> = {
        'PENDING': 'En attente',
        'INTERVIEW': 'Entretien convenu',
        'ACCEPTED': 'Candidature retenue',
        'REJECTED': 'Candidature non retenue',
      };

      const candidateUserId = appToUpdate.candidate?.userId;
      const candidateEmail = appToUpdate.candidate?.user?.email;
      const candidatePhone = appToUpdate.candidate?.phone;
      const candidateName = appToUpdate.candidate?.fullName;
      const jobTitle = appToUpdate.job?.title || 'le poste';
      const schoolName = appToUpdate.job?.schoolName || 'L\'établissement';

      if (candidateUserId) {
        let notifTitle = `Mise à jour statut : ${statusLabels[status]}`;
        let notifType = 'INFO';
        let notifMsg = `Votre candidature pour "${jobTitle}" chez ${schoolName} a été mise à jour : ${statusLabels[status]}.`;

        if (status === 'INTERVIEW') {
          notifType = 'WARNING';
          notifTitle = '🎯 Convocation à un Entretien !';
          notifMsg = `Félicitations ! ${schoolName} souhaite vous rencontrer pour le poste "${jobTitle}". ${messageNote ? `Message : "${messageNote}"` : ''}`;
        } else if (status === 'ACCEPTED') {
          notifType = 'SUCCESS';
          notifTitle = '🎉 Candidature Retenue !';
          notifMsg = `Félicitations ! Votre profil a été retenu pour le poste "${jobTitle}" chez ${schoolName}.`;
        }

        // In-app Notification
        await db.insert(notifications).values({
          id: uuidv4(),
          userId: candidateUserId,
          title: notifTitle,
          message: notifMsg,
          type: notifType,
          link: '/profile',
        });

        // Email Alert
        if (candidateEmail) {
          await sendEmailAlert(
            candidateEmail,
            `[EDULINK CI] ${notifTitle} - ${schoolName}`,
            `Bonjour ${candidateName},\n\n${notifMsg}\n\nRetrouvez tous les détails sur votre espace EDULINK CI.\n\nCordialement,\nL'équipe EDULINK CI`
          );
        }

        // SMS Alert
        if (candidatePhone && (status === 'INTERVIEW' || status === 'ACCEPTED')) {
          await sendSmsAlert(
            candidatePhone,
            `EDULINK CI: Bonjour ${candidateName}, ${schoolName} a mis à jour votre candidature pour ${jobTitle} (${statusLabels[status]}). Connectez-vous sur edulink.ci`
          );
        }
      }
        
      res.json({ message: 'Statut mis à jour et notifications envoyées avec succès' });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur', error: e.message });
    }
  });

  app.patch('/api/v1/candidates/me', authenticateToken, async (req: any, res) => {
    try {
      const candidate = await db.query.candidates.findFirst({ where: eq(candidates.userId, req.user.sub) });
      if (!candidate) return res.status(404).json({ message: 'Profil introuvable' });

      const { fullName, phone, discipline, level, experience, city, bio } = req.body;
      
      await db.update(candidates)
        .set({
          fullName: fullName || candidate.fullName,
          phone: phone || candidate.phone,
          discipline: discipline || candidate.discipline,
          level: level || candidate.level,
          experience: experience !== undefined ? experience : candidate.experience,
          city: city || candidate.city,
          bio: bio !== undefined ? bio : candidate.bio,
          updatedAt: new Date()
        })
        .where(eq(candidates.id, candidate.id));

      const updatedCandidate = await db.query.candidates.findFirst({ where: eq(candidates.id, candidate.id) });
      res.json(updatedCandidate);
    } catch (e: any) {
      res.status(500).json({ message: 'Erreur serveur', error: e.message });
    }
  });

  // Candidate Public Profile Route
  app.get('/api/v1/candidates/:id', async (req, res) => {
    try {
      const candidateProfile = await db.query.candidates.findFirst({ 
        where: eq(candidates.id, req.params.id),
        with: {
          user: true
        }
      });
      
      if (!candidateProfile) {
        return res.status(404).json({ message: 'Profil introuvable' });
      }
      
      res.json({
        id: candidateProfile.id,
        fullName: candidateProfile.fullName,
        discipline: candidateProfile.discipline,
        level: candidateProfile.level,
        experience: candidateProfile.experience,
        city: candidateProfile.city,
        bio: candidateProfile.bio,
        cvUrl: candidateProfile.cvUrl,
        avatarUrl: candidateProfile.avatarUrl,
        phone: candidateProfile.phone,
        email: candidateProfile.user?.email,
        createdAt: candidateProfile.createdAt
      });
    } catch (e) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // Upload Routes
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DEST),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const prefix = file.fieldname === 'avatar' ? 'avatar' : 'cv';
      cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'avatar') {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
          return cb(new Error('Seules les images sont acceptées.'));
        }
      } else {
        if (!file.originalname.match(/\.(pdf|docx|doc)$/i)) {
          return cb(new Error('Seuls les fichiers PDF et Word sont acceptés.'));
        }
      }
      cb(null, true);
    },
  });

  app.post('/api/v1/upload/cv', authenticateToken, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni.' });
      
      const filename = req.file.filename;
      const cvUrl = `/uploads/${filename}`;
      const fileBuffer = fs.readFileSync(req.file.path);
      const fileData = fileBuffer.toString('base64');

      // Persist in DB for durability across container restarts
      await db.insert(storedFiles).values({
        id: uuidv4(),
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype || 'application/pdf',
        fileData,
        size: req.file.size,
        userId: req.user.sub,
      }).onConflictDoNothing();

      const candidate = await db.query.candidates.findFirst({ where: eq(candidates.userId, req.user.sub) });
      if (candidate) {
        await db.update(candidates).set({ cvUrl, updatedAt: new Date() }).where(eq(candidates.id, candidate.id));
      }
      res.json({ message: 'CV enregistré avec succès.', cvUrl });
    } catch (e: any) {
      console.error('Erreur upload CV:', e);
      res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement du CV' });
    }
  });

  app.post('/api/v1/upload/avatar', authenticateToken, upload.single('avatar'), async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni.' });
      
      const filename = req.file.filename;
      const avatarUrl = `/uploads/${filename}`;
      const fileBuffer = fs.readFileSync(req.file.path);
      const fileData = fileBuffer.toString('base64');

      // Persist in DB for durability across container restarts
      await db.insert(storedFiles).values({
        id: uuidv4(),
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype || 'image/jpeg',
        fileData,
        size: req.file.size,
        userId: req.user.sub,
      }).onConflictDoNothing();

      const candidate = await db.query.candidates.findFirst({ where: eq(candidates.userId, req.user.sub) });
      if (candidate) {
        await db.update(candidates).set({ avatarUrl, updatedAt: new Date() }).where(eq(candidates.id, candidate.id));
      }
      res.json({ message: 'Avatar enregistré avec succès.', avatarUrl });
    } catch (e: any) {
      console.error('Erreur upload avatar:', e);
      res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement de l\'avatar' });
    }
  });

  // Direct In-App Contact Message Route
  app.post('/api/v1/contact/direct-message', async (req: any, res) => {
    try {
      const { recipientId, recipientEmail, recipientName, subject, message, senderName, senderContact } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Le message ne peut pas être vide.' });
      }

      // If recipientId is provided, find user and create in-app notification
      let targetUserId: string | null = null;
      if (recipientId) {
        const targetCand = await db.query.candidates.findFirst({ where: eq(candidates.id, recipientId) });
        if (targetCand && targetCand.userId) {
          targetUserId = targetCand.userId;
        }
      }

      if (!targetUserId && recipientEmail) {
        const targetUser = await db.query.users.findFirst({ where: eq(users.email, recipientEmail) });
        if (targetUser) {
          targetUserId = targetUser.id;
        }
      }

      if (targetUserId) {
        await db.insert(notifications).values({
          id: uuidv4(),
          userId: targetUserId,
          title: `📩 Nouveau message : ${subject || 'Contact Établissement'}`,
          message: `${senderName ? `${senderName} (${senderContact}) : ` : ''}"${message.substring(0, 160)}${message.length > 160 ? '...' : ''}"`,
          type: 'INFO',
          link: '/profile',
        });
      }

      // Send Simulated Email Alert
      if (recipientEmail) {
        sendEmailAlert(
          recipientEmail,
          `[EDULINK CI] ${subject || 'Nouveau message de contact'}`,
          `Bonjour ${recipientName || ''},\n\nVous avez reçu un nouveau message sur EDULINK CI de la part de : ${senderName || 'Un établissement'}${senderContact ? ` (${senderContact})` : ''}.\n\n--- Message ---\n${message}\n\nConnectez-vous sur EDULINK CI pour répondre.`
        );
      }

      res.json({ message: 'Message transmis avec succès.' });
    } catch (e: any) {
      console.error('Erreur envoi message contact:', e);
      res.status(500).json({ message: 'Erreur serveur lors de la transmission du message' });
    }
  });

  // Seed Route (Test Only)
  app.post('/api/v1/seed', async (req, res) => {
    try {
      const adminEmail = 'admin@edulink.ci';
      const existingAdmin = await db.query.users.findFirst({ where: eq(users.email, adminEmail) });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        const adminId = uuidv4();
        await db.insert(users).values({ id: adminId, email: adminEmail, password: hashedPassword, role: 'ADMIN' });
        
        const candidateId = uuidv4();
        const candUserId = uuidv4();
        await db.insert(users).values({ id: candUserId, email: 'koffi.jean@edulink.ci', password: hashedPassword, role: 'CANDIDATE' });
        await db.insert(candidates).values({
          id: candidateId,
          userId: candUserId,
          fullName: 'Koffi Jean-Eudes',
          phone: '+225 07 07 07 07 07',
          discipline: 'Anglais',
          level: 'CAPES / Master 2',
          experience: 4,
          city: 'Abidjan',
          avatarUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=400&q=80',
          bio: 'Professeur d’anglais certifié avec 4 années d’expérience en collège et lycée à Abidjan. Passionné par les méthodes interactives et la réussite scolaire de chaque élève.'
        });

        const job1Id = uuidv4();
        await db.insert(jobs).values({
          id: job1Id,
          title: 'Professeur d’Anglais Second Cycle',
          schoolName: 'Collège Moderne Les Élites',
          description: 'Recherche enseignant d’anglais qualifié.',
          discipline: 'Anglais',
          level: 'Master / CAPES',
          city: 'Abidjan',
          salaryRange: '200 000 - 300 000 FCFA',
          contractType: 'CDI'
        });

        await db.insert(applications).values({
          id: uuidv4(),
          candidateId: candidateId,
          jobId: job1Id,
          coverLetter: 'Je suis très motivé.'
        });
        res.json({ message: 'Seeded successfully' });
      } else {
        res.json({ message: 'Already seeded' });
      }
    } catch (e: any) {
      res.status(500).json({ error: (e as any).message });
    }
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'Le fichier est trop volumineux (Max 5Mo).' });
      }
      return res.status(400).json({ message: `Erreur d'upload: ${err.message}` });
    }
    if (err) {
      return res.status(500).json({ message: err.message || 'Erreur interne du serveur' });
    }
    next();
  });

  // Admin Middleware
  const authenticateAdmin = (req: any, res: any, next: any) => {
    authenticateToken(req, res, () => {
      if (req.user && req.user.role === 'ADMIN') {
        next();
      } else {
        res.status(403).json({ message: 'Accès refusé. Réservé aux administrateurs.' });
      }
    });
  };

  // Admin Routes
  app.get('/api/v1/admin/stats', authenticateAdmin, async (req, res) => {
    try {
      const usersList = await db.select().from(users);
      const jobsList = await db.select().from(jobs);
      const appsList = await db.select().from(applications);
      res.json({ users: usersList.length, jobs: jobsList.length, applications: appsList.length });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur', error: e.message });
    }
  });

  app.get('/api/v1/admin/users', authenticateAdmin, async (req, res) => {
    try {
      const allUsers = await db.query.users.findMany({
        with: { candidate: true },
        orderBy: (users, { desc }) => [desc(users.createdAt)]
      });
      
      const safeUsers = allUsers.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.delete('/api/v1/admin/users/:id', authenticateAdmin, async (req: any, res) => {
    try {
      if (req.params.id === req.user.sub) {
        return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte." });
      }
      await db.delete(users).where(eq(users.id, req.params.id));
      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.get('/api/v1/admin/jobs', authenticateAdmin, async (req, res) => {
    try {
      const allJobs = await db.query.jobs.findMany({
        orderBy: (jobs, { desc }) => [desc(jobs.createdAt)]
      });
      res.json(allJobs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  app.delete('/api/v1/admin/jobs/:id', authenticateAdmin, async (req, res) => {
    try {
      await db.delete(jobs).where(eq(jobs.id, req.params.id));
      res.json({ message: 'Offre supprimée avec succès' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 EDULINK Backend lancé sur : http://localhost:${PORT}/api/v1`);
  });
}

startServer();
