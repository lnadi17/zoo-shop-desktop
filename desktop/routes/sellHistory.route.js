import { Router } from 'express';
import { selectHistory } from './search.js';
export function historyRoutes(store) {
  const router = Router();
  const find = req => selectHistory(store.all('history'),req.body);
  router.post('/findHistories/:page/:limit/:isPagination', (req,res) => {
    const list = find(req);
    const { page, limit, isPagination } = req.params;
    res.json(Number(isPagination) ? list.slice((page-1)*limit, page*limit) : list);
  });
  router.post('/add', (req,res) => res.json({status:200, _id:store.addHistory(req.body)._id}));
  router.get('/findAll', (req,res) => res.json(store.all('history')));
  router.post('/getCount', (req,res) => res.json(find(req).length));
  router.delete('/delete/:id', (req,res) => {
    store.remove('history',req.params.id);
    res.json({status: 200});
  });
  return router;
}
