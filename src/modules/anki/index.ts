import { Elysia } from 'elysia';
import { philosophyModule } from './philosophy';
import { bibleModule } from './bible';

/**
 * Anki Flashcards Module
 *
 * Main aggregator for all Anki-style flashcard endpoints.
 * Includes philosophy-specific implementations and Bible academic analysis.
 *
 * Routes:
 * - /anki/philosophy/political - Political philosophy flashcards
 * - /anki/philosophy/kant - Kant-specific flashcards
 * - /anki/bible/generate - Academic Bible (תנ״ך) flashcards
 */
export const ankiModule = new Elysia({
  prefix: '/anki',
  name: 'Anki.Module'
})
  .use(philosophyModule)
  .use(bibleModule);

// Export components for potential use in other modules
export { philosophyModule } from './philosophy';
export { bibleModule } from './bible';
export { politicalPhilosophyFlashcardsController } from './philosophy/political';
export { kantPhilosophyFlashcardsController } from './philosophy/kant';
export * from './philosophy/base';
export { PoliticalPhilosophyFlashcardsService } from './philosophy/political/service';
export { KantPhilosophyFlashcardsService } from './philosophy/kant/service';
export { BibleFlashcardsService } from './bible/service';
