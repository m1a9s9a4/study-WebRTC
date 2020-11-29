'use strict';

let localStream = null;
let peer = null;
let room = null;
let existingCall = null;

// navigatorはユーザーエージェントの情報を返す https://developer.mozilla.org/ja/docs/Web/API/Navigator
// mediaDevicesは使用可能なメディアデバイスの情報を取得する（読取専用）
// getUserMediaは要求された種類のメディア{video, audio}でMediaStreamを生成する許可をユーザーに求める
navigator.mediaDevices.getUserMedia({audio: true})
    .then(function (stream) {
        // Success
        console.log($('#my-video').get(0).srcObject);
        console.log(stream);
        $('#my-video').get(0).srcObject = stream;
        localStream = stream;
    }).catch(function (error) {
    // Error
    console.error('mediaDevice.getUserMedia() error:', error);
    return;
});

peer = new Peer({
    key: '4093331f-b98d-4ab9-87bd-950c09692a50',
    debug: 3
});

// 自分自身のIDで映像をVideoにいれる。
// ブラウザごとにopenイベントが発火される
peer.on('open', function(){
    room = peer.joinRoom('test', {
        mode: 'sfu',
        stream: localStream,
    });
    $('#my-id').text(peer.id);
});

room.on('open', function() {
    console.log('opened room');
});

peer.on('error', function(err){
    console.log('error');
    alert(err.message);
});

// ブラウザを閉じたら発火？
peer.on('close', function(){
    console.log('close');
});

peer.on('disconnected', function(){
    console.log('disconnected');
});

// 電話するボタンを押したら相手のIDを取得する
$('#make-call').submit(function(e){
    console.log('call pressed');
    e.preventDefault();
    const call = peer.call($('#callto-id').val(), localStream);
    setupCallEventHandlers(call);
});

$('#end-call').click(function(){
    existingCall.close();
});

peer.on('call', function(call){
    console.log('call');
    call.answer(localStream);
    setupCallEventHandlers(call);
});

function setupCallEventHandlers(call){
    // すでに通話がされていれば変更する
    if (existingCall) {
        existingCall.close();
    };

    // 現在の通話として保存する
    existingCall = call;

    call.on('stream', function(stream){
        addVideo(call,stream);
        setupEndCallUI();
        $('#their-id').text(call.remoteId);
    });
    call.on('close', function(){
        removeVideo(call.remoteId);
        setupMakeCallUI();
    });
}

function addVideo(call,stream){
    $('#their-video').get(0).srcObject = stream;
}

function removeVideo(peerId){
    $('#'+peerId).remove();
}

function setupMakeCallUI(){
    $('#make-call').show();
    $('#end-call').hide();
}

function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
}