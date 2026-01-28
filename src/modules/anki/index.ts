import { Elysia } from 'elysia';
import { philosophyModule } from './philosophy';

/**
 * Anki Flashcards Module
 *
 * Main aggregator for all Anki-style flashcard endpoints.
 * Currently includes philosophy-specific implementations with potential
 * for expansion to other domains.
 *
 * Routes:
 * - /anki/philosophy/political - Political philosophy flashcards
 * - /anki/philosophy/kant - Kant-specific flashcards
 */
export const ankiModule = new Elysia({
  prefix: '/anki',
  name: 'Anki.Module'
})
  .use(philosophyModule);

// Export components for potential use in other modules
export { philosophyModule } from './philosophy';
export { politicalPhilosophyFlashcardsController } from './philosophy/political';
export { kantPhilosophyFlashcardsController } from './philosophy/kant';
export * from './philosophy/base';
export { PoliticalPhilosophyFlashcardsService } from './philosophy/political/service';
export { KantPhilosophyFlashcardsService } from './philosophy/kant/service';
