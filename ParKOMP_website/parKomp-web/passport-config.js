const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById, getJSONlan) {
  const authenticateUser = async (req, email, password, done) => {
    getUserByEmail(email, async (user) => {
      if(user != 'error'){
        if (user == null) {
          getJSONlan(req, null, (req, res, lang)=>{
            req.flash('email', email)
            return done(null, false, { message: lang.err13 })
          })
          return
        }
    
        try {
          if (await bcrypt.compare(password, user.password)) {
            var usr = {id: user.ident, id2: user.id, email: user.email, password: user.password}
            return done(null, usr)
          } else {
            getJSONlan(req, null, (req, res, lang)=>{
              req.flash('email', email)
              return done(null, false, { message: lang.err14 })
            })
          }
        } catch (e) {
          return done(e)
        }
      }
      else{
        getJSONlan(req, null, (req, res, lang)=>{
          return done(null, false, { message: lang.err15 })
        })
      }
    })
  }

  passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback : true }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    getUserById(id, (user) => {
      if(user != 'error'){
        var us = {id: user.ident, id2: user.id, name: user.name, email: user.email, password: user.password}
      }
      if(user != 'error'){
        let user = us;
        return done(null, user)
      }
      else{
        return done(null, false, { message: 'Server error 2! Please, try again!' })
      }
    })
  })
}

module.exports = initialize