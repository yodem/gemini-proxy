// Test file to verify markdown code block removal
function testMarkdownRemoval() {
  console.log('🧪 Testing Markdown Code Block Removal...\n');

  // Test cases
  const testCases = [
    {
      name: 'Standard markdown with ```json',
      input: '```json\n{\n  "description": "test",\n  "categories": ["test"]\n}\n```',
      expected: '{\n  "description": "test",\n  "categories": ["test"]\n}'
    },
    {
      name: 'Standard markdown with ```',
      input: '```\n{\n  "description": "test",\n  "categories": ["test"]\n}\n```',
      expected: '{\n  "description": "test",\n  "categories": ["test"]\n}'
    },
    {
      name: 'Clean JSON (no markdown)',
      input: '{\n  "description": "test",\n  "categories": ["test"]\n}',
      expected: '{\n  "description": "test",\n  "categories": ["test"]\n}'
    },
    {
      name: 'JSON with whitespace',
      input: '  {\n    "description": "test",\n    "categories": ["test"]\n  }  ',
      expected: '{\n    "description": "test",\n    "categories": ["test"]\n  }'
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log('Input:', JSON.stringify(testCase.input));

    // Apply the same cleaning logic as in the service
    let cleanText = testCase.input.trim();

    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '');
    }
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '');
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.replace(/\s*```$/, '');
    }

    cleanText = cleanText.trim();

    console.log('Cleaned:', JSON.stringify(cleanText));
    console.log('Expected:', JSON.stringify(testCase.expected));

    const success = cleanText === testCase.expected;
    console.log(success ? '✅ PASS' : '❌ FAIL');
    console.log('');

    // Test JSON parsing
    try {
      JSON.parse(cleanText);
      console.log('✅ JSON parsing: SUCCESS');
    } catch (error) {
      console.log('❌ JSON parsing: FAILED -', error.message);
    }
    console.log('='.repeat(50));
  });
}

// Run the tests
testMarkdownRemoval();
