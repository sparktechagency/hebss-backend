// zod validation for recommendation
import { z } from 'zod';

const createRecommendationZodSchema = z.object({
  body: z.object({
    category: z.string({
      required_error: 'Category is required!',
    }),
    description: z.string({
      required_error: 'Description is required!',
    }),
    skillSuggestions: z.array(z.string()).min(1, 'Skill suggestions must not be empty!'),
    bookCategorySuggestions: z.array(z.string()).min(1, 'Book category suggestions must not be empty!'),
  }),
});

const getRecommendationByCategoryZodSchema = z.object({
  params: z.object({
    categoryId: z.string({
      required_error: 'ID is request in params!',
    }),
  }),
});

export default createRecommendationZodSchema;
