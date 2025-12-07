import { v4 as uuidv4 } from 'uuid';

export interface Feedback {
  id: string;
  name: string;
  room_number: string;
  feedback: string;
  edit_token: string;
  created_at: string;
  updated_at: string;
}

// Check if we're in production with Vercel Postgres
const isVercelPostgres = !!process.env.POSTGRES_URL;

// ============================================
// LOCAL FILE STORAGE (Development)
// ============================================

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'feedbacks.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

function readLocalFeedbacks(): Feedback[] {
  try {
    ensureDataDir();
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeLocalFeedbacks(feedbacks: Feedback[]): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(feedbacks, null, 2), 'utf-8');
}

// ============================================
// VERCEL POSTGRES (Production)
// ============================================

async function getPostgresClient() {
  const { sql } = await import('@vercel/postgres');
  return sql;
}

async function initPostgres(): Promise<void> {
  const sql = await getPostgresClient();
  await sql`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      room_number VARCHAR(100) NOT NULL,
      feedback TEXT NOT NULL,
      edit_token VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

let pgInitialized = false;

async function ensurePostgres(): Promise<void> {
  if (!pgInitialized) {
    await initPostgres();
    pgInitialized = true;
  }
}

// ============================================
// UNIFIED DATABASE FUNCTIONS
// ============================================

export async function getAllFeedbacks(): Promise<Feedback[]> {
  if (isVercelPostgres) {
    await ensurePostgres();
    const sql = await getPostgresClient();
    const { rows } = await sql<Feedback>`
      SELECT * FROM feedbacks ORDER BY created_at DESC
    `;
    return rows;
  } else {
    const feedbacks = readLocalFeedbacks();
    return feedbacks.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
}

export async function getFeedbackById(id: string): Promise<Feedback | null> {
  if (isVercelPostgres) {
    await ensurePostgres();
    const sql = await getPostgresClient();
    const { rows } = await sql<Feedback>`
      SELECT * FROM feedbacks WHERE id = ${id}
    `;
    return rows[0] || null;
  } else {
    const feedbacks = readLocalFeedbacks();
    return feedbacks.find(f => f.id === id) || null;
  }
}

export async function createFeedback(
  name: string,
  roomNumber: string,
  feedback: string
): Promise<Feedback> {
  const id = uuidv4();
  const editToken = uuidv4();
  const now = new Date().toISOString();

  if (isVercelPostgres) {
    await ensurePostgres();
    const sql = await getPostgresClient();
    const { rows } = await sql<Feedback>`
      INSERT INTO feedbacks (id, name, room_number, feedback, edit_token, created_at, updated_at)
      VALUES (${id}, ${name}, ${roomNumber}, ${feedback}, ${editToken}, ${now}, ${now})
      RETURNING *
    `;
    return rows[0];
  } else {
    const feedbacks = readLocalFeedbacks();
    const newFeedback: Feedback = {
      id,
      name,
      room_number: roomNumber,
      feedback,
      edit_token: editToken,
      created_at: now,
      updated_at: now,
    };
    feedbacks.push(newFeedback);
    writeLocalFeedbacks(feedbacks);
    return newFeedback;
  }
}

export async function updateFeedback(
  id: string,
  editToken: string,
  name: string,
  roomNumber: string,
  feedback: string
): Promise<Feedback | null> {
  const now = new Date().toISOString();

  if (isVercelPostgres) {
    await ensurePostgres();
    const sql = await getPostgresClient();
    const { rows } = await sql<Feedback>`
      UPDATE feedbacks 
      SET name = ${name}, room_number = ${roomNumber}, feedback = ${feedback}, updated_at = ${now}
      WHERE id = ${id} AND edit_token = ${editToken}
      RETURNING *
    `;
    return rows[0] || null;
  } else {
    const feedbacks = readLocalFeedbacks();
    const index = feedbacks.findIndex(f => f.id === id && f.edit_token === editToken);
    if (index === -1) return null;
    
    feedbacks[index] = {
      ...feedbacks[index],
      name,
      room_number: roomNumber,
      feedback,
      updated_at: now,
    };
    writeLocalFeedbacks(feedbacks);
    return feedbacks[index];
  }
}

export async function deleteFeedback(id: string, editToken: string): Promise<boolean> {
  if (isVercelPostgres) {
    await ensurePostgres();
    const sql = await getPostgresClient();
    const result = await sql`
      DELETE FROM feedbacks WHERE id = ${id} AND edit_token = ${editToken}
    `;
    return (result.rowCount ?? 0) > 0;
  } else {
    const feedbacks = readLocalFeedbacks();
    const index = feedbacks.findIndex(f => f.id === id && f.edit_token === editToken);
    if (index === -1) return false;
    
    feedbacks.splice(index, 1);
    writeLocalFeedbacks(feedbacks);
    return true;
  }
}