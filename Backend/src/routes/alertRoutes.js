const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { listAlerts, markAllRead } = require('../controllers/alertController');

router.use(authRequired);
router.get('/', listAlerts);
router.post('/read-all', markAllRead);

module.exports = router;
