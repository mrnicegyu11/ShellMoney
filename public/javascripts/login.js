/*  */// SHELLMONEY login.js

$("#login").on("click",function(event)
{
  document.getElementById("form").action = "/login";
})

$("#create").on("click",function(event)
{
  document.getElementById("form").action = "/createUser";
})