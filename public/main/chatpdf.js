		const API_URL = "";
		$(function() {
			$("#chathistorylinker").click(function() { $("#historyform").submit(); });
			$("#filename").change(function() { uploadFile(); });
			$('#questform').submit(function() { return submitQuest(); });
			$('#sendbutton').click(function() { return submitQuest(); });
			if($.trim($("#fileid").val())=="") {
				$('#query').focus();
			} else {
				$('#filename').focus();
			}
			loadCategories();
		});
		function submitQuest() {
			if($.trim($('#query').val())=="") { $('#query').focus(); return false; }
			//if($.trim($("#fileid").val())=="") { $("#filename").click(); return false; }
			sendQuery($('#query').val());
			$("#fileid").val('');
			$('#query').val('');
			return false;
		}
		function sendQuery(quest) {
			let li = $('<li>').addClass("fxc").append($('<span>').addClass("topic topic-quest f-left").text("Question")).append($('<span>').addClass("text text-quest f-right").text(quest));
			$('#listmessages').append(li);
			$(".input-ask").prop('disabled', true);
			let model = $("input[name='model']:checked").val();
			window.scrollTo(0,questmessages.scrollHeight);
			$("#waitlayer").show();
			jQuery.ajax({
				url: API_URL+"/api/chatpdf/quest",
				data: {mime: "PDF", model: model, image: $("#fileid").val(), query: quest},
				type: "POST",
				dataType: "html",
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",
				error : function(transport,status,errorThrown) {
					$("#waitlayer").hide();
					let err = $('<li>').addClass("fxc").append($('<span>').addClass("topic topic-error f-left").text("Error")).append($('<span>').addClass("text text-error f-right").text(errorThrown));
					$('#listmessages').append(err);
					$(".input-ask").prop('disabled', false);
				},
				success: function(data,status,transport) {
					$("#waitlayer").hide();
					let json = $.parseJSON(data);
					if(json) {
						displayQueryAnswer(json.query, json.answer, json.error);
						displayDataSet(json.dataset);
					}
					$(".input-ask").prop('disabled', false);
					window.scrollTo(0,questmessages.scrollHeight);
					$('#query').focus();
				}
			});	
		}
		function displayQueryAnswer(query, answer, error) {
			let span = $('<span>').addClass("typed-out").attr("style","--n:"+answer.length).text(answer);
			let txt =  $('<div>').addClass(error?"typed-container text text-error f-right":"typed-container text text-success f-right").append(span);
			let ans = $('<li>').addClass("fxc").append($('<span>').addClass("topic topic-answer f-left").text("Answer")).append(txt);
			$('#listmessages').append(ans);
		}
		function displayDataSet(data) {
			if(data) {
				let dsboxchk = true; //$("#datasetbox").is(":checked");
				let div = $('<div>').addClass("text text-answer table-responsive");
				let li = $('<li>').addClass("fxc li-dataset").append($('<span>').addClass("topic topic-answer").text("")).append(div);
				if(!dsboxchk) li.addClass("fa-hidden");
				$('#listmessages').append(li);
				if(Array.isArray(data) && data.length>0) {
					let table = $('<table>').addClass("tables table-data table-bordered");
					let rowhead = $('<tr>');
					let first = data[0];
					for(let key in first) {
						rowhead.append($('<th>').text(key));
					}
					table.append($('<thead>').append(rowhead));
					let tbody = $('<tbody>');
					$(data).each(function(index, item) {
						let tr = $('<tr>');
						for(let key in item) {
							tr.append($('<td>').text(item[key]));
						}
						tbody.append(tr);
					});
					table.append(tbody);
					div.append(table);
				} else {
					div.text(data);
				}
			}
		}
		function uploadFile(aform) {
			if(!aform) aform = uploadform;
			let fileExtension = ['pdf','txt'];
        	if ($.inArray($("#filename").val().split('.').pop().toLowerCase(), fileExtension) == -1) {
            	alert("Only pdf or text file type are allowed : "+fileExtension.join(', '));
				return false;
        	}			
			$("#fileid").val('');
			$("#waitlayer").show();
			let fd = new FormData(aform);
			jQuery.ajax({
				url: "/upload/file",
				type: "POST",
				dataType: "html",
				data: fd,
				enctype: "multipart/form-data",
				processData: false, 
				contentType: false, 
				error : function(transport,status,errorThrown) { 
					$("#waitlayer").hide();
					try {
						let json = $.parseJSON($.trim(data));
						if(json && json["head"]) {
							alert(json.head["errordesc"]);
						}
						return;
					} catch(ex) { }
					alert(errorThrown);
				},
				success: function(data,status,transport){ 
					console.log("response : "+transport.responseText);
					$("#waitlayer").hide();
					let json = $.parseJSON($.trim(data));
					if(json && json["body"]) {
						let rows = json.body["rows"];
						if(rows && rows["attachid"]) {
							$("#fileid").val(rows["attachid"]);
						}
					}
				}
			});	
		}
