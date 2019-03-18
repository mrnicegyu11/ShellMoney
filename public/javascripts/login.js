/*  */// SHELLMONEY login.js

$("#login").on("click",function(event)
{
  document.getElementById("form").action = "/login";
})

$("#create").on("click",function(event)
{
  document.getElementById("form").action = "/createUser";
})

//var canvas = document.getElementById("vantawaves");
//canvas.width = document.body.clientWidth; //document.width is obsolete
//canvas.height = document.body.clientHeight; //document.height is obsolete