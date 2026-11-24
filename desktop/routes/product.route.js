import { Router } from 'express';
import { selectProducts } from './search.js';

export function productRoutes(store) {
  const router = Router();
  for (const action of ['add','change']) {
    router.post('/' + action, (req,res) => {
      const item = store.save('product', req.body, action === 'change');
      res.json({status: 200, _id: item._id, item});
    });
  }
  router.delete('/delete/:id', (req,res) => {
    store.remove('product', req.params.id);
    res.json({status: 200});
  });
  router.post('/findProducts', (req,res) => res.json(selectProducts(store.all('product'), req.body)));
  router.get('/findAll', (req,res) => res.json(store.all('product')));
  router.get('/one', (req,res) => res.json(store.get('product', String(req.query.id || ''))));
  router.post('/sellProduct', (req,res) => {
    const {requestId, ...line} = req.body;
    res.json({status: 200, ...store.checkout([line], requestId)[0]});
  });
  router.post('/checkout', (req,res) => {
    res.json({status: 200, items: store.checkout(req.body.items, req.body.requestId)});
  });
  return router;
}
