import express from 'express';
import CategoryControllers from './category.controllers';

const categoryRouter = express.Router();

categoryRouter.post('/create', CategoryControllers.createCategory);
categoryRouter.get('/retrieve', CategoryControllers.getCategories);
categoryRouter.get('/retrieve/:id', CategoryControllers.getCategoryById);
categoryRouter.patch('/update/:id', CategoryControllers.updateCategory);
categoryRouter.delete('/delete/all', CategoryControllers.deleteAllCategory);

export default categoryRouter;
