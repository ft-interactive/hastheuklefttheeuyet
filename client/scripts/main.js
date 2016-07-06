fetch("https://bertha.ig.ft.com/view/publish/gss/1df2KhuBMRYJji9SDX528c8RGGGaMPASDyCmFB7PZRSE/options")
	.then(function(res) {
		res.json().then(function(jsonresponse) {
			if (jsonresponse[0].result) {
				document.getElementById("answer").innerHTML = "Yes";
			} else {
				document.getElementById("answer").innerHTML = "No";
			}
		})
	});