const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { getReports } = require('../controllers/reportController');

router.use(authRequired);
router.get('/', getReports);

module.exports = router;
