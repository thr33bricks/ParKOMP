//ParKOMP - Parking of the future
//Yordan Yordanov, February 2021
//Baba Tonka High School of Mathematics, Ruse
//For contacts - yyordanov2002@icloud.com

//IT IS FORBIDDEN TO USE THIS CODE IN ANY WAY
//WITHOUT THE PERMISSION OF THE OWNER

//All icons located in /public/pics except the parkomp logos are
//made by Freepik from www.flaticon.com

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
var http = require('http')
//var https = require('https'); handled by nginx
var socket = require("socket.io");
var fs = require('fs');

var visitorsLogStream = fs.createWriteStream("visitors_log.txt", {flags:'a'});

/*var privateKey  = fs.readFileSync('/etc/letsencrypt/live/parkomp.tk/privkey.pem', 'utf-8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/parkomp.tk/cert.pem', 'utf-8');
var ca_bundle = fs.readFileSync('/etc/letsencrypt/live/parkomp.tk/chain.pem', 'utf-8');

var credentials = {key: privateKey, cert: certificate, ca: ca_bundle};

--handled by nginx now
*/

const app = express()

//========================================= Security ================================================
app.use(express.json({ limit: '30kb' }));//Limiting payload; basic DOS protection

const rateLimit = require('express-rate-limit')
const limit = rateLimit({
  max: 50,// max requests
  windowMs: 60 * 1000 * 15, // 15 mins
  message: 'Too many requests' // message to send
}); //Basic DOS and brute force protection
app.use('/login', limit);
app.use('/register', limit); 

// Data Sanitization against XSS
const xss = require('xss-clean')
app.use(xss());

app.disable('x-powered-by')
//Protection module
/*const helmet = require("helmet");
app.use(helmet());*/
//===================================================================================================
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
var mysql = require('mysql')

var connection = mysql.createConnection({
  host     : process.env.db_hostname,
  user     : process.env.db_user,
  password : process.env.db_pass,
  database : process.env.db_name
});

connection.connect(function(error){
  if(!!error) console.log(error);
  else console.log('Database Connected!');
});

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  userByEmail,
  userById,
  getJSONlan
)

app.set('view-engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//===================================================================================


//Redirects all http reqs to https
//app.all('*', ensureSecure); //handled by nginx
app.all('*', logVisitIP);

app.get('/', checkAuthenticated, (req, res) => {
  //Gets the complete stays only. Formats date and time accordingly, sets aliases.
  var sql = "SELECT l.parking_name p_name, DATE_FORMAT(l.time_arrival, '%d-%m-%Y') date_arr," +
            "c.name c_name, DATE_FORMAT(l.time_arrival, '%H:%i') t_arr," +
            "DATE_FORMAT(l.time_exit, '%H:%i') t_exit FROM logs l "+
            "JOIN cars c ON c.id = l.car_id " +
            "WHERE l.time_exit IS NOT NULL AND c.user_id=? ORDER BY l.time_arrival DESC;";                      
  let query = connection.query(sql,[req.user.id2],(err, results) => {
    if(err){
      getJSONlan(req, res, (req, res, lang)=>{
        redirError(req, res, 'SQL_ERR: Could not get stays!', lang.err8, '/register');
      })
      return
    }

    getJSONlan(req, res, (req, res, lang)=>{
      res.render('index.ejs', { l: lang, name: req.user.name, items: results })
    })
  })
})

app.get('/cars', checkAuthenticated, (req, res) => {
  var sql = "SELECT * FROM cars WHERE user_id=?";
  let query = connection.query(sql,[req.user.id2],(err, results) => {
    if(err){
      getJSONlan(req, res, (req, res, lang)=>{
        redirError(req, res, 'SQL_ERR: Could not get cars!', lang.err8, '/');
      })
      return
    }

    getJSONlan(req, res, (req, res, lang)=>{
      res.render('cars.ejs', { l: lang, name: req.user.name, items: results })
    })
  })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  getJSONlan(req, res, (req, res, lang)=>{
    res.render('login.ejs', {l: lang})
  })
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  getJSONlan(req, res, (req, res, lang)=>{
    res.render('register.ejs', {l: lang})
  })
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try{
    userByEmail(req.body.email, async (user) => {
      if(user == 'error'){
        getJSONlan(req, res, (req, res, lang)=>{
          redirError(req, res, 'SQL_ERR: Could not get user by email!', lang.err8, '/register')
        })
      }
      else if(user == null){
        if(req.body.name.length == 0 || req.body.password.length == 0 || req.body.email.length == 0){
          getJSONlan(req, res, (req, res, lang)=>{
            req.flash('error', lang.err1)
            res.redirect('/register')
          })
        }
        else if(req.body.name.length > 45 || req.body.password.length > 50 || req.body.email.length > 50){
          getJSONlan(req, res, (req, res, lang)=>{
            req.flash('error', lang.err2)
            res.redirect('/register')
          })
        }
        else{
          const hashedPassword = await bcrypt.hash(req.body.password, 10)
  
          let data = {ident: Date.now().toString(), name: req.body.name, email: req.body.email, password: hashedPassword}
          let sql = "INSERT INTO users SET ?"
          let query = connection.query(sql, data,(err, results) => {
            if(err){
              getJSONlan(req, res, (req, res, lang)=>{
                redirError(req, res, 'SQL_ERR: Could not register user!', lang.err9, '/register')
              })
              return;
            }
            res.redirect('/login')
          })
        }
      }
      else{
        getJSONlan(req, res, (req, res, lang)=>{
          req.flash('name', req.body.name)
          req.flash('error', lang.err6)
          res.redirect('/register')
        })
      }
    })
    
  } catch {
    getJSONlan(req, res, (req, res, lang)=>{
      req.flash('name', req.body.name)
      req.flash('error', lang.err7)
      res.redirect('/register')
    })
  }
})

app.get('/add', checkAuthenticated, (req, res) => {
  getJSONlan(req, res, (req, res, lang)=>{
    res.render('add.ejs', {l: lang})
  })
})

app.post('/add', checkAuthenticated, async (req, res) => {
  if(req.body.car_name.length == 0 || req.body.lp.length == 0){
    getJSONlan(req, res, (req, res, lang)=>{
      addError(req, res, lang.err1, null)
    })
  }
  else if(req.body.car_name.length > 20 || req.body.lp.length > 14){
    getJSONlan(req, res, (req, res, lang)=>{
      addError(req, res, lang.err2, null)
    })
  }
  else if(!BgLpAuth(req.body.lp)){
    getJSONlan(req, res, (req, res, lang)=>{
      addError(req, res, lang.err3, null)
    })
  }
  else{
    let data = {user_id: req.user.id2, name: req.body.car_name, lic_plate: req.body.lp}
    let sql = "INSERT INTO cars SET ?"
    let query = connection.query(sql, data,(err, results) => {
      if(err){
        getJSONlan(req, res, (req, res, lang)=>{
          addError(req, res, lang.err4, null)
        })
        return
      }
      getJSONlan(req, res, (req, res, lang)=>{
        redirError(req, res, '', lang.err5, '/cars')
      })
    })
  }
})

app.get('/edit/:carId', checkAuthenticated, (req, res) => {
  const carId = req.params.carId
  carById(req, carId, (car) => {
    if(car != null){
      getJSONlan(req, res, (req, res, lang)=>{
        res.render('edit.ejs', { l: lang, car : car })
      })
    }
    else{
      res.redirect('/cars')
    }
  })
})

app.put('/edit', checkAuthenticated, (req, res) => {
  if(req.body.car_name.length == 0 || req.body.lp.length == 0){
    getJSONlan(req, res, (req, res, lang)=>{
      addError(req, res, lang.err1, req.body.id)
    })
  }
  else if(req.body.car_name.length > 20 || req.body.lp.length > 14){
    getJSONlan(req, res, (req, res, lang)=>{
      addError(req, res, lang.err2, req.body.id)
    })
  }
  else if(!BgLpAuth(req.body.lp)){
    getJSONlan(req, res, (req, res, lang)=>{
      addError(req, res, lang.err3, req.body.id)
    })
  }
  else{
    let data = [req.body.car_name, req.body.lp, req.body.id, req.user.id2]
    let sql = "UPDATE cars SET name=?, lic_plate=? WHERE id = ? AND user_id = ?"
    let query = connection.query(sql, data,(err, results) => {
      if(err){
        getJSONlan(req, res, (req, res, lang)=>{
          addError(req, res, lang.err4, req.body.id)
        })
        return
      }
      getJSONlan(req, res, (req, res, lang)=>{
        redirError(req, res, '', lang.err10, '/cars')
      })
    })
  }
})

app.get('/delete/:carId', checkAuthenticated, (req, res) => {
  const carId = req.params.carId
  carById(req, carId, (car) =>{
    if(car != null){
      getJSONlan(req, res, (req, res, lang)=>{
        res.render('confirm.ejs', { l: lang, car: car })
      })
    }
    else{
      res.redirect('/cars')
    }
  })
})

app.delete('/delete/:carId', checkAuthenticated, (req, res) => {
  const carId = req.params.carId
  let data = [carId, req.user.id2]
  let sql = "DELETE FROM cars WHERE id = ? AND user_id = ?";
  let query = connection.query(sql, data, (err, results) => {
    if(err){
      console.log(err)
      getJSONlan(req, res, (req, res, lang)=>{
        redirError(req, res, 'SQL_ERR: Could not delete car!', lang.err11, '/cars');
      })
      return
    }
    getJSONlan(req, res, (req, res, lang)=>{
      redirError(req, res, '', lang.err12, '/cars')
    })
  })
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

app.use(function(req, res, next) {
  res.status(404)
  res.redirect('/login')
})

//===================================================================================

//handled by nginx
function ensureSecure(req, res, next){
  if(req.secure){
    // OK, continue
    return next();
  };
  res.redirect('https://' + req.hostname + req.url); // express 4.x
}

function logVisitIP(req, res, next){
  visitorsLogStream.write('IP:' + req.headers["x-real-ip"] + ' visited ' + req.hostname + req.url + ' Date:' + new Date().toString().replace(/T/, ':').replace(/\.\w*/, '') + '\n');
  console.log('New visitor! IP:' + req.headers["x-real-ip"]);
  return next();
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

function addError(req, res, error, carId){
  req.flash('car_name', req.body.car_name)
  req.flash('lp', req.body.lp)
  req.flash('error', error)

  if(carId != null){
    res.redirect('/edit/' + carId.toString())
  }
  else{
    res.redirect('/add')
  }
}

function redirError(req, res, log, error, redir){
  if(log.length != 0){
    console.log('\x1b[41m%s\x1b[0m', log)
  }
  req.flash('redir', redir)
  req.flash('error', error)
  getJSONlan(req, res, (req, res, lang)=>{
    res.render('error.ejs', {l: lang})
  })
  return
}

function userByEmail(email, callback){
  let sql = "SELECT id, ident, name, email, password FROM users WHERE email = ? LIMIT 1"
  let query = connection.query(sql, [email], (err, results, fields) => {
    if(err){
      return callback('error')
    }
    return callback(results[0])
})}

function userById(id, callback){
  let sql = "SELECT id, ident, name, email, password FROM users WHERE ident = ? LIMIT 1"
  let query = connection.query(sql, [id], (err, results, fields) => {
    if(err){
      console.error('\x1b[41m%s\x1b[0m', 'SQL_ERR: Could not get user by id!')
      return callback('error')
    }
    return callback(results[0])
})}

function carById(req, carId, callback){
  let data = [carId, req.user.id2]
  let sql = "SELECT * FROM cars WHERE id = ? AND user_id = ?"
  let query = connection.query(sql, data, (err, results, fields) => {
    if(err){
      console.error('\x1b[41m%s\x1b[0m', 'SQL_ERR: Could not find car by id!')
      return callback('error')
    }
    return callback(results[0])
})}

//License plate regex authenticator
function BgLpAuth(lp){
  //example: P1112CA, P111111, 123H229, C0110,      XH1123
  //         regular,   paid,  transit, government, temporary
  var bgNumREG = /^[ABEKMHOPCTYX]{1,2}[0-9]{4}[ABEKMHOPCTYX]{2}\b|^[ABEKMHOPCTYX]{1,2}[0-9]{6}\b|^[0-9]{3}[BMHT]{1}[0-9]{3}\b|^[CT]{1,2}[0-9]{4}\b|^[XH]{2}[0-9]{4}\b/
  return bgNumREG.test(lp)
}

//Get json info for used language
function getJSONlan(req, res, callback){
  var lan = req.acceptsLanguages(['bg', 'bg-BG', 'en', 'en-US'])
  if(lan == 'bg' || lan == 'bg-BG'){
    fs.readFile('./langs/bg.json',(err, rawdata) =>{
      callback(req, res, JSON.parse(rawdata))
    })
  }
  else{
    fs.readFile('./langs/en.json',(err, rawdata) =>{
      callback(req, res, JSON.parse(rawdata))
    })
  }
}

var httpServer = http.createServer(app);
var io = socket(httpServer,{
  path: '/socketio'
})
//var httpsServer = https.createServer(credentials, app);     no need for a https server as nginx is used
httpServer.listen(process.env.HTTP_PORT)
//httpsServer.listen(process.env.HTTPS_PORT);

//============================== Socket IO ==============================

//Socket io server setup
io.on("connection", (socket)=>{
  socket.auth = false
  setTimeout(function(){
    //If the socket didn't authenticate, disconnect it
    if (!socket.auth) {
      console.error('\x1b[41m%s\x1b[0m', 'IO Client kicked!')
      socket.disconnect('unauthorized')
    }
  }, 1000);

  socket.on('authenticate', (data)=>{
    //check the auth data sent by the client
    if(data.token == process.env.socket_token){
      console.log("IO Client joined the server: ", socket.id)
      socket.auth = true
      io.emit("connected")
    }
  });

  socket.on("disconnect", ()=>{
    console.error('\x1b[41m%s\x1b[0m', 'IO Client disconnected!')
  });

  socket.on("new_cust", (data)=>{
    carByLP(data.lp, (car)=>{
      if(car == 'error' || car == null){
        //If err/0 => car is not in the db
        io.emit("validated", {res:'no'})
        return
      }
      isCarIn(car.id, (log)=>{
        if(log == 'error'){
          //server error
          io.emit("validated", {res:'err'})
        }
        else if(log == null){
          //car is not inside
          writeCarIn(car.id, car.user_id, data.p_name,(res)=>{
            if(res == 'error'){
              //server error
              io.emit("validated", {res:'err'})
              return
            }
            //Car gets in
            io.emit("validated", {res:'in'})
          })
        }
        else{
          //car is inside
          writeCarOut(log.id, (res)=>{
            if(res == 'error'){
              //server error
              io.emit("validated", {res:'err'})
              return
            }
            //Car gets out
            io.emit("validated", {res:'out'})
          })
        }
      })   
    })
  })
})


function carByLP(carLP, callback){
  let sql = "SELECT * FROM cars WHERE lic_plate=?"
  let query = connection.query(sql, [carLP], (err, results, fields) => {
    if(err){
      console.error('\x1b[41m%s\x1b[0m', 'SQL_ERR: Could not find car by id!')
      return callback('error')
    }
    return callback(results[0])
})}

function isCarIn(carId, callback){
  let sql = "SELECT id FROM logs WHERE car_id=? AND time_exit IS NULL LIMIT 1"
  let query = connection.query(sql, [carId], (err, results, fields) => {
    if(err){
      console.log(err)
      console.error('\x1b[41m%s\x1b[0m', 'SQL_ERR: Could not find out if car is in!')
      return callback('error')
    }
    return callback(results[0])
})}

function writeCarIn(carId, carUsrId, p_name, callback){
  //Correct time to 24h format
  let data = {car_id: carId, car_user_id: carUsrId, time_arrival: toISOLocal(new Date()), parking_name: p_name}
  let sql = "INSERT INTO logs SET ?"
  let query = connection.query(sql, data, (err, results, fields) => {
    if(err){
      console.log(err)
      console.error('\x1b[41m%s\x1b[0m', 'SQL_ERR: Could not write car in!')
      return callback('error')
    }
    return callback(results[0])
})}

function writeCarOut(logId, callback){
  //Correct time to 24h format
  let data = [toISOLocal(new Date()), logId]
  let sql = "UPDATE logs SET time_exit = ? WHERE id = ?"
  let query = connection.query(sql, data, (err, results, fields) => {
    if(err){
      console.error('\x1b[41m%s\x1b[0m', 'SQL_ERR: Could not update log info!')
      return callback('error')
    }
    return callback(results[0])
})}

function toISOLocal(d) {
  var z  = n =>  ('0' + n).slice(-2)
  var zz = n => ('00' + n).slice(-3)
  var off = d.getTimezoneOffset()
  var sign = off < 0? '+' : '-'
  off = Math.abs(off)

  return d.getFullYear() + '-'
         + z(d.getMonth()+1) + '-' +
         z(d.getDate()) + ' ' +
         z(d.getHours()) + ':'  + 
         z(d.getMinutes()) + ':' +
         z(d.getSeconds())  
}
