(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

fetch('https://bertha.ig.ft.com/view/publish/gss/1df2KhuBMRYJji9SDX528c8RGGGaMPASDyCmFB7PZRSE/options').then(function (res) {
  res.json().then(function (jsonresponse) {
    if (jsonresponse[0].result === 'no') {
      document.getElementById('answer').innerHTML = 'No';
    }

    if (jsonresponse[0].result === 'yes') {
      document.getElementById('answer').innerHTML = 'Yes';
    }

    if (jsonresponse[0].result === 'not yet') {
      document.getElementById('answer').innerHTML = 'Not yet';
    }

    var todayDate = moment().format('D MMM YYYY');
    var sinceReferendum = moment().diff(moment('2016-06-23'), 'days');
    document.getElementById('timestamp').innerHTML = 'as of ' + todayDate + ', <br />' + sinceReferendum + ' days since the EU referendum.';
  });
});

},{}]},{},[1]);
