import { t } from 'elysia';

// Define validation schemas for category identification
export namespace CategoryIdentificationModel {
  // Input schema for the identifyCategories request
  export const identifyCategoriesBody = t.Object({
    categories: t.Array(t.String(), {
      minItems: 1,
      description: "Array of category strings that will be used to match against the content. Must contain at least one category.",
      examples: [["רמב״ם", "חז״ל", "פילוסופיה אריסטוטלית", "קבלה", "כללי"]]
    }),
    title: t.String({
      minLength: 1,
      description: "The title of the content to analyze for category identification.",
      examples: ["השכל העיוני", "היחס לגיוס לצה״ל להגותו של שעיהו ליבוביץ"]
    }),
    description: t.String({
      minLength: 1,
      description: "The description/content to analyze for category identification. Should contain meaningful content for AI analysis.",
      examples: ["על פי הפילוסופיה של הרמב״ם, השכל העיוני הוא חלק מהשכל האחראי על ידע תיאורטי..."]
    })
  }, {
    description: "Request body for category identification containing categories to match and content to analyze",
    title: "CategoryIdentificationRequest"
  });

  // TypeScript types inferred from schemas
  export type identifyCategoriesBody = typeof identifyCategoriesBody.static;

  // Response schema
  export const identifyCategoriesResponse = t.Object({
    success: t.Boolean({
      description: "Indicates whether the request was processed successfully"
    }),
    matchingCategories: t.Array(t.String({
      description: "Array of category names that best match the content with focus on precision over quantity"
    }), {
      description: "List of identified categories from the provided options"
    }),
    totalCategoriesProvided: t.Number({
      description: "Total number of categories provided in the original request"
    })
  }, {
    description: "Successful response containing identified categories and metadata",
    title: "CategoryIdentificationResponse"
  });

  export type identifyCategoriesResponse = typeof identifyCategoriesResponse.static;

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
