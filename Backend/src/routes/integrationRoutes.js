const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const {
  getIntegrations,
  connectEmail,
  disconnectEmail,
} = require('../controllers/integrationController');

router.use(authRequired);
router.get('/', getIntegrations);
router.post('/email/connect', connectEmail);
router.post('/email/disconnect', disconnectEmail);

module.exports = router;
