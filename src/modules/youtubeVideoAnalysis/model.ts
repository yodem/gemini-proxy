import { t } from 'elysia';

// Define validation schemas for YouTube video analysis
export namespace YouTubeVideoAnalysisModel {
  // Input schema for the analyzeYouTubeVideo request
  export const analyzeYouTubeVideoBody = t.Object({
    youtubeUrl: t.String({
      minLength: 1,
      description: "YouTube URL from a Jewish philosophy website to analyze",
      examples: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"]
    }),
    categories: t.Array(t.String(), {
      minItems: 1,
      description: "Array of category strings that will be used to match against the video content. Must contain at least one category.",
      examples: [["פילוסופיה יהודית", "תורה", "חסידות", "קבלה", "מחשבה יהודית"]]
    })
  }, {
    description: "Request body for YouTube video analysis containing YouTube URL and categories to match",
    title: "YouTubeVideoAnalysisRequest"
  });

  // TypeScript types inferred from schemas
  export type analyzeYouTubeVideoBody = typeof analyzeYouTubeVideoBody.static;

  // Response schema
  export const analyzeYouTubeVideoResponse = t.Object({
    success: t.Boolean({
      description: "Indicates whether the request was processed successfully"
    }),
    description: t.String({
      description: "Description of the video content in Hebrew"
    }),
    categories: t.Array(t.String({
      description: "Array of category names that best match the video content"
    }), {
      description: "List of identified categories from the provided options"
    })
  }, {
    description: "Successful response containing video description and identified categories in Hebrew",
    title: "YouTubeVideoAnalysisResponse"
  });

  export type analyzeYouTubeVideoResponse = typeof analyzeYouTubeVideoResponse.static;

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
