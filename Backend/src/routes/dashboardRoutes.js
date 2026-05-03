const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboardController');

router.use(authRequired);
router.get('/', getDashboard);

module.exports = router;
