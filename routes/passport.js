var monk = require('monk');
var mongoDB_accessPath = process.env.SHELLMONEY_MONGODB_ACCESS
var dbUsers = monk(mongoDB_accessPath + '/shellmoney');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const sessionID = uuidv4().toString().substring(0,24);

// For now we buffer the userDB as mongo-access is async and it seems like passportjs
// likes to have a decision on wether a user is valid like DIRECTLY!!11
// -.-'
var currentUsersBuffered = {};
dbUsers.get('users').find({},{},function(err,docs){
  currentUsersBuffered = docs;
});
//

///////////////////////////////
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
passport.use(new Strategy(
  function(username, password, cb) {
    console.log("Refreshing user-list from mongoDB...")
    dbUsers.get('users').find({},{},function(err,docs){
      currentUsersBuffered = docs;
    });
    console.log("Passport is auth-ing...")
    var found = false;
    for (var i = 0; i < currentUsersBuffered.length; i++)
    {
      if(currentUsersBuffered[i].username === username)
      {
        res = bcrypt.compareSync(password, currentUsersBuffered[i].password);
        if(res === false)
        {
          return cb(null, false); 
        }
        else if (res === true)
        {
          return cb(null, currentUsersBuffered[i]);
        }
      }
    }
    if (found === false)
    { 
      return cb(null, false); 
    }
}));
passport.serializeUser(function(user, cb) {
  cb(null, user._id.toString() + sessionID);
});
passport.deserializeUser(function(id, cb) {
  var found = false;
  for (var i = 0; i < currentUsersBuffered.length; i++)
  {
    if(currentUsersBuffered[i]._id.toString() === id.toString().substring(0,24)) // dirty hack...
    {

      if(id.toString().substring(24) !== sessionID)
      {
        return cb(null, false); 
      }
      else
      {
        found = true;
        return cb(null, currentUsersBuffered[i]);
      }

    }
  }
  if (found === false)
  { 
    return cb(null, false); 
  }
});
///////////////////////////////

exports.isUserLoggedIn = function isUserLoggedIn(req)
{
  if(req.session.username === null || typeof req.session.username === 'undefined')
  {
    return false
  }
  else
  {
    return req.session.username;
  }
}

exports.passportmodule = passport;
exports.currentUsersBuffered = function()
{
  dbUsers.get('users').find({},{},function(err,docs){
    currentUsersBuffered = docs;
  });
  return currentUsersBuffered;
};

exports.insertNewUser = function(user,pass)
{

  // Check if username already exists:
  // [This should have been caught before!!]
  for (var i = 0; i < currentUsersBuffered.length; i++)
  {
    if(currentUsersBuffered[i].username === user)
    {
      console.log("Error in creating new user: Username already exists.")
      return;
    }
  }

  var collection = dbUsers.get('users');
  bcrypt.hash(pass, 10, function(err, hash) {
    collection.insert({username: user, password: hash}, function(err, result)
    {
      if (err !== null)
      {
        console.log("Error in creating new user:")
        console.log(err);
        return;
      }
      else
      {
        exports.currentUsersBuffered();
      }
    });
  });

}