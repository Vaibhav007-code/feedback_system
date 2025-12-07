import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export interface Feedback {
  id: string;
  name: string;
  room_number: string;
  feedback: string;
  edit_token: string;
  created_at: string;
  updated_at: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'feedbacks.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load feedbacks from file
function loadFeedbacks(): Feedback[] {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading feedbacks:', error);
  }
  return [];
}

// Save feedbacks to file
function saveFeedbacks(feedbacks: Feedback[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(feedbacks, null, 2));
  } catch (error) {
    console.error('Error saving feedbacks:', error);
  }
}

// Get all feedbacks
export function getAllFeedbacks(): Feedback[] {
  return loadFeedbacks().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// Get feedback by ID
export function getFeedbackById(id: string): Feedback | null {
  const feedbacks = loadFeedbacks();
  return feedbacks.find(f => f.id === id) || null;
}

// Create new feedback
export function createFeedback(
  name: string,
  roomNumber: string,
  feedback: string
): Feedback {
  const feedbacks = loadFeedbacks();
  const newFeedback: Feedback = {
    id: uuidv4(),
    name,
    room_number: roomNumber,
    feedback,
    edit_token: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  feedbacks.push(newFeedback);
  saveFeedbacks(feedbacks);
  return newFeedback;
}

// Update feedback
export function updateFeedback(
  id: string,
  editToken: string,
  name: string,
  roomNumber: string,
  feedback: string
): Feedback | null {
  const feedbacks = loadFeedbacks();
  const index = feedbacks.findIndex(f => f.id === id && f.edit_token === editToken);
  
  if (index === -1) return null;
  
  feedbacks[index] = {
    ...feedbacks[index],
    name,
    room_number: roomNumber,
    feedback,
    updated_at: new Date().toISOString(),
  };
  
  saveFeedbacks(feedbacks);
  return feedbacks[index];
}

// Delete feedback
export function deleteFeedback(id: string, editToken: string): boolean {
  const feedbacks = loadFeedbacks();
  const index = feedbacks.findIndex(f => f.id === id && f.edit_token === editToken);
  
  if (index === -1) return false;
  
  feedbacks.splice(index, 1);
  saveFeedbacks(feedbacks);
  return true;
}