const API_URL = "";
$(function() {
	$('#questform').submit(function() {
		if($('#query').val().trim()=="") return false;
		sendQuery($('#query').val());
		$('#query').val('');
		return false;
	});
	$('#query').focus();
	$("#clearlinker").click(function() { $("#listmessages").empty(); });
	setupCategories();
});
function sendQuery(quest) {
	let li = $('<li>').addClass("fxc").append($('<span>').addClass("topic topic-quest f-left").text("Question")).append($('<span>').addClass("text text-quest f-right").text(quest));
	$('#listmessages').append(li);
	$(".input-ask").prop('disabled', true);
	questmessages.scrollTo(0,questmessages.scrollHeight);
	$("#waitlayer").show();
	let cat = $("input[name='category']:checked").val();
	jQuery.ajax({
		url: API_URL+"/api/chat/quest",
		data: {category: cat, query: quest},
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
			questmessages.scrollTo(0,questmessages.scrollHeight);
		}
	});	
}
function displayQueryAnswer(query, answer, error) {
	let span = $('<span>').addClass("typed-out").attr("style","--n:"+answer.length).text(answer);
	let txt =  $('<div>').addClass(error?"typed-container text text-error f-right":"typed-container text text-success f-right").append(span);
	let ans = $('<li>').addClass("fxc").append($('<span>').addClass("topic topic-answer f-left").text("Answer")).append(txt);
	let queryboxchk = $("#querybox").prop("checked");
	if(queryboxchk) {
		let qry = $('<li>').addClass("fxc").append($('<span>').addClass("topic topic-query f-left").text("Query")).append($('<span>').addClass("text text-query f-right").text(query));
		$('#listmessages').append(qry);
	}
	$('#listmessages').append(ans);
}
function displayDataSet(data) {
	if(!$("#datasetbox").prop("checked")) return;
	if(data && data.length>0) {
		let div = $('<div>').addClass("text text-answer table-responsive f-right");
		let li = $('<li>').addClass("fxc").append($('<span>').addClass("topic topic-answer f-left").text("")).append(div);
		$('#listmessages').append(li);
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
	}
}
function setupCategories() {
	buildCategories();
	setupSelectedCategories();
}
function setupSelectedCategories() {
	$("label.label-cat").each(function(index,element) {
		$(element).click(function() {
			$("label.label-cat").removeClass("cat-selected").parent().find("label.cat-pointer").html("&#160;&#160;");
			$(this).addClass("cat-selected").parent().find("label.cat-pointer").html("&#187;");
			buildExamples($(this).parent().find("input[name='category']").val());
		});
	});
	buildExamples($("input[name='category']:checked").val());
}
function buildCategories() {
	let ul = $("#categorylisting").empty();
	for(let cat in system_categories) {
		let info = system_categories[cat];
		let catname = info.title.replaceAll(' ','').toLowerCase();
		let li = $('<li>');
		let div = $('<div>').addClass("category-info");
		let pointer = $('<label>').addClass("cat-pointer").html("&#160;&#160;");
		let input = $('<input>').attr({type: "radio", class: "cat-radio", name: "category", id: cat, value: cat});
		let span = $('<span>').addClass("span-cat").append(pointer).append(input);
		let label = $('<label>').addClass("label-cat").attr("for",cat).text(info.title);
		if(info.selected) {
			pointer.html("&#187;");
			input.attr("checked","checked");
			label.addClass("cat-selected");
		}
		div.append(span).append(label);
		let menu = $('<div>').addClass("menu dropdown cat-menu");
		let m = $('<span>').addClass("m dropbtn").html("&#8942;");
		let content = $('<div>').addClass("dropdown-content cat-content");
		let link1 = $('<a>').attr("href","#0").addClass("info-linker").attr("data-cat",cat).text("Table Info");
		let link2 = $('<a>').attr("href","#0").addClass("info-downloader").attr("data-cat",cat).attr("target","table_info_window").attr("download",catname+"_schema.sql").text("Download");
		link1.click(function() {
			let cat = $(this).attr("data-cat");
			$("#infocategory").val(cat);
			$("#infoform").submit();
			return false;
		});
		link2.click(function() {
			let cat = $(this).attr("data-cat");
			let url = "/api/tableinfo/html?category="+cat;
			$(this).attr("href",url);
		});
		content.append(link1).append(link2);
		menu.append(m).append(content);
		li.append(div).append(menu);
		ul.append(li);
	}
}
function buildExamples(cat) {
	console.log("buildExamples",cat);
	let info = system_categories[cat];
	let ul = $("#examplelisting").empty();
	if(!info) return;
	$(info.examples).each(function(index,element) {
		let li = $('<li>').text(element.question);
		ul.append(li);
		li.click(function() { 
			$("#query").val(li.text());
		});
	});
}
function bindingCategories() {
	$("a.info-linker").each(function(index,element) {
		$(element).click(function() {
			let cat = $(this).attr("data-cat");
			$("#infocategory").val(cat);
			$("#infoform").submit();
			return false;
		});
	});
	$("a.info-downloader").each(function(index,element) {
		$(element).click(function() {
			let cat = $(this).attr("data-cat");
			let url = "/api/tableinfo/html?category="+cat;
			$(this).attr("href",url);
		});
	});
}
