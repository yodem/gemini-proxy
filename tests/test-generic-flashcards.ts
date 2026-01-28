/**
 * Test script for the generic flashcards endpoint
 *
 * This demonstrates using the generic flashcards API with different subject domains
 * (not just political philosophy).
 *
 * Run with: bun run test-generic-flashcards.ts
 */

const API_URL = 'http://localhost:4000/flashcards/generate';

async function testFlashcardsGeneration(testName: string, requestBody: any) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST: ${testName}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ Success! Generated ${data.flashcards.length} flashcard(s)\n`);

      data.flashcards.forEach((card: any, index: number) => {
        console.log(`📇 Flashcard ${index + 1}:`);
        console.log(`   Type: ${card.type}`);
        console.log(`   Front: ${card.front}`);
        console.log(`   Back: ${card.back}`);
        if (card.context_logic) {
          console.log(`   Context: ${card.context_logic}`);
        }
        if (card.tags && card.tags.length > 0) {
          console.log(`   Tags: ${card.tags.join(', ')}`);
        }
        console.log('');
      });

      console.log(`🔑 Conversation Key: ${data.metadata.conversationKey}`);
      console.log(`📊 Total Cards: ${data.metadata.totalCards}\n`);
    } else {
      console.log(`❌ Error: ${data.error}\n`);
    }
  } catch (error) {
    console.error(`❌ Request failed:`, error);
  }
}

async function runTests() {
  console.log('\n🚀 Starting Generic Flashcards API Tests\n');

  // Test 1: Biology/Science
  await testFlashcardsGeneration('Biology - Photosynthesis', {
    content: 'Photosynthesis is the process by which plants convert light energy from the sun into chemical energy stored in glucose. This process occurs in the chloroplasts and requires water, carbon dioxide, and sunlight. The overall equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2.',
    systemInstruction: 'You are an expert biology tutor creating educational flashcards. Create flashcards that help students learn key concepts. Use these card types: Concept, Process, Definition. Each flashcard should have a clear question on the front and a concise answer on the back. Return JSON format: {flashcards: [{type, front, back, context_logic, tags}]}',
    contextMetadata: {
      subject: 'Biology',
      topic: 'Photosynthesis',
      level: 'High School'
    },
    cardTypes: ['Concept', 'Process', 'Definition'],
    language: 'en',
    extraCards: false
  });

  // Test 2: Programming/Computer Science
  await testFlashcardsGeneration('Programming - JavaScript Closures', {
    content: 'A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned. Closures are created every time a function is created in JavaScript. They allow for data privacy and the creation of function factories.',
    systemInstruction: 'You are a programming instructor creating flashcards for software developers. Focus on clear technical explanations. Card types: Concept, Example, Use-Case. Format: JSON with {flashcards: [{type, front, back, context_logic, tags}]}',
    contextMetadata: {
      subject: 'Computer Science',
      topic: 'JavaScript',
      subtopic: 'Closures'
    },
    cardTypes: ['Concept', 'Example', 'Use-Case'],
    language: 'en',
    extraCards: false
  });

  // Test 3: History
  await testFlashcardsGeneration('History - American Revolution', {
    content: 'The Boston Tea Party occurred on December 16, 1773, when American colonists, frustrated with British taxation without representation, dumped 342 chests of tea into Boston Harbor. This act of defiance against the Tea Act of 1773 was a pivotal event leading to the American Revolution.',
    systemInstruction: 'You are a history teacher creating study flashcards. Focus on events, causes, and significance. Card types: Event, Cause, Effect. Return JSON: {flashcards: [{type, front, back, context_logic, tags}]}',
    contextMetadata: {
      subject: 'History',
      period: '18th Century',
      topic: 'American Revolution'
    },
    cardTypes: ['Event', 'Cause', 'Effect'],
    language: 'en',
    extraCards: true  // Request deeper analysis
  });

  // Test 4: Language Learning (Spanish)
  await testFlashcardsGeneration('Language Learning - Spanish Verbs', {
    content: 'El verbo "ser" es uno de los verbos más importantes en español. Se usa para describir características permanentes, identidad, origen, profesión y para decir la hora. Ejemplos: Soy estudiante. Ella es de México. Son las tres.',
    systemInstruction: 'Eres un profesor de español creando flashcards para estudiantes. Tipos de tarjetas: Definición, Ejemplo, Uso. Formato JSON: {flashcards: [{type, front, back, context_logic, tags}]}',
    contextMetadata: {
      subject: 'Spanish Language',
      topic: 'Verbs',
      verb: 'ser'
    },
    cardTypes: ['Definición', 'Ejemplo', 'Uso'],
    language: 'es',
    extraCards: false
  });

  console.log('\n✨ All tests completed!\n');
}

// Run the tests
runTests().catch(console.error);
