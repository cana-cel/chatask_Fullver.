jQuery(function($) {
	"use strict";
	var socket = io.connect('http://localhost:3000');
	
	//createイベントを受信した時、html上にメモを作成する。
	socket.on('create',function(taskData){
		taskData.forEach(function(data){
			createTask(data);
		});
	});
	//update-textイベントを受信した時、メモのテキストを更新する。
	socket.on('update-text',function(data){
		$('#'+data._id).find('.text').val(data.text);
	});
	//moveイベントを受信した時、メモの位置をアニメーションさせる。
	socket.on('move',function(data){
		$('#'+data._id).animate(data.position);
	});
	//removeイベントを受信した時、メモを削除する。
	socket.on('remove',function(data){
		removeTask(data._id);
	});

	//var name = <%- JSON.stringify(name) %>
	//var groupname = <%- JSON.stringify(groupname) %>

	//createボタンが押された時、新規タスクを作成するようにcreateイベントを送信する。
	$('#create-button').click(function(){
		var inputText = $("#input_text").val();
		var date = new Date();
		var now = new Date();
		var taskData = {
			//groupname:groupname,
			//name:name,
			text:inputText,
			date:date,
		};
		socket.emit('create',taskData);
		//console.log(memoData.group_id);
		//console.log(memoData.text);
		//console.log(memoData.date);
		$('#input_text').val('');

	});
	//taskDataを元にメモをhtml上に生成
	//taskDataは{_id:String,text:String,position:{left:Number,top:Number}}の型
	var createTask = function(taskData){
		var id = taskData._id;
		var old = $('#'+id);
		if(old.length !== 0){
			return;
		}

		var element =
			$('<div class="memo"/>')
			.attr('id',id)
			.append($('<div class="settings">')
				.append($('</p>')
					.text(taskData.text + "(" + taskData.date + taskData.date[1] + ")")
			)
			.append('<a href="#" class="complete-button">完了</a>')
			.append('<a href="#" class="remove-button">消去</a>')
			
			);
		element.hide().fadeIn();
		$('#field').append(element);
		
		//テキストが変更された場合、update-textイベントを送る。
		var $text = element.find('.text');
		$text.keyup(function(){
			socket.emit('update-text',{_id:id,text:$text.val()});
		});

		//完了ボタンを押した場合completeイベントを送る
		element.find('.complete-button').click(function(){
			socket.emit('complete',{_id:id});
			return false;
		});

		//消去ボタンを押した場合removeイベントを送る
		element.find('.remove-button').click(function(){
			socket.emit('remove',{_id:id});
			removeTask(id);
			return false;
		});

	};
	var removeTask = function(id){
		$('#'+id).fadeOut('fast').queue(function(){
			$(this).remove();
		});
	};
});