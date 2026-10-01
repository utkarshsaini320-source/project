import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3000);
const dbName = process.env.DB_NAME || 'apnaghar';
const jwtSecret = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.MONGODB_URI || !jwtSecret || jwtSecret.length < 32) {
  throw new Error('Set MONGODB_URI and a JWT_SECRET of at least 32 characters in your .env file.');
}

const mongo = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
await mongo.connect();
const db = mongo.db(dbName);
const users = db.collection('users');
const properties = db.collection('properties');
const enquiries = db.collection('enquiries');
const images = new GridFSBucket(db, { bucketName: 'propertyImages' });

await Promise.all([
  users.createIndex({ email: 1 }, { unique: true }),
  properties.createIndex({ createdAt: -1 }),
  properties.createIndex({ ownerId: 1, createdAt: -1 }),
  enquiries.createIndex({ propertyId: 1, createdAt: -1 }),
  enquiries.createIndex({ ownerId: 1, createdAt: -1 })
]);

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '32kb' }));

const authCookie = 'agh_session';
function setSession(res, user) {
  const token = jwt.sign({ sub: user._id.toString() }, jwtSecret, { expiresIn: '7d' });
  res.cookie(authCookie, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[authCookie] || req.get('cookie')?.split(';')
      .map(part => part.trim()).find(part => part.startsWith(`${authCookie}=`))?.slice(authCookie.length + 1);
    if (!token) return res.status(401).json({ error: 'Sign in to continue.' });
    const payload = jwt.verify(decodeURIComponent(token), jwtSecret);
    const user = await users.findOne({ _id: new ObjectId(payload.sub) }, { projection: { passwordHash: 0 } });
    if (!user) return res.status(401).json({ error: 'Your session has expired. Sign in again.' });
    req.user = user;
    next();
  } catch {
    res.clearCookie(authCookie, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });
    return res.status(401).json({ error: 'Your session has expired. Sign in again.' });
  }
}

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });
const listingLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });
const enquiryLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 3, fileSize: 1024 * 1024 },
  fileFilter(_req, file, done) {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype)) {
      return done(new Error('Use JPG, PNG, WebP, or AVIF photos.'));
    }
    done(null, true);
  }
});

function cleanEmail(value) { return String(value || '').trim().toLowerCase(); }
function publicUser(user) { return { id: user._id.toString(), name: user.name, email: user.email }; }
function publicProperty(item) {
  return { ...item, id: item._id.toString(), _id: undefined, ownerId: undefined };
}
function validText(value, min, max) {
  return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
}

app.post('/api/auth/signup', authLimiter, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!validText(name, 2, 80) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 10 || password.length > 128) {
      return res.status(400).json({ error: 'Enter your name, a valid email, and a password of at least 10 characters.' });
    }
    const user = { name, email, passwordHash: await bcrypt.hash(password, 12), createdAt: new Date() };
    await users.insertOne(user);
    setSession(res, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'An account with this email already exists.' });
    next(error);
  }
});

app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || '');
    const user = await users.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    setSession(res, user);
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie(authCookie, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });
  res.status(204).end();
});

app.get('/api/auth/me', async (req, res) => {
  const token = req.get('cookie')?.split(';').map(part => part.trim())
    .find(part => part.startsWith(`${authCookie}=`))?.slice(authCookie.length + 1);
  if (!token) return res.json({ user: null });
  try {
    const payload = jwt.verify(decodeURIComponent(token), jwtSecret);
    const user = await users.findOne({ _id: new ObjectId(payload.sub) }, { projection: { passwordHash: 0 } });
    res.json({ user: user ? publicUser(user) : null });
  } catch { res.json({ user: null }); }
});

app.get('/api/properties', async (_req, res, next) => {
  try {
    const items = await properties.find({ status: 'published' }).sort({ createdAt: -1 }).limit(500).toArray();
    res.json({ properties: items.map(publicProperty) });
  } catch (error) { next(error); }
});

app.post('/api/properties', listingLimiter, requireAuth, upload.array('photos', 3), async (req, res, next) => {
  const storedImageIds = [];
  try {
    const data = JSON.parse(req.body.property || '{}');
    if (!validText(data.name, 2, 120) || !validText(data.location, 2, 160) || !validText(data.description, 10, 2000) ||
        !['hostel', 'pg', 'room', 'house', 'hotel'].includes(data.type) || !Number.isFinite(Number(data.price)) || Number(data.price) <= 0 ||
        !/^[0-9]{10}$/.test(String(data.owner?.phone || ''))) {
      return res.status(400).json({ error: 'Check the property details and try again.' });
    }
    const imageUrls = [];
    for (const file of req.files || []) {
      const fileId = new ObjectId();
      const stream = images.openUploadStreamWithId(fileId, file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'), {
        contentType: file.mimetype,
        metadata: { ownerId: req.user._id.toString() }
      });
      await new Promise((resolve, reject) => {
        stream.once('error', reject);
        stream.once('finish', resolve);
        stream.end(file.buffer);
      });
      storedImageIds.push(fileId);
      imageUrls.push(`/api/images/${fileId}`);
    }
    const property = {
      name: data.name.trim(), type: data.type, location: data.location.trim(), price: Number(data.price),
      unit: data.unit === 'night' ? 'night' : 'month', rating: 0, reviews: 0, featured: false,
      available: data.available !== false, sharing: 'shared', status: 'published',
      amenities: Object.fromEntries(['furnished', 'ac', 'attachedBathroom', 'wifi', 'parking', 'food'].map(key => [key, Boolean(data.amenities?.[key])])),
      description: data.description.trim(), rules: ['Contact owner for full house rules'],
      images: imageUrls.length ? imageUrls : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop'],
      owner: { name: req.user.name, phone: String(data.owner.phone) }, ownerId: req.user._id,
      createdAt: new Date()
    };
    const result = await properties.insertOne(property);
    property._id = result.insertedId;
    res.status(201).json({ property: publicProperty(property) });
  } catch (error) {
    await Promise.all(storedImageIds.map(id => images.delete(id).catch(() => {})));
    next(error);
  }
});

app.post('/api/enquiries', enquiryLimiter, async (req, res, next) => {
  try {
    const { propertyId, fullName, mobile, email, checkin, checkout, guests, message = '' } = req.body;
    if (!validText(String(propertyId || ''), 1, 80) || !validText(fullName, 2, 100) || !/^[0-9]{10}$/.test(String(mobile || '')) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail(email)) || !checkin || !checkout || checkout <= checkin ||
        !Number.isInteger(Number(guests)) || Number(guests) < 1 || Number(guests) > 20) {
      return res.status(400).json({ error: 'Check the enquiry details and try again.' });
    }
    const propertyObjectId = ObjectId.isValid(propertyId) ? new ObjectId(propertyId) : null;
    const property = propertyObjectId
      ? await properties.findOne({ _id: propertyObjectId, status: 'published' })
      : null;
    if (propertyObjectId && !property) return res.status(404).json({ error: 'That property is no longer available.' });
    const propertyName = property?.name || String(req.body.propertyName || '').trim().slice(0, 120);
    if (!propertyName) return res.status(400).json({ error: 'Property name is required.' });
    await enquiries.insertOne({
      propertyId: property?._id || String(propertyId), ownerId: property?.ownerId || null, propertyName,
      fullName: fullName.trim(), mobile: String(mobile), email: cleanEmail(email),
      checkin, checkout, guests: Number(guests), message: String(message).trim().slice(0, 2000), createdAt: new Date()
    });
    res.status(201).json({ message: 'Your enquiry has been sent to the owner.' });
  } catch (error) { next(error); }
});

app.get('/api/my/enquiries', requireAuth, async (req, res, next) => {
  try {
    const items = await enquiries.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).limit(100).toArray();
    res.json({ enquiries: items.map(item => ({
      id: item._id.toString(), propertyName: item.propertyName, fullName: item.fullName,
      mobile: item.mobile, email: item.email, checkin: item.checkin, checkout: item.checkout,
      guests: item.guests, message: item.message, createdAt: item.createdAt
    })) });
  } catch (error) { next(error); }
});

app.get('/api/images/:id', async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(404).end();
  try {
    const file = await db.collection('propertyImages.files').findOne({ _id: new ObjectId(req.params.id) });
    if (!file) return res.status(404).end();
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    images.openDownloadStream(file._id).on('error', next).pipe(res);
  } catch (error) { next(error); }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use(express.static(__dirname, { dotfiles: 'deny', index: 'index.html', extensions: ['html'] }));
app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Each photo must be 1 MB or smaller.' : 'Choose up to 3 photos.';
    return res.status(400).json({ error: message });
  }
  if (error.message?.startsWith('Use JPG')) return res.status(400).json({ error: error.message });
  console.error(error);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

const server = app.listen(port, () => console.log(`Apna Ghar server listening on http://localhost:${port}`));
async function shutdown() {
  server.close();
  await mongo.close();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
