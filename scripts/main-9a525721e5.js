(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

fetch('https://bertha.ig.ft.com/view/publish/gss/1df2KhuBMRYJji9SDX528c8RGGGaMPASDyCmFB7PZRSE/options').then(function (res) {
  res.json().then(function (jsonresponse) {
    if (jsonresponse[0].result) {
      document.getElementById('answer').innerHTML = 'Yes';
    } else {
      document.getElementById('answer').innerHTML = 'No';
    }

    var todayDate = moment().format('D MMM YYYY');
    var sinceReferendum = moment().diff(moment('2016-06-23'), 'days');
    document.getElementById('timestamp').innerHTML = 'as of ' + todayDate + ', <br />' + sinceReferendum + ' days since the EU referendum.';
  });
});

},{}]},{},[1]);
