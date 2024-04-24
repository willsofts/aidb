var mouseX = 0;
var mouseY = 0;
//#(10000) programmer code begin;
//#(10000) programmer code end;
$(function(){
	$(this).mousedown(function(e) { mouseX = e.pageX; mouseY = e.pageY; });
	try { startApplication("text"); }catch(ex) { }
	initialApplication();
	//#(20000) programmer code begin;
	//#(20000) programmer code end;
});
function initialApplication() {
	//#(30000) programmer code begin;
	//#(30000) programmer code end;
	setupComponents();
	setupAlertComponents();
	//#(40000) programmer code begin;
	$("#addcaptionlinker").click(function() { addNewCaption(); });
	$("#addlabellinker").click(function() { addNewLabel(); });
	$("#labeldialogpanel").find(".modal-dialog").draggable();
	initialApplicationControls($("#labeldialogpanel"));
	$("#correct").change(function() {
		if($(this).is(":checked")) {
			$("#correctprompt").removeAttr("disabled");
		} else {
			$("#correctprompt").attr("disabled","disabled");
		}
	});
	//#(40000) programmer code end;
}
function setupComponents() {
	//#(50000) programmer code begin;
	//#(50000) programmer code end;
	$("#searchbutton").click(function(evt) {
		resetFilters();
		search();  return false;
	});
	$("#insertbutton").click(function(evt) {
		insert();  return false;
	});
	$("#savebutton").click(function() {
		disableControls($("#savebutton"));
		save();  return false;
	});
	$("#cancelbutton").click(function() {
		cancel();  return false;
	});
	$("#updatebutton").click(function() {
		disableControls($("#updatebutton"));
		update();  return false;
	});
	$("#deletebutton").click(function() {
		disableControls($("#deletebutton"));
		deleted();  return false;
	});
	//#(60000) programmer code begin;
	$("#addquestion").click(function() { addNewQuestion(); });
	//#(60000) programmer code end;
}
function resetFilters() {
	try { 
		fssearchform.page.value = "1";
		fssearchform.orderBy.value = "";
		fssearchform.orderDir.value = "";
	}catch(ex) { }	
}
function refreshFilters() {
	try { 
		fssearchform.page.value = fslistform.page.value;
		fssearchform.orderBy.value = fschapterform.orderBy.value;
		fssearchform.orderDir.value = fschapterform.orderDir.value;
	}catch(ex) { }	
}
function ensurePaging(tablebody) {
	if(!tablebody) tablebody = "#datatablebody";
	try {
		let pageno = parseInt(fslistform.page.value);
		let size = $(tablebody).find("tr").length;
		if(size<=1 && pageno>1) {
			fslistform.page.value = ""+(pageno-1);
		}
	} catch(ex) { }
}
function search(aform) {
	//#(70000) programmer code begin;
	//#(70000) programmer code end;
	if(!aform) aform = fssearchform;
	let formdata = serializeDataForm(aform);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/text/search",
		data: formdata.jsondata,
		headers : formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			searchComplete(transport,data);
		}
	});	
	//#(80000) programmer code begin;
	//#(80000) programmer code end;
}
function searchComplete(xhr,data) {
	$("#listpanel").data("searchfilters",createParameters(fssearchform));
	//#(90000) programmer code begin;
	//#(90000) programmer code end;
	stopWaiting();
	$("#listpanel").html(data);
	setupDataTable();
	//#(100000) programmer code begin;
	//#(100000) programmer code end;
}
function insert() {
	//#(110000) programmer code begin;
	//#(110000) programmer code end;
	let aform = fslistform;
	aform.docid.value = "";
	let formdata = serializeDataForm(aform);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/text/add",
		data: formdata.jsondata,
		headers : formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			stopWaiting();
			$("#dialogpanel").html(data);
			setupDialogComponents();
			$("#fsmodaldialog_layer").modal("show");
		}
	});
	return false;
	//#(120000) programmer code begin;
	//#(120000) programmer code end;
}
function clearingFields() {
	//#(130000) programmer code begin;
	//#(130000) programmer code end;
	fsentryform.reset();
	//#(140000) programmer code begin;
	//#(140000) programmer code end;
}
function cancel() {
	//#(150000) programmer code begin;
	//#(150000) programmer code end;
	confirmCancel(function() {
		clearingFields();
		window.close();
	});
	//#(160000) programmer code begin;
	//#(160000) programmer code end;
}
function validSaveForm(callback) {
	//#(170000) programmer code begin;
	//#(170000) programmer code end;
	return validRequiredFields(callback,fs_requiredfields);
	//#(180000) programmer code begin;
	//#(180000) programmer code end;
}
function save(aform) {
	//#(190000) programmer code begin;
	fs_requiredfields = {
		"doctitle":{msg:""},
		"captions":{msg:""},
	};
	$("#caption_alert").hide();
	let captions = scrapeCaptions();
	$("#captions").val(JSON.stringify(captions,null,2));
	console.log("captions=",captions);
	//#(190000) programmer code end;
	if(!aform) aform = fsentryform;
	if(!validNumericFields(aform)) return false;
	validSaveForm(function() {
		//#(195000) programmer code begin;
		if(!validateCaptions()) {
			$("#captions").focus();	
			$("#captions").parent().addClass("has-error");
			$("#captions_alert").show();
			return;
		}
		if(captions.length==0) {
			$("#caption_alert").show();
			return;
		}
		//#(195000) programmer code end;
		confirmSave(function() {
			let formdata = serializeDataForm(aform);
			startWaiting();
			jQuery.ajax({
				url: API_URL+"/api/text/insert",
				data: formdata.jsondata,
				headers : formdata.headers,
				type: "POST",
				dataType: "html",
				contentType: defaultContentType,
				error : function(transport,status,errorThrown) {
					submitFailure(transport,status,errorThrown);
				},
				success: function(data,status,transport){
					stopWaiting();
					//#(195300) programmer code begin;
					//#(195300) programmer code end;
					successbox(function() {
						$("#fsmodaldialog_layer").modal("hide");
					});
					//#(195500) programmer code begin;
					refreshFilters();
					search();
					//#(195500) programmer code end;
				}
			});
		});
	});
	return false;
	//#(200000) programmer code begin;
	//#(200000) programmer code end;
}
function update(aform) {
	//#(230000) programmer code begin;
	fs_requiredfields = {
		"doctitle":{msg:""},
		"captions":{msg:""},
	};
	$("#caption_alert").hide();
	let captions = scrapeCaptions();
	$("#captions").val(JSON.stringify(captions,null,2));
	console.log("captions=",captions);
	//#(230000) programmer code end;
	if(!aform) aform = fsentryform;
	if(!validNumericFields(aform)) return false;
	validSaveForm(function() {
		//#(235000) programmer code begin;
		if(!validateCaptions()) {
			$("#captions").focus();	
			$("#captions").parent().addClass("has-error");
			$("#captions_alert").show();
			return;
		}
		if(captions.length==0) {
			$("#caption_alert").show();
			return;
		}
		//#(235000) programmer code end;
		confirmUpdate(function() {
			let formdata = serializeDataForm(aform);
			startWaiting();
			jQuery.ajax({
				url: API_URL+"/api/text/update",
				data: formdata.jsondata,
				headers : formdata.headers,
				type: "POST",
				dataType: "html",
				contentType: defaultContentType,
				error : function(transport,status,errorThrown) {
					submitFailure(transport,status,errorThrown);
				},
				success: function(data,status,transport){ 
					stopWaiting();
					//#(235300) programmer code begin;
					//#(235300) programmer code end;
					successbox(function() { 
						$("#fsmodaldialog_layer").modal("hide");
					});
					//#(235500) programmer code begin;
					refreshFilters();
					search();
					//#(235500) programmer code end;
				}
			});
		});
	});
	return false;
	//#(240000) programmer code begin;
	//#(240000) programmer code end;
}
function submitRetrieve(src,docid) {
	//#(250000) programmer code begin;
	//#(250000) programmer code end;
	let aform = fslistform;
	aform.docid.value = docid;
	let formdata = serializeDataForm(aform);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/text/retrieval",
		data: formdata.jsondata,
		headers: formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			stopWaiting();
			$("#dialogpanel").html(data);
			setupDialogComponents();
			$("#fsmodaldialog_layer").modal("show");
		}
	});
	return false;
	//#(260000) programmer code begin;
	//#(260000) programmer code end;
}
function submitChapter(aform,index) {
	let fs_params = fetchParameters($("#listpanel").data("searchfilters"));
	//#(270000) programmer code begin;
	//#(270000) programmer code end;
	let formdata = serializeDataForm(aform, $("#listpanel").data("searchfilters"));
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/text/search",
		data: formdata.jsondata,
		headers: formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			stopWaiting();
			$("#listpanel").html(data);
			setupDataTable();
		}
	});
	//#(280000) programmer code begin;
	//#(280000) programmer code end;
}
function submitOrder(src,sorter) {
	let aform = fssortform;
	aform.orderBy.value = sorter;
	let fs_params = fetchParameters($("#listpanel").data("searchfilters"));
	let formdata = serializeDataForm(aform, $("#listpanel").data("searchfilters"));
	//#(290000) programmer code begin;
	//#(290000) programmer code end;
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/text/search",
		data: formdata.jsondata,
		headers: formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			stopWaiting();
			$("#listpanel").html(data);
			setupDataTable();
		}
	});
	return false;
	//#(300000) programmer code begin;
	//#(300000) programmer code end;
}
function submitDelete(src,fsParams) {
	//#(310000) programmer code begin;
	//#(310000) programmer code end;
	confirmDelete([fsParams[1]],function() {
		deleteRecord(fsParams);
	});
	//#(320000) programmer code begin;
	//#(320000) programmer code end;
}
function deleteRecord(fsParams) {
	//#(330000) programmer code begin;
	//#(330000) programmer code end;
	let params = {
		ajax: true,
		docid : fsParams[0]
	};
	let formdata = serializeParameters(params);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/text/remove",
		data: formdata.jsondata,
		headers: formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			stopWaiting();
			//#(333000) programmer code begin;
			//#(333000) programmer code end;
			ensurePaging();
			refreshFilters();
			search();
			//#(335000) programmer code begin;
			//#(335000) programmer code end;
		}
	});
	//#(340000) programmer code begin;
	//#(340000) programmer code end;
}
function deleted(aform) {
	//#(345000) programmer code begin;
	//#(345000) programmer code end;
	if(!aform) aform = fsentryform;
	confirmDelete([],function() {
		let formdata = serializeDataForm(aform);
		//#(347000) programmer code begin;
		//#(347000) programmer code end;
		startWaiting();
		jQuery.ajax({
			url: API_URL+"/api/text/remove",
			data: formdata.jsondata,
			headers: formdata.headers,
			type: "POST",
			dataType: "html",
			contentType: defaultContentType,
			error : function(transport,status,errorThrown) {
				submitFailure(transport,status,errorThrown);
			},
			success: function(data,status,transport){ 
				stopWaiting();
				//#(347500) programmer code begin;
				//#(347500) programmer code end;
				$("#fsmodaldialog_layer").modal("hide");
				ensurePaging();
				refreshFilters();
				search();
				//#(347700) programmer code begin;
				//#(347700) programmer code end;
			}
		});
	});
	return false;
	//#(348000) programmer code begin;
	//#(348000) programmer code end;
}
function setupDialogComponents() {
	//#(380000) programmer code begin;
	//#(380000) programmer code end;
	$("#savebutton").click(function() {
		disableControls($("#savebutton"));
		save(); return false;
	});
	$("#updatebutton").click(function() {
		disableControls($("#updatebutton"));
		update(); return false;
	});
	$("#deletebutton").click(function() {
		disableControls($("#deletebutton"));
		deleted(); return false;
	});
	setupAlertComponents($("#dialogpanel"));
	initialApplicationControls($("#dialogpanel"));
	$("#dialogpanel").find(".modal-dialog").draggable();
	//#(385000) programmer code begin;
	$("#captiontablebody").find(".fa-data-edit").each(function(index,element) {
		$(element).click(function() {
			if($(this).is(":disabled")) return;
			editLabel(element,$(this).parent().parent().attr("data-key"));
			return false;
		});
	});
	$("#captiontablebody").find(".fa-data-delete").each(function(index,element) {
		$(element).click(function() {
			if($(this).is(":disabled")) return;
			deleteLabel(element,$(this).parent().parent().attr("data-key"));
			return false;
		});
	});
	$("#addcaptionlinker").click(function() { addNewCaption(); });
	//#(385000) programmer code end;
}
var fs_requiredfields = {
	"doctitle":{msg:""},
	"captions":{msg:""},
};
//#(390000) programmer code begin;
function setupDataTable() {
	setupPageSorting("datatable",submitOrder);
	setupPagination("fschapterlayer",submitChapter,fschapterform,fssearchform);
	$("#datatablebody").find(".fa-data-edit").each(function(index,element) {
		$(element).click(function() {
			if($(this).is(":disabled")) return;
			submitRetrieve(element,$(this).parent().parent().attr("data-key"));
		});
	});
	$("#datatablebody").find(".fa-data-delete").each(function(index,element) {
		$(element).click(function() {
			if($(this).is(":disabled")) return;
			submitDelete(element,[$(this).parent().parent().attr("data-key"),$(this).attr("data-name")]);
		});
	});
}
function validateCaptions() {
	if($.trim($("#captions").val())!="") {
		try {
			JSON.parse($("#captions").val());
		} catch(ex) {
			return false;
		}
	}
	return true;
}
function addNewCaption() {
	$("#modalheadertitle_new").show();
	$("#modalheadertitle_edit").hide();
	$("#code").removeAttr("disabled").val("");
	$("#type").val("");
	$("#lines").val("");
	$("#correct").prop("checked",false);
	$("#correctprompt").val("");
	$("#labelslayer").empty();
	addNewLabel("");
	$("#labelokbutton").unbind("click").bind("click",function() { saveNewCaption(); });
	$("#fslabelmodaldialog_layer").modal("show");
}
function editLabel(src,lbcode) {
	//alert(code);
	$("#modalheadertitle_new").hide();
	$("#modalheadertitle_edit").show();
	let tr = $(src).parent().parent();
	let code = $("input.label-code",tr).eq(0).val();
	let type = $("input.label-type",tr).eq(0).val();
	let lines = $("input.label-lines",tr).eq(0).val();
	let correct = $("input.label-correct",tr).eq(0).val();
	let correctprompt = $("input.label-correctprompt",tr).eq(0).val();
	let labels = $("input.label-labels",tr).eq(0).val();
	$("#code").prop("disabled",true).val(code);
	$("#type").val(type);
	$("#lines").val(lines);
	$("#correct").prop("checked",correct=="true");
	$("#correctprompt").val(correctprompt);
	$("#labelslayer").empty();
	let labellist = [];
	try {
		labellist = JSON.parse(labels);
	} catch(ex) { }
	$(labellist).each(function(index,element) {
		addNewLabel(element);
	});
	$("#labelokbutton").unbind("click").bind("click",function() { updateEditCaption(src); });
	$("#fslabelmodaldialog_layer").modal("show");
	$("#correct").trigger("change");
}
function deleteLabel(src,code) {
	confirmDelete([code],function() {
		$(src).parent().parent().remove();
		setupSequence($("#captiontablebody"));
	});
}
function setupSequence(table) {
	let index = 1;
	$(table).find("tr").each(function() {
		$(this).find("td:first").html(index);
		index++;
	});
}
function addNewLabel(str) {
	if(!str) str = "";
	let div = $('<div class="label-input"></div>');
	let input = $('<input type="text" name="label" class="form-control input-md input-label"></input>');
	input.val(str);
	div.append(input);
	$("#labelslayer").append(div);
}
function scrapeLabels() {
	let labels = [];
	$("#labelslayer").find(".input-label").each(function(index,element) {
		let lbval = $(element).val();
		if($.trim(lbval)!="") {
			labels.push(lbval);
		}
	});
	return labels;
}
function saveNewCaption() {
	$("#label_alert").hide();
	fs_requiredfields = {
		"code":{msg:""},
	};
	validSaveForm(function() {
		let labellist = scrapeLabels();
		if(labellist.length==0) {
			$("#label_alert").show();
			$("#labelslayer").find(".input-label").eq(0).focus();
			return false;
		}
		let code = $("#code").val();
		let found = false;
		$("#captiontablebody").find("input.label-code").each(function(index,element) {
			if(code==$(element).val()) {
				found = true;
				return false;
			}
		});
		if(found) {
			alertDialog("Code already exists.");
			return false;
		}
		let type = $("#type").val();
		let lines = $("#lines").val();
		let correct = $("#correct").is(":checked");
		let correctprompt = $("#correctprompt").val();
		displayCaption(code,labellist,type,lines,correct,correctprompt);
		setupSequence($("#captiontablebody"));
		$("#fslabelmodaldialog_layer").modal("hide");
		$("#caption_alert").hide();
	});
}
function displayCaption(code,labels,type,lines,correct,correctprompt) {
	let tr = $("<tr></tr>").attr("data-key",code);
	let link1 = $('<a href="javascript:void(0)" class="alink-data fa-data-edit col-code"></a>').html(code);
	let link2 = $('<a href="javascript:void(0)" class="alink-data fa-data-edit col-labels"></a>').html(labels.join(" , "));
	let link3 = $('<a href="javascript:void(0)" class="alink-data fa-data-edit col-type"></a>').html(type);
	let link4 = $('<a href="javascript:void(0)" class="alink-data fa-data-edit col-lines"></a>').html(lines);
	link1.click(function() { editLabel(link1,$(this).parent().attr("data-key")); });
	link2.click(function() { editLabel(link2,$(this).parent().attr("data-key")); });
	link3.click(function() { editLabel(link3,$(this).parent().attr("data-key")); });
	link4.click(function() { editLabel(link4,$(this).parent().attr("data-key")); });
	let td1 = $("<td></td>").addClass("text-center");
	let td2 = $("<td></td>").addClass("text-center").append(link1);
	let td3 = $("<td></td>").append(link2);
	let td4 = $("<td></td>").addClass("text-center").append(link3);
	let td5 = $("<td></td>").addClass("text-center").append(link4);
	let td6 = $("<td></td>").addClass("text-center");
	let editbtn = $('<button class="btn-edit fa-data-edit"></button>');
	let delbtn = $('<button class="btn-delete fa-data-delete"></button>');
	editbtn.click(function() { 
		editLabel(editbtn,$(this).parent().parent().attr("data-key"));
		return false;
	});
	delbtn.click(function() { 
		deleteLabel(delbtn,$(this).parent().parent().attr("data-key"));
		return false;
	});
	td6.append(editbtn).append(delbtn);
	tr.append(td1).append(td2).append(td3).append(td4).append(td5).append(td6);
	let input1 = $('<input type="hidden" class="label-code"></input>').val(code);
	let input2 = $('<input type="hidden" class="label-type"></input>').val(type);
	let input3 = $('<input type="hidden" class="label-lines"></input>').val(lines);
	let input4 = $('<input type="hidden" class="label-labels"></input>').val(JSON.stringify(labels));
	let input5 = $('<input type="hidden" class="label-correct"></input>').val(correct);
	let input6 = $('<input type="hidden" class="label-correctprompt"></input>').val(correctprompt);
	tr.append(input1).append(input2).append(input3).append(input4).append(input5).append(input6);
	$("#captiontablebody").append(tr);
}
function updateEditCaption(src) {
	fs_requiredfields = {
		"code":{msg:""},
	};
	validSaveForm(function() {
		let labellist = scrapeLabels();
		if(labellist.length==0) {
			$("#label_alert").show();
			$("#labelslayer").find(".input-label").eq(0).focus();
			return false;
		}
		let tr = $(src).parent().parent();
		let code = $("input.label-code",tr).eq(0);
		let type = $("input.label-type",tr).eq(0);
		let lines = $("input.label-lines",tr).eq(0);
		let labels = $("input.label-labels",tr).eq(0);
		let correct = $("input.label-correct",tr).eq(0);
		let correctprompt = $("input.label-correctprompt",tr).eq(0);
		code.val($("#code").val());
		type.val($("#type").val());
		lines.val($("#lines").val());
		labels.val(JSON.stringify(labellist));
		correct.val($("#correct").is(":checked"));
		correctprompt.val($("#correctprompt").val());
		let link1 = $("a.col-code",tr).eq(0);
		let link2 = $("a.col-labels",tr).eq(0);
		let link3 = $("a.col-type",tr).eq(0);
		let link4 = $("a.col-lines",tr).eq(0);
		link1.html(code.val());
		link2.html(labellist.join(" , "));
		link3.html(type.val());
		link4.html(lines.val());
		$("#fslabelmodaldialog_layer").modal("hide");
	});
}
function scrapeCaptions() {
	let captions = [];
	$("#captiontablebody").find("tr").each(function(index,element) {
		let tr = $(element);
		let code = $("input.label-code",tr).eq(0);
		let type = $("input.label-type",tr).eq(0);
		let lines = $("input.label-lines",tr).eq(0);
		let labels = $("input.label-labels",tr).eq(0);
		let correct = $("input.label-correct",tr).eq(0);
		let correctprompt = $("input.label-correctprompt",tr).eq(0);
		console.log("code=",code.val(),"type=",type.val(),"lines=",lines.val(),"labels=",labels.val()+", correct=",correct.val()+", correctprompt=",correctprompt.val());
		let labellist = [];
		try {
			labellist = JSON.parse(labels.val());
		} catch(ex) { }
		let item = { code: code.val(), labels: labellist, correct: "true"==correct.val(), correctPrompt: correctprompt.val()};
		if($.trim(type.val())!="") item.type = type.val();
		if($.trim(lines.val())!="" && !isNaN(lines.val())) item.lines = Number(lines.val());
		captions.push(item);
	});
	return captions;
}
//#(390000) programmer code end;
