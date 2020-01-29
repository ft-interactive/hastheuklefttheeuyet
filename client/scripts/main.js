fetch('https://bertha.ig.ft.com/view/publish/gss/1df2KhuBMRYJji9SDX528c8RGGGaMPASDyCmFB7PZRSE/options')
  .then((res) => {
    res.json().then((jsonresponse) => {
      if (jsonresponse[0].result === 'no') {
        document.getElementById('answer').innerHTML = 'No';
      }

      if (jsonresponse[0].result === 'yes') {
        document.getElementById('answer').innerHTML = 'Yes';
      }

      if (jsonresponse[0].result === 'not yet') {
        document.getElementById('answer').innerHTML = 'Not quite';
      }

      // const todayDate = moment().format('D MMM YYYY');
      // const sinceReferendum = moment().diff(moment('2016-06-23'), 'days');
      document.getElementById('timestamp').innerHTML = 'The UK is leaving on Friday January 31 2020';
    });
  });
