import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {WebcamImage, WebcamInitError, WebcamUtil, WebcamMirrorProperties} from 'ngx-webcam';
import { Subject, Observable} from 'rxjs';
import Quagga from 'quagga';
import { SpinnerService } from '../../spinner.service';

@Component({
  selector: 'app-barcode-reader',
  templateUrl: './barcode-reader.component.html',
  styleUrls: ['./barcode-reader.component.css']
})
export class BarcodeReaderComponent implements OnInit {

  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    width: {ideal: 1024},
    height: {ideal: 768}
  };
  public errors: WebcamInitError[] = [];
  public webcamImage: WebcamImage = null;
  public scanError = false;
  public isScanning = true;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  public spinnerName = 'BarcodeReaderComponent';

  @Output() readCode = new EventEmitter<string>();

  constructor(private spinner: SpinnerService) {

  }

  ngOnInit(): void {
    this.bindQuagga();

    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  private bindQuagga() {
    Quagga.init(
      {
        inputStream: {
          width: 300,
          height: 250,
          name: 'Live',
          type: 'LiveStream',
          constraints: {
            facingMode: "environment",
            aspectRatio: {min: 1, max: 2}
          },
          target: document.querySelector('#yourElement') // Or '#yourElement' (optional)
        },
        decoder: {
          readers: ['ean_reader']
        }
      },
      err => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('Initialization finished. Ready to start');
        Quagga.onDetected(this.imageReaderHandler.bind(this));
        Quagga.onProcessed(function(result) {
          const drawingCtx = Quagga.canvas.ctx.overlay;
          const drawingCanvas = Quagga.canvas.dom.overlay;

          if (result) {
            if (result.boxes) {
              drawingCtx.clearRect(
                0,
                0,
                parseInt(drawingCanvas.getAttribute('width')),
                parseInt(drawingCanvas.getAttribute('height'))
              );
              result.boxes
                .filter(function(box) {
                  return box !== result.box;
                })
                .forEach(function(box) {
                  Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                    color: 'green',
                    lineWidth: 2
                  });
                });
            }

            if (result.box) {
              Quagga.ImageDebug.drawPath(
                result.box,
                { x: 0, y: 1 },
                drawingCtx,
                { color: '#00F', lineWidth: 2 }
              );
            }

            if (result.codeResult && result.codeResult.code) {
              Quagga.ImageDebug.drawPath(
                result.line,
                { x: 'x', y: 'y' },
                drawingCtx,
                { color: 'red', lineWidth: 3 }
              );
            }
          }
        });
        Quagga.start();
      }
    );
  }

  public startScanning() {
    this.isScanning = true;
    this.bindQuagga();
  }

  public stopScanning() {
    this.isScanning = false;
    Quagga.stop();
  }

  public triggerSnapshot(): void {
    this.spinner.show(this.spinnerName);
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.readImage(webcamImage.imageAsDataUrl);
  }

  private readImage(imageData) {
    const decoderConfig = {
      src: imageData,
      numOfWorkers: 4,  // Needs to be 0 when used within node
      inputStream: {
          size: 800  // restrict input-size to be 800px in width (long-side)
      },
      halfSample: true,
      decoder: {
        readers: ['ean_reader']
      },
      patchSize: 'medium'
    };

    Quagga.decodeSingle(decoderConfig, this.imageReaderHandler.bind(this));
  }

  private imageReaderHandler(result) {
    this.spinner.hide(this.spinnerName);


    console.log(result);
    if (typeof result === 'undefined') {
      this.scanError = true;
      return;
    }

    console.log(typeof result.codeResult);

    if (typeof result.codeResult === 'undefined') {
      this.scanError = true;
      return;
    }

    console.log(typeof result.codeResult.code);

    if (typeof result.codeResult.code === 'undefined') {
      this.scanError = true;
      return;
    }

    console.log(result.codeResult.code);

    this.readCode.emit(result.codeResult.code);
    this.scanError = false;
    this.stopScanning();
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

}
