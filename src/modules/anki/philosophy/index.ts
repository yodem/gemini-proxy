import { Elysia } from 'elysia';
import { politicalPhilosophyFlashcardsController } from './political';
import { kantPhilosophyFlashcardsController } from './kant';

/**
 * Philosophy Flashcards Module
 *
 * Aggregates all philosophy-related flashcard endpoints.
 * Routes:
 * - /anki/philosophy/political - Political philosophy flashcards
 * - /anki/philosophy/kant - Kant-specific flashcards
 */
// Create wrappers to add domain-specific prefixes
const politicalWrapper = new Elysia({ prefix: '/political' })
  .use(politicalPhilosophyFlashcardsController);

const kantWrapper = new Elysia({ prefix: '/kant' })
  .use(kantPhilosophyFlashcardsController);

export const philosophyModule = new Elysia({
  prefix: '/philosophy',
  name: 'Philosophy.Module'
})
  .use(politicalWrapper)
  .use(kantWrapper);
