var express = require('express');
var router = express.Router();

/* GET transactions. */
router.get('/transactions_list/:userID', function(req, res) {
  var db = req.dbTransactions;
  var collection = db.get('transactions');
  console.log("GET transactions_list with username: " + req.params.userID);
  collection.find({ userID: { $eq: req.params.userID } },{},function(e,docs){
    res.json(docs);
    console.log("ja");
  });
});

/* GET categories. */
router.get('/categories_list/:userID', function(req, res) {
  var db = req.dbCategories;
  var collection = db.get('categories');
  console.log("GET categories_list with username: " + req.params.userID);
  collection.find({ userID: { $eq: req.params.userID } },{},function(e,docs){
    res.json(docs);
  });
});

/* GET accounts. */
router.get('/accounts_list/:userID', function(req, res) {
  var db = req.dbAccounts;
  var collection = db.get('accounts');
  console.log("GET accounts_list with username: " + req.params.userID);
  collection.find({ userID: { $eq: req.params.userID } },{},function(e,docs){
    res.json(docs);
  });
});



/* POST to transactions. */
router.post('/transactions_add', function(req, res) {
  var db = req.dbTransactions;
  var collection = db.get('transactions');
  collection.insert(JSON.parse(req.body.data), function(err, result){
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    );
    console.log("Post transaction with following username: " + req.body.data.username)
    console.log(req.body.data)
  });
});

/* POST to categories. */
router.post('/categories_add', function(req, res) {
  var db = req.dbCategories;
  var collection = db.get('categories');
  collection.insert(JSON.parse(req.body.data), function(err, result){
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    )
  });
});

/* POST to accounts. */
router.post('/accounts_add', function(req, res) {
  var db = req.dbAccounts;
  var collection = db.get('accounts');
  collection.insert(JSON.parse(req.body.data), function(err, result){
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    )
  });
});

/* POST entire database. */
router.post('/import', function(req, res) {

  var jsonFile = JSON.parse(req.body.data);

  var db = req.dbAccounts;
  var collection = db.get('accounts');
  collection.remove({ 'userID' : jsonFile[0] });

  db = req.dbCategories;
  collection = db.get('categories');
  collection.remove({ 'userID' : jsonFile[0] });

  db = req.dbTransactions;
  collection = db.get('transactions');
  collection.remove({ 'userID' : jsonFile[0] });

  console.log("DELETED all data of user: " + jsonFile[0]);
  //var db = req.dbAccounts;

  if(jsonFile.length > 1)
  {
    db = req.dbTransactions;
    collection = db.get('transactions');
    for (var i = 0; i < jsonFile[1].length; i++)
    {
      collection.insert(jsonFile[1][i]);
    }

    db = req.dbCategories;
    collection = db.get('categories');
    for (var i = 0; i < jsonFile[2].length; i++)
    {
      collection.insert(jsonFile[2][i]);
    }

    db = req.dbAccounts;
    collection = db.get('accounts');
    for (var i = 0; i < jsonFile[3].length; i++)
    {
      collection.insert(jsonFile[3][i]);
    }

    console.log("Inserted New Database.")
  }
  var err = null;
  res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
});



/* MODIFY categories. */
router.put('/categories_modify/:id', function(req, res) {
  var db = req.dbCategories;
  var collection = db.get('categories');;
  var toModify = req.params.id;
  collection.update({ '_id' : toModify }, JSON.parse(req.body.data),function(err) 
  {
    res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    if(err != null)
    {
      console.log("Error");
      console.log(err);
      
    }
    else
    {
      console.log("PUT categories");
      console.log(req.body.data);
    }
  });
});


/* MODIFY transactions. */
router.put('/transactions_modify/:id', function(req, res) {
  var db = req.dbTransactions;
  var collection = db.get('transactions');
  var toModify = req.params.id;
  collection.update({ '_id' : toModify }, JSON.parse(req.body.data),function(err) 
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
      console.log(req.body.data);
    }
  });
});

/* MODIFY accounts. */
router.put('/accounts_modify/:id', function(req, res) {
  var db = req.dbAccounts;
  var collection = db.get('accounts');;
  var toModify = req.params.id;
  collection.update({ '_id' : toModify }, JSON.parse(req.body.data),function(err) 
  {
    res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    if(err != null)
    {
      console.log("Error");
      console.log(err);
      
    }
    else
    {
      console.log("PUT accounts");
      console.log(req.body.data);
      console.log("to Modify:")
      console.log(toModify)
    }
  });
});

/* DELETE to transactions. */
router.delete('/transactions_delete/:id', function(req, res) {
  var db = req.dbTransactions;
  var collection = db.get('transactions');
  var toDelete = req.params.id;
  collection.remove({ '_id' : toDelete }, function(err) {
    res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
  });
});

/* DELETE categories. */
router.delete('/categories_delete/:id', function(req, res) {
  var db = req.dbCategories;
  var collection = db.get('categories');
  var toDelete = req.params.id;
  collection.remove({ '_id' : toDelete }, function(err) {
    res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
  });
});

/* DELETE categories. */
router.delete('/accounts_delete/:id', function(req, res) {
  var db = req.dbAccounts;
  var collection = db.get('accounts');
  var toDelete = req.params.id;
  collection.remove({ '_id' : toDelete }, function(err) {
    res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
  });
});

module.exports = router;
