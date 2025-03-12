/*
Tooltips

Reset Function
Duplicate?
*/
var timers_list = [];
var interval;
var today;

window.addEventListener('load', function(){
	let alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	$('#add').on('click', function(){
		newTimer(alpha);
	});
	loadCardsFromCookies(alpha);

	today = new Date(Date.now());
});

function loadCardsFromCookies(alpha) {
	let allcookies = Cookies.get();
	for( let c in allcookies ){
		let k = c.includes('timecard_');
		if (k) {
			newTimer(alpha, JSON.parse(allcookies[c]));
		}
	}
}

// Click Events

function btnClick() {
	anyCardChange($(this).attr('id').substring(0,6));
	let timer = getTimer($(this).attr('id').substring(0,6));
	if ( timer.status == 0 ) {
		$('button.btn-danger').trigger('click');
		timer.start();
	} else {
		timer.stop();
	}
}

function editTitle() {
	let key = $(this).attr('id').substring(0,6);
	if ( $('#' + key + '-title').hasClass('editing') ) {
		return;
	}
	let titleElem = '#' + key + '-title';
	$(titleElem).addClass('editing');
	var name = $(titleElem).attr('text');
	$(titleElem).html('');
    $('<input></input>')
        .attr({
            'type': 'text',
            'name': 'fname',
            'id': 'txt_fullname',
            'value': name
        })
        .appendTo(titleElem);
  $('#txt_fullname').val(name);
  $('#txt_fullname').focus();
  $('.card h2.editing::after').on('click', saveTitle);
}

function saveTitle() {
	anyCardChange($(this).attr('id').substring(0,6));
	replaceName('#txt_fullname');
}

function saveCard() {
	let timey = getTimer($(this).parent('.from-cookie').attr('id').substring(0,6));
	timey.save();
}

function deleteCard() {
	let sure = confirm("Are you sure? This cannot be undone.");
	if (sure) {
		let key = $(this).attr('id').substring(0,6);
		$('#' + $('#' + key + '-del').attr('aria-describedby')).remove();
		$('#' + key).remove();
		getTimer(key).delete();
	}
}

function copyCard() {
	let key = $(this).attr('id').substring(0,6);
	navigator.clipboard.writeText(key);
	$('.tooltip-inner').append('<div class="tooltip-inner" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0;">Copied!</div>')
}

// Utility

function anyCardChange(key) {
	$('#' + key + '-cookie > .bi-bookmark-check-fill').addClass('hide');
	$('#' + key + '-cookie > .bi-bookmark').removeClass('hide');
}

function replaceName( input ) {
	let text = $(input).val();
	$(input).parent('h2').attr('text', text);
	if ( text.length < 1 ) {
		text = 'Untitled';
	} else if ( text.length > 18 ) {
		text = text.substr(0, 19) + '...';
	}
	$('<span>' + text + '</span>').appendTo($(input).parent('h2'));
	let timey = getTimer($(input).parent('h2').attr('id').substring(0,6));
	timey.name = text;
	$(input).parent('h2').removeClass('editing');
	$(input).remove();
}

function newTimer(alpha, data = null) {
	let key = "";
	if ( data === null ) {
		for (let i = 0; i < 6; i++) {
			key += alpha[Math.floor(Math.random() * alpha.length)];
		}
	} else {
		key = data.id;
	}

	let beepboop = new Timer(key);

	if ( data === null ) {
		beepboop.name = key;
	} else {
		beepboop.name = data.name;
		beepboop.hrs = data.hrs;
		beepboop.min = data.min;
		beepboop.sec = data.sec;
		beepboop.status = data.status;
		beepboop.created = new Date(Date.parse(data.created));
		beepboop.updated = new Date(Date.parse(data.updated));
		beepboop.saved = new Date(Date.parse(data.saved));
	}

	let output = returnOutput(beepboop);
	$('.data').append(output);

	if ( data === null ) {
		$('#' + key + '-cookie').removeClass('hide');
		$('#' + key + '-cookie > .bi-bookmark').removeClass('hide');
	} else {
		$('#' + key + '-cookie').removeClass('hide');
		$('#' + key + '-cookie > .bi-bookmark-check-fill').removeClass('hide');
	}

	beepboop.button = $('#' + key + '-btn');
	beepboop.display = $('#' + key + '-view');
	beepboop.update();
	beepboop.index = timers_list.length;
	timers_list.push(beepboop);

	$('#' + key + '-btn').on('click', btnClick);
	//$('#' + key + '-t-edit').on('click', editTitle);
	$('#' + key + '-title').on('click', editTitle);
	$('#' + key + '-t-save').on('click', saveTitle);
	$('#' + key + '-cookie > .bi-bookmark').on('click', saveCard);
	$('#' + key + '-del').on('click', deleteCard);
	$('#' + key + '-copy').on('click', copyCard);

	$('#' + key + '-title').on('mouseover', function(){
		$(this).addClass('hover');
	});
	$('#' + key + '-title').on('mouseout', function(){
		$(this).removeClass('hover');
	});

	getToolTips();
}

function returnOutput(obj) {
	let output = "";
	output += '<div class="col" id="' + obj.id + '">';
		output += '<div class="card h-100">';
			output += '<div class="card-body pb-0">';
				output += '<div class="row m-0 py-0" style="margin-bottom: -20px!important;">';
					output += '<div class="col text-end text-body-tertiary"><span class="copy" id="' + obj.id + '-copy" data-bs-toggle="tooltip" data-bs-title="Copy the unique ID"><small>' + obj.id + ' <i class="bi bi-clipboard2-fill"></i></small></span></div>';
					output += '</div>';
					output += '<div class="row mt-0">';
						output += '<div class="col-9 text-start position-relative p-0 m-0">';
							output += '<h2 id="' + obj.id + '-title" text="' + obj.name + '" class="fw-bold text-nowrap"><span>' + obj.name + '</span></h2>';
							output += '<button id="' + obj.id + '-t-edit" class="edit-title position-absolute"><i class="bi bi-pencil-square"></i><span class="visually-hidden"> Edit Title</span></button>';
							output += '<button id="' + obj.id + '-t-save" class="save-title position-absolute"><i class="bi bi-check-square"></i><span class="visually-hidden"> Save Title</span></button>';
						output += '</div>';
					output += '</div>';
				output += '<div class="row">';

					output += '<div class="col bg-dark-subtle position-relative p-2 me-2 d-flex flex-column justify-content-end align-items-start" style="font-size: 12px;">';
						// Created date
						output += '<div>Created on <span id="' + obj.id + '-created">' + prettyDate(obj.created) + '</span></div>';
						// Updated date
						output += '<div>Updated on <span id="' + obj.id + '-updated">' + prettyDate(obj.updated) + '</span></div>';
						// loaded from cookie
						output += '<div>Saved on <span id="' + obj.id + '-saved">' + prettyDate(obj.saved) + '</span></div>';		
					output += '</div>';
				
				// Time
				output += '<div id="' + obj.id + '-view" class="col d-flex justify-content-around align-items-end flex-column bg-primary-subtle text-center time p-2 ms-0 position-relative" seconds="0">';
					
					output += '<span id="' + obj.id + '-cookie" class="hide from-cookie position-absolute end-0 top-0" style="margin-top: -2px;">';
							output += '<i class="hide bi bi-bookmark-check-fill" data-bs-toggle="tooltip" data-bs-title="Changes are saved."></i>';
							output += '<i class="hide bi bi-bookmark" data-bs-toggle="tooltip" data-bs-html="true" data-bs-title="Changes made but not saved.<br>Click to save changes."></i>';
						output += '</span>';

					output += '<hrs class="d-block" label="hours"><num>0</num></hrs>';
					output += '<min class="d-block" label="minutes"><num>0</num></min>';
					output += '<sec class="d-block" label="seconds"><num>0</num></sec>';

				output += '</div>';

				output += '</div>';
				output += '<div class="row buttons text-center">';
					output += '<div class="col text-start d-flex align-items-center p-0">';
						// buttons
						output += '<button class="delete-card btn btn-dark btn-hover-danger flex-grow-0" id="' + obj.id + '-del" data-bs-placement="right" data-bs-toggle="tooltip" data-bs-title="Delete this timer."><i class="bi bi-trash-fill"></i> Delete</button>';
						output += '<button id="' + obj.id + '-btn" class="btn btn-primary fw-bold text-uppercase mx-2 flex-grow-1">Start</button>';
						output += '<button class="btn btn-dark btn-hover-danger flex-grow-0" id="' + obj.id + '-save" data-bs-placement="right" data-bs-toggle="tooltip" data-bs-title="Save this timer."><i class="bi bi-trash-fill"></i> Save</button>';
					output += '</div>';
				output += '</div>';
			output += '</div>';
		output += '</div>';
	output += '</div>';
	return output;
}

function prettyDate(val) {
	if ( today == val ) {
		return 'Today';
	} else {
		return val;
	}
}

function getTimer(lkey) {
	for(let t of timers_list){
		if (t.id == lkey){
			return t;
		}
	}
	return null;
}

function ticktock( timey ) {
	let thyme = timey;
	if ( thyme.status > 0 ) {
		thyme.sec += 1;
		if ( thyme.sec == 60 ) {
			thyme.sec = 0;
			thyme.min += 1;
			if ( thyme.min == 60 ) {
				thyme.min = 0;
				thyme.hrs += 1;
			}
		}
		thyme.update();
	}
}

function getToolTips() {
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function Timer(key){
	this.id = key
	this.name = key;
	this.hrs = 0;
	this.min = 0;
	this.sec = 0;
	this.status = 0;
	this.button = '';
	this.display = '';
	this.interval = 0;
	this.index = -1;
	this.created = new Date(Date.now());
	this.updated = this.created;
	this.saved = new Date();

	this.update = function() {
		this.display.children('hrs').children('num').html(this.hrs);
		this.display.children('min').children('num').html(this.min);
		this.display.children('sec').children('num').html(this.sec);
	}

	this.start = function() {
		let idd = this.id;
		this.status = 1;
		this.interval = setInterval(ticktock, 1000, this);
		this.button.addClass('btn-danger');
		this.button.html('Stop');
		this.updated = today;
		$('#' + key + '-updated').html(this.updated);
		if (	$('#' + this.id + '-cookie > i').hasClass('bi-bookmark-fill') ) {
			$('#' + this.id + '-cookie > i').removeClass('bi-bookmark-fill');
			$('#' + this.id + '-cookie > i').addClass('bi-bookmark');
		}
	}

	this.stop = function() {
		this.status = 0;
		clearInterval(this.interval);
		this.button.removeClass('btn-danger');
		this.button.html('Start');
	}

	this.save = function(){
		this.stop();
		Cookies.set('timecard_' + this.id, JSON.stringify(timers_list[this.index], null, 2), {expires: 30, path: '/', samesite: 'Lax', secure: true});
		$('#' + this.id + '-cookie > .bi-bookmark-check-fill').removeClass('hide');
		$('#' + this.id + '-cookie > .bi-bookmark').addClass('hide');
		this.saved = new Date(Date.now());
		$('#' + this.id + '-saved').html(prettyDate(this.saved));
	}

	this.delete = function(){
		Cookies.remove('timecard_' + this.id, {path: '/', samesite: 'Lax', secure: true});
	}
}