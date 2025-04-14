const passport = require('passport');
const { isAdmin, authJWT } = require(`${__middelwares}/user`)

module.exports = (router, controller) => {
  router.use(passport.initialize());

  router.post('/generatePermanentKey', authJWT, isAdmin, controller.generatePermanentKey);
  router.post('/generateTemporaryKey', authJWT, isAdmin, controller.generateTemporaryKey);
  router.post('/revokeKey/:keyId/:userId', authJWT, isAdmin, controller.revokeKey);
  router.post('/verifyKey/:keyId/:userId', authJWT, isAdmin, controller.verifyKey);
  
};