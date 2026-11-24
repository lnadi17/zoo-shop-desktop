import { Router } from 'express';
export function parameterRoutes(store) {
  const router = Router();
  for (const action of ['add','change']) {
    router.post('/' + action, (req,res) => {
      const item = store.save('parameter',req.body,action === 'change');
      res.json({status: 200, _id: item._id});
    });
  }
  router.delete('/delete/:id', (req,res) => {
    store.remove('parameter',req.params.id);
    res.json({status: 200});
  });
  router.get('/findParameters', (req,res) => res.json(store.all('parameter')));
  router.post('/getParameter', (req,res) => {
    const {name, parameterType, defaultValue} = req.body;
    res.json(store.all('parameter').find(p => p.name === name && p.parameterType === parameterType) ??
      {name, parameterType, value: defaultValue});
  });
  return router;
}
