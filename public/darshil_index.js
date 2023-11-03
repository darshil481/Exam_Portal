let mysql = require('mysql2/promise');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
const { json } = require('express/lib/response');
var cookieParser = require('cookie-parser')
const req = require('express/lib/request');
app.use(express.static(__dirname + '/'));
app.use(bodyParser.json());
const bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken')
const { query } = require('express');
const { cookie } = require('express/lib/response');
const session = require('express-session');
const res = require('express/lib/response');
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
const con = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "exam_system"
});
app.use(
    session({
        secret: 'your-secret-key', 
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, 
        },
    })
);
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('adminPanel.ejs');
});
app.get('/forgot_pass', (req, res) => {
    res.render('forgot.ejs');
})
app.post('/link_generate', (req, res) => {
    temp_email = req.body.email;
    req.session.email = temp_email;
    console.log(req.session);
    if ((req.session)) {
        res.render('verified');
    }
    else {
        res.redirect('/');
    }
})
app.post('/link_click', function (req, res) {
    if ((req.session)) {
        res.render('conform_pass.ejs');
    }
    if ((!req.session)) {
        res.redirect('/');
    }
});
// app.get('/login', (req, res) => {
//     res.end('login succesfull')
// })
var flg;
let flg2 = false;
const arr = [];
app.post('/abc', async (req, res) => {
    let p = req.body.password;
    let e = req.body.email;
    if (e.length != 0) {
        var q = `select * from exam_system.user_login where email='${e}' and role='1';`
        let [ans] = await con.query(q);
        if (ans.length != 0) {
            flg = true;
            arr.push(flg)
            arr[1] = ans[0].email;
            bcrypt.compare(p, ans[0].password, function (err, result) {
                if (result) {
                    res.json(true )
                }
                else {
                    res.json(false )
                }
            });
        }
        else {
            res.json(false )
        }
    }
})
app.post('/xyz', async(req, result) => {
    let e = req.body.email;
    const ans1 = [];
    if (e.length != 0) {
        var q = `select * from exam_system.user_login where email='${e}' and role='1';`
        let [ans] = await con.query(q);
         console.log(ans);
            
            if (ans.length != 0) {
                ans1[0] = true;
                ans1[1] = ans[0].email;
                console.log(ans1);
                result.json({ans1});
            }
            else {
                ans1[0] = false;
                console.log(ans1);
                result.json({ans1});
            }
    }
})
app.post('/updated', (req, res) => {
    let email1 = req.session.email;
    let pass1 = req.body.pass1;
    var hashedPassword;
    // Encryption of the string password
    bcrypt.genSalt(10, function (err, Salt) {
        // The bcrypt is used for encrypting password.
        bcrypt.hash(pass1, Salt, function (err, hash) {
            if (err) {
                return console.log('Cannot encrypt');
            }
            hashedPassword = hash;
            console.log(hash);
            var q1 = `UPDATE exam_system.user_login  set password ='${hash}' WHERE email='${email1}' and role=1`;
            con.query(q1, (err, res) => {
                if (err) throw err;
                console.log('update');
            })
        })
    })
    console.log(hashedPassword);
    req.session.destroy();
    res.json({ email1 });
})
const queryExecurter = (query) => {
    return new Promise((resolve, reject) => {
        con.query(query, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        })
    })
}


const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/");
    }
    next();
  };
  app.get("/login", authMiddleware, (req, res) => {
    res.end('login succesfull')
  });
app.listen(8000);
