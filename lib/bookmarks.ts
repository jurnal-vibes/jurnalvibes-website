'use client';

const ARTICLES_KEY = 'jurnal_wave_bookmarks';
const JOBS_KEY = 'jurnal_wave_saved_jobs';

export function getSavedArticleIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ARTICLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isArticleSaved(id: string): boolean {
  const list = getSavedArticleIds();
  return list.includes(id);
}

export function toggleArticleBookmark(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getSavedArticleIds();
    let updated: string[];
    let newState = false;

    if (list.includes(id)) {
      updated = list.filter(item => item !== id);
      newState = false;
    } else {
      updated = [...list, id];
      newState = true;
    }

    localStorage.setItem(ARTICLES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bookmarks-updated', { detail: { type: 'article', id, isSaved: newState } }));
    window.dispatchEvent(new Event('storage'));
    return newState;
  } catch (err) {
    console.error('Failed to toggle article bookmark:', err);
    return false;
  }
}

export function getSavedJobIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isJobSaved(id: string): boolean {
  const list = getSavedJobIds();
  return list.includes(id);
}

export function toggleJobBookmark(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getSavedJobIds();
    let updated: string[];
    let newState = false;

    if (list.includes(id)) {
      updated = list.filter(item => item !== id);
      newState = false;
    } else {
      updated = [...list, id];
      newState = true;
    }

    localStorage.setItem(JOBS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bookmarks-updated', { detail: { type: 'job', id, isSaved: newState } }));
    window.dispatchEvent(new Event('storage'));
    return newState;
  } catch (err) {
    console.error('Failed to toggle job bookmark:', err);
    return false;
  }
}
