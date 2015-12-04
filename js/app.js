/*
 *    Fill in host and port for Qlik engine
 */
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );

var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
//to avoid errors in workbench: you can remove this when you have added an app
var app;
require.config( {
	baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources"
} );

require( ['jquery', "js/qlik"], function ( $, qlik ) {
	
		$( "[data-qcmd]" ).on( 'click', function () {
			var $element = $( this );
			switch ( $element.data( 'qcmd' ) ) {
				//app level commands
				case 'clearAll':
					app.clearAll();
					break;
				case 'back':
					app.back();
					break;
				case 'forward':
					app.forward();
					break;
			}
		} );


		/////////
		
		//Restore Vizlist position

		if(typeof localStorage.getItem("vizcontainerTop")!== 'undefined' && localStorage.getItem("vizcontainerTop") !== null && 1==0)
		{
		var vizleft = localStorage.getItem("vizcontainerLeft");//($('#mapDiv').width()-$('#container').width())-(localStorage.getItem("containerLeft"));
		var viztop = localStorage.getItem("vizcontainerTop");

		document.getElementById("vizcontainer").style.top = viztop + "px";
		document.getElementById("vizcontainer").style.left = vizleft + "px";
		}
		else
		{
			//document.getElementById("vizcontainer").style.top = "100px";
			//document.getElementById("vizcontainer").style.left = "65px";
		}

		/////////

		
		qlik.getAppList(function(list){
			//var str = "";
			list.forEach(function(value) {
				//str +=  value.qDocName + '('+ value.qDocId +') ';
				$('<li><a href="#">'+value.qDocName+'</a></li>').appendTo("#applist");
			});
		}, config);
	
		var appname, app;
		//appname = 'Executive Dashboard.qvf
	
		$("#applist").click(function(e) 
		{ 
		$("#appbutton").empty();
		$("#appbutton").append(e.target.innerText);

		appname = $("#appbutton").text().trim();
		app = qlik.openApp(appname, config);
		
		populateVizList(appname, app);
		
		updateCurrSelections();
		
		});

		
		function updateCurrSelections() 
		{
			app.getList('SelectionObject', function(reply) {  
				$("#currsel0").empty();
				$("#currsel1").empty();
				$("#currsel2").empty();
				$("#currsel3").empty();
				$.each(reply.qSelectionObject.qSelections, function(key, value) {
					$("#currsel"+key).empty();
					$("#currsel"+key).append('<h2>'+value.qField+'</h2>');
					$("#currsel"+key).append('<ul class="nav nav-pills nav-stacked">');
					$("#currsel"+key).append('<li><a href="#">'+value.qSelected+'</a></li>');
					$("#currsel"+key).append('</ul>');
					$("#currsel"+key).append("<h3 id=clearField_"+value.qField.replace(/ /g,"")+">Clear Field</h3>");
					$("#clearField_"+value.qField.replace(/ /g,"")).click( function(){
					  app.field(value.qField).clear();
					});
				});
			});
		}
		

		function populateVizList(appname, app) 
		{
		
		app.getAppObjectList( 'masterobject', function(reply){
			$( "#vizList" ).empty();
			//var str = "";
			$.each(reply.qAppObjectList.qItems, function(key, value) {		
				$('<li class="mastervizitem" id='+value.qInfo.qId+'><a href="#">'+value.qMeta.title+'</a></li>').appendTo("#vizList");
				$("#"+value.qInfo.qId).draggable({
					appendTo: "body",
					helper: "clone"
				})
			});
		});
		
		}
		
		$("#maincanvas").droppable({
		  drop: function( event, ui ) {

		  //console.log(event);
		  //console.log(ui);
		  
		    if(document.getElementById("main_"+ui.draggable.context.id.replace('main_','')) == null) {
					$("#maincanvas").append("<div class='qlikObject' id=main_"+ui.draggable.context.id+" style='border:solid 0px;position:absolute;overflow:hidden;left:"+event.clientX+"px;top:"+event.clientY+"px;width:300px;height:200px;padding-bottom: 28px;'></div>");
					
					$("#main_"+ui.draggable.context.id).append("<div id=viztitle_bar_"+ui.draggable.context.id+" class='boxtitlebar' style='height: 25px; width: 100%; line-height: 25px;'>"+$("#appbutton").text()+"<div id=vizbutton_"+ui.draggable.context.id+" style='border:solid 0px; width: 25px; height: 23px; float:right; cursor:pointer; text-align: center; font-weight: bold;'>X</div></div><div id=viz_"+ui.draggable.context.id+" class='vizlist' style='height: 100%;border:solid 1px;overflow:hidden; background: rgba(255,255,255,.8);'></div>");
					
					app.getObject('viz_'+ui.draggable.context.id, ui.draggable.context.id);
					
					console.log("#main_"+ui.draggable.context.id);
					$("#main_"+ui.draggable.context.id).resizable({
						stop: function( event, ui) {
							qlik.resize(ui.element.context.id.replace('main_',''));
						}
					});
					$("#main_"+ui.draggable.context.id).draggable({handle: "div.boxtitlebar", stack:"div.boxtitlebar", snap:false});
					
					$("#vizbutton_"+ui.draggable.context.id).click(function() {
						//Remove Viz
						$("#" + this.id.replace("vizbutton_", "main_")).remove();
					});
					
			  } else {
					document.getElementById("main_"+ui.draggable.context.id.replace('main_','')).style.top = event.clientY - event.offsetY+ "px";
					document.getElementById("main_"+ui.draggable.context.id.replace('main_','')).style.left = event.clientX - event.offsetX+ "px";
			  }
		  

		  }
		});
			
			//Apply hide/show functionality to the Vizlist div.
			$("#vizbutton").click(function(){
				if($(this).html() == "-"){
					$(this).html("+");
					  $( "#vizList" ).fadeTo( "slow" , 0.0, function() {
						// Animation complete.
					  });
				}
				else{
					$(this).html("-");
					  $( "#vizList" ).fadeTo( "slow" , 1.0, function() {
						// Animation complete.
					  });
				}
			});

			$("#saveLayout").click(function() {
			//Store div layout
				console.log("storing layout");
				saveBox();
			});
			
			function saveBox () {
				$("#maincanvas").fadeTo(500,.2);

				$("#maincontainer").append('<div id="saveSettings" class="saveRestore"></div>');
				$("#saveSettings").append('<div id="saveTitleBar" class="boxtitlebar" style="height: 25px; width: 100%; line-height: 25px;"><div id="saveTitleButton" style="border:solid 0px; width: 25px; height: 23px; float:right; cursor:pointer; text-align: center; font-weight: bold;">X</div></div><div id="saveBody" class="saveRestore" style="height: 100%;border:solid 1px;overflow:hidden; background: rgba(255,255,255,.8);"></div>');
				$("#saveTitleBar").append('Save Layout');
				$("#saveBody").append('Save As: <input type="text" id="saveFileName" name="savename" value="">');
				$("#saveBody").append('<button type="button" id="saveButton">Save</button>');
				
				$("#saveTitleButton").click(function() {
					//Remove Save Dialog
					$("#saveSettings").remove();
					$("#maincanvas").fadeTo(500,1);
				});
				
				$("#saveButton").click(function() {
					//Remove Save Dialog
					
					var fileName = "qlik_" + $("#saveFileName").val();
					
					$("#saveSettings").remove();
					$("#maincanvas").fadeTo(500,1);
					
					localStorage[fileName] = JSON.stringify($("#maincanvas").html());
					
				});
				
			   $("#saveFileName").keydown(function (e) {
					if (e.keyCode == 32) {
						$(this).val($(this).val() + "-"); // append '-' to input
						return false; // return false to prevent space from being added
					}
				}).change(function (e) {
					$(this).val(function (i, v) { return v.replace(/ /g, "-"); }); 
				});
				
			};
			

			
			$("#restoreLayout").click(function() {
			//restore div layout
			console.log("restoring layout");
			
				$("#maincanvas").fadeTo(500,.2);

				$("#maincontainer").append('<div id="restoreSettings" class="saveRestore" style="width:300px"></div>');
				$("#restoreSettings").append('<div id="restoreTitleBar" class="boxtitlebar" style="height: 25px; width: 100%; line-height: 25px;"><div id="restoreTitleButton" style="border:solid 0px; width: 25px; height: 23px; float:right; cursor:pointer; text-align: center; font-weight: bold;">X</div></div><div id="restoreBody" class="saveRestore" style="height: 100%;border:solid 1px;overflow:hidden; background: rgba(255,255,255,.8);"></div>');
				$("#restoreTitleBar").append('Restore Layout');
				
				

					$("#restoreBody").append('<ul class="nav nav-pills nav-stacked">');
					
					for ( var i = 0, len = localStorage.length; i < len; ++i ) {
					  if(localStorage.key( i ).slice(0,5) == "qlik_") {
						  //console.log( localStorage.key( i ) );
						  $("#restoreBody").append('<li id="li_' + localStorage.key( i ) + '"><div style="border:solid 0px"><div id="' + localStorage.key( i ) + '" style="border:solid 0px;height: 25px; width: 100%; line-height: 25px; border:1px;"><a href="#">'+localStorage.key( i ).replace("qlik_","")+'</a></div><div id="'+ localStorage.key( i ) +'_remove" class="removeSaveState" style="border:solid 0px; width: 25px; height: 23px; float:right; cursor:pointer; text-align: center; font-weight: bold;"><a href="#">X</a></div></div></li>');
						  
						  $("#" + localStorage.key( i )).click(function() {
							 //console.log("clicked on a save file"); 
							 
							 restoreLayoutFromSave($(this).attr('id'));
							$("#restoreSettings").remove();
							$("#maincanvas").fadeTo(500,1);
						  });  
						  
						  $("#" + localStorage.key( i ) + "_remove").click(function() {
								var removeSaveFile = $(this).attr('id').slice(0,$(this).attr('id').length-7);
								localStorage.removeItem(removeSaveFile);
								$("#li_" + removeSaveFile).remove();
						  
						  });
						  
					  }
					}
										
					$("#restoreBody").append('</ul>');
				
				$("#restoreTitleButton").click(function() {
					//Remove Save Dialog
					$("#restoreSettings").remove();
					$("#maincanvas").fadeTo(500,1);
				});
			
			
			});
			
			function restoreLayoutFromSave(saveFileName) {
			//restoring maincanvas page
			   if (localStorage[saveFileName] != null) {
				   //console.log(saveFileName);
				  var contentsOfOldDiv = JSON.parse(localStorage[saveFileName]);    
				  $("#maincanvas").html(contentsOfOldDiv);
				  //looping through each visualization to reset the connection to the qlik object
				  $(".qlikObject").each(function(key, value){

					  var restoreVizId = value.id.replace("main_", ""); //Object ID
					  var restoreAppName = $("#viztitle_bar_" + value.id.replace("main_", "")).text().slice(0,-1); //App Name
					  var appload = qlik.openApp(restoreAppName, config);
					  appload.getObject('viz_'+restoreVizId, restoreVizId);
					  
					  //resetting the navigation aspects - resize, drag, remove functionality
					  console.log("#main_"+restoreVizId);
					$("#main_"+restoreVizId).resizable({
						stop: function( event, ui) {
							qlik.resize(restoreVizId);
						}
					});
					$("#main_"+restoreVizId).draggable({handle: "div.boxtitlebar", stack:"div.boxtitlebar", snap:false});
					$("#vizbutton_"+restoreVizId).click(function() {
						//Remove Viz
						$("#" + this.id.replace("vizbutton_", "main_")).remove();
					});
					  
				  })
				} 	
			};
		
} );