const passport = require('passport');
const { isAdmin } = require(`${__middelwares}/user`)

module.exports = (router, controller) => {
  router.use(passport.initialize());
  
  router.post('/createUser', isAdmin, controller.createUser);
  router.put('/updateUser', isAdmin, controller.updateUser);
  router.delete('/deleteUser', isAdmin, controller.deleteUser);
  router.get('/getAllUsers', isAdmin, controller.getAllUsers);
  router.post('/revokeKey', isAdmin, controller.revokeKey);
  router.post('/login', controller.login);
  router.get('/auth/jwtToken', controller.authJwtToken);
  router.get('/refreshToken', controller.refreshToken);
  router.post('/logout', controller.logout);
};