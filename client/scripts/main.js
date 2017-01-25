fetch('https://bertha.ig.ft.com/view/publish/gss/1df2KhuBMRYJji9SDX528c8RGGGaMPASDyCmFB7PZRSE/options')
  .then(function(res) {
    res.json().then(function(jsonresponse) {
      if (jsonresponse[0].result) {
        document.getElementById('answer').innerHTML = 'Yes';
      } else {
        document.getElementById('answer').innerHTML = 'No';
      }

      const todayDate = moment().format('D MMM YYYY');
      const sinceReferendum = moment().diff(moment('2016-06-23'), 'days');
      document.getElementById('timestamp').innerHTML = `as of ${todayDate}, <br />${sinceReferendum} days since the EU referendum.`;
    });
  });
