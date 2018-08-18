// Userlist data array for filling in info box
var transactionsData = [];
var categoryData = [];
var accountData = [];

var selectedMonth = new Date().getMonth() + 1;
var selectedYear = new Date().getFullYear();
var lastPickedDateInSession = null;

// Stuff we use:
// ".buttonIsTransactionBooked"
// -> Has element "rel" which is ID
// -> Should ID always be rel?
// ".datepicker"
// ".dropdown-item-paymentTypeSelection"



// This is most likely obsolete:
//$( function() {
//  $( "" ).datepicker(); 
//} );

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
    populateCashingUpTable();
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
    populateCashingUpTable();
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
    $('#cashingUpView').css("display", "none");

    $('#transactionList table tbody').off('click');
    $('#transactionList table tbody').on('click', 'td a.linkshowtransaction', showTransactionInfo);
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
    $('#cashingUpView').css("display", "none");
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
    $('#cashingUpView').css("display", "none");

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

    $('#categoryDatabaseView table tbody').on('click', 'td a.linkshowcategory', showCategoryInfo);
    $('#categoryDatabaseView table tbody').on('click', 'td a.linkmodcategory', modifyCategory);
  });

  // CASHING-UP
  $('#navigation').on('click', 'div.btn-class > button ,#DisplayCashing-Up', function()
  {
    onNavigationChange()
    populateCashingUpTable();

    
    $('#cashingUpBookedButton').off("click");
    $('#cashingUpBookedButton').on("click", function()
    {
      if($(this).html() != "Booked")
      {
        $(this).html("Booked");
        $(this).removeClass("btn-warning");
        $(this).addClass("btn-success");
      }
      else
      {
        $(this).html("Not Booked");
        $(this).removeClass("btn-success");
        $(this).addClass("btn-warning");
      }
    });


    $('#cashingUpButtonAdd').off("click");
    $('#cashingUpButtonAdd').on('click', function()
    {
      // Super basic validation - increase errorCount variable if any fields are blank
      var errorSubmission = false;
      if(
        $('#addRedemptionView input#cashingUpInputDebitor').val() == "" 
        || $('#addRedemptionView input#cashingUpInputCategory').val() == "" 
        || $('#addRedemptionView input#cashingUpInputAmount').val() == "" 
        || $('#addRedemptionView input#cashingUpBookedButton').val() == "" 
      )
      {
        errorSubmission = true
      }

  
      // Check and make sure errorCount's still at zero
      if(! errorSubmission) 
      {
        // If it is, compile all user info into one object
        var newTransaction = {
          'name': $('#addRedemptionView input#cashingUpInputDebitor').val(),
          'account': $('#addRedemptionView input#cashingUpInputAccount').val(),
          'bookingType': "Redemption",
          'dateEntered': (new Date()).setFullYear(parseInt(selectedYear),parseInt(selectedMonth),0),
          'dateBooked': $('#addRedemptionView button#cashingUpBookedButton').html() === "Booked" ? Date.now() : null,
          'amount' : [
            {
              "category" : $('#addRedemptionPaymentForm input#cashingUpInputCategory').val(),
              "amount" : (parseFloat($('#addRedemptionView input#cashingUpInputAmount').val())).toString(),
              "originalDebitorAmount" : (parseFloat($('#addRedemptionView input#cashingUpInputOriginalDebitorAmount').val())).toString(),
            }
          ]
        };
              // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: {data : JSON.stringify(newTransaction) },
            url: '/db/transactions_add',
            dataType: 'JSON'
        }).done(function( response ) {
      
            // Check for successful (blank) response
            if (response.msg === '') {
              //alert('Done');
              // Clear the form inputs
              $('#addRedemptionView input').val('');
              $("#addRedemptionPaymentForm").css("display","none");
              reloadData();
              $('#DisplayDB').click();
            }
            else {
              // If something goes wrong, alert the error message that our service returned
              alert('Error: ' + response.msg);
            }
        });
      }
      else {
        // If errorCount is more than 0, error out
        alert('Error occurred.');
      }    
    });


    $('#cashingUpButtonCancel').off('click');
    $('#cashingUpButtonCancel').on('click', function()
    {
      $('#addRedemptionView input').val('');
      $("#addRedemptionPaymentForm").css("display","none");
    });




    onNavigationChange()
    $('#databaseView').css("display", "none");
    $('#addTransactionView').css("display", "none");
    $('#categoriesView').css("display", "none");
    $('#cashingUpView').css("display", "block");
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
      var ID = $(this).('rel');
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
          url: '/db/transactions_modify/' + $(this).('rel'),
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
    url: '/db/categories_delete/' + $(this).('rel')
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
      tableContent += '<td><a href="#" class="linkshowtransaction" rel="' + this._id + '">';
      
      var totalAmount = 0.
      for (var i = 0; i < this.amount.length; i++)
      {
        totalAmount += parseFloat(this.amount[i].amount);
      }
      tableContent += totalAmount.toFixed(2) + '</a></td>';

      // Insert here booked? button code
      if(this.name != "Income" && this.name != "Correction" && this.bookingType != "Redemption")
      {
        tableContent += '<td>' + this.name + '</td>';
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

function populateCashingUpTable() 
{
  if(categoryData.length === 0)
  {
    reloadData();
  }
  if(transactionsData.length === 0)
  {
    reloadData();
  }

  foundDebitorsPlusCategories = []

  $.each(categoryData, function(){
    // Find unqiue debitors
    var found = -1;
    if (this.systems != null)
    {
      for (var j = 0; j < this.systems.length; j++)
      {
        for (var i = 0; i < foundDebitorsPlusCategories.length; i++)
        {
          if(foundDebitorsPlusCategories[i].debitor === this.systems[j].debitor
          && foundDebitorsPlusCategories[i].category === this.name)
          {
            found = i;
            break;
          }
        }
        if (found === -1)
        {
          foundDebitorsPlusCategories.push({"debitor":this.systems[j].debitor,"amount":0,"category": this.name,"isReconciled":null});
        }
      }
    }
  })

  // Currently only scans selected month, it would be better if this checks for months which have not been redemped and adds this amount
  for (var countDebitors = 0; countDebitors < foundDebitorsPlusCategories.length; countDebitors++)
  {
    var summedAmountIndivCategory = 0.0;
    var isReconciled = null;
    for (var i = 0; i < transactionsData.length; i++)
    {
      if(transactionsData[i].bookingType === "Redemption" 
        && new Date(transactionsData[i].dateEntered).getMonth() + 1 === selectedMonth
        && new Date(transactionsData[i].dateEntered).getFullYear() === selectedYear)
      {
        if(transactionsData[i].name === foundDebitorsPlusCategories[countDebitors].debitor 
          && transactionsData[i].amount[0].category === foundDebitorsPlusCategories[countDebitors].category)
        {
          isReconciled = "yes";
          //summedAmountIndivCategory += parseFloat(transactionsData[i].amount[0].originalDebitorAmount);
        }
      }
      else if( transactionsData[i].bookingType === "Payment"
        && new Date(transactionsData[i].dateEntered).getMonth() + 1 === selectedMonth
        && new Date(transactionsData[i].dateEntered).getFullYear() === selectedYear)
      {
        for (var countPaymentSubCategories = 0; countPaymentSubCategories < transactionsData[i].amount.length; countPaymentSubCategories++)
        {
          for (var j = 0; j < categoryData.length; j++)
          {
            if (transactionsData[i].amount[countPaymentSubCategories].category === categoryData[j].name
            && categoryData[j].systems != null)
            {
              for (var k = 0; k < categoryData[j].systems.length; k++)
              {
                if (categoryData[j].systems[k].debitor === foundDebitorsPlusCategories[countDebitors].debitor
                  && foundDebitorsPlusCategories[countDebitors].category === categoryData[j].name)
                {
                  summedAmountIndivCategory += transactionsData[i].amount[countPaymentSubCategories].amount * parseFloat(categoryData[j].systems[k].percentage) / 100.0;
                }
              }
            }
          }
        }
      }
    }
    foundDebitorsPlusCategories[countDebitors] = {
      "debitor":foundDebitorsPlusCategories[countDebitors].debitor,
      "amount":summedAmountIndivCategory,
      "category":foundDebitorsPlusCategories[countDebitors].category,
      "isReconciled":isReconciled
    };
  }

  var tableContent = '';
  for (var i = 0; i < foundDebitorsPlusCategories.length; i++)
  {
    if (parseFloat(parseFloat(foundDebitorsPlusCategories[i].amount).toFixed(2)) < 0.0)
    {
      tableContent += '<tr>';
      tableContent += '<td><a href="#" class="cashingUpTableDebitor" rel="' + foundDebitorsPlusCategories[i].debitor.split(' ').join('-') + '_' + foundDebitorsPlusCategories[i].category.split(' ').join('-') + '">';
      tableContent += foundDebitorsPlusCategories[i].debitor + " - " + foundDebitorsPlusCategories[i].category + '</a></td>';


      tableContent += '<td id="cashingUpTableDebtAmount_' +foundDebitorsPlusCategories[i].debitor.split(' ').join('-') + '_' + foundDebitorsPlusCategories[i].category.split(' ').join('-') + '">' + (-1.0*parseFloat(foundDebitorsPlusCategories[i].amount)).toFixed(2) + '</td>';

      tableContent += '<td>';
      tableContent += foundDebitorsPlusCategories[i].isReconciled === null ? "No" : "Yes";
      tableContent += '</td>';

      tableContent += '</tr>';
    }
  }

  $('#cashingUpDatabaseView table tbody').html(tableContent);
  
  $('.cashingUpTableDebitor').off("click");
  $('.cashingUpTableDebitor').on("click", function(event)
  {
    event.preventDefault();

    var rel = $(this).('rel');

    $("#addRedemptionPaymentForm").css("display","block");

    var debitor = rel.substr(0, rel.indexOf('_')); 
    $("#addRedemptionPaymentForm input#cashingUpInputDebitor").val(debitor.split('-').join(" "));

    var category = rel.split('_')[1];; 
    $("#addRedemptionPaymentForm input#cashingUpInputCategory").val(category.split('-').join(" "));

    var amount = $("#cashingUpTableDebtAmount_" + rel).html();
    amount = parseFloat(amount);
    $("#addRedemptionPaymentForm p input#cashingUpInputAmount").val(amount)

    var originalDebitorAmount = $("#cashingUpTableDebtAmount_" + rel).html();
    originalDebitorAmount = parseFloat(originalDebitorAmount);
    $("#addRedemptionPaymentForm p input#cashingUpInputOriginalDebitorAmount").val(originalDebitorAmount);

  });

};

function populateCategoryTable() {

  var unallocatedAmount = 0.0;
  for (var i = 0; i < transactionsData.length; i++)
  {
    // Da Redemptions immer eine Category haben, werden Sie beim unallozierten Geld nicht einbezogen
    if ((transactionsData[i].bookingType === "Income" || transactionsData[i].bookingType === "Correction" ) 
      && new Date(transactionsData[i].dateEntered).getMonth() + 1 == selectedMonth
      && new Date(transactionsData[i].dateEntered).getFullYear() == selectedYear)
    {
      if (transactionsData[i].amount[0].category == "Income" || transactionsData[i].amount[0].category == "Correction")
      {
        unallocatedAmount += parseFloat(transactionsData[i].amount[0].amount);
      }
    }
  }
  // Das hier sollte die Menge an absolutem Income diesen Monat sein.
  var toBeAllocatedThisPeriod = unallocatedAmount;

  // Nun werden alle allozierungen abgezogen und damit errechnet, wie viel aktuell unalloziert sind.
  for (var i = 0; i < categoryData.length; i++)
  {
    var found = getIteratorFromAllocatedSinceReferenceArray(categoryData[i].allocatedSinceReference,selectedYear,selectedMonth);
    var allocatedThisMonth = 0.0;
    if (found != null)
    {
      allocatedThisMonth = categoryData[i].allocatedSinceReference[found].amount;
    }
    unallocatedAmount -= parseFloat(allocatedThisMonth);
  }
  $('#categoryUnallocatedMoney').html("<strong>Unallocated Amount: </strong>"+ unallocatedAmount.toFixed(2));
  $('#categoryToBeAllocatedMoney').html("<strong>Total Income this Month: </strong>"+ toBeAllocatedThisPeriod.toFixed(2));


  // Empty content string
  var tableContent = '';



  // For each item in our JSON, add a table row and cells to the content string
  $.each(categoryData, function(){
    tableContent += '<tr class="clickable-row">';

    tableContent += '<td><a href="#" class="linkshowcategory" rel="' + this._id + '">' + this.name + '</a></td>';
    
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
    // (aktuell nur virtuell) (aktuell nur Debitoren inkludiert, Transactionen werden als Booked angenommen, Redemptions sind drinnen)
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
                if (transactionsData[i].bookingType === "Redemption")
                {
                  if (transactionsData[i].dateBooked != null)
                  {
                    actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
                  }
  
                  if (parseFloat(transactionsData[i].amount[j].amount) != parseFloat(transactionsData[i].amount[j].originalDebitorAmount))
                  {
                    var difference = parseFloat(transactionsData[i].amount[j].amount) - parseFloat(transactionsData[i].amount[j].originalDebitorAmount);
                    virtualSpendingThisMonth += difference;
                  }
                }
                else if(transactionsData[i].bookingType === "Payment")
                {
                  if (transactionsData[i].dateBooked != null)
                  {
                    actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
                  }

                  // If no systems, just add the amount.
                  if(this.systems == null || this.systems == [])
                  {
                    virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
                  }
                  // If systems are present, calculate virtual amount
                  else if (this.systems.length > 0)
                  {
                    var iHaveToPay = transactionsData[i].amount[j].amount;
                    for (var k=0; k < this.systems.length; k++)
                    {
                      iHaveToPay -= parseFloat(this.systems[k].percentage) / 100.0 * transactionsData[i].amount[j].amount;
                    }
                    virtualSpendingThisMonth += iHaveToPay;
                  }
                }
                else if(transactionsData[i].bookingType === "Correction")
                {
                  actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);

                  // If no systems, just add the amount.
                  if(this.systems == null || this.systems == [])
                  {
                    virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
                  }
                  // If systems are present, calculate virtual amount
                  else if (this.systems.length > 0)
                  {
                    var iHaveToPay = transactionsData[i].amount[j].amount;
                    for (var k=0; k < this.systems.length; k++)
                    {
                      iHaveToPay -= parseFloat(this.systems[k].percentage) / 100.0 * transactionsData[i].amount[j].amount;
                    }
                    virtualSpendingThisMonth += iHaveToPay;
                  }
                  else if(transactionsData[i].bookingType === "Income")
                  {
                    actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
  
                    // If no systems, just add the amount.
                    if(this.systems == null || this.systems == [])
                    {
                      virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
                    }
                    // If systems are present, calculate virtual amount
                    else if (this.systems.length > 0)
                    {
                      var iHaveToPay = transactionsData[i].amount[j].amount;
                      for (var k=0; k < this.systems.length; k++)
                      {
                        iHaveToPay -= parseFloat(this.systems[k].percentage) / 100.0 * transactionsData[i].amount[j].amount;
                      }
                      virtualSpendingThisMonth += iHaveToPay;
                    }
                  }
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



    // Hier wird der aktuelle Monat durchgezählt (aktuell nur virtuell) (aktuell nur Debitoren inkludiert, Transactionen werden als Booked angenommen, Redemptions sind drinnen)
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

            if(this.systems == null || this.systems == [])
            {
              virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
            }
            else if (this.systems.length > 0)
            {
              var iHaveToPay = transactionsData[i].amount[j].amount;
              for (var k=0; k < this.systems.length; k++)
              {
                iHaveToPay -= parseFloat(this.systems[k].percentage) / 100.0 * transactionsData[i].amount[j].amount;
              }
              virtualSpendingThisMonth += iHaveToPay;
            }
          }
          else if (transactionsData[i].bookingType === "Redemption")
          {
            if (transactionsData[i].dateBooked != null)
            {
              actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
            }
            if (parseFloat(transactionsData[i].amount[j].amount) != parseFloat(transactionsData[i].amount[j].originalDebitorAmount))
            {
              var difference = parseFloat(transactionsData[i].amount[j].amount) - parseFloat(transactionsData[i].amount[j].originalDebitorAmount);
              virtualSpendingThisMonth += difference;
            }
          }
          else if (transactionsData[i].bookingType === "Correction")
          {
            actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);

            if(this.systems == null || this.systems == [])
            {
              virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
            }
            else if (this.systems.length > 0)
            {
              var iHaveToPay = transactionsData[i].amount[j].amount;
              for (var k=0; k < this.systems.length; k++)
              {
                iHaveToPay -= parseFloat(this.systems[k].percentage) / 100.0 * transactionsData[i].amount[j].amount;
              }
              virtualSpendingThisMonth += iHaveToPay;
            }
          }
          else if (transactionsData[i].bookingType === "Income")
          {
            actualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);

            if(this.systems == null || this.systems == [])
            {
              virtualSpendingThisMonth += parseFloat(transactionsData[i].amount[j].amount);
            }
            else if (this.systems.length > 0)
            {
              var iHaveToPay = transactionsData[i].amount[j].amount;
              for (var k=0; k < this.systems.length; k++)
              {
                iHaveToPay -= parseFloat(this.systems[k].percentage) / 100.0 * transactionsData[i].amount[j].amount;
              }
              virtualSpendingThisMonth += iHaveToPay;
            }
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

    var thisID = $(this).('rel');

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

function showButtonsAddingTransaction(thisID) {
  $('#addTransaction').html("");

  var dropdownAccount = $(document.createElement('div'));
  dropdownAccount.("class","dropdown");

  var dropdownAccount_b1 = $(document.createElement('button'));
  dropdownAccount_b1.("class", "btn btn-secondary dropdown-toggle my-3");
  dropdownAccount_b1.("type","button");
  dropdownAccount_b1.("data-toggle","dropdown");

  if (thisID === null)
    dropdownAccount_b1.html("Booking Type"); 
  else
    dropdownAccount_b1.html(thisID);

  dropdownAccount.append(dropdownAccount_b1);

  var divDropdown = $(document.createElement('div'));
  divDropdown.("class","dropdown-menu");

  var dropdownEntry1 = $(document.createElement('a'));
  dropdownEntry1.("class", "dropdown-item dropdown-item-paymentTypeSelection");
  dropdownEntry1.("href", "#");
  // Here pick accounts dynamically
  dropdownEntry1.html("Payment");
  divDropdown.append(dropdownEntry1);


  var dropdownEntry2 = $(document.createElement('a'));
  dropdownEntry2.("class", "dropdown-item dropdown-item-paymentTypeSelection");
  dropdownEntry2.("href", "#");
  // Here pick accounts dynamically
  dropdownEntry2.html("Income");
  divDropdown.append(dropdownEntry2);

  var dropdownEntry3 = $(document.createElement('a'));
  dropdownEntry3.("class", "dropdown-item dropdown-item-paymentTypeSelection");
  dropdownEntry3.("href", "#");
  // Here pick accounts dynamically
  dropdownEntry3.html("Transfer");
  divDropdown.append(dropdownEntry3);

  var dropdownEntry4 = $(document.createElement('a'));
  dropdownEntry4.("class", "dropdown-item dropdown-item-paymentTypeSelection");
  dropdownEntry4.("href", "#");
  // Here pick accounts dynamically
  dropdownEntry4.html("Correction");
  divDropdown.append(dropdownEntry4);

  dropdownAccount.append(divDropdown);

  $('#addTransaction').append(dropdownAccount);
  //$('#addTransaction').append($(document.createElement('br')));

  $('#addTransactionButton').off("click");
  if(thisID === "Payment")
  {
    var textfieldDate = $(document.createElement('input'));
    textfieldDate.("type", "text");
    textfieldDate.("placeholder", "Date");
    textfieldDate.("id", "datepickerPayment");
    textfieldDate.("class", "m-2 p-2 datepicker");
    $('#addTransaction').append(textfieldDate);

    $( function() {
      $( "Payment" ).datepicker();
    } );

    $( "Payment" ).datepicker({
      dateFormat: "yy-mm-dd"
    });

    // Set starting Date
    if (lastPickedDateInSession != null)
    {
      $("Payment").val($.datepicker.formatDate( "yy-mm-dd", lastPickedDateInSession));
    }
    else
    {
      $("Payment").val($.datepicker.formatDate( "yy-mm-dd", new Date() ));
    }
    
    $('#addTransaction').append($(document.createElement('br')));
    

    var textfieldName = $(document.createElement('input'));
    textfieldName.("type", "text");
    textfieldName.("placeholder", "Name");
    textfieldName.("id", "inputName");
    textfieldName.("class", "m-2 p-2");
    $('#addTransaction').append(textfieldName);
    

    var textfieldAccount = $(document.createElement('input'));
    textfieldAccount.("type", "text");
    textfieldAccount.("placeholder", "Account");
    textfieldAccount.("id", "inputAccount");
    textfieldAccount.("class", "m-2 p-2");
    $('#addTransaction').append(textfieldAccount);
    $('#addTransaction').append($(document.createElement('br')));

    var textfieldTotalamount = $(document.createElement('input'));
    textfieldTotalamount.("type", "number");
    textfieldTotalamount.("placeholder", "Amount 1");
    textfieldTotalamount.("id", "inputAmount1");
    $('#addTransaction').append(textfieldTotalamount);
    textfieldTotalamount.("class", "m-2 p-2");

    // CATEGORY DROPDOWN
    var dropdownCategory1 = $(document.createElement('div'));
    dropdownCategory1.("class","dropdown");
    var dropdownCat_b1 = $(document.createElement('button'));
    dropdownCat_b1.("class", "btn btn-secondary dropdown-toggle my-3");
    dropdownCat_b1.("type","button");
    dropdownCat_b1.("id","inputCategory1Button");
    dropdownCat_b1.("data-toggle","dropdown");
    dropdownCat_b1.html("Pick Category 1"); 
    dropdownCategory1.append(dropdownCat_b1);
    var divDropdown = $(document.createElement('div'));
    divDropdown.("class","dropdown-menu");
    for (var i = 0; i < categoryData.length; ++i)
    {
      var dropdownEntry = $(document.createElement('a'));
      dropdownEntry.("class", "dropdown-item dropdown-item-categorySelection");
      dropdownEntry.("href", "#");
      dropdownEntry.html(categoryData[i].name);
      divDropdown.append(dropdownEntry);
    }
    dropdownCategory1.append(divDropdown);
    $('#addTransaction').append(dropdownCategory1);
    //
   

    var textfieldTotalamount = $(document.createElement('input'));
    textfieldTotalamount.("type", "number");
    textfieldTotalamount.("placeholder", "Amount 2");
    textfieldTotalamount.("class", "m-2 p-2");
    textfieldTotalamount.("id", "inputAmount2");
    $('#addTransaction').append(textfieldTotalamount);
    

    // CATEGORY DROPDOWN
    var dropdownCategory2 = $(document.createElement('div'));
    dropdownCategory2.("class","dropdown");
    var dropdownCat_b1 = $(document.createElement('button'));
    dropdownCat_b1.("class", "btn btn-secondary dropdown-toggle my-3");
    dropdownCat_b1.("type","button");
    dropdownCat_b1.("id","inputCategory2Button");
    dropdownCat_b1.("data-toggle","dropdown");
    dropdownCat_b1.html("Pick Category 2"); 
    dropdownCategory2.append(dropdownCat_b1);
    var divDropdown = $(document.createElement('div'));
    divDropdown.("class","dropdown-menu");
    for (var i = 0; i < categoryData.length; ++i)
    {
      var dropdownEntry = $(document.createElement('a'));
      dropdownEntry.("class", "dropdown-item dropdown-item-categorySelection");
      dropdownEntry.("href", "#");
      dropdownEntry.html(categoryData[i].name);
      divDropdown.append(dropdownEntry);
    }
    dropdownCategory2.append(divDropdown);
    $('#addTransaction').append(dropdownCategory2);
    //

    var textfieldTotalamount = $(document.createElement('input'));
    textfieldTotalamount.("type", "number");
    textfieldTotalamount.("placeholder", "Amount 3");
    textfieldTotalamount.("class", "m-2 p-2");
    textfieldTotalamount.("id", "inputAmount3");
    $('#addTransaction').append(textfieldTotalamount);
    
    // CATEGORY DROPDOWN
    var dropdownCategory3 = $(document.createElement('div'));
    dropdownCategory3.("class","dropdown");
    var dropdownCat_b1 = $(document.createElement('button'));
    dropdownCat_b1.("class", "btn btn-secondary dropdown-toggle my-3");
    dropdownCat_b1.("type","button");
    dropdownCat_b1.("id","inputCategory3Button");
    dropdownCat_b1.("data-toggle","dropdown");
    dropdownCat_b1.html("Pick Category 3"); 
    dropdownCategory3.append(dropdownCat_b1);
    var divDropdown = $(document.createElement('div'));
    divDropdown.("class","dropdown-menu");
    for (var i = 0; i < categoryData.length; ++i)
    {
      var dropdownEntry = $(document.createElement('a'));
      dropdownEntry.("class", "dropdown-item dropdown-item-categorySelection");
      dropdownEntry.("href", "#");
      dropdownEntry.html(categoryData[i].name);
      divDropdown.append(dropdownEntry);
    }
    dropdownCategory3.append(divDropdown);
    $('#addTransaction').append(dropdownCategory3);
    //

    var textfieldTotalamount = $(document.createElement('input'));
    textfieldTotalamount.("type", "number");
    textfieldTotalamount.("placeholder", "Amount 4");
    textfieldTotalamount.("class", "m-2 p-2");
    textfieldTotalamount.("id", "inputAmount4");
    $('#addTransaction').append(textfieldTotalamount);
    
    // CATEGORY DROPDOWN
    var dropdownCategory4 = $(document.createElement('div'));
    dropdownCategory4.("class","dropdown");
    var dropdownCat_b1 = $(document.createElement('button'));
    dropdownCat_b1.("class", "btn btn-secondary dropdown-toggle my-3");
    dropdownCat_b1.("type","button");
    dropdownCat_b1.("id","inputCategory4Button");
    dropdownCat_b1.("data-toggle","dropdown");
    dropdownCat_b1.html("Pick Category 4"); 
    dropdownCategory4.append(dropdownCat_b1);
    var divDropdown = $(document.createElement('div'));
    divDropdown.("class","dropdown-menu");
    for (var i = 0; i < categoryData.length; ++i)
    {
      var dropdownEntry = $(document.createElement('a'));
      dropdownEntry.("class", "dropdown-item dropdown-item-categorySelection");
      dropdownEntry.("href", "#");
      dropdownEntry.html(categoryData[i].name);
      divDropdown.append(dropdownEntry);
    }
    dropdownCategory4.append(divDropdown);
    $('#addTransaction').append(dropdownCategory4);
    //

    var buttonBooked = $(document.createElement('button'));
    buttonBooked.("type", "text");
    buttonBooked.("class", "btn btn-success m-2 p-2");
    buttonBooked.html("Booked");
    buttonBooked.("id", "insertTransactionPaymentButtonToggleBooked");
    $('#addTransaction').append(buttonBooked);
    $('#addTransaction').append($(document.createElement('br'))); 

    $('#insertTransactionPaymentButtonToggleBooked').off("click");
    $('#insertTransactionPaymentButtonToggleBooked').on("click", function()
    {
      if($(this).html() === "Booked")
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


    $('#addTransactionButton').on("click",function(event)
    {
      event.preventDefault();

      // Super basic validation - increase errorCount variable if any fields are blank
      var errorSubmission = false;
      if(
        $('#addTransaction input#inputName').val() == "" 
        || $('#addTransaction input#inputAccount').val() == "" 
        || $('#addTransaction input#inputAmount1').val() == "" 
        || $('#addTransaction #inputCategory1Button').html() == "" 
      )
      {
        errorSubmission = true
      }

      var foundCategory = false;
      for (var i = 0; i < categoryData.length; ++i)
      {
        var debug1 = $('#addTransaction #inputCategory1Button');
        if(categoryData[i].name === $('#addTransaction #inputCategory1Button').html())
        {
          foundCategory = true;
          break;
        }
      }
      if(!foundCategory)
      {
        errorSubmission = true;
      }

      // Check and make sure errorCount's still at zero
      if(! errorSubmission && foundCategory) {
    
        // If it is, compile all user info into one object
        var newTransaction = {
          'name': $('#addTransaction input#inputName').val(),
          'account': $('#addTransaction input#inputAccount').val(),
          'bookingType': thisID,
          'dateEntered': new Date($.datepicker.parseDate( "yy-mm-dd",$('Payment').val())).getTime(),
          'dateBooked': $('#insertTransactionPaymentButtonToggleBooked').html() === "Booked" ? Date.now() : null,
          'amount' : [
            {
              "category" : $('#addTransaction #inputCategory1Button').html(),
              "amount" : (parseFloat($('#addTransaction input#inputAmount1').val()) * -1.0).toString()
            }
          ]
        }

        for (var i = 0; i < 2; ++i)
        {
          if($('#addTransaction #inputCategory' + (i+2).toString() + "Button").html()  != "Pick Category " + (i+2).toString() && $('#addTransaction input#inputAmount'+ (i+2).toString()).val() != "")
          {
            newTransaction.amount.push(
              {
                "category": $('#addTransaction #inputCategory'+ (i+2).toString() + "Button").html() ,
                "amount" : (parseFloat($('#addTransaction input#inputAmount'+ (i+2).toString()).val()) * -1.0).toString()
              });
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
            //alert('Done');
            // Clear the form inputs
            $('#addTransaction input').val('');
            $('#addTransactionButton').off("click");
            reloadData();
            $('#DisplayDB').click();
           
    
          }
          else {
    
            // If something goes wrong, alert the error message that our service returned
            alert('Error: ' + response.msg);
    
          }
        });

        
      }
      else {
        // If errorCount is more than 0, error out
        alert('Error occurred.');
      }
    });
  }
  else if (thisID === "Income")
  {
    var textfieldDate = $(document.createElement('input'));
    textfieldDate.("type", "text");
    textfieldDate.("placeholder", "Date");
    textfieldDate.("id", "datepickerIncome");
    textfieldDate.("class", "m-2 p-2 datepicker");
    $('#addTransaction').append(textfieldDate);

    $( function() {
      $( "Income" ).datepicker();
    } );

    $( "Income" ).datepicker({
      dateFormat: "yy-mm-dd"
    });

    $("Income").val($.datepicker.formatDate( "yy-mm-dd", new Date() ));
    $('#addTransaction').append($(document.createElement('br')));
    

    var textfieldName = $(document.createElement('input'));
    textfieldName.("type", "text");
    textfieldName.("placeholder", "Name");
    textfieldName.("id", "inputName");
    textfieldName.("class", "m-2 p-2");
    $('#addTransaction').append(textfieldName);
    $('#addTransaction').append($(document.createElement('br')));

    var textfieldTotalamount = $(document.createElement('input'));
    textfieldTotalamount.("type", "number");
    textfieldTotalamount.("placeholder", "Amount");
    textfieldTotalamount.("id", "inputAmount");
    textfieldTotalamount.("class", "m-2 p-2");
    $('#addTransaction').append(textfieldTotalamount);
    $('#addTransaction').append($(document.createElement('br')));

    var textfieldAccount = $(document.createElement('input'));
    textfieldAccount.("type", "text");
    textfieldAccount.("placeholder", "Account");
    textfieldAccount.("id", "inputAccount");
    textfieldAccount.("class", "m-2 p-2");
    $('#addTransaction').append(textfieldAccount);
    $('#addTransaction').append($(document.createElement('br')));

    // CATEGORY DROPDOWN
    var dropdownCategory = $(document.createElement('div'));
    dropdownCategory.("class","dropdown");
    var dropdownCat_b1 = $(document.createElement('button'));
    dropdownCat_b1.("class", "btn btn-secondary dropdown-toggle my-3");
    dropdownCat_b1.("type","button");
    dropdownCat_b1.("id","inputCategoryButton");
    dropdownCat_b1.("data-toggle","dropdown");
    dropdownCat_b1.html("Pick Category (optional)"); 
    dropdownCategory.append(dropdownCat_b1);
    var divDropdown = $(document.createElement('div'));
    divDropdown.("class","dropdown-menu");
    var dropdownEntry = $(document.createElement('a'));
    dropdownEntry.("class", "dropdown-item dropdown-item-categorySelection");
    dropdownEntry.("href", "#");
    dropdownEntry.html("No category");
    divDropdown.append(dropdownEntry);
    for (var i = 0; i < categoryData.length; ++i)
    {
      var dropdownEntry = $(document.createElement('a'));
      dropdownEntry.("class", "dropdown-item dropdown-item-categorySelection");
      dropdownEntry.("href", "#");
      dropdownEntry.html(categoryData[i].name);
      divDropdown.append(dropdownEntry);
    }
    dropdownCategory.append(divDropdown);
    $('#addTransaction').append(dropdownCategory);
    //

    var buttonBooked = $(document.createElement('button'));
    buttonBooked.("type", "text");
    buttonBooked.("class", "btn btn-success m-2 p-2");
    buttonBooked.html("Booked");
    buttonBooked.("id", "insertTransactionPaymentButtonToggleBooked");
    $('#addTransaction').append(buttonBooked);
    $('#addTransaction').append($(document.createElement('br'))); 

    $('#insertTransactionPaymentButtonToggleBooked').off("click");
    $('#insertTransactionPaymentButtonToggleBooked').on("click", function()
    {
      // Future Transactions can never be booked. Only past ones can be booked
      if (new Date($.datepicker.parseDate( "yy-mm-dd",$('Income').val())) > new Date())
      {
        $(this).html("Not Booked");
        $(this).removeClass("btn-success");
        $(this).addClass("btn-warning");
      }
      else
      {
        if($(this).html() === "Booked")
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
      }
    });

    $('#addTransactionButton').on("click",function(event)
    {
      event.preventDefault();

      // Super basic validation - increase errorCount variable if any fields are blank
      var errorSubmission = false;
      if(
        $('#addTransaction input#inputAccount').val() == "" 
        || $('#addTransaction input#inputAmount').val() == ""  
        || $('#addTransaction input#inputName').val() == ""  
      )
      {
        errorSubmission = true
      }

      if(!errorSubmission ) 
      {
        var newTransaction = {
          'name': $('#addTransaction input#inputName').val(),
          'account': $('#addTransaction input#inputAccount').val(),
          'bookingType': thisID,
          'dateEntered': new Date($.datepicker.parseDate( "yy-mm-dd",$('Income').val())).getTime(),
          'dateBooked': $('#insertTransactionPaymentButtonToggleBooked').html() === "Booked" ? new Date($.datepicker.parseDate( "yy-mm-dd",$('Income').val())).getTime() : null,
          'amount' : [
            {
              "category" : ($('#addTransaction #inputCategoryButton').html() === "No category" 
                || $('#addTransaction #inputCategoryButton').html() === "Pick Category (optional)") ? "Income" : $('#addTransaction #inputCategoryButton').html(),
              "amount" : $('#addTransaction input#inputAmount').val()
            }
          ]
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
    
            // Clear the form inputs
            $('#addTransaction input').val('');
            $('#addTransactionButton').off("click");
            reloadData();
            $('#DisplayDB').click();

    
          }
          else {
    
            // If something goes wrong, alert the error message that our service returned
            alert('Error: ' + response.msg);
    
          }
        });

        
      }
      else {
        // If errorCount is more than 0, error out
        alert('Error occurred. Please fill in the relevant fields.');
        return false;
      }
    });
  }
  else if (thisID === "Transfer")
  {
    //$('#addTransaction').append($(document.createElement('br')));
    var textfieldDate = $(document.createElement('input'));
    textfieldDate.("type", "text");
    textfieldDate.("placeholder", "Date");
    textfieldDate.("id", "datepickerTransfer");
    textfieldDate.("class", "m-2 p-2 datepicker");
    $('#addTransaction').append(textfieldDate);

    $( function() {
      $( "Transfer" ).datepicker();
    } );

    $( "Transfer" ).datepicker({
      dateFormat: "yy-mm-dd"
    });

    $("Transfer").val($.datepicker.formatDate( "yy-mm-dd", new Date() ));
    $('#addTransaction').append($(document.createElement('br')));

    var textfieldTotalamount = $(document.createElement('input'));
    textfieldTotalamount.("type", "number");
    textfieldTotalamount.("placeholder", "Amount");
    textfieldTotalamount.("id", "inputAmount");
    textfieldTotalamount.("class", "m-2 p-2");
    $('#addTransaction').append(textfieldTotalamount);
    $('#addTransaction').append($(document.createElement('br')));

    var textfieldAccount = $(document.createElement('input'));
    textfieldAccount.("type", "text");
    textfieldAccount.("placeholder", "From Account");
    textfieldAccount.("id", "inputAccount");
    textfieldAccount.("class", "m-2 p-2");
    $('#addTransaction').append(textfieldAccount);
    $('#addTransaction').append($(document.createElement('br')));
    
    var textfieldAccount2 = $(document.createElement('input'));
    textfieldAccount2.("type", "text");
    textfieldAccount2.("placeholder", "To Account");
    textfieldAccount2.("id", "targetAccount");
    textfieldAccount2.("class", "m-2 p-2");
    $('#addTransaction').append(textfieldAccount2);
    $('#addTransaction').append($(document.createElement('br')));

    var buttonBooked = $(document.createElement('button'));
    buttonBooked.("type", "text");
    buttonBooked.("class", "btn btn-success m-2 p-2");
    buttonBooked.html("Booked");
    buttonBooked.("id", "insertTransactionPaymentButtonToggleBooked");
    $('#addTransaction').append(buttonBooked);
    $('#addTransaction').append($(document.createElement('br'))); 

    $('#insertTransactionPaymentButtonToggleBooked').off("click");
    $('#insertTransactionPaymentButtonToggleBooked').on("click", function()
    {
      // Future Transactions can never be booked. Only past ones can be booked
      if (new Date($.datepicker.parseDate( "yy-mm-dd",$('Transfer').val())) > new Date())
      {
        $(this).html("Not Booked");
        $(this).removeClass("btn-success");
        $(this).addClass("btn-warning");
      }
      else
      {
        if($(this).html() === "Booked")
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
      }
    });


    $('#addTransactionButton').on("click",function(event)
    {
      event.preventDefault();

      // Super basic validation - increase errorCount variable if any fields are blank
      var errorSubmission = false;
      if(
        $('#addTransaction input#targetAccount').val() == "" 
        || $('#addTransaction input#inputAccount').val() == "" 
        || $('#addTransaction input#inputAmount').val() == ""  
      )
      {
        errorSubmission = true
      }
      // Check and make sure errorCount's still at zero
      if(! errorSubmission) {
    
        // If it is, compile all user info into one object
        var newTransaction = {
          'name': "Transfer",
          'account': $('#addTransaction input#inputAccount').val(),
          'targetAccount' : $('#addTransaction input#targetAccount').val(),
          'bookingType': thisID,
          'dateEntered': new Date($.datepicker.parseDate( "yy-mm-dd",$('Transfer').val())).getTime(),
          'dateBooked': $('#insertTransactionPaymentButtonToggleBooked').html() === "Booked" ? new Date($.datepicker.parseDate( "yy-mm-dd",$('Transfer').val())).getTime() : null,
          'amount' : [
            {
              "category" : "Transfer",
              "amount" : $('#addTransaction input#inputAmount').val()
            }
          ]
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
    
            // Clear the form inputs
            $('#addTransaction input').val('');
            $('#addTransactionButton').off("click");
            reloadData();
            $('#DisplayDB').click();

    
          }
          else {
    
            // If something goes wrong, alert the error message that our service returned
            alert('Error: ' + response.msg);
    
          }
        });

        
      }
      else {
        // If errorCount is more than 0, error out
        alert('Error occurred. Please fill in the relevant fields.');
        return false;
      }
    });
  }
  else if (thisID === "Correction")
  {
    var textfieldTotalamount = $(document.createElement('input'));
    textfieldTotalamount.("type", "number");
    textfieldTotalamount.("placeholder", "Target Balance");
    textfieldTotalamount.("id", "inputAmount");
    textfieldTotalamount.("class", "m-2 p-2");
    $('#addTransaction').append(textfieldTotalamount);
    $('#addTransaction').append($(document.createElement('br')));

    // CATEGORY DROPDOWN
    var dropdownCategory = $(document.createElement('div'));
    dropdownCategory.("class","dropdown");
    var dropdownCat_b1 = $(document.createElement('button'));
    dropdownCat_b1.("class", "btn btn-secondary dropdown-toggle my-3");
    dropdownCat_b1.("type","button");
    dropdownCat_b1.("id","inputCategoryButton");
    dropdownCat_b1.("data-toggle","dropdown");
    dropdownCat_b1.html("Pick Category (optional)"); 
    dropdownCategory.append(dropdownCat_b1);
    var divDropdown = $(document.createElement('div'));
    divDropdown.("class","dropdown-menu");
    var dropdownEntry = $(document.createElement('a'));
    dropdownEntry.("class", "dropdown-item dropdown-item-categorySelection");
    dropdownEntry.("href", "#");
    dropdownEntry.html("No category");
    divDropdown.append(dropdownEntry);
    for (var i = 0; i < categoryData.length; ++i)
    {
      var dropdownEntry = $(document.createElement('a'));
      dropdownEntry.("class", "dropdown-item dropdown-item-categorySelection");
      dropdownEntry.("href", "#");
      dropdownEntry.html(categoryData[i].name);
      divDropdown.append(dropdownEntry);
    }
    dropdownCategory.append(divDropdown);
    $('#addTransaction').append(dropdownCategory);
    //

    var textfieldAccount = $(document.createElement('input'));
    textfieldAccount.("type", "text");
    textfieldAccount.("placeholder", "Account");
    textfieldAccount.("id", "inputAccount");
    textfieldAccount.("class", "m-2 p-2");
    $('#addTransaction').append(textfieldAccount);
    $('#addTransaction').append($(document.createElement('br')));

    $('#addTransactionButton').on("click",function(event)
    {
      event.preventDefault();

      // Super basic validation - increase errorCount variable if any fields are blank
      var errorSubmission = false;
      if(
        $('#addTransaction input#inputAccount').val() == "" 
        || $('#addTransaction input#inputAmount').val() == ""  
      )
      {
        errorSubmission = true
      }

      if(accountData.length === 0)
      {
        populateAccountInformation();
      }
      var foundMatchingAccount = -1;
      for (var i = 0; i < accountData.length; ++i)
      {
        if(accountData[i].name === $('#addTransaction input#inputAccount').val())
        {
          foundMatchingAccount = i;
          break;
        }
      }

      if(!errorSubmission && foundMatchingAccount != -1) 
      {
        var correctionAmount = (parseFloat($('#addTransaction input#inputAmount').val()) - parseFloat(accountData[foundMatchingAccount].totalCurrent))
        var newTransaction = {
          'name': "Correction",
          'account': $('#addTransaction input#inputAccount').val(),
          'bookingType': thisID,
          'dateEntered': Date.now(),
          'dateBooked': Date.now(),
          'amount' : [
            {
              "category" : ($('#addTransaction #inputCategoryButton').html() != "Pick Category (optional)" 
                && $('#addTransaction #inputCategoryButton').html() != "No category" ) ? $('#addTransaction #inputCategoryButton').html() : "Correction",
              "amount" : correctionAmount.toString()    
            }
          ]
        }
    
        // Use AJAX to post the object to our adduser service
        if(correctionAmount != 0.0)
        {
          $.ajax({
            type: 'POST',
            data: {data : JSON.stringify(newTransaction) },
            url: '/db/transactions_add',
            dataType: 'JSON'
          }).done(function( response ) {
          
            // Check for successful (blank) response
            if (response.msg === '') {
            
              // Clear the form inputs
              $('#addTransaction input').val('');
              $('#addTransactionButton').off("click");
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
          $('#addTransaction input').val('');
          $('#addTransactionButton').off("click");
          reloadData();
          $('#DisplayDB').click();
        }
      }
      else {
        // If errorCount is more than 0, error out
        alert('Error occurred.');
      }
    });
  }

  $('.dropdown-item-paymentTypeSelection').off("click");
  $('.dropdown-item-paymentTypeSelection').on('click', function(event)
  {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel ibute
    var thisID = $(this).html();


    showButtonsAddingTransaction(thisID);

  })
  $('.dropdown-item-categorySelection').off("click");
  $('.dropdown-item-categorySelection').on('click', function(event)
  {
    // Prevent Link from Firing
    event.preventDefault();

    $(this).parent().parent().find(".dropdown-toggle").html($(this).html());
  })

  $('#addTransaction').append($(document.createElement('br'))); 

  categoryNames = []
  for (catItem in categoryData)
  {
    categoryNames.push(catItem.name);
  }
  //$('.categoryInputField').autocomplete({source: categoryNames});

};

function prepareButtonsAddingTransaction() {


  $('#addTransactionButton').off("click");
  if(thisID === "Payment")
  {

    $( function() {
      $( "Payment" ).datepicker();
    } );

    $( "Payment" ).datepicker({
      dateFormat: "yy-mm-dd"
    });

    // Set starting Date 
    if (lastPickedDateInSession != null)
    {
      $("Payment").val($.datepicker.formatDate( "yy-mm-dd", lastPickedDateInSession));
    }
    else
    {
      $("Payment").val($.datepicker.formatDate( "yy-mm-dd", new Date() ));
    }
    

    for (var i = 0; i < categoryData.length; ++i)
    {
      var dropdownEntry = $(document.createElement('a'));
      dropdownEntry.("class", "dropdown-item dropdown-item-categorySelection");
      dropdownEntry.("href", "#");
      dropdownEntry.html(categoryData[i].name);
      $("#inputCategoryPayment1Button").parent().find(".dropdown-menu").append(dropdownEntry);
      $("#inputCategoryPayment2Button").parent().find(".dropdown-menu").append(dropdownEntry);
      $("#inputCategoryPayment3Button").parent().find(".dropdown-menu").append(dropdownEntry);
      $("#inputCategoryPayment4Button").parent().find(".dropdown-menu").append(dropdownEntry);
    }

    $('.insertTransactionButtonToggleBooked').off("click");
    $('.insertTransactionButtonToggleBooked').on("click", function()
    {
      if($(this).html() == "Booked")
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


    $('#addTransactionButton').on("click",function(event)
    {
      event.preventDefault();

      var currentTransactionKind = null
      if($('#addTransaction #payment').attr("style") != "display:none")
      {
        currentTransactionKind = "payment";
      } else if ($('#addTransaction #income').attr("style") != "display:none") 
      {
        currentTransactionKind = "income";
      } else if ($('#addTransaction #transfer').attr("style") != "display:none")
      {
        currentTransactionKind = "transfer";
      } else if ($('#addTransaction #correction').attr("style") != "display:none")
      {
        currentTransactionKind = "correction";
      }

      // Super basic validation - increase errorCount variable if any fields are blank
      var errorSubmission = false;
      if(
        $('#addTransaction '+ currentTransactionKind +' .inputName').val() == "" 
        || $('#addTransaction '+ currentTransactionKind +' #inputAccount').val() == "" 
        || $('#addTransaction '+ currentTransactionKind +' #inputAmount1').val() == "" 
        || $('#addTransaction '+ currentTransactionKind +' #inputCategory1Button').html() == "" 
      )
      {
        errorSubmission = true
      }

      var foundCategory = false;
      for (var i = 0; i < categoryData.length; ++i)
      {
        if(categoryData[i].name === $('#addTransaction '+ currentTransactionKind +' #inputCategory1Button').html())
        {
          foundCategory = true;
          break;
        }
      }
      if(!foundCategory)
      {
        errorSubmission = true;
      }

      // Check and make sure errorCount's still at zero
      if(! errorSubmission && foundCategory) {
    
        // If it is, compile all user info into one object
        var newTransaction = {
          'name': $('#addTransaction ' + currentTransactionKind + ' .inputName').val(),
          'account': $('#addTransaction ' + currentTransactionKind + ' #inputAccount').val(),
          'bookingType': thisID,
          'dateEntered': new Date($.datepicker.parseDate( "yy-mm-dd",$('Payment').val())).getTime(),
          'dateBooked': $('#insertTransactionButtonToggleBooked').html() === "Booked" ? Date.now() : null,
          'amount' : [
            {
              "category" : $('#addTransaction ' + currentTransactionKind + ' #inputCategory1Button').html(),
              "amount" : (parseFloat($('#addTransaction ' + currentTransactionKind + ' #inputAmount1').val()) * -1.0).toString()
            }
          ]
        }

        for (var i = 0; i < 2; ++i)
        {
          if($('#addTransaction ' + currentTransactionKind + ' #inputCategory' + (i+2).toString() + "Button").html()  != "Pick Category " + (i+2).toString() && $('#addTransaction ' + currentTransactionKind + ' #inputAmount'+ (i+2).toString()).val() != "")
          {
            newTransaction.amount.push(
              {
                "category": $('#addTransaction ' + currentTransactionKind + ' #inputCategory'+ (i+2).toString() + "Button").html() ,
                "amount" : (parseFloat($('#addTransaction ' + currentTransactionKind + ' #inputAmount'+ (i+2).toString()).val()) * -1.0).toString()
              });
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
            $('#addTransaction ' + currentTransactionKind + ' input').val('');

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
      else {
        // If errorCount is more than 0, error out
        alert('Error occurred.');
      }
    });
  }


  $('.dropdown-item-paymentTypeSelection').off("click");
  $('.dropdown-item-paymentTypeSelection').on('click', function(event)
  {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel ibute
    var thisID = $(this).html();


    showButtonsAddingTransaction(thisID);

  })
  $('.dropdown-item-categorySelection').off("click");
  $('.dropdown-item-categorySelection').on('click', function(event)
  {
    // Prevent Link from Firing
    event.preventDefault();

    $(this).parent().parent().find(".dropdown-toggle").html($(this).html());
  })

  $('#addTransaction').append($(document.createElement('br'))); 

  categoryNames = []
  for (catItem in categoryData)
  {
    categoryNames.push(catItem.name);
  }
  //$('.categoryInputField').autocomplete({source: categoryNames});

};

// Show User Info
function showTransactionInfo(event) {

  // Prevent Link from Firing
  event.preventDefault();

  // Retrieve username from link rel ibute
  var thisID = $(this).('rel');
  
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

  if(thisUserObject != [])
  {
    //Populate Info Box
    $('#transactionInfoDateEntered').text(new Date(parseInt(thisUserObject.dateEntered)).toISOString().substring(0, 10));
    $('#transactionInfoDateBooked').text(/**/thisUserObject.dateBooked === null ? null : ( new Date(parseInt(thisUserObject.dateEntered)).toISOString().substring(0, 10) )/**/);
    $('#transactionInfoName').text(thisUserObject.name);
    $('#transactionInfoID').text(thisUserObject._id);
    $('#transactionInfoAccount').text(thisUserObject.account);
    $('#transactionInfoBookingType').text(thisUserObject.bookingType);

    if(thisUserObject.bookingType == "Transfer")
    {
      $('#transactionInfoTargetAccount').text(thisUserObject.targetAccount);
    }
    else
    {
      $('#transactionInfoTargetAccount').text("");
    }
    
    var totalAmount = 0.0;
    var categoriesString = "";
    for (var i=0; i < thisUserObject.amount.length; ++i)
    {
      totalAmount = totalAmount + parseFloat(thisUserObject.amount[i].amount);
      categoriesString += thisUserObject.amount[i].category.toString() + " - " + parseFloat(thisUserObject.amount[i].amount).toFixed(2) + "<br>";
    }
    $('#transactionInfoTotalAmount').text(totalAmount.toFixed(2));


    $('#transactionInfoCategories').html(categoriesString);
  }
};

function showCategoryInfo(event) {

  $('#categoriesInfo').("style","display:block");
  // Prevent Link from Firing
  event.preventDefault();

  // Retrieve username from link rel ibute
  var thisID = $(this).('rel');
  
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

  //perform error checking here.

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
    var htmlString = "";
    if(thisUserObject.systems != null)
    {
      htmlString += "<strong>Debitors</strong><br>";

      for (var i=0; i < thisUserObject.systems.length; ++i)
      {
        htmlString += " - " + thisUserObject.systems[i].debitor + " pays " + thisUserObject.systems[i].percentage + "%.<br>";
      }
    }
    htmlString += "<br><br>";
    $('#categoryInfoDebitorList').html(htmlString);
  }
};

function modifyCategory(event)
{
  // Prevent Link from Firing
  event.preventDefault();

  $('#addCategoryButton').css("display", "none");

  // Retrieve username from link rel ibute
  var thisID = $(this).('rel');
  $('#tegoryID').val(thisID);
  
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
    $('#modifyDatabaseEntryCategory #changeCategoryAllocation').val(thisUserObject.allocatedSinceReference);
    if(thisUserObject.systems != null)
    {
      for (var i=0; i < thisUserObject.systems.length && i < 3; ++i)
      {
        $('#modifyDatabaseEntryCategory #changeCategoryDebitor' + (i+1).toString()).val(thisUserObject.systems[i].debitor);
        $('#modifyDatabaseEntryCategory #changeCategoryPercentage' + (i+1).toString()).val(thisUserObject.systems[i].percentage);
      }
      for (var i=thisUserObject.systems.length; i < 3; ++i)
      {
        $('#modifyDatabaseEntryCategory #changeCategoryDebitor' + (i+1).toString()).val("");
        $('#modifyDatabaseEntryCategory #changeCategoryPercentage' + (i+1).toString()).val("");
      }
    }
    
  }

  $('#modifyDatabaseEntryCategory').("style","display:block");

  $('#modifyDatabaseEntryCategory #changeCategoryButton').off("click");
  $('#modifyDatabaseEntryCategory #changeCategoryButton').on("click",function(event)
  {
    // Retrieve username from link rel ibute
    var thisID = $('#tegoryID').val();
    
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

      var allocatedSinceReferenceArray = thisUserObject.allocatedSinceReference;

      var found = getIteratorFromAllocatedSinceReferenceArray(allocatedSinceReferenceArray,selectedYear,selectedMonth);
      if (found != null)
      {
        allocatedSinceReferenceArray[i].amount = $('#modifyDatabaseEntryCategory #changeCategoryAllocation').val();
      }
      else
      {
        allocatedSinceReferenceArray.push({"amount":$('#modifyDatabaseEntryCategory #changeCategoryAllocation').val(),"year":selectedYear,"month":selectedMonth});
      }

      // If it is, compile all user info into one object
      var newTransaction = {
        'name': $('#modifyDatabaseEntryCategory input#changeCategoryName').val(),
        'systems': null,
        "referenceDate" : thisUserObject.referenceDate,
        "referenceAmount" : thisUserObject.referenceAmount,
        "associatedTransactions" : thisUserObject.associatedTransactions,
        "allocatedSinceReference" : allocatedSinceReferenceArray
      }

      if($('#modifyDatabaseEntryCategory input#changeCategoryDebitor1').val() != "")
      {
        if (newTransaction.systems === null)
        {
          newTransaction.systems = [];
        }

        var debitor1Val = $('#modifyDatabaseEntryCategory input#changeCategoryDebitor1').val();
        newTransaction.systems.push(
          {
            "debitor": $('#modifyDatabaseEntryCategory input#changeCategoryDebitor1').val(),
            "percentage" : $('#modifyDatabaseEntryCategory input#changeCategoryPercentage1').val()
          });
      }
      if($('#modifyDatabaseEntryCategory input#changeCategoryDebitor2').val() != "")
      {
        if (newTransaction.systems === null)
        {
          newTransaction.systems = [];
        }
        var debitor1Val = $('#modifyDatabaseEntryCategory input#changeCategoryDebitor2').val();
        newTransaction.systems.push(
          {
            "debitor": $('#modifyDatabaseEntryCategory input#changeCategoryDebitor2').val(),
            "percentage" : $('#modifyDatabaseEntryCategory input#changeCategoryPercentage2').val()
          });
      }
      if($('#modifyDatabaseEntryCategory input#changeCategoryDebitor3').val() != "")
      {
        if (newTransaction.systems === null)
        {
          newTransaction.systems = [];
        }
        var debitor1Val = $('#modifyDatabaseEntryCategory input#changeCategoryDebitor3').val();
        newTransaction.systems.push(
          {
            "debitor": $('#modifyDatabaseEntryCategory input#changeCategoryDebitor3').val(),
            "percentage" : $('#modifyDatabaseEntryCategory input#changeCategoryPercentage3').val()
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
    populateCategoryTable();
    $('#modifyDatabaseEntryCategory').("style","display:none");
    $('#addCategoryButton').css("display", "block");
  });
  $('#modifyDatabaseEntryCategory #cancelChangeCategoryButton').off("click");
  $('#modifyDatabaseEntryCategory #cancelChangeCategoryButton').on("click",function(event)
  {
    $('#addCategoryButton').css("display", "block");
    $('#modifyDatabaseEntryCategory input').val('');
    $('#modifyDatabaseEntryCategory').("style","display:none");
  });
};

// Delete User
function deleteTransaction(event) {

  event.preventDefault();

  // Pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to delete this entry?');

  // Check and make sure the user confirmed
  if (confirmation === true) {

    // If they did, do our delete
    $.ajax({
      type: 'DELETE',
      url: '/db/transactions_delete/' + $(this).('rel')
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
  $('#modifyDatabaseEntryCategory').("style","display:none");
  $('#categoriesInfo').("style","display:none");
};


