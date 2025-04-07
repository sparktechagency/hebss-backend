import Category from '../categoryModule/category.model';

const getCategoryByAge = async (age: number) => {
  const categories = await Category.find();

  const matchedCategory = categories.find((cat: any) => {
    const match = cat.ageGroup.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      return age >= min && age <= max;
    }
    return false;
  });

  return matchedCategory?._id || null;
};

const parseCostStatement = (statement: string) => {
  const priceMatch = statement.match(/\$(\d+)[^\d]+(\d+)/);
  const bookRangeMatch = statement.match(/(\d+\s*[-–]\s*\d+)\s*books/i);

  const minPrice = priceMatch ? parseInt(priceMatch[1]) : undefined;
  const maxPrice = priceMatch ? parseInt(priceMatch[2]) : undefined;
  const bookRange = bookRangeMatch ? bookRangeMatch[1].replace(/\s+/g, '') + ' books/month' : undefined;

  return { minPrice, maxPrice, bookRange };
};

export { getCategoryByAge, parseCostStatement };
