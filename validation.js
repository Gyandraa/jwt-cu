const { check } = require('express-validator');

exports.signupValidation = [
    check('username', 'username is requied').not().isEmpty(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 1 }),
    check('role', 'please enter a role').not().isEmpty()
]

exports.loginValidation = [
     check('username', 'Please include a valid username').not().isEmpty(),
     check('password', 'Password must be 6 or more characters').isLength({ min: 1 })

]