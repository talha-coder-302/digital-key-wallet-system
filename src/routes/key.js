const passport = require('passport');
const { isAdmin, authJWT } = require(`${__middelwares}/user`)

module.exports = (router, controller) => {
  router.use(passport.initialize());

  // router.post('/generateKey', authJWT, isAdmin, controller.generateKey);
  // router.post('/verifyKey', authJWT, isAdmin, controller.verifyKey);
  router.post('/generatePermanentKey', authJWT, isAdmin, controller.generatePermanentKey);
  router.post('/generateTemporaryKey', authJWT, isAdmin, controller.generateTemporaryKey);
  router.post('/verifyKey', authJWT, isAdmin, controller.verifyKey);
  
};