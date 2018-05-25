// (function () {
    const socket = io();

    const player = document.getElementById('player');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const btn = document.querySelector('.switch');

    const takePictureDelay = 800;
    const turnOffFlashDelay = 1600;

    const camera = {
        devices: null,
        device: null,
        track: null,
        imageCapture: null,
        photoCapabilities: null,
        enableTorch: function () {
            console.log("torch enabled");

            this.track.applyConstraints({
                advanced: [{torch: true}]
            });
        },
        disableTorch: function () {
            console.log("torch disabled");

            this.track.applyConstraints({
              location.reload();
                advanced: [{torch: false}]
            });
        },
        emitTorchState: function (state) {
            console.log('emit', state);

            socket.emit('torch', state);
        },
        onEmitTorchState: function () {
            const _this = this;

            socket.on('torchToggle', function (state) {
                if(state) {
                    _this.enableTorch();
                } else {
                    _this.disableTorch();
                }
            });
        },
        takeSnapshot: function() {
            this.emitTorchState(true);

            setTimeout(() => {
                context.drawImage(player, 0, 0, canvas.width, canvas.height);
            }, takePictureDelay);

            setTimeout(() => {
                this.emitTorchState(false);
            }, turnOffFlashDelay);
        },
        addTorchEvent: function() {
            btn.addEventListener('click', () => {
                this.takeSnapshot()
            });
        },
        connect: function () {
            const _this = this;

            //Test browser support
            const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

            if (SUPPORTS_MEDIA_DEVICES) {
                //Get the environment camera (usually the second one)
                navigator.mediaDevices.enumerateDevices().then(devices => {

                    _this.devices = devices.filter((device) => device.kind === 'videoinput');

                    if (_this.devices.length === 0) {
                        throw 'No camera found on this device.';
                    }

                    _this.device = _this.devices[_this.devices.length - 1];

                    // Create stream and get video track
                    navigator.mediaDevices.getUserMedia({

                        video: {
                            deviceId: _this.device.deviceId,
                            facingMode: ['user', 'environment'],
                            height: {ideal: 1080},
                            width: {ideal: 1920}
                        }

                    }).then(stream => {
                        _this.track = stream.getVideoTracks()[0];

                        player.srcObject = stream;

                        //Create image capture object and get camera capabilities
                        _this.imageCapture = new ImageCapture(_this.track);
                        _this.photoCapabilities = _this.imageCapture.getPhotoCapabilities().then(() => {
                            _this.addTorchEvent();
                        });
                    });
                });
            }
        },
        init: function () {
            this.connect();
            this.onEmitTorchState();
        }
    };

    const app = {
        addSpacebarEvent: function() {
            document.addEventListener('keydown', (event) => {
                const keyCode = event.keyCode;
                if(keyCode === 32) {
                    camera.takeSnapshot();
                }
            });
        },
        init: function () {
            this.addSpacebarEvent();
            camera.init();
            console.log('init');
        }
    };

    app.init();
// })();
