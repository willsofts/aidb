var mouseX = 0;
var mouseY = 0;
//#(10000) programmer code begin;
//#(10000) programmer code end;
$(function(){
	$(this).mousedown(function(e) { mouseX = e.pageX; mouseY = e.pageY; });
	try { startApplication("forum"); }catch(ex) { }
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
	setupInputs();
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
		url: API_URL+"/api/forum/search",
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
		url: API_URL+"/api/forum/add",
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
	console.log("fs_requiredfields",fs_requiredfields);
	$("#forumsetting").parent().removeClass("has-error");
	$("#forumsetting_alert").hide();
	//#(190000) programmer code end;
	if(!aform) aform = fsentryform;
	if(!validNumericFields(aform)) return false;
	validSaveForm(function() {
		//#(195000) programmer code begin;
		if(!validateForumSettings()) {
			$("#forumsetting").focus();	
			$("#forumsetting").parent().addClass("has-error");
			$("#forumsetting_alert").show();
			return;
		}
		//#(195000) programmer code end;
		confirmSave(function() {
			let formdata = serializeDataForm(aform);
			startWaiting();
			jQuery.ajax({
				url: API_URL+"/api/forum/insert",
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
	console.log("fs_requiredfields",fs_requiredfields);
	$("#forumsetting").parent().removeClass("has-error");
	$("#forumsetting_alert").hide();
	//#(230000) programmer code end;
	if(!aform) aform = fsentryform;
	if(!validNumericFields(aform)) return false;
	validSaveForm(function() {
		//#(235000) programmer code begin;
		if(!validateForumSettings()) {
			$("#forumsetting").focus();
			$("#forumsetting").parent().addClass("has-error");
			$("#forumsetting_alert").show();
			return;
		}
		//#(235000) programmer code end;
		confirmUpdate(function() {
			let formdata = serializeDataForm(aform);
			startWaiting();
			jQuery.ajax({
				url: API_URL+"/api/forum/update",
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
		url: API_URL+"/api/forum/retrieval",
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
		url: API_URL+"/api/forum/search",
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
		url: API_URL+"/api/forum/search",
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
		url: API_URL+"/api/forum/remove",
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
			url: API_URL+"/api/forum/remove",
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
	setupInputs();
	setTimeout(function() { $("#forumtitle").focus(); },500);
	//#(385000) programmer code end;
}
var fs_requiredfields = {
	"forumid":{msg:""}, 
	"forumtitle":{msg:""}, 
	"forumtype":{msg:""}, 
	"forumdialect":{msg:""}, 
	"forumapi":{msg:""}, 
	"forumurl":{msg:""}, 
	"forumuser":{msg:""}, 
	"forumpassword":{msg:""}, 
	"forumdatabase":{msg:""}, 
	"forumhost":{msg:""}, 
	"forumport":{msg:""}, 
	"forumtable_gemini":{msg:""}
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
function setupInputs() {
	$("#forumtype").change(function() { 
		let val = $(this).val();
		if(val == "DB") {
			$("#dblayer").show();
			$("#apilayer").hide();
			delete fs_requiredfields["forumapi"];
			fs_requiredfields["forumurl"] = {msg:"URL is required"};
			fs_requiredfields["forumuser"] = {msg:"User is required"};
			fs_requiredfields["forumpassword"] = {msg:"Password is required"};
			fs_requiredfields["forumdatabase"] = {msg:"Database is required"};
			fs_requiredfields["forumhost"] = {msg:"Host is required"};
			fs_requiredfields["forumport"] = {msg:"Port is required"};
			$("#forumdialect").trigger("change");
		} else if(val == "API") {
			$("#apilayer").show();
			$("#dblayer").hide();
			delete fs_requiredfields["forumurl"];
			delete fs_requiredfields["forumuser"];
			delete fs_requiredfields["forumpassword"];
			delete fs_requiredfields["forumdatabase"];
			delete fs_requiredfields["forumhost"];
			delete fs_requiredfields["forumport"];
			fs_requiredfields["forumapi"] = {msg : "API is required"};
		}
		console.log("setupInputs: forumtype.change - value="+val+", fs_requiredfields",fs_requiredfields);
	}).trigger("change");
	$("#forumdialect").change(function() {
		if($("#forumtype").val()=="API") return;
		let cat = forum_dialects[$(this).val()];
		if(cat.providedflag=="1") {
			$("#providedlayer").show();
			$("#unprovidedlayer").hide();
			fs_requiredfields["forumurl"] = {msg:"URL is required"};
			fs_requiredfields["forumuser"] = {msg:"User is required"};
			fs_requiredfields["forumpassword"] = {msg:"Password is required"};
			fs_requiredfields["forumdatabase"] = {msg:"Database is required"};
			fs_requiredfields["forumhost"] = {msg:"Host is required"};
			fs_requiredfields["forumport"] = {msg:"Port is required"};
		} else {
			$("#providedlayer").hide();
			$("#unprovidedlayer").show();
			delete fs_requiredfields["forumurl"];
			delete fs_requiredfields["forumuser"];
			delete fs_requiredfields["forumpassword"];
			delete fs_requiredfields["forumdatabase"];
			delete fs_requiredfields["forumhost"];
			delete fs_requiredfields["forumport"];
		}
		if(cat.urlflag=="1") {
			$("#urllayer").show();
			$("#unurllayer").hide();
			delete fs_requiredfields["forumuser"];
			delete fs_requiredfields["forumpassword"];
			delete fs_requiredfields["forumdatabase"];
			delete fs_requiredfields["forumhost"];
			delete fs_requiredfields["forumport"];
			if($("#forumtype").val()=="DB") {
				fs_requiredfields["forumurl"] = {msg:"URL is required"};
			}
		} else {
			$("#urllayer").hide();
			$("#unurllayer").show();
			delete fs_requiredfields["forumurl"];
			if($("#forumtype").val()=="DB") {
				fs_requiredfields["forumuser"] = {msg:"User is required"};
				fs_requiredfields["forumpassword"] = {msg:"Password is required"};
				fs_requiredfields["forumdatabase"] = {msg:"Database is required"};
				fs_requiredfields["forumhost"] = {msg:"Host is required"};
				fs_requiredfields["forumport"] = {msg:"Port is required"};
			}
		}
		console.log("setupInputs: forumdialect.change - cat="+$(this).val()+", fs_requiredfields",fs_requiredfields);
	}).trigger("change");
	$("#forumsetting").focus(function() {
		$(this).parent().removeClass("has-error");
		$("#forumsetting_alert").hide();
	});
}
function validateForumSettings() {
	if($("#forumtype").val()=="API" && $.trim($("#forumsetting").val())!="") {
		try {
			JSON.parse($("#forumsetting").val());
		} catch(ex) {
			return false;
		}
	}
	return true;
}
//#(390000) programmer code end;
