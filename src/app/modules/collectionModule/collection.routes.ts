import express from 'express';
import CollectionControllers from './collection.controllers';

const collectionRouter = express.Router();

collectionRouter.post('/create', CollectionControllers.createCollection);
collectionRouter.get('/retrieve', CollectionControllers.getCollections);
collectionRouter.get('/retrieve/:id', CollectionControllers.getCollectionById);
collectionRouter.patch('/update/:id', CollectionControllers.updateCollection);
collectionRouter.delete('/delete/all', CollectionControllers.deleteAllCollections);

export default collectionRouter;
