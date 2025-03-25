const passport = require('passport');

module.exports = (router, controller) => {
  router.use(passport.initialize());

  router.post('/generateKey', controller.generateKey);
  router.post('/verifyKey', controller.verifyKey);
  
};