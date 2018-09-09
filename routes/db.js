var express = require('express');
var router = express.Router();

/* GET transactions. */
router.get('/transactions_list', function(req, res) {
  var db = req.dbTransactions;
  var collection = db.get('finance1');
  collection.find({},{},function(e,docs){
    res.json(docs);
  });
});

/* GET categories. */
router.get('/categories_list', function(req, res) {
  var db = req.dbCategories;
  var collection = db.get('categories1');
  collection.find({},{},function(e,docs){
    res.json(docs);
  });
});

/* GET accounts. */
router.get('/accounts_list', function(req, res) {
  var db = req.dbAccounts;
  var collection = db.get('accounts1');
  collection.find({},{},function(e,docs){
    res.json(docs);
  });
});



/* POST to transactions. */
router.post('/transactions_add', function(req, res) {
  var db = req.dbTransactions;
  var collection = db.get('finance1');
  collection.insert(JSON.parse(req.body.data), function(err, result){
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    );

  });
});

/* POST to categories. */
router.post('/categories_add', function(req, res) {
  var db = req.dbCategories;
  var collection = db.get('categories1');
  collection.insert(JSON.parse(req.body.data), function(err, result){
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    )
  });
});

/* POST to accounts. */
router.post('/accounts_add', function(req, res) {
  var db = req.dbAccounts;
  var collection = db.get('accounts1');
  collection.insert(JSON.parse(req.body.data), function(err, result){
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    )
  });
});

/* MODIFY categories. */
router.put('/categories_modify/:id', function(req, res) {
  var db = req.dbCategories;
  var collection = db.get('categories1');;
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
  var collection = db.get('finance1');
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
  var collection = db.get('accounts1');;
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
  var collection = db.get('finance1');
  var toDelete = req.params.id;
  collection.remove({ '_id' : toDelete }, function(err) {
    res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
  });
});

/* DELETE categories. */
router.delete('/categories_delete/:id', function(req, res) {
  var db = req.dbCategories;
  var collection = db.get('categories1');
  var toDelete = req.params.id;
  collection.remove({ '_id' : toDelete }, function(err) {
    res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
  });
});

/* DELETE categories. */
router.delete('/accounts_delete/:id', function(req, res) {
  var db = req.dbAccounts;
  var collection = db.get('accounts1');
  var toDelete = req.params.id;
  collection.remove({ '_id' : toDelete }, function(err) {
    res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
  });
});

module.exports = router;
