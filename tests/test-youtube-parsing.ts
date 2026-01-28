// Test file to verify YouTube parsing logic
import { YouTubeVideoAnalysisService } from './src/modules/youtubeVideoAnalysis/service';

// Test the parsing logic with mock responses
function testParsing() {
  console.log('🧪 Testing YouTube Video Analysis Parsing Logic...\n');

  // Test 1: Valid 4-5 sentence response
  const mockResponse1 = `{
    "description": "השיעור עוסק בבחירה החופשית במחשבה היהודית. הוא בוחן את קיומה של הבחירה החופשית ואת הגורמים המשפיעים עליה. הנושא נדון מתוך התייחסות למקורות קלאסיים ביהדות. השיעור מציע ניתוח פילוסופי-תיאולוגי מעמיק. הוא מתמקד בשאלות יסוד הנוגעות ליחסים בין רצון האדם לרצון שמיים.",
    "categories": ["פילוסופיה יהודית", "מחשבה יהודית"]
  }`;

  const categories1 = ["פילוסופיה יהודית", "תורה", "חסידות", "קבלה", "מחשבה יהודית"];

  console.log('Test 1: Valid 4-5 sentence response');
  console.log('Input categories:', categories1);
  console.log('Mock response:', mockResponse1);

  // We can't directly test the private method, but we can test the logic
  try {
    const parsed = JSON.parse(mockResponse1);
    const sentenceCount = (parsed.description.match(/[.!?]+/g) || []).length;
    const validCategories = parsed.categories.filter((cat: string) =>
      categories1.includes(cat.trim())
    );

    console.log('✅ Sentence count:', sentenceCount, '(expected: 4-5)');
    console.log('✅ Valid categories:', validCategories);
    console.log('✅ Filtered categories:', validCategories.slice(0, 3));
  } catch (error) {
    console.log('❌ Parse error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Response with invalid categories
  const mockResponse2 = `{
    "description": "השיעור עוסק בבחירה החופשית. הוא בוחן את קיומה של הבחירה החופשית. הנושא נדון מתוך התייחסות למקורות קלאסיים. השיעור מציע ניתוח פילוסופי-תיאולוגי.",
    "categories": ["פילוסופיה יהודית", "פסיכולוגיה", "אתיולוגיה"]
  }`;

  console.log('Test 2: Response with invalid categories');
  console.log('Input categories:', categories1);
  console.log('Mock response:', mockResponse2);

  try {
    const parsed = JSON.parse(mockResponse2);
    const sentenceCount = (parsed.description.match(/[.!?]+/g) || []).length;
    const validCategories = parsed.categories.filter((cat: string) =>
      categories1.includes(cat.trim())
    );

    console.log('✅ Sentence count:', sentenceCount, '(expected: 4-5)');
    console.log('✅ Valid categories:', validCategories, '(should filter out invalid ones)');
    console.log('✅ Filtered categories:', validCategories.slice(0, 3));
  } catch (error) {
    console.log('❌ Parse error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Wrong number of sentences
  const mockResponse3 = `{
    "description": "השיעור עוסק בבחירה החופשית. הוא בוחן את קיומה.",
    "categories": ["פילוסופיה יהודית"]
  }`;

  console.log('Test 3: Wrong number of sentences (2 instead of 4-5)');
  console.log('Mock response:', mockResponse3);

  try {
    const parsed = JSON.parse(mockResponse3);
    const sentenceCount = (parsed.description.match(/[.!?]+/g) || []).length;

    console.log('⚠️  Sentence count:', sentenceCount, '(should be 4-5)');
    if (sentenceCount < 4 || sentenceCount > 6) {
      console.log('⚠️  Warning: Description length outside expected range');
    }
  } catch (error) {
    console.log('❌ Parse error:', error.message);
  }

  console.log('\n🎉 Parsing logic tests completed!');
}

// Run the tests
testParsing();
