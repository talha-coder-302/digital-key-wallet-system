const passport = require('passport');

module.exports = (router, controller) => {
  router.use(passport.initialize());
  
  router.post('/createUser', controller.createUser);
  router.put('/updateUser', controller.updateUser);
  router.delete('/deleteUser', controller.deleteUser);
  router.get('/getAllUsers', controller.getAllUsers);
  router.post('/revokeKey', controller.revokeKey);
  
};