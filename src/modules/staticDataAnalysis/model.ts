import { t } from 'elysia';

// Define validation schemas for static data analysis
export namespace StaticDataAnalysisModel {
  // Input schema for the analyzeStaticData request
  export const analyzeStaticDataBody = t.Object({
    title: t.String({
      minLength: 1,
      description: "Title of the content to analyze",
      examples: ["מחשבות על הקבלה והפילוסופיה היהודית"]
    }),
    description: t.String({
      minLength: 1,
      description: "Description of the content to analyze",
      examples: ["הסרטון דן ברעיונות הפילוסופיים של הרב קוק בעניין התחייה הלאומית והקשר בין האומה לטבע"]
    }),
    categories: t.Array(t.String(), {
      minItems: 1,
      description: "Array of category strings that will be used to match against the content. Must contain at least one category.",
      examples: [["פילוסופיה יהודית", "תורה", "חסידות", "קבלה", "מחשבה יהודית"]]
    }),
    clarificationParagraph: t.Optional(t.String({
      minLength: 1,
      description: "Optional additional paragraph to provide context and clarification for better category identification",
      examples: ["התוכן מתמקד בהשפעת הפילוסופיה האריסטוטלית על המחשבה היהודית בימי הביניים, במיוחד אצל הרמב״ם והרס״ג"]
    }))
  }, {
    description: "Request body for static data analysis containing title, description, optional clarification and categories to match",
    title: "StaticDataAnalysisRequest"
  });

  // TypeScript types inferred from schemas
  export type analyzeStaticDataBody = typeof analyzeStaticDataBody.static;

  // Response schema
  export const analyzeStaticDataResponse = t.Object({
    success: t.Boolean({
      description: "Indicates whether the request was processed successfully"
    }),
    categories: t.Array(t.String({
      description: "Array of category names that best match the content"
    }), {
      description: "List of identified categories from the provided options"
    })
  }, {
    description: "Successful response containing identified categories",
    title: "StaticDataAnalysisResponse"
  });

  export type analyzeStaticDataResponse = typeof analyzeStaticDataResponse.static;

  // Error response schema
  export const errorResponse = t.Object({
    success: t.Boolean({
      description: "Always false for error responses"
    }),
    error: t.String({
      description: "Error type or category"
    }),
    message: t.Optional(t.String({
      description: "Detailed error message explaining what went wrong"
    }))
  }, {
    description: "Error response containing error details and message",
    title: "ErrorResponse"
  });

  export type errorResponse = typeof errorResponse.static;
}
