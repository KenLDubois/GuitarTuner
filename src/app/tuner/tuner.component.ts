import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tuner',
  templateUrl: './tuner.component.html',
  styleUrls: ['./tuner.component.scss']
})
export class TunerComponent implements OnInit {
  
  constructor() { }

  tempFeedback: any = null;
  stream: MediaStream = null;
  audioContext: AudioContext;
  mediaStreamSource: MediaStreamAudioSourceNode;
  analyzer: AnalyserNode;
  dataArray: Float32Array;

  @ViewChild('canvas', { static: true }) 
  canvas: ElementRef<HTMLCanvasElement>;

  canvasHeight = 300;
  canvasWidth = 600;

  private ctx: CanvasRenderingContext2D;
  

  constraints: MediaStreamConstraints = {
    audio: {
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false
  },
    video: false
  }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.audioContext = new AudioContext();
  }

  streamAudio() : void {

    this.endStream();

    if(this.hasGetUserMedia()){      
      navigator.mediaDevices.getUserMedia(this.constraints)
        .then(
          (stream) => {
            this.stream = stream;
            this.analyzeStream();
          }
        );

    } else {
      console.error('no media device found.')
    }

  }

  endStream() : void {
    if(this.stream){
      this.stream.getTracks().forEach(function(track) 
      {
        track.stop();
      });
    }
  }

  hasGetUserMedia() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }

  analyzeStream(){
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
    this.analyzer = this.audioContext.createAnalyser();
    this.analyzer.fftSize = 2048;
    this.mediaStreamSource.connect(this.analyzer);
    
    //this.analyzer.connect(this.audioContext.destination) // output audio

    //start loop!
    const i = setInterval(() => {

      this.updateWaveform();
      this.updatePitch();

    }, 25); //<- LOWER = FASTER
  }

  updateWaveform(){

      let fbc_array = new Uint8Array(this.analyzer.frequencyBinCount);
      this.analyzer.getByteFrequencyData(fbc_array);

      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.fillStyle = '#00CCFF';
      let bars = 50;
      for(let i = 0; i < bars; i++){
        let bar_x = i * 7;
        let bar_width = 5;
        let bar_height = -(fbc_array[i] / 2);
        this.ctx.fillRect(bar_x, this.canvasHeight, bar_width, bar_height);
      }    
  }

  updatePitch(){
    this.dataArray = new Float32Array(this.analyzer.fftSize);
    this.analyzer.getFloatTimeDomainData(this.dataArray);

    /// TEMP
    this.tempFeedback = "";
    for(let i = 0; i < this.dataArray.length && i < 10; i++){
      this.tempFeedback += this.dataArray[i] + ", ";
    }
    this.tempFeedback +='......'
    //// <-TEMP


    // var ac = this.autoCorrelate(this.buf, this.audioContext.sampleRate)
  }

}
