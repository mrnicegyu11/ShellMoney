var express = require('express');
var router = express.Router();
var passport = require('./passport').passportmodule;
var isUserLoggedIn = require('./passport').isUserLoggedIn;

/* GET transactions. */
router.get('/transactions_list/', 
  function(req, res) {
    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      var username = isUserLoggedIn(req).toString();
      var db = req.dbTransactions;
      var collection = db.get('transactions');
      console.log("GET transactions_list with username: " + username);
      collection.find({ userID: { $eq: username } },{ userID: 0},function(e,docs){
        res.json(docs);
      });
    }
  }
);

/* GET categories. */
router.get('/categories_list/', 
  function(req, res) {

    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      var username = isUserLoggedIn(req).toString();
      var db = req.dbCategories;
      var collection = db.get('categories');
      console.log("GET categories_list with username: " + username);
      collection.find({ userID: { $eq: username } },{ userID: 0},function(e,docs){
        res.json(docs);
      });
    }


});

/* GET accounts. */
router.get('/accounts_list/', 
  function(req, res) {

    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      var username = isUserLoggedIn(req).toString();
      var db = req.dbAccounts;
      var collection = db.get('accounts');
      console.log("GET accounts_list with username: " + username);
      collection.find({ userID: { $eq: username } },{ userID: 0},function(e,docs){
        res.json(docs);
      });
    }
});



/* POST to transactions. */
router.post('/transactions_add', function(req, res) {
  if(isUserLoggedIn(req) === false)
  {
    res.redirect('/')
  }
  else
  {
    // TODO: Remove username from global.js and add here
    var username = isUserLoggedIn(req).toString();
    var db = req.dbTransactions;
    var collection = db.get('transactions');
    var JSONobj = JSON.parse(req.body.data);
    JSONobj.userID = username;
    collection.insert(JSONobj, function(err, result){
      res.send(
        (err === null) ? { msg: '' } : { msg: err }
      );
      console.log("Post transaction with following username: " + username)
      console.log(req.body.data)
    });
  }
});

/* POST to categories. */
router.post('/categories_add', 
  function(req, res) {
    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      // TODO: Remove username from global.js and add here
      var username = isUserLoggedIn(req).toString();
      var db = req.dbCategories;
      var collection = db.get('categories');
      var JSONobj = JSON.parse(req.body.data);
      JSONobj.userID = username;
      collection.insert(JSONobj, function(err, result){
        res.send(
          (err === null) ? { msg: '' } : { msg: err }
        )
      });
    }
});

/* POST to accounts. */
router.post('/accounts_add', 
  function(req, res) {
    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      // TODO: Remove username from global.js and add here
      var username = isUserLoggedIn(req).toString();
      var db = req.dbAccounts;
      var collection = db.get('accounts');
      var JSONobj = JSON.parse(req.body.data);
      JSONobj.userID = username;
      collection.insert(JSONobj, function(err, result){
        res.send(
          (err === null) ? { msg: '' } : { msg: err }
        )
      });
    }
});

/* POST entire database. */
router.post('/import',
  function(req, res) {
    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      // TODO: Remove username from global.js and add here
      var username = isUserLoggedIn(req).toString(); // = jsonFile[0];
      var jsonFile = JSON.parse(req.body.data);
      jsonFile[0]=username;

      var db = req.dbAccounts;
      var collection = db.get('accounts');
      collection.remove({ 'userID' : username });
    
      db = req.dbCategories;
      collection = db.get('categories');
      collection.remove({ 'userID' : username });
    
      db = req.dbTransactions;
      collection = db.get('transactions');
      collection.remove({ 'userID' : username });
    
      console.log("DELETED all data of user: " + username);
      //var db = req.dbAccounts;
    
      if(jsonFile.length > 1)
      {
        // TODO: Handle username here
        db = req.dbTransactions;
        collection = db.get('transactions');
        for (var i = 0; i < jsonFile[1].length; i++)
        {
          jsonFile[1][i].userID = username;
          delete jsonFile[1][i]._id;
          collection.insert(jsonFile[1][i]);
        }
    
        db = req.dbCategories;
        collection = db.get('categories');
        for (var i = 0; i < jsonFile[2].length; i++)
        {
          jsonFile[2][i].userID = username;
          delete jsonFile[2][i]._id;
          collection.insert(jsonFile[2][i]);
        }
    
        db = req.dbAccounts;
        collection = db.get('accounts');
        for (var i = 0; i < jsonFile[3].length; i++)
        {
          jsonFile[3][i].userID = username;
          delete jsonFile[3][i]._id;
          collection.insert(jsonFile[3][i]);
        }
    
        console.log("Inserted New Database.")
      }
      var err = null;
      res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    }

  
});



/* MODIFY categories. */
router.put('/categories_modify/:id', 
  function(req, res) {
    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      // TODO: Remove username from global.js and add here
      // TODO: Validate correct username
      var username = isUserLoggedIn(req).toString();
      var db = req.dbCategories;
      //db.addMiddleware(require('monk-middleware-wrap-non-dollar-update'))
      var collection = db.get('categories');;
      var toModify = req.params.id;

      var JSONfile = JSON.parse(req.body.data);
      JSONfile.userID = username;

      //collection.update({ '_id' : toModify, 'userID': {$eq: username} }, JSONfile,function(err) 
      collection.findOneAndUpdate({ '_id' : toModify, 'userID': {$eq: username}}, {"$set": JSONfile},function(err)
      {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
        if(err != null)
        {
          console.log("Error in server backend: Modification of a category.");
          console.log(err);
          
        }
        else
        {
          console.log("PUT categories");
          console.log(JSONfile);
        }
      });
    }
});


/* MODIFY transactions. */
router.put('/transactions_modify/:id', 
  function(req, res) {
    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      // TODO: Remove username from global.js and add here
      // TODO: Validate correct username
      var username = isUserLoggedIn(req).toString();
      var db = req.dbTransactions;
      var collection = db.get('transactions');
      var toModify = req.params.id;

      var JSONfile = JSON.parse(req.body.data);
      JSONfile.userID = username;


      collection.findOneAndUpdate({ '_id' : toModify, 'userID': {$eq: username} }, {"$set": JSONfile},function(err) 
      {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
        if(err != null)
        {
          console.log("Error");
          console.log(err);
          
        }
        else
        {
          console.log("PUT transactions");
          console.log(JSONfile);
        }
      });
    }
});

/* MODIFY accounts. */
router.put('/accounts_modify/:id',
  function(req, res) {
    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      // TODO: Remove username from global.js and add here
      // TODO: Validate correct username
      var username = isUserLoggedIn(req).toString();
      var db = req.dbAccounts;
      var collection = db.get('accounts');;
      var toModify = req.params.id;

      var JSONfile = JSON.parse(req.body.data);
      JSONfile.userID = username;

      collection.findOneAndUpdate({ '_id' : toModify, 'userID': {$eq: username} }, {"$set": JSONfile},function(err) 
      {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
        if(err != null)
        {
          console.log("Error");
          console.log(err);
        }
        else
        {
          console.log("PUT account with ID:");
          console.log(toModify)
          console.log("Modified Account Data:")
          console.log(JSONfile);
        }
      });
    }
});

/* DELETE to transactions. */
router.delete('/transactions_delete/:id',
  function(req, res) {
    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      // TODO: Remove username from global.js and add here
      // TODO: Validate correct username
      var username = isUserLoggedIn(req).toString();
      var db = req.dbTransactions;
      var collection = db.get('transactions');
      var toDelete = req.params.id;
      
      collection.remove({ '_id' : toDelete , 'userID': {$eq: username} }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
      });
    }
});

/* DELETE categories. */
router.delete('/categories_delete/:id',
  function(req, res) {
    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      // TODO: Remove username from global.js and add here
      // TODO: Validate correct username
      var username = isUserLoggedIn(req).toString();
      var db = req.dbCategories;
      var collection = db.get('categories');
      var toDelete = req.params.id;
      collection.remove({ '_id' : toDelete , 'userID': {$eq: username} }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
      });
    }
});

/* DELETE categories. */
router.delete('/accounts_delete/:id',
  function(req, res) {
    if(isUserLoggedIn(req) === false)
    {
      res.redirect('/')
    }
    else
    {
      // TODO: Remove username from global.js and add here
      // TODO: Validate correct username
      var username = isUserLoggedIn(req).toString();
      var db = req.dbAccounts;
      var collection = db.get('accounts');
      var toDelete = req.params.id;
      collection.remove({ '_id' : toDelete , 'userID': {$eq: username} }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
      });
    }
});



module.exports = router;
