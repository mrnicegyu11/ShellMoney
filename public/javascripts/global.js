// Userlist data array for filling in info box
var transactionsData = [];
var categoryData = [];
var accountData = [];

var selectedMonth = new Date().getMonth() + 1;
var selectedYear = new Date().getFullYear();
var lastPickedDateInSession = null;

// Extend jQuery:
$.fn.exists = function () {
  return this.length !== 0;
  // see: https://stackoverflow.com/questions/920236/how-can-i-detect-if-a-selector-returns-null
}

// Stuff we use:
// ".buttonIsTransactionBooked"
// -> Has element "rel" which is ID
// -> Should ID always be rel?
// ".datepicker"
// ".dropdown-item-paymentTypeSelection"

// Conventions:
// INCOME has positive numbers
// PAYMENTS have negative numbers.
// Therefore amounts of transactions are always simply summed, never subtracted.

// Wechselkurse nur relevant für Zukünftige Transaktionen, 
// denn es wird über irgendwann aktuell die Zahlung getätigt.



// DOM Ready =============================================================
$(document).ready(function() {
  // Populate the user table on initial page load
  reloadData();
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  $('#selectedMonthYear').html(selectedMonth + " / " + selectedYear);
  
  $('#monthUp').on("click",function()
  {
    if(selectedMonth === 12)
    {
      selectedYear += 1;
      selectedMonth = 1;
    }
    else
    {
      selectedMonth += 1;
    }
    populateCategoryTable();

    populateTransactionTable(selectedMonth,selectedYear);
    $('#selectedMonthYear').html(selectedMonth + " / " + selectedYear);
  })

  $('#monthDown').on("click",function()
  {
    if(selectedMonth === 1)
    {
      selectedYear -= 1;
      selectedMonth = 12;
    }
    else
    {
      selectedMonth -= 1;
    }
    populateCategoryTable();

    populateTransactionTable(selectedMonth,selectedYear);
    $('#selectedMonthYear').html(selectedMonth + " / " + selectedYear);
  })

  // ACCOUNTS BUTTON
  $('#accountsButton').on('click', "button", function()
  {
    if($('#accountOverview').css("display") === "none")
    {
      if(transactionsData.length === 0)
      {
        reloadData();
      }

      $('#accountOverview').css("display","block");
    }
    else
    {
      $('#accountOverview').css("display","none");
    }
  });

  // SHOW DB (LANDING PAGE)
  $('#navigation').on('click', 'div.btn-class > button, #DisplayDB', function()
  {
    onNavigationChange()
    populateTransactionTable(selectedMonth,selectedYear);

    $('#databaseView').css("display", "block");
    $('#addTransactionView').css("display", "none");
    $('#categoriesView').css("display", "none");


    $('#transactionList table tbody').off('click');
    $('#transactionList table tbody').unbind().on('click', 'td a.linkshowtransaction', showTransactionInfo);
    $('#transactionList table tbody').on('click', 'td a.linkdeletetransaction', deleteTransaction);
    $('.buttonIsTransactionBooked').off();
    $('.buttonIsTransactionBooked').on("click", setButton_toggleTransactionListBookedStatus);
  });

  // ADD TRANSACTION
  $('#navigation').on('click', 'div.btn-class > button ,#DisplayAdd', function()
  {
    onNavigationChange()

    prepareButtonsAddingTransaction();
    //showButtonsAddingTransaction(null);
    $('#databaseView').css("display", "none");
    $('#addTransactionView').css("display", "block");
    $('#categoriesView').css("display", "none");

  });

  // CATEGORIES
  $('#navigation').on('click', 'div.btn-class > button ,#DisplayCategories', function()
  {
    $('#addCategoryButton').off("click");
    $('#addCategoryButtonAdd').off("click");
    $('#addCategoryButtonCancel').off("click");

    onNavigationChange()

    populateCategoryTable();
    $('#databaseView').css("display", "none");
    $('#addTransactionView').css("display", "none");
    $('#categoriesView').css("display", "block");

    $('#addCategoryButton').on('click', function()
    {
      $('#addCategory').css("display", "block");
      $('#addCategoryButton').css("display", "none");
      // Click on Add Category
      $('#addCategoryButtonAdd').on('click', function()
      {
        event.preventDefault();

      
        // Check and make sure errorCount's still at zero
        if($('#addCategory input#inputCategoryName').val() != '') {
        
          // If it is, compile all user info into one object
          var newTransaction = {
            'name': $('#addCategory input#inputCategoryName').val(),
            'systems': null,
            "referenceDate" : Date.now(),
            "referenceAmount" : 0.0,
            "associatedTransactions" : null,
            "allocatedSinceReference" : 0.0
          }

          if($('#addCategory input#inputCategoryDebitor1').val() != "")
          {
            if (newTransaction.systems === null)
            {
              newTransaction.systems = [];
            }

            var debitor1Val = $('#addCategory input#inputCategoryDebitor1').val();
            newTransaction.systems.push(
              {
                "debitor": $('#addCategory input#inputCategoryDebitor1').val(),
                "percentage" : $('#addCategory input#inputCategoryPercentage1').val()
              });
          }
          if($('#addCategory input#inputCategoryDebitor2').val() != "")
          {
            if (newTransaction.systems === null)
            {
              newTransaction.systems = [];
            }
            var debitor1Val = $('#addCategory input#inputCategoryDebitor2').val();
            newTransaction.systems.push(
              {
                "debitor": $('#addCategory input#inputCategoryDebitor2').val(),
                "percentage" : $('#addCategory input#inputCategoryPercentage2').val()
              });
          }
          if($('#addCategory input#inputCategoryDebitor3').val() != "")
          {
            if (newTransaction.systems === null)
            {
              newTransaction.systems = [];
            }
            var debitor1Val = $('#addCategory input#inputCategoryDebitor3').val();
            newTransaction.systems.push(
              {
                "debitor": $('#addCategory input#inputCategoryDebitor2').val(),
                "percentage" : $('#addCategory input#inputCategoryPercentage2').val()
              });
          }

          // Use AJAX to post the object to our adduser service
          $.ajax({
            type: 'POST',
            data: { "data" : JSON.stringify(newTransaction) },
            url: '/db/categories_add',
            dataType: 'json'
          }).done(function( response ) {
          
            // Check for successful (blank) response
            if (response.msg === '') {
            
              // Clear the form inputs
              $('#addCategory input').val('');
              $('#addCategory').css("display", "none");
              $('#addCategoryButton').css("display", "block");

              reloadData();


            }
            else {
            
              // If something goes wrong, alert the error message that our service returned
              alert('Error: ' + response.msg);
            
            }
          });

          
        }
        else {
          // If errorCount is more than 0, error out
          alert('Please fill in the name');
          return false;
        }

        $('#addCategoryButtonAdd').off("click");
      });
    });

    $('#addCategoryButtonCancel').on('click', function()
    {
      $('#addCategory').css("display", "none");
      $('#addCategoryButton').css("display", "block");
      $('#addCategory input').val('');
      $('#addCategoryButtonAdd').off("click");
    });

    

     
    $('#categoryDatabaseView table tbody').on('click', 'td a.linkdeletecategory', deleteCategory);

    $('#categoryDatabaseView table tbody').on('click', 'td a.linkshowcategory', showCategoryInfoModal);
    $('#categoryDatabaseView table tbody').on('click', 'td a.linkmodcategory', modifyCategory);

    $("#categoryTableResetAllocations").off("click");
    $("#categoryTableResetAllocations").on('click', function()
    {
      for (var i = 0; i < categoryData.length; i++)
      {
        var thisUserObject = categoryData[i];
        var found = getIteratorFromAllocatedSinceReferenceArray(categoryData[i].allocatedSinceReference,selectedYear,selectedMonth);
        if (found != null)
        {
          categoryData[i].allocatedSinceReference.splice(found, 1);

          var category = {
            'name': thisUserObject.name,
            'systems': thisUserObject.systems,
            "referenceDate" : thisUserObject.referenceDate,
            "referenceAmount" : thisUserObject.referenceAmount,
            "associatedTransactions" : thisUserObject.associatedTransactions,
            "allocatedSinceReference" : categoryData[i].allocatedSinceReference
          }
        
          $.ajax(
          {
            type: 'PUT',
            data: { "data" : JSON.stringify(category) },
            url: '/db/categories_modify/' + categoryData[i]._id,
            dataType: 'json'
          }).done(function( response ) 
          {
            
            // Check for successful (blank) response
            if (response.msg === '') {
            
            
            }
            else {
            
              // If something goes wrong, alert the error message that our service returned
              alert('Error: ' + response.msg);
            
            }
          });
        }
      }
      reloadData();
      populateCategoryTable();
    })

    $("#autofillAllocationButton").off("click");
    $("#autofillAllocationButton").on('click', function() 
    {
      for (var i = 0; i < categoryData.length; i++)
      {
        var thisUserObject = categoryData[i];
        var lastMonthIter = getIteratorFromAllocatedSinceReferenceArray(categoryData[i].allocatedSinceReference,selectedYear,selectedMonth - 1);
        var curMonthIter = getIteratorFromAllocatedSinceReferenceArray(categoryData[i].allocatedSinceReference,selectedYear,selectedMonth);
        if (lastMonthIter != null)
        {
          if(curMonthIter != null)
          {
            categoryData[i].allocatedSinceReference[curMonthIter].amount = categoryData[i].allocatedSinceReference[lastMonthIter].amount;
          }
          else
          {
            categoryData[i].allocatedSinceReference.push(
            { 
              "amount":categoryData[i].allocatedSinceReference[lastMonthIter].amount,
              "year": selectedYear,
              "month": selectedMonth
            });
          }

          var category = {
            'name': categoryData[i].name,
            'systems': categoryData[i].systems,
            "referenceDate" : categoryData[i].referenceDate,
            "referenceAmount" : categoryData[i].referenceAmount,
            "associatedTransactions" : categoryData[i].associatedTransactions,
            "allocatedSinceReference" : categoryData[i].allocatedSinceReference
          }

          $.ajax(
          {
            type: 'PUT',
            data: { "data" : JSON.stringify(category) },
            url: '/db/categories_modify/' + categoryData[i]._id,
            dataType: 'json'
          }).done(function( response ) 
          {
            
            // Check for successful (blank) response
            if (response.msg === '') {
            
            
            }
            else {
            
              // If something goes wrong, alert the error message that our service returned
              alert('Error: ' + response.msg);
            
            }
          });
        }
      }
      reloadData();
      populateCategoryTable();
    });
  });

  onNavigationChange()

  $( "" ).datepicker();
});




/////////////////////////////
//
// S N I P P E T S
//
/////////////////////////////

// Source: http://stackoverflow.com/questions/497790
var dates = {
  convert:function(d) {
      // Converts the date in d to a date-object. The input can be:
      //   a date object: returned without modification
      //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
      //   a number     : Interpreted as number of milliseconds
      //                  since 1 Jan 1970 (a timestamp) 
      //   a string     : Any format supported by the javascript engine, like
      //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
      //  an object     : Interpreted as an object with year, month and date
      //                  ibutes.  **NOTE** month is 0-11.
      return (
          d.constructor === Date ? d :
          d.constructor === Array ? new Date(d[0],d[1],d[2]) :
          d.constructor === Number ? new Date(d) :
          d.constructor === String ? new Date(d) :
          typeof d === "object" ? new Date(d.year,d.month,d.date) :
          NaN
      );
  },
  compare:function(a,b) {
      // Compare two dates (could be of any type supported by the convert
      // function above) and returns:
      //  -1 : if a < b
      //   0 : if a = b
      //   1 : if a > b
      // NaN : if a or b is an illegal date
      // NOTE: The code inside isFinite does an assignment (=).
      return (
          isFinite(a=this.convert(a).valueOf()) &&
          isFinite(b=this.convert(b).valueOf()) ?
          (a>b)-(a<b) :
          NaN
      );
  },
  inRange:function(d,start,end) {
      // Checks if date in d is between dates in start and end.
      // Returns a boolean or NaN:
      //    true  : if d is between start and end (inclusive)
      //    false : if d is before start or after end
      //    NaN   : if one or more of the dates is illegal.
      // NOTE: The code inside isFinite does an assignment (=).
     return (
          isFinite(d=this.convert(d).valueOf()) &&
          isFinite(start=this.convert(start).valueOf()) &&
          isFinite(end=this.convert(end).valueOf()) ?
          start <= d && d <= end :
          NaN
      );
  }
}


// Functions =============================================================
// Helper Function: getTotalCostsFromTransaction
function getTotalCostsFromTransaction(transaction)
{
  var totalAmount = 0.0;
  for (var j = 0; j < transaction.amount.length; j++)
  {
      totalAmount += parseFloat(transaction.amount[j].amount);
  }
  return totalAmount;
}

// Helper Function: getIteratorFromAllocatedSinceReferenceArray
function getIteratorFromAllocatedSinceReferenceArray(array,yearQuery,monthQuery)
{
  // Catch some easy out-of-bound stuff. 
  // Deliberatly not properly taking care of this as months should when possible be between 1 and 12
  if(monthQuery === 0 || monthQuery < 0)
  {
    yearQuery -= 1;
    monthQuery += 12;
  }
  else if (monthQuery > 12)
  {
    yearQuery += 1;
    monthQuery -= 12;
  }


  var allocatedSinceReferenceArray = array;

  var found = -1;
  for (var i = 0; i < allocatedSinceReferenceArray.length; i++)
  {
    if (parseInt(allocatedSinceReferenceArray[i].month) === monthQuery && parseInt(allocatedSinceReferenceArray[i].year) === yearQuery)
    {
      found = i;
      break;
    }
  }
  if (found != -1)
  {
    return i;
  }
  else
  {
    return null;
  }
}

// Called once toggleBookedStatusButton are rendern to set the button action
function setButton_toggleTransactionListBookedStatus()
{
  $('.buttonIsTransactionBooked').on("click", function()
    {
      var ID = $(this).attr('rel');
      var foundIterator = -1;

      // Check if we habe the ID in the database
      for(var i = 0; i < transactionsData.length; i++)
      {
        if(transactionsData[i]._id === ID)
        {
          foundIterator = i;
          break;
        }
      }

      // If we have found the ID
      if(i != -1)
      {
        if(transactionsData[i].dateBooked != null)
        {
          transactionsData[i].dateBooked = null;
        }
        else
        {
          transactionsData[i].dateBooked = Date.now();
        }

        $.ajax({
          type: 'PUT',
          data: { "data" : JSON.stringify(transactionsData[i]) },
          url: '/db/transactions_modify/' + $(this).attr('rel'),
          dataType: 'json'
        }).done(function( response ) {
        
          // Check for successful (blank) response
          if (response.msg === '') {
          
            // Clear the form inputs
            // TODO: Diesen reload sollte man weglassen können normalerweise.
            reloadData();
            $('#DisplayDB').click();

          }
          else {
          
            // If something goes wrong, alert the error message that our service returned
            alert('Error: ' + response.msg);
          
          }
        });

        $('#DisplayDB').click();
      }
      else
      {
        alert('Error: In function setButton_toggleTransactionListBookedStatus: ' + 'Did not find ID of button element in Database of Transactions.');
      }
    });
}

// Deletes a category, event musst have ibute "rel" with ID in it.
function deleteCategory(event)
{
  event.preventDefault();
    
    // If they did, do our delete
  $.ajax({
    type: 'DELETE',
    url: '/db/categories_delete/' + $(this).attr('rel')
  }).done(function( response ) {
  
    // Check for a successful (blank) response
    if (response.msg === '') {
      //alert('Successfully deleted. ');
    }
    else {
      alert('Error: ' + response.msg);
    }
  
    // Update the table
    reloadData();
  
  });  
}

// Reloads data from mongoDB and populates tables accordingly.
function reloadData()
{
  $.getJSON('db/transactions_list').always(function( data ) 
  {
    transactionsData = data;

    // Sort by descending date
    transactionsData.sort(function(a, b) {
      var dateA = new Date(a.dateEntered);
      var dateB = new Date(b.dateEntered);
      if (dateA < dateB) //sort string ascending
       return 1;
      if (dateA > dateB)
       return -1;
      return 0; //default return value (no sorting)
    });
    // Update the table
    populateTransactionTable(selectedMonth,selectedYear);
    populateAccountInformation();
  });
  $.getJSON('db/categories_list').always(function( data ) 
  {
    categoryData = data;

    // Sort by Name
    categoryData.sort(function(a, b) {
      var nameA=a.name.toLowerCase()
      var nameB=b.name.toLowerCase();
      if (nameA < nameB) //sort string ascending
       return -1;
      if (nameA > nameB)
       return 1;
      return 0; //default return value (no sorting)
    });

    populateCategoryTable()
  });
  
  
};

function populateTransactionTable(selectedMonth,selectedYear) {
  // Empty content string
  var tableContent = '';


  if(transactionsData.length === 0)
  {
    reloadData();
  }

  // For each item in our JSON, add a table row and cells to the content string
  $.each(transactionsData, function(){
    if (selectedMonth === new Date(parseInt(this.dateEntered)).getMonth() + 1
        && selectedYear === new Date(parseInt(this.dateEntered)).getFullYear() )
    {
      tableContent += '<tr>';
      tableContent += '<td><a href="#" class="linkshowtransaction" data-toggle="modal" data-target="#categoryModal" rel="' + this._id + '">';
      
      var totalAmount = 0.
      for (var i = 0; i < this.amount.length; i++)
      {
        totalAmount += parseFloat(this.amount[i].amount);
      }
      tableContent += totalAmount.toFixed(2) + '</a></td>';

      // Insert here booked? button code
      if(this.name != "Income" && this.name != "Correction" && this.bookingType != "Redemption")
      {
        tableContent += '<td class="transactionTableName">' + this.name + '</td>';
        tableContent += '<td>'
        if(this.dateBooked == null)
        {
          tableContent += '<button type="button" class="btn btn-warning buttonIsTransactionBooked" rel="' + this._id + '">No</button>';
        }
        else
        {
          tableContent += '<button type="button" class="btn btn-success buttonIsTransactionBooked" rel="' + this._id + '">Yes</button>';
        }
      }
      else
      {
        var nameDisplay = this.name;

        tableContent += '<td><div style="font-weight:bold;font-style:italic">' + nameDisplay;
        if (this.name === "Correction")
        {
          tableContent += "</div><div> (" + this.account +")";
        }
        else if (this.name == "Transfer")
        {
          tableContent += "</div><div> from " + this.account +" to " + this.targetAccount;
        }
        else if (this.bookingType == "Redemption")
        {
          tableContent += "</div><div> (Redemption)";
        }

        tableContent += '</div></td>';
        tableContent += '<td>'
        if (this.bookingType != "Redemption")
        {
          tableContent += '<button type="button" class="btn btn-outline-success">Yes</button>';
        }
        else
        {
          if(this.dateBooked == null)
          {
            tableContent += '<button type="button" class="btn btn-warning buttonIsTransactionBooked" rel="' + this._id + '">No</button>';
          }
          else
          {
            tableContent += '<button type="button" class="btn btn-success buttonIsTransactionBooked" rel="' + this._id + '">Yes</button>';
          }
        }
      }
    
      tableContent +='</td>';
      tableContent += '<td><a href="#" class="linkdeletetransaction" rel="' + this._id + '">delete</a></td>';
      tableContent += '</tr>';
    }
  });

  // Inject the whole content string into our existing HTML table
  $('#transactionList table tbody').html(tableContent);
  setButton_toggleTransactionListBookedStatus()
};

function populateCategoryTable() {

  var totalIncomeThisMonth = 0.0;
  for (var i = 0; i < transactionsData.length; i++)
  {
    // Da Redemptions immer eine Category haben, werden Sie beim unallozierten Geld nicht einbezogen
    if ((transactionsData[i].bookingType === "Income" || transactionsData[i].bookingType === "Correction" ) 
      && new Date(transactionsData[i].dateEntered).getMonth() + 1 == selectedMonth
      && new Date(transactionsData[i].dateEntered).getFullYear() == selectedYear)
    {
      // Some Income and Corrections have a specific category, those are thus allocated and do not need to be considered.
      if (transactionsData[i].amount[0].category == "Income" || transactionsData[i].amount[0].category == "Correction")
      {
        totalIncomeThisMonth += parseFloat(transactionsData[i].amount[0].amount);
      }
    }
  }
  // Das hier sollte die Menge an absolutem Income diesen Monat sein.
  $('#categoryToBeAllocatedMoney').html("<strong>Total Income this Month: </strong>"+ totalIncomeThisMonth.toFixed(2));


  ////
  ///
  /// Iterates all previous and current month
  var unallocatedAmount = 0.0;
  // 1. Find oldest Date in Transactions
  var oldestDateFound = new Date();
  for(var i=0; i < transactionsData.length; i++)
  {
    var thisDate = new Date(transactionsData[i].dateEntered);
    if (dates.compare(thisDate,oldestDateFound) === -1)
    {
      oldestDateFound = thisDate;
    }
  }
  for (var countYear = oldestDateFound.getFullYear(); countYear < selectedYear + 1; countYear++)
  {
    for (var countMonth = oldestDateFound.getMonth() + 1;
    countMonth < 13 && (countMonth <= selectedMonth || countYear != selectedYear);
    countMonth++)
    {
      for (var i = 0; i < transactionsData.length; i++)
      {
        // Da Redemptions immer eine Category haben, werden Sie beim unallozierten Geld nicht einbezogen
        if ((transactionsData[i].bookingType === "Income" || transactionsData[i].bookingType === "Correction" ) 
          && new Date(transactionsData[i].dateEntered).getMonth() + 1 == countMonth
          && new Date(transactionsData[i].dateEntered).getFullYear() == countYear)
        {
          // Some Income and Corrections have a specific category, those are thus allocated and do not need to be considered.
          if (transactionsData[i].amount[0].category == "Income" || transactionsData[i].amount[0].category == "Correction")
          {
            unallocatedAmount += parseFloat(transactionsData[i].amount[0].amount);
          }
        }
      }

        // Nun werden alle allozierungen abgezogen und damit errechnet, wie viel aktuell unalloziert sind.
      for (var i = 0; i < categoryData.length; i++)
      {
        var found = getIteratorFromAllocatedSinceReferenceArray(categoryData[i].allocatedSinceReference,countYear,countMonth);
        var allocatedThisMonth = 0.0;
        if (found != null)
        {
          allocatedThisMonth = categoryData[i].allocatedSinceReference[found].amount;
        }
        unallocatedAmount -= parseFloat(allocatedThisMonth);
      }
    }
  }
  $('#categoryUnallocatedMoney').html("<strong>Unallocated Amount: </strong>"+ unallocatedAmount.toFixed(2));
  ///
  //
  


  // Empty content string
  var tableContent = '';



  // For each item in our JSON, add a table row and cells to the content string
  $.each(categoryData, function(){
    tableContent += '<tr class="clickable-row">';

    tableContent += '<td><a href="#" class="linkshowcategory" rel="' + this._id + '">' + this.name + '</a></td>';
    
    // For every category:
      // Summiere transactionen bis selected Month / Year

      // Wir sind schon in einer each Schleife
        // Start with month of oldest date and then for every month
          // calculate total and move on to next month up to selected month

          // if selected Month is now, check if reference amount of category and date is fitting
          // if not, update
          
          // This.reference Amount = Last Total Amount
          // This Total Amount = reference + allocated + spending
          // reference in first month is always 0
  

    // Hier wird alles AUSSER dem aktuellen Monat durchgezählt
    var virtualCurrentMonthTotal = 0.0;
    var actualCurrentMonthTotal = 0.0;
    for (var countYear = oldestDateFound.getFullYear(); countYear < selectedYear + 1; countYear++)
    {
      for (var countMonth = oldestDateFound.getMonth() + 1;
      countMonth < 13 && (countMonth < selectedMonth || countYear != selectedYear);
      countMonth++)
      {
        var virtualSpendingThisMonth = 0.0;
        var actualSpendingThisMonth = 0.0;
        // For every Transaction
        for(var i=0; i < transactionsData.length; i++)
        {
          if(
              new Date(transactionsData[i].dateEntered).getMonth() + 1 == countMonth
              && new Date(transactionsData[i].dateEntered).getFullYear() == countYear
            )
          {
            // For every category in this transaction
            for(var j = 0; j < transactionsData[i].amount.length;j++)
            {
              // If category and selectedDate matches 
              if(transactionsData[i].amount[j].category === this.name)
              {
                if(transactionsData[i].bookingType === "Payment")
                {
                  if (transactionsData[i].dateBooked != null)
                  {
                    actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
                  }

                  // just add the amount.
                  virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
                }
                else if(transactionsData[i].bookingType === "Correction")
                {
                  actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);

                  // If just add the amount.
                  virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
                }
                else if(transactionsData[i].bookingType === "Income")
                {
                  actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
  
                  // If no systems, just add the amount.
                  virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
                }
              }
            }
          }
        }

        
        var found = getIteratorFromAllocatedSinceReferenceArray(this.allocatedSinceReference,countYear,countMonth);
        var allocatedThisMonth = 0.0;
        if (found != null)
        {
          allocatedThisMonth = this.allocatedSinceReference[found].amount;
        }

        virtualCurrentMonthTotal = parseFloat(virtualCurrentMonthTotal) + /**/ parseFloat(allocatedThisMonth) + virtualSpendingThisMonth;
        actualCurrentMonthTotal = parseFloat(actualCurrentMonthTotal) + /**/ parseFloat(allocatedThisMonth) + actualSpendingThisMonth;
      }
    }

    var amountSavedDisplayText = parseFloat(virtualCurrentMonthTotal).toFixed(2);
    if (parseFloat(virtualCurrentMonthTotal).toFixed(2) != parseFloat(actualCurrentMonthTotal).toFixed(2))  
    {
      amountSavedDisplayText += ' (<font color="orange">'+ parseFloat(actualCurrentMonthTotal).toFixed(2) + '</font>)';
    }  
    tableContent += '<td id="categoryAmountSaved">' + amountSavedDisplayText + '</td>';



    var found = getIteratorFromAllocatedSinceReferenceArray(this.allocatedSinceReference,selectedYear,selectedMonth);
    var allocatedThisMonth = 0.0;
    if (found != null)
    {
      allocatedThisMonth = this.allocatedSinceReference[found].amount;
    }
    tableContent += '<td><input type="text" class="m.1" rel="' + this._id + '" value="' + allocatedThisMonth + '" id="categoryAllocated">' + '</td>';



    // Hier wird der aktuelle Monat durchgezählt
    var virtualSpendingThisMonth = 0.0;   
    var actualSpendingThisMonth = 0.0;
    for(var i=0; i < transactionsData.length; i++)
    {
      for(var j = 0; j < transactionsData[i].amount.length;j++)
      {
        if(transactionsData[i].amount[j].category === this.name
          && new Date(transactionsData[i].dateEntered).getMonth() + 1 == selectedMonth
          && new Date(transactionsData[i].dateEntered).getFullYear() == selectedYear)
        {
          if (transactionsData[i].bookingType === "Payment")
          {
            if (transactionsData[i].dateBooked != null)
            {
              actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
            }

            virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
          }
          else if (transactionsData[i].bookingType === "Correction")
          {
            // Corrections are always applied immedeatly, they thus have no date by convention
            actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);

            virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
          }
          else if (transactionsData[i].bookingType === "Income")
          {
            // We exclude income that is unbooked and transactions that take place in the future
            // For the calculation of the actual money
            if (transactionsData[i].dateBooked != null )
            {
              actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
            }
            virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
          }
        }
      }
    }


    var amountSpentDisplayText = "";
    if (parseFloat(allocatedThisMonth) + parseFloat(virtualSpendingThisMonth) < 0.0)
    {
      amountSpentDisplayText += '<font color="red">'
    }
    amountSpentDisplayText += parseFloat(virtualSpendingThisMonth).toFixed(2);
    if (parseFloat(allocatedThisMonth) + parseFloat(virtualSpendingThisMonth) < 0.0)
    {
      amountSpentDisplayText += '</font>'
    }
    if (parseFloat(virtualSpendingThisMonth).toFixed(2) != parseFloat(actualSpendingThisMonth).toFixed(2))  
    {
      amountSpentDisplayText += ' (<font color="orange">'+ parseFloat(actualSpendingThisMonth).toFixed(2) + '</font>)';
    }  
    tableContent += '<td id="categorySpentThisMonth">' + amountSpentDisplayText + '</td>';



    tableContent += '<td id="categoryTotalAmount" >';
    tableContent += (parseFloat(virtualCurrentMonthTotal) + parseFloat(allocatedThisMonth) + virtualSpendingThisMonth).toFixed(2);
    if ((parseFloat(virtualCurrentMonthTotal) + parseFloat(virtualSpendingThisMonth)).toFixed(2) 
        != (parseFloat(actualCurrentMonthTotal) + parseFloat(actualSpendingThisMonth)).toFixed(2))  
    {
      tableContent += ' (<font color="orange">';
      tableContent += (parseFloat(actualCurrentMonthTotal) + parseFloat(allocatedThisMonth) + actualSpendingThisMonth).toFixed(2);
      tableContent += '</font>)';
    } 

    tableContent += '</td>';

    tableContent += '<td><a href="#" class="linkmodcategory" rel="' + this._id + '">' + "Modify" + '</a></td>';
    tableContent += '<td><a href="#" class="linkdeletecategory" rel="' + this._id + '">delete</a></td>';
    tableContent += '</tr>';
  });

  tableContent += '<tr id="summaryRow" class="table-success">'
  tableContent += '<td>Marked Rows</td>';
  for (var i = 0; i < 6; i++)
  {
    tableContent += '<td id="' + i.toString() + '"></td>'
  }
  tableContent += "</tr>";

  // Inject the whole content string into our existing HTML table
  $('#categoryDatabaseView table tbody').html(tableContent);

  $('#categoryDatabaseView table').off("click");
  $('#categoryDatabaseView table').on('click', '.clickable-row', function(event) {
    event.preventDefault();
    
    if($(this).hasClass('table-info'))
    {
      $(this).removeClass('table-info');
    }
    else
    {
      $(this).addClass('table-info');
    }

    var numberOfActiveElements = 0;
    $.each($('#categoryDatabaseView table .clickable-row'), function()
    {
      if($(this).hasClass('table-info'))
      {
        numberOfActiveElements = numberOfActiveElements + 1;
      }
    });

    if(numberOfActiveElements > 0)
    {
      $('#categoryDatabaseView table #summaryRow').css("display","");
      var saved = 0.0;
      var allocated = 0.0;
      var spentThisMonth= 0.0;
      var totalAmount = 0.0;
      $.each($('#categoryDatabaseView table .table-info'), function()
      {
        if($(this).hasClass('table-info'))
        {
          saved = parseFloat($($(this).find("#categoryAmountSaved")[0]).html());
          //allocated += parseFloat($(this.categoryAllocated));
          allocated += parseFloat($($(this).find("#categoryAllocated")[0]).val());
          
          spentThisMonth += parseFloat($($(this).find("#categorySpentThisMonth")[0]).html());
          totalAmount += parseFloat($($(this).find("#categoryTotalAmount")[0]).html());

        }
      });
      $("#categoryDatabaseView table #summaryRow #0").html(saved.toFixed(2));
      $("#categoryDatabaseView table #summaryRow #1").html(allocated.toFixed(2));
      $("#categoryDatabaseView table #summaryRow #2").html(spentThisMonth.toFixed(2));
      $("#categoryDatabaseView table #summaryRow #3").html(totalAmount.toFixed(2));

    }
    else
    {
      $("#categoryDatabaseView table #summaryRow #0").html("");
      $("#categoryDatabaseView table #summaryRow #1").html("");
      $("#categoryDatabaseView table #summaryRow #2").html("");
      $("#categoryDatabaseView table #summaryRow #3").html("");
      //$('#categoryDatabaseView table #summaryRow').css("display","none");
    }

  });


  $('#categoryDatabaseView table tbody input').off("blur");
  $('#categoryDatabaseView table tbody input').blur(function(event)
  {
    event.preventDefault();

    var thisID = $(this).attr('rel');

     // Get our User Object
    var thisUserObject = [];
    for (var i=0; i < categoryData.length; ++i)
    {
      if(categoryData[i]._id == thisID)
      {
        thisUserObject = categoryData[i];
        break;
      }
    }

    var allocatedSinceReferenceArray = thisUserObject.allocatedSinceReference;

    var found = getIteratorFromAllocatedSinceReferenceArray(allocatedSinceReferenceArray,selectedYear,selectedMonth);
    if (found != null)
    {
      allocatedSinceReferenceArray[found].amount = $(this).val();
    }
    else
    {
      if(Array.isArray(allocatedSinceReferenceArray))
      {
        allocatedSinceReferenceArray.push({"amount":$(this).val(),"year":selectedYear,"month":selectedMonth});
      }
      else
      {
        allocatedSinceReferenceArray = [];
        allocatedSinceReferenceArray.push({"amount":$(this).val(),"year":selectedYear,"month":selectedMonth});
      }
    }

    if(thisUserObject != [] && $(this).val() != thisUserObject.val)
    {
      var category = {
        'name': thisUserObject.name,
        'systems': thisUserObject.systems,
        "referenceDate" : thisUserObject.referenceDate,
        "referenceAmount" : thisUserObject.referenceAmount,
        "associatedTransactions" : thisUserObject.associatedTransactions,
        "allocatedSinceReference" : allocatedSinceReferenceArray
      }

      $.ajax({
        type: 'POST',
        data: { "data" : JSON.stringify(category) },
        url: '/db/categories_add',
        dataType: 'json'
      }).done(function( response ) {

        // Check for successful (blank) response
        if (response.msg === '') {


        }
        else {

          // If something goes wrong, alert the error message that our service returned
          alert('Error: ' + response.msg);

        }
      });

      // Delete old entry
      $.ajax({
        type: 'DELETE',
        url: '/db/categories_delete/' + thisID
      }).done(function( response ) {
        // Check for a successful (blank) response
        if (response.msg === '') {
          reloadData();
          populateCategoryTable();
        }
        else {
          alert('Error: ' + response.msg);
        }
      });
    }
  
  

  });
};

function populateAccountInformation() 
{
  var tableContent = '';
  foundAccounts = [];

  // For each item in our JSON, add a table row and cells to the content string
  $.each($(transactionsData), function(){
    var found = -1;
    for (var i = 0; i < foundAccounts.length; i++)
    {
      if(foundAccounts[i].name === this.account)
      {
        found = i;
        break;
      }
    }
    if(found != -1)
    {
      var totalAmountVirtual = getTotalCostsFromTransaction(this);
      var totalAmount = this.dateBooked != null ? getTotalCostsFromTransaction(this) : 0.0;
      if (this.bookingType === "Transfer")
      {
        foundAccounts[found].totalCurrent -= totalAmount;
        foundAccounts[found].totalVirtual -= totalAmountVirtual;
        var found2 = -1;
        for (var j = 0; j < foundAccounts.length; j++)
        {
          if(foundAccounts[j].name === this.targetAccount)
          {
            found2 = j;
            break;
          }
        }
        if(found2 != -1)
        {
          foundAccounts[found2].totalCurrent += totalAmount;
          foundAccounts[found2].totalVirtual += totalAmountVirtual;
        }
        else
        {
          foundAccounts.push({"name" : this.targetAccount, "totalCurrent" : totalAmount, "totalVirtual" : totalAmountVirtual});
        }
      }
      else
      {
        foundAccounts[found].totalCurrent += totalAmount;
        foundAccounts[found].totalVirtual += totalAmountVirtual;
      }
    }
    else
    {
      var totalAmountVirtual = getTotalCostsFromTransaction(this);
      var totalAmount = this.dateBooked != null ? getTotalCostsFromTransaction(this) : 0.0;
      foundAccounts.push({"name" : this.account, "totalCurrent" : totalAmount, "totalVirtual" : totalAmountVirtual});
    }
  });
  
  var sumCurrent = 0.0;
  var sumVirtual = 0.0;
  for (var i = 0; i < foundAccounts.length; ++i)
  {
    tableContent += '<tr class="w-auto pauto">';
    tableContent += '<td>' + foundAccounts[i].name + '</td>';
    tableContent += '<td>' + foundAccounts[i].totalCurrent.toFixed(2) + '</td>';
    sumCurrent += foundAccounts[i].totalCurrent;
    tableContent += '<td>' + foundAccounts[i].totalVirtual.toFixed(2) + '</td>';
    sumVirtual += foundAccounts[i].totalVirtual;
  }
  tableContent += '<tr class="w-auto pauto">';
  tableContent += '<td>' + "Summed" + '</td>';
  tableContent += '<td>' + sumCurrent.toFixed(2) + '</td>';
  tableContent += '<td>' + sumVirtual.toFixed(2);
  if(sumCurrent < sumVirtual)
  {
    tableContent += '  (Deficiency: '+ (sumVirtual - sumCurrent).toFixed(2) + ')</td>';
  }
  else if (sumCurrent > sumVirtual)
  {
    tableContent += '  (Surplus: '+ (sumCurrent - sumVirtual).toFixed(2) + ')</td>';
  }
  else
  {
    tableContent += '</td>';
  }
  

  tableContent += '</tr>';

  accountData = foundAccounts;
  $('#accountOverview table tbody').html(tableContent);
  
};


function prepareButtonsAddingTransaction() {
  $( "#datepicker" ).datepicker({
    dateFormat: "yy-mm-dd"
  });

  // Set starting Date 
  if (lastPickedDateInSession != null)
  {
    $("#datepicker").val($.datepicker.formatDate( "yy-mm-dd", new Date(lastPickedDateInSession)));
  }
  else
  {
    $("#datepicker").val($.datepicker.formatDate( "yy-mm-dd", new Date() ));
  }
  


  if ($("#inputCategoryPayment1Button").parent().find(".dropdown-menu").children().length == 0)
  {
    // Extra None Entry:
    var dropdownEntryNone = $(document.createElement('a'));
    dropdownEntryNone.attr("class", "dropdown-item dropdown-item-categorySelection");
    dropdownEntryNone.attr("href", "#");
    dropdownEntryNone.html("None");
    dropdownEntryNone.appendTo($("#inputCategoryIncomeButton").parent().find(".dropdown-menu"));
    dropdownEntryNone.clone().appendTo($("#inputCategoryCorrectionButton").parent().find(".dropdown-menu"));
    //
    for (var i = 0; i < categoryData.length; ++i)
    {
      var dropdownEntry = $(document.createElement('a'));
      dropdownEntry.attr("class", "dropdown-item dropdown-item-categorySelection");
      dropdownEntry.attr("href", "#");
      dropdownEntry.html(categoryData[i].name);
      dropdownEntry.appendTo($("#inputCategoryPayment1Button").parent().find(".dropdown-menu"));
      dropdownEntry.clone().appendTo($("#inputCategoryPayment2Button").parent().find(".dropdown-menu"));
      dropdownEntry.clone().appendTo($("#inputCategoryPayment3Button").parent().find(".dropdown-menu"));
      dropdownEntry.clone().appendTo($("#inputCategoryPayment4Button").parent().find(".dropdown-menu"));

      dropdownEntry.clone().appendTo($("#inputCategoryIncomeButton").parent().find(".dropdown-menu"));
      dropdownEntry.clone().appendTo($("#inputCategoryCorrectionButton").parent().find(".dropdown-menu"));
    }
  }

  $('.insertTransactionButtonToggleBooked').off("click");
  $('.insertTransactionButtonToggleBooked').on("click", function()
  {
    if($.trim($(this).html()) == "Booked")
    {
      $(this).html("Not Booked");
      $(this).removeClass("btn-success");
      $(this).addClass("btn-warning");
    }
    else
    {
      $(this).html("Booked");
      $(this).removeClass("btn-warning");
      $(this).addClass("btn-success");
    }
  });

  $('#addTransactionButton').off("click");
  $('#addTransactionButton').on("click",function(event)
  {
    event.preventDefault();

    var currentTransactionKind = null
    var currentTransactionDivName = null
    if($('#addTransaction #payment').attr("style") != "display:none")
    {
      currentTransactionKind = "Payment";
      currentTransactionDivName = "#payment";
    } else if ($('#addTransaction #income').attr("style") != "display:none") 
    {
      currentTransactionKind = "Income";
      currentTransactionDivName = "#income";
    } else if ($('#addTransaction #transfer').attr("style") != "display:none")
    {
      currentTransactionKind = "Transfer";
      currentTransactionDivName = "#transfer";
    } else if ($('#addTransaction #correction').attr("style") != "display:none")
    {
      currentTransactionKind = "Correction";
      currentTransactionDivName= "#correction";
    }

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorSubmission = false;
    if (currentTransactionKind == "Payment" || currentTransactionKind == "Income")
    {
      if(
        $('#addTransaction '+ currentTransactionDivName +' .inputName').val() == "" 
        || $('#addTransaction '+ "#general" +' .inputAccount').val() == "" 
        || $('#addTransaction '+ currentTransactionDivName +' #inputAmount1').val() == "" 
        || $('#addTransaction '+ currentTransactionDivName +' .category1Button').html() == "" 
      )
      {
        errorSubmission = true
      }
    }
    else if (currentTransactionKind == "Transfer")
    {
      if(
          $('#addTransaction '+ "#general" +' .inputAccount').val() == "" 
        || $('#addTransaction '+ currentTransactionDivName +' #inputAmount1').val() == "" 
        || $('#addTransaction '+ currentTransactionDivName +' .targetAccount').val() == "" 
      )
      {
        errorSubmission = true
      }
    }
    else if (currentTransactionKind == "Correction")
    {
      if(
          $('#addTransaction '+ "#general" +' .inputAccount').val() == "" 
        || $('#addTransaction '+ currentTransactionDivName +' #inputAmount1').val() == "" 
      )
      {
        errorSubmission = true
      }
      var foundMatchingAccount = -1;
      for (var i = 0; i < accountData.length; ++i)
      {
        if(accountData[i].name === $('#addTransaction #general .inputAccount').val())
        {
          foundMatchingAccount = i;
          break;
        }
      }
      if (foundMatchingAccount == -1)
      {
        errorSubmission = true
      }
    }
    else
    {
      errorSubmission = true
    }

    if(currentTransactionKind == "Payment"
      || (currentTransactionKind == "Income" && $("#inputCategoryIncomeButton").html() != "None" && $("#inputCategoryIncomeButton").html() != "Pick Category (optional)")
      || (currentTransactionKind == "Correction" && $("#inputCategoryCorrectionButton").html() != "None" && $("#inputCategoryCorrectionButton").html() != "Pick Category (optional)")
      )
    {
      var foundCategory = false;
      for (var i = 0; i < categoryData.length; ++i)
      {
        if(categoryData[i].name === $('#addTransaction '+ currentTransactionDivName +' .category1Button').html())
        {
          foundCategory = true;
          break;
        }
      }
      if(!foundCategory)
      {
        errorSubmission = true;
      }
    }

    // Check and make sure errorCount's still at zero
    if(! errorSubmission) {
  
      // Set our Object that keeps track of the last entered Date for the current session:
      lastPickedDateInSession = new Date($.datepicker.parseDate( "yy-mm-dd",$('#datepicker').val())).getTime();

      // If it is, compile all user info into one object
      var newTransaction = {
        'name': $('#addTransaction ' + currentTransactionDivName + ' .inputName').val(),
        'account': $('#addTransaction ' + "#general" + ' .inputAccount').val(),
        'bookingType': currentTransactionKind,
        'dateEntered': new Date($.datepicker.parseDate( "yy-mm-dd",$('#general #datepicker').val())).getTime(),
        'dateBooked': $.trim($('#addTransaction ' + currentTransactionDivName + ' .insertTransactionButtonToggleBooked').html()) === "Booked" ? Date.now() : null,
        'amount' : [
          {
            "category" : $('#addTransaction ' + currentTransactionDivName + ' .category1Button').html(),
            "amount" : (parseFloat($('#addTransaction ' + currentTransactionDivName + ' #inputAmount1').val()) * -1.0).toString()
          }
        ]
      }
      if(currentTransactionKind == "Income" && ($("#inputCategoryIncomeButton").html() == "None" || $("#inputCategoryIncomeButton").html() == "Pick Category (optional)"))
      {
        newTransaction.amount[0].category = "Income"
      }
      else if (currentTransactionKind == "Transfer")
      {
        newTransaction.name = "Transfer"
        newTransaction.amount[0].category = "Transfer"
      }
      else if (currentTransactionKind == "Correction")
      {
        var foundMatchingAccount = -1;
        for (var i = 0; i < accountData.length; ++i)
        {
          if(accountData[i].name === $('#addTransaction #general .inputAccount').val())
          {
            foundMatchingAccount = i;
            break;
          }
        }
        var debug = parseFloat($('#addTransaction #correction .inputAmount').val());
        var correctionAmount = (parseFloat($('#addTransaction #correction .inputAmount').val()) - parseFloat(accountData[foundMatchingAccount].totalCurrent))
        newTransaction.dateBooked = new Date().getTime();
        newTransaction.name = "Correction";
        if (($("#inputCategoryCorrectionButton").html() == "None" || $("#inputCategoryCorrectionButton").html() == "Pick Category (optional)"))
        {
          newTransaction.amount[0].category = "Correction"
        }
        newTransaction.amount[0].amount = correctionAmount;
      }
      else if (currentTransactionKind == "Payment")
      {
        for (var i = 0; i < 2; ++i)
        {
          if($('#addTransaction ' + currentTransactionDivName + ' #inputCategoryPayment' + (i+2).toString() + "Button").html()  != "Pick Category " + (i+2).toString() && $('#addTransaction ' + currentTransactionDivName + ' #inputAmount'+ (i+2).toString()).val() != "")
          {
            newTransaction.amount.push(
              {
                "category": $('#addTransaction ' + currentTransactionDivName + ' #inputCategoryPayment'+ (i+2).toString() + "Button").html() ,
                "amount" : (parseFloat($('#addTransaction ' + currentTransactionDivName + ' #inputAmount'+ (i+2).toString()).val()) * -1.0).toString()
              });
          }
        }
      }
  
      // Use AJAX to post the object to our adduser service
      $.ajax({
        type: 'POST',
        data: {data : JSON.stringify(newTransaction) },
        url: '/db/transactions_add',
        dataType: 'JSON'
      }).done(function( response ) {
  
        // Check for successful (blank) response
        if (response.msg === '') {
          // alert('Done');
          // Clear the form inputs
          $('#addTransaction ' + currentTransactionDivName + ' input').val('');

          // Here we could optimize by not reloading thw hole database but keeping track ourselves
          reloadData();
          $('#DisplayDB').click();
        }
        else {
  
          // If something goes wrong, alert the error message that our service returned
          alert('Error: ' + response.msg);
  
        }
      });

      
    }
    else 
	  {
      // If errorCount is more than 0, error out
      alert('Error occurred. Data is incomplete.');
    }
  });

  $('#addTransaction #payment .inputAmount').keyup(function () {
    var summedVal = 0.0;
    $('#addTransaction #payment .inputAmount').each(function(i,obj)
    {
      if(parseFloat(obj.value) != NaN && obj.value != "")
      {
        summedVal = summedVal + parseFloat(obj.value);
      }
    });
    $('#addTransaction #payment #summedAmounts').html("Summed Amount: " + summedVal.toFixed(2));

  });


  $('.dropdown-item-paymentTypeSelection').off("click");
  $('.dropdown-item-paymentTypeSelection').on('click', function(event)
  {
    $(this).parent().parent().find(".dropdown-toggle").html($(this).html());
    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel ibute
    var thisID = $(this).html();
    $("#addTransaction #general").attr("style","display:block");
	  if (thisID === "Payment")
	  {
      if($("#addTransaction #payment").attr("style") == "display:block")
      {
        $('#addTransaction ' + "#payment" + ' input').val('');
      }
      else
      {
        $("#addTransaction #general #inputAmount1").attr("placeholder","Amount 1");
	      $("#addTransaction #payment").attr("style","display:block");
	      $("#addTransaction #income").attr("style","display:none");
	      $("#addTransaction #transfer").attr("style","display:none");
        $("#addTransaction #correction").attr("style","display:none");
        $("#addTransaction #general #inputAccount").attr("placeholder","Account");
      }
    }
    else if (thisID === "Income")
	  {
      if($("#addTransaction #income").attr("style") == "display:block")
      {
        $('#addTransaction ' + "#income" + ' input').val('');
      }
      else
      {
        $("#addTransaction #general #inputAmount1").attr("placeholder","Amount");
	      $("#addTransaction #income").attr("style","display:block");
	      $("#addTransaction #payment").attr("style","display:none");
	      $("#addTransaction #transfer").attr("style","display:none");
        $("#addTransaction #correction").attr("style","display:none");
        $("#addTransaction #general #inputAccount").attr("placeholder","Account");
      }
    }
    else if (thisID === "Transfer")
	  {
      if($("#addTransaction #transfer").attr("style") == "display:block")
      {
        $('#addTransaction ' + "#transfer" + ' input').val('');
      }
      else
      {
        $("#addTransaction #general #inputAmount1").attr("placeholder","Amount");
        $("#addTransaction #general #inputAccount").attr("placeholder","From Account");
	      $("#addTransaction #transfer").attr("style","display:block");
	      $("#addTransaction #payment").attr("style","display:none");
	      $("#addTransaction #income").attr("style","display:none");
        $("#addTransaction #correction").attr("style","display:none");
      }
    }
    else if (thisID === "Correction")
	  {
      if($("#addTransaction #correction").attr("style") == "display:block")
      {
        $('#addTransaction ' + "#correction" + ' input').val('');
      }
      else
      {
        $("#addTransaction #general #inputAmount1").attr("placeholder","Target Amount");
        $("#addTransaction #general #inputAccount").attr("placeholder","Account");
	      $("#addTransaction #correction").attr("style","display:block");
	      $("#addTransaction #payment").attr("style","display:none");
	      $("#addTransaction #income").attr("style","display:none");
        $("#addTransaction #transfer").attr("style","display:none");
      }
	  }
  })
  
  $('.dropdown-item-categorySelection').off("click");
  $('.dropdown-item-categorySelection').on('click', function(event)
  {
    // Prevent Link from Firing
    event.preventDefault();

    $(this).parent().parent().find(".dropdown-toggle").html($(this).html());
  })
};

// Show User Info
function showTransactionInfo(event) {

  // Prevent Link from Firing
  event.preventDefault();

  // Retrieve username from link rel ibute
  var thisID = $(this).attr('rel');
  
  // Get our User Object
  var thisUserObject = [];
  for (var i=0; i < transactionsData.length; ++i)
  {
    if(transactionsData[i]._id == thisID)
    {
      thisUserObject = transactionsData[i];
      break;
    }
  }

  //perform error checking here.

  $("#transactionList table tbody tr").each(function(i,obj)
  {
    if(thisID === $(obj).find("td")[0].childNodes[0].rel)
    {
      var thisUserObject = transactionsData[i];
      var newHTML = '<br><div id="transactionDetails" style="display:block">'
      newHTML += "<strong>Name: </strong>";
      newHTML += thisUserObject.name;
      newHTML += "<br>"
      newHTML += "<strong>Date Entered: </strong>";
      newHTML += new Date(parseInt(thisUserObject.dateEntered)).toISOString().substring(0, 10);
      newHTML += "<br>"
      newHTML += "<strong>Date Booked: </strong>";
      newHTML += /**/thisUserObject.dateBooked === null ? "Not booked" : ( new Date(parseInt(thisUserObject.dateEntered)).toISOString().substring(0, 10) )/**/;
      newHTML += "<br>";
      newHTML += "<strong>Account: </strong>";
      newHTML += thisUserObject.account;
      newHTML += "<br>"
      newHTML += "<strong>Booking Type: </strong>";
      newHTML += thisUserObject.bookingType;
      newHTML += "<br>"
      if(thisUserObject.bookingType == "Transfer")
      {
        newHTML += "<strong>Target Account: </strong>";
        newHTML += thisUserObject.targetAccount;
        newHTML += "<br>"
      }
      var totalAmount = 0.0;
      var categoriesString = "";
      for (var i=0; i < thisUserObject.amount.length; ++i)
      {
        totalAmount = totalAmount + parseFloat(thisUserObject.amount[i].amount);
        categoriesString += '<div style="padding-left:5em">' + thisUserObject.amount[i].category.toString() + ": " + parseFloat(thisUserObject.amount[i].amount).toFixed(2) + "</div>";
      }
      newHTML += categoriesString;
      newHTML += "<strong>Total Amount: </strong>";
      newHTML += totalAmount.toFixed(2);
      newHTML += "<br></div>";
      if($(obj).find(".transactionTableName #transactionDetails").exists())
      {
        if($(obj).find(".transactionTableName #transactionDetails").attr("style") === "display:none")
        {
          $(obj).find(".transactionTableName #transactionDetails").attr("style","display:block")
        }
        else
        {
          $(obj).find(".transactionTableName #transactionDetails").attr("style","display:none");
        }
      }
      else
      {
        $(obj).find(".transactionTableName").html($(obj).find(".transactionTableName").html() + newHTML);
      }
    }
  })
};

function showCategoryInfo(event) {

  $('#categoriesInfo').attr("style","display:block");
  // Prevent Link from Firing
  event.preventDefault();

  // Retrieve username from link rel ibute
  var thisID = $(this).attr('rel');
  
  // Get our User Object
  var thisUserObject = [];
  for (var i=0; i < categoryData.length; ++i)
  {
    if(categoryData[i]._id == thisID)
    {
      thisUserObject = categoryData[i];
      break;
    }
  }

  if(thisUserObject != [])
  {
    //Populate Info Box
    $('#categoriesInfo #categoryInfoName').html("<strong>Name: </strong>" + thisUserObject.name);
    $('#categoriesInfo #categoryInfoReferenceDate').html("<strong>Reference Date: </strong>" + new Date(parseInt(thisUserObject.referenceDate)).toISOString().substring(0, 10));
    $('#categoriesInfo #categoryInfoReferenceAmount').html("<strong>Reference Amount: </strong>" + thisUserObject.referenceAmount);

    if (getIteratorFromAllocatedSinceReferenceArray(thisUserObject.allocatedSinceReference,selectedYear,selectedMonth) != null)
    {
      $('#categoriesInfo #categoryInfoAllocatedSinceReference').html("<strong>AllocatedSinceReference: </strong>" +
        thisUserObject.allocatedSinceReference[getIteratorFromAllocatedSinceReferenceArray(thisUserObject.allocatedSinceReference,selectedYear,selectedMonth)].amount);
    }
    else
    {
      $('#categoriesInfo #categoryInfoAllocatedSinceReference').html("<strong>AllocatedSinceReference: </strong>0");
    }
    var htmlContent = "";
    for (var i=0; i < transactionsData.length; ++i)
    {
      for(var j = 0; j < transactionsData[i].amount.length;j++)
      {
        if(transactionsData[i].amount[j].category === thisUserObject.name
          && new Date(transactionsData[i].dateEntered).getMonth() + 1 == selectedMonth
          && new Date(transactionsData[i].dateEntered).getFullYear() == selectedYear)
        {
          var tableContent = '<tr>';
          tableContent += '<td>'+ transactionsData[i].name +'</td>';
          tableContent += '<td>'+ $.datepicker.formatDate( "yy-mm-dd", new Date(transactionsData[i].dateEntered)) +'</td>';
          if(transactionsData[i].dateBooked != null)
          {
            tableContent += '<td>'+ "Booked" +'</td>';
          }
          else
          {
            tableContent += '<td>'+ "Not Booked" +'</td>';
          }
          tableContent += '<td>'+ transactionsData[i].account +'</td>';
          tableContent += '<td>'+ parseFloat(transactionsData[i].amount[j].amount).toFixed(2) +'</td>';
          tableContent +='</tr>';
          htmlContent += tableContent;
        }
      }
    }
    $("#categoryInfoTransactions table tbody").html(htmlContent);

  }
};

function showCategoryInfoModal(event) {

  // Prevent Link from Firing
  //event.preventDefault();

  // Retrieve username from link rel ibute
  var thisID = $(this).attr('rel');
  
  // Get our User Object
  var thisUserObject = [];
  for (var i=0; i < categoryData.length; ++i)
  {
    if(categoryData[i]._id == thisID)
    {
      thisUserObject = categoryData[i];
      break;
    }
  }

  if(thisUserObject != [])
  {
    $(".modal-body #categoryInfoTransactions").parent().find("table").attr("style","display:block");

    $("#categoryModalTitle").html(thisUserObject.name);

    //Populate Info Box
    var htmlString = "";
    htmlString += "<div><strong>Name: </strong>" + thisUserObject.name;

    htmlString += "</div><div><strong>Reference Date: </strong>" + new Date(parseInt(thisUserObject.referenceDate)).toISOString().substring(0, 10);
    htmlString += "</div><div><strong>Reference Amount: </strong>" + thisUserObject.referenceAmount;

    if (getIteratorFromAllocatedSinceReferenceArray(thisUserObject.allocatedSinceReference,selectedYear,selectedMonth) != null)
    {
      htmlString += "</div><div><strong>AllocatedSinceReference: </strong>" +
        thisUserObject.allocatedSinceReference[getIteratorFromAllocatedSinceReferenceArray(thisUserObject.allocatedSinceReference,selectedYear,selectedMonth)].amount;
    }
    else
    {
      htmlString += "</div><div><strong>AllocatedSinceReference: </strong>0";
    }
    var whereToInsert = $(".modal-body #categoryInfoTransactions");
    
    // Debug Display disabled
    //whereToInsert.html(htmlString);

    var htmlContent = "";
    var countEntries = 0;
    for (var i=0; i < transactionsData.length; ++i)
    {
      for(var j = 0; j < transactionsData[i].amount.length;j++)
      {
        if(transactionsData[i].amount[j].category === thisUserObject.name
          && new Date(transactionsData[i].dateEntered).getMonth() + 1 == selectedMonth
          && new Date(transactionsData[i].dateEntered).getFullYear() == selectedYear)
        {
          var tableContent = '<tr>';
          tableContent += '<td>'+ transactionsData[i].name +'</td>';
          tableContent += '<td>'+ $.datepicker.formatDate( "yy-mm-dd", new Date(transactionsData[i].dateEntered)) +'</td>';
          if(transactionsData[i].dateBooked != null)
          {
            tableContent += '<td>'+ "Booked" +'</td>';
          }
          else
          {
            tableContent += '<td>'+ "Not Booked" +'</td>';
          }
          tableContent += '<td>'+ transactionsData[i].account +'</td>';
          tableContent += '<td>'+ parseFloat(transactionsData[i].amount[j].amount).toFixed(2) +'</td>';
          tableContent +='</tr>';
          htmlContent += tableContent;

          countEntries++;
        }
      }
    }
    whereToInsert = $(".modal-body #categoryInfoTransactions").parent().find("table tbody");
    whereToInsert.html(htmlContent);

    if(countEntries === 0)
    {
      $(".modal-body #categoryInfoTransactions").html("No transactions this month.")
      $(".modal-body #categoryInfoTransactions").parent().find("table").attr("style","display:none")
    }
    $('#categoryModal').modal();
  }
  
};

function modifyCategory(event)
{
  // Prevent Link from Firing
  event.preventDefault();

  $('#addCategoryButton').css("display", "none");

  // Retrieve username from link rel ibute
  var thisID = $(this).attr('rel');
  $('#modifyCategoryID').val(thisID);
  
  // Get our User Object
  var thisUserObject = null;
  for (var i=0; i < categoryData.length; ++i)
  {
    if(categoryData[i]._id == thisID)
    {
      thisUserObject = categoryData[i];
      break;
    }
  }

  //perform error checking here.

  if(thisUserObject != null)
  {
    //Populate Info Box
    $('#modifyDatabaseEntryCategory #changeCategoryName').val(thisUserObject.name);
  }
  else
  {
    alert("Something went deeply wrong.")
  }
  $('#modifyDatabaseEntryCategory').attr("style","display:block");

  $('#modifyDatabaseEntryCategory #changeCategoryButton').off("click");
  $('#modifyDatabaseEntryCategory #changeCategoryButton').on("click",function(event)
  {
    // Retrieve username from link rel ibute
    var thisID = $('#modifyCategoryID').val();
    
    // Get our User Object
    var thisUserObject = null;
    for (var i=0; i < categoryData.length; ++i)
    {
      if(categoryData[i]._id == thisID)
      {
        thisUserObject = categoryData[i];
        break;
      }
    }
  
    //perform error checking here.
  
    if(thisUserObject != null)
    {
      event.preventDefault();


      // If it is, compile all user info into one object
      var newTransaction = {
        'name': $('#modifyDatabaseEntryCategory input#changeCategoryName').val(),
        'systems': null,
        "referenceDate" : thisUserObject.referenceDate,
        "referenceAmount" : thisUserObject.referenceAmount,
        "associatedTransactions" : thisUserObject.associatedTransactions,
        "allocatedSinceReference" : thisUserObject.allocatedSinceReference
      }

      // Use AJAX to post the object to our adduser service
      $.ajax({
        type: 'POST',
        data: { "data" : JSON.stringify(newTransaction) },
        url: '/db/categories_add',
        dataType: 'json'
      }).done(function( response ) {
    
        // Check for successful (blank) response
        if (response.msg === '') {
    
          // Clear the form inputs
          $('#modifyDatabaseEntryCategory input').val('');


        }
        else {
    
          // If something goes wrong, alert the error message that our service returned
          alert('Error: ' + response.msg);
    
        }
      });

      // Delete old entry
      $.ajax({
        type: 'DELETE',
        url: '/db/categories_delete/' + thisID
      }).done(function( response ) {
        // Check for a successful (blank) response
        if (response.msg === '') {
          reloadData();
        }
        else {
          alert('Error: ' + response.msg);
        }
      });
    }

    // Update the table
    reloadData();
    populateCategoryTable();
    $('#modifyDatabaseEntryCategory').attr("style","display:none");
    $('#addCategoryButton').css("display", "block");
  });
  $('#modifyDatabaseEntryCategory #cancelChangeCategoryButton').off("click");
  $('#modifyDatabaseEntryCategory #cancelChangeCategoryButton').on("click",function(event)
  {
    $('#addCategoryButton').css("display", "block");
    $('#modifyDatabaseEntryCategory input').val('');
    $('#modifyDatabaseEntryCategory').attr("style","display:none");
  });
};

// Delete transaction
function deleteTransaction(event) {

  event.preventDefault();

  // Pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to delete this transaction?');

  // Check and make sure the user confirmed
  if (confirmation === true) {

    // If they did, do our delete
    $.ajax({
      type: 'DELETE',
      url: '/db/transactions_delete/' + $(this).attr('rel')
    }).done(function( response ) {

      // Check for a successful (blank) response
      if (response.msg != '') 
      {
        alert('Error: ' + response.msg);
      }

      // Update the table
      reloadData();

    });

  }
  else {

    // If they said no to the confirm, do nothing
  }
};

function onNavigationChange()
{
  $("#addRedemptionPaymentForm").css("display","none");
  $('#modifyDatabaseEntryCategory').attr("style","display:none");
  $('#categoriesInfo').attr("style","display:none");
};


