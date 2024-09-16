var mouseX = 0;
var mouseY = 0;
//#(10000) programmer code begin;
//#(10000) programmer code end;
$(function(){
	$(this).mousedown(function(e) { mouseX = e.pageX; mouseY = e.pageY; });
	try { startApplication("forumnote"); }catch(ex) { }
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
	$("#fileuploadbutton").click(function() { showUploadDialog(); });
	$("#fileviewbutton").click(function() { showFileInfoDialog(); });
	$("#uploadbutton").click(function() { startUploadFile(); });
	$("#uploaddialogpanel").find(".modal-dialog").draggable();
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
		url: API_URL+"/api/forumnote/search",
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
	aform.forumid.value = "";
	let formdata = serializeDataForm(aform);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/forumnote/add",
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
		"forumid":{msg:""}, 
		"forumtitle":{msg:""}, 
		"forumfile":{msg:""},
		"forumtable":{msg:""}
	};
	//#(190000) programmer code end;
	if(!aform) aform = fsentryform;
	if(!validNumericFields(aform)) return false;
	validSaveForm(function() {
		//#(195000) programmer code begin;
		if(!validateUploadFile()) return false;
		//#(195000) programmer code end;
		confirmSave(function() {
			let formdata = serializeDataForm(aform);
			startWaiting();
			jQuery.ajax({
				url: API_URL+"/api/forumnote/insert",
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
		"forumid":{msg:""}, 
		"forumtitle":{msg:""}, 
		"forumfile":{msg:""},
		"forumtable":{msg:""}
	};	
	//#(230000) programmer code end;
	if(!aform) aform = fsentryform;
	if(!validNumericFields(aform)) return false;
	validSaveForm(function() {
		//#(235000) programmer code begin;
		if(!validateUploadFile()) return false;
		//#(235000) programmer code end;
		confirmUpdate(function() {
			let formdata = serializeDataForm(aform);
			startWaiting();
			jQuery.ajax({
				url: API_URL+"/api/forumnote/update",
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
function submitRetrieve(src,forumid) {
	//#(250000) programmer code begin;
	//#(250000) programmer code end;
	let aform = fslistform;
	aform.forumid.value = forumid;
	let formdata = serializeDataForm(aform);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/forumnote/retrieval",
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
		url: API_URL+"/api/forumnote/search",
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
		url: API_URL+"/api/forumnote/search",
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
		forumid : fsParams[0]
	};
	let formdata = serializeParameters(params);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/forumnote/remove",
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
			url: API_URL+"/api/forumnote/remove",
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
	$("#addquestion").click(function() { addNewQuestion(); });
	$("#fileuploadbutton").click(function() { showUploadDialog(); });
	$("#fileviewbutton").click(function() { showFileInfoDialog(); });
	setTimeout(function() { $("#forumtitle").focus(); },500);
	//#(385000) programmer code end;
}
var fs_requiredfields = {
	"forumid":{msg:""}, 
	"forumtitle":{msg:""}, 
	"forumfile":{msg:""},
	"forumtable":{msg:""}
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
function addNewQuestion() {
	let div = $('<div class="quest-input"></div>');
	let input = $('<input type="text" name="question" class="form-control input-md"></input>');
	div.append(input);
	$("#questionslayer").append(div);
}
function validateUploadFile() {
	if($.trim($("#fileid").val())=="" && $.trim($("#forumurl").val())=="") {
		alertmsg("Please upload a file first");
		return false;
	}
	return true;
}
function showUploadDialog() {
	$("#fsfilemodaldialog_layer").modal("show");
}
function startUploadFile() {
	fs_requiredfields = {
		"filename":{msg:""}
	};
	validSaveForm(function() {
		uploadFile();
	});
}
function uploadFile(aform) {
	if(!aform) aform = uploadform;
	let fileExtension = ['pdf','txt'];
	if ($.inArray($("#filename").val().split('.').pop().toLowerCase(), fileExtension) == -1) {
		alertmsg("Only pdf or text file type are allowed : "+fileExtension.join(', '));
		return false;
	}			
	if($.trim($("#fileid").val())!="") $("#attachid").val($("#fileid").val());
	if($.trim($("#forumurl").val())!="") $("#attachid").val($("#forumurl").val());
	startWaiting();
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
			stopWaiting();
			try {
				let json = $.parseJSON($.trim(data));
				if(json && json["head"]) {
					alert(json.head["errordesc"]);
				}
				return;
			} catch(ex) { }
			alertmsg(errorThrown);
		},
		success: function(data,status,transport){ 
			console.log("response : "+transport.responseText);
			stopWaiting();
			$("#forumfile").val($("#filename").val());
			let json = $.parseJSON($.trim(data));
			if(json && json["body"]) {
				let rows = json.body["rows"];
				if(rows && rows["attachid"]) {
					$("#fileid").val(rows["attachid"]);
				}
				if(rows && rows["sourcefile"]) {
					$("#forumfile").val(rows["sourcefile"]);
				}
			}
			$("#fsfilemodaldialog_layer").modal("hide");
		}
	});	
}
function showDocumentInfo() {
	startWaiting();
	let params = {
		ajax: true,
		dialog: "dialog",
		forumid : $("#forumid").val()
	};
	let formdata = serializeParameters(params);
	jQuery.ajax({
		url: API_URL+"/gui/forumnote/note",
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
			$("#infodialogpanel").html(data);
			$("#infodialogpanel").find(".modal-dialog").draggable();
			$("#fsinfomodaldialog_layer").modal("show");
		}
	});	
}
function showFileInfoDialog() {
	submitWindow({url: BASE_URL+"/gui/forumnote/note", params: {forumid : $("#forumid").val()}, windowName: "document_info_window"});
}
//#(390000) programmer code end;
