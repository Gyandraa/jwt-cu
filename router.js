const express = require('express');
const router = express.Router();
const db  = require('./dbconnection');
const { signupValidation, loginValidation } = require('./validation');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', signupValidation, (req, res, next) => {
  db.query(
    `SELECT * FROM user WHERE username = (${db.escape(
      req.body.username
    )});`,
    (err, result) => {
      if (result.length) {
        return res.status(409).send({
          msg: 'This user is already in use!'
        });
      } else {
        // username is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err
            });
          } else {
            // has hashed pw => add to database
            db.query(
              `INSERT INTO user (username, password, role) VALUES ('${req.body.username}',
              ${db.escape(hash)},  ${db.escape(req.body.role)})`,
              (err, result) => {
                if (err) {
                  //throw err;
                  return res.status(400).send({
                    msg: err
                  });
                }
                return res.status(201).send({
                  msg: 'The user has been registerd with us!'
                });
              }
            );
          }
        });
      }
    }
  );
});


router.post('/login', loginValidation, (req, res, next) => {
  db.query(
    `SELECT * FROM user WHERE username = ${db.escape(req.body.username)};`,
    (err, result) => {
      // user does not exists
      if (err) {
        //throw err;
        return res.status(400).send({
          msg: err
        });
      }
      if (!result.length) {
        return res.status(401).send({
          msg: 'Username or password is incorrect!'
        });
      }
      // check password
      bcrypt.compare(
        req.body.password,
        result[0]['password'],
        (bErr, bResult) => {
          // wrong password
          if (bErr) {
            //throw bErr;
            return res.status(401).send({
              msg: 'user or password is incorrect!'
            });
          }
          if (bResult) {
            const token = jwt.sign({id:result[0].id},'the-super-strong-secrect',{ expiresIn: '1h' });
            // db.query(
            //   `UPDATE user SET last_login = now() WHERE id = '${result[0].id}'`
            // );
            return res.status(200).send({
              msg: 'Logged in!',
              token,
              user: result[0]
            });
          }
          return res.status(401).send({
            msg: 'User or password is incorrect!'
          });
        }
      );
    }
  );
});

router.post('/get-user', signupValidation, (req, res, next) => {


  if(
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer') ||
      !req.headers.authorization.split(' ')[1]
  ){
      return res.status(422).json({
          message: "Please provide the token",
      });
  }

  const theToken = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(theToken, 'the-super-strong-secrect');

  db.query('SELECT * FROM user ORDER BY username ', decoded.username, function (error, results, fields) {
      if (error) throw error;
      return res.send({ error: false, data: results[0], message: 'Fetch Successfully.' });
  });


});


module.exports = router;

