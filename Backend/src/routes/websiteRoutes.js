const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const {
  listWebsites,
  createWebsite,
  deleteWebsite,
  updateWebsite,
} = require('../controllers/websiteController');

router.use(authRequired);
router.get('/', listWebsites);
router.post('/', createWebsite);
router.put('/:id', updateWebsite);
router.delete('/:id', deleteWebsite);

module.exports = router;
