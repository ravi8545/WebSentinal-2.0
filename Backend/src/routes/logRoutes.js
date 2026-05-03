const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { listLogs } = require('../controllers/logController');

router.use(authRequired);
router.get('/', listLogs);

module.exports = router;
