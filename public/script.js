'use strict';

let localStream = null;
let peer = null;
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
    key: '',
    debug: 3
});

// 自分自身のIDで映像をVideoにいれる。
peer.on('open', function(){
    $('#my-id').text(peer.id);
});

peer.on('error', function(err){
    console.log('error');
    alert(err.message);
});

peer.on('close', function(){
    console.log('close');
});

peer.on('disconnected', function(){
    console.log('disconnected');
});

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
    if (existingCall) {
        existingCall.close();
    };

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