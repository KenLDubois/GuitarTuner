import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-temp-tests',
  templateUrl: './temp-tests.component.html',
  styleUrls: ['./temp-tests.component.scss']
})
export class TempTestsComponent implements OnInit {

  constructor() { }

  currentNote: string;
  audioContext: AudioContext;
  audioDevices: MediaDeviceInfo[] = [];
  stream: MediaStream = null;
  mediaStreamSource: MediaStreamAudioSourceNode;
  analyzer: AnalyserNode;
  dataArray: Uint8Array;
  smoothValue: number = 0.75;
  selectedAudioDeviceIndex: number = 0;
  interval;
  refreshRate: number = 50;
  octive: number;
  frequency: number;
  differenceFromNote: number;
  notes: Note[] = [
    { note: 'C', hz: 16.35160	},
    { note: 'C#', hz: 17.32391	},
    { note: 'D', hz: 18.35405	},
    { note: 'D#', hz: 19.44544	},
    { note: 'E', hz: 20.60172	},
    { note: 'F', hz: 21.82676	},
    { note: 'F#', hz: 23.12465	},
    { note: 'G', hz: 24.49971	},
    { note: 'G#', hz: 25.95654	},
    { note: 'A', hz: 27.50000	},
    { note: 'A#', hz: 29.13524	},
    { note: 'B', hz: 30.86771	}
  ]

  canvasHeight = 300;
  canvasWidth = 600;
  canvasContext: CanvasRenderingContext2D;
  @ViewChild('canvas', { static: true }) 
  canvas: ElementRef<HTMLCanvasElement>;

  constraints: MediaStreamConstraints = {
    audio: {
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false
  },
    video: false
  }

  ngOnInit(): void {

    this.canvasContext = this.canvas.nativeElement.getContext('2d');
    this.audioContext = new AudioContext();
    this.checkForAudioSources();

  }

  checkForAudioSources(){
    navigator.mediaDevices.enumerateDevices().then(
      result => {
        for(let i = 0; i < result.length; i++){
          if(result[i]?.kind == 'audioinput'){
            this.audioDevices.push(result[i]);
          }
        }
      }
    );
  }

  onListen(){
    navigator.mediaDevices.getUserMedia(this.constraints)
      .then(
        stream => {
          this.stream = stream;
          this.analyzeStream();
        }
      );
  }

  onStopListening(){

    if(this.interval){
      clearInterval(this.interval);
    }

    if(this.stream) {
      this.stream.getTracks().forEach(function(track){
        track.stop();
      });
    }
    this.currentNote = null;
    this.dataArray = null;
    this.frequency = null;
    this.differenceFromNote = null;
  }

  analyzeStream(){
    this.mediaStreamSource = this.audioContext
      .createMediaStreamSource(this.stream);
    
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = 2048;
      this.analyzer.smoothingTimeConstant = this.smoothValue;
      this.mediaStreamSource.connect(this.analyzer);

      this.interval = setInterval(() => {
        this.updatePitch();
        this.visualizeAudio();
      },
      this.refreshRate);
  }

  visualizeAudio(){
    this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.canvasContext.fillStyle = '#00CCFF';
    //let bars = Math.round(this.dataArray.length / 2);
    let bars = 50;
      for(let i = 0; i < bars; i++){
        let bar_x = i * 7;
        let bar_width = 5;
        let bar_height = -(this.dataArray[i] / 2);
        this.canvasContext.fillRect(bar_x, this.canvasHeight, bar_width, bar_height);
      }  
  }

  updatePitch(){

    this.dataArray = new Uint8Array(this.analyzer.fftSize);
    this.analyzer.getByteFrequencyData(this.dataArray);
    
    let max = 0;
    let index = 0;
    let maxHZ = this.audioContext.sampleRate / 2;
    let len = this.dataArray.length;
    
    for(let i = 0; i < len; i++){
      if(this.dataArray[i] > max){
        max = this.dataArray[i];
        index = i;
      }
    }

    this.frequency = index / len * maxHZ;
    this.getNote();

  }

  getNote(){
    let noteIndex = 0;
    let minDiff = this.audioContext.sampleRate;

    this.getOctive();

    if(!this.octive || this.octive == null){
      return;
    }

    for(let i = 0; i < this.notes.length; i++){
      let perfectHz = this.getHzAtOctive(this.notes[i].hz, this.octive)
      let diff = perfectHz - this.frequency;
      if(Math.abs(diff) <= Math.abs(minDiff)){
        minDiff = diff;
        noteIndex = i;
      }
    }

    this.currentNote = this.notes[noteIndex].note;
    this.differenceFromNote = minDiff;

  }

  getHzAtOctive(baseHz: number, octive: number) : number{
    let result = baseHz;
    for(let i = 0; i < octive; i++){
      result = result * 2;
    }
    return result;
  }

  getOctive(){
    if(!this.frequency){
      this.octive = null;
      return;
    }
    if(this.frequency <= 30.86771 ){
      this.octive = 0;
      return;
    }
    if(this.frequency <= 61.73541 ){
      this.octive = 1;
      return;
    }
    if(this.frequency <= 123.4708 ){
      this.octive = 2;
      return;
    }
    if(this.frequency <= 246.9417 ){
      this.octive = 3;
      return;
    }
    if(this.frequency <= 493.8833 ){
      this.octive = 4;
      return;
    }
    if(this.frequency <= 987.7666 ){
      this.octive = 5;
      return;
    }
    if(this.frequency <= 1975.533 ){
      this.octive = 6;
      return;
    }
    if(this.frequency <= 3951.066 ){
      this.octive = 7;
      return;
    }
    if(this.frequency <= 7902.133 ){
      this.octive = 8;
      return;
    }
  
    this.octive = null;
    return;

  }
  
}

interface Note {
  note: string;
  hz: number;
}
