const passport = require('passport');
const { isAdmin, authJWT } = require(`${__middelwares}/user`)

module.exports = (router, controller) => {
  router.use(passport.initialize());
  
  router.post('/createUser', authJWT, isAdmin, controller.createUser);
  router.put('/updateUser/:userId', authJWT, isAdmin, controller.updateUser);
  router.delete('/deleteUser/:userId', authJWT, isAdmin, controller.deleteUser);
  router.get('/getAllUsers', authJWT, isAdmin, controller.getAllUsers);
  router.post('/revokeKey', isAdmin, controller.revokeKey);
  router.post('/login', controller.login);
  // router.get('/auth/jwtToken', controller.authJwtToken);
  // router.get('/refreshToken', controller.refreshToken);
  router.post('/logout', controller.logout);
};