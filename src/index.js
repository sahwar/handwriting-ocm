import Ajax from './Ajax';

const FPS = 120;
const FPS_INTERVAL = 1000/FPS;
let lastDate = Date.now();
let dt = 0;
let now = 0;

class Canvas {
    constructor(canvas) {
        this.canvas = document.querySelector(canvas);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext('2d');

        this.mouse = {x:0,y:0};
        this.trace = [];
        this.handwriting = { x:[], y:[] };
        this.canDraw = false;

        this.render = this.render.bind(this);
        this._mouseMove = this._mouseMove.bind(this);
        this._mouseUp = this._mouseUp.bind(this);
        this._mouseDown = this._mouseDown.bind(this);

        this.canvas.addEventListener('mousemove', (e) => { this._mouseMove(e) });
        this.canvas.addEventListener('mousedown', (e) => { this._mouseDown(e) });
        this.canvas.addEventListener('mouseup', (e) => { this._mouseUp(e) });
        
        this.canvas.addEventListener('touchmove', this._mouseMove);
        this.canvas.addEventListener('touchstart',(e) => { this._mouseDown(e) });
        this.canvas.addEventListener('touchleave', (e) => { this._mouseUp(e) });
        this.canvas.addEventListener('touchend', (e) => { this._mouseUp(e) });
        this.canvas.addEventListener('touchcancel', (e) => { this._mouseUp(e) });
        
        document.querySelector('#tools .clear').addEventListener('click', () => {
            this.clearCanvas();
        });

        this.context.strokeStyle = '#000';
        this.context.lineJoin = "round";
        this.context.lineWidth = 4;

        this.render();
    }

    render(delta = 0) {
        // requestAnimationFrame(this.render);
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.trace = [];
    }

    _mouseMove(e) {
        
        if(this.canDraw) {
            this._setMouse(e);
            this.context.lineTo(this.mouse.x,this.mouse.y);
            this.context.stroke();

            this._saveTrace(this.mouse.x,this.mouse.y);
        }
    }

    _mouseDown(e) {
        this._setMouse(e);
        this.context.beginPath();
        this.canDraw = true;
        
        this.context.moveTo(this.mouse.x,this.mouse.y);
        this._saveTrace(this.mouse.x,this.mouse.y);
    }

    _mouseUp() {
        this.context.closePath();
        this.canDraw = false;

        this._saveTrace(this.mouse.x,this.mouse.y);
        this._saveTrace(null,null);
        this.recognize();

    }

    normalizeForGoogle(positions) {
        let trace = [],
        handwriting = {x:[],y:[]};

        for(let ind=0; ind<positions.length; ind++) {

            // on mouse up
            if(positions[ind].x == null || positions[ind].y == null) {
                let tempo = [];
                tempo.push(handwriting.x);
                tempo.push(handwriting.y);
                tempo.push([]);
                trace.push(tempo);
                handwriting.x = [];
                handwriting.y = [];
            } else {
                handwriting.x.push(positions[ind].x);
                handwriting.y.push(positions[ind].y);
            }
        }
        
        return trace;
    }

    recognize() {
        let url = 'https://www.google.com/inputtools/request?ime=handwriting';
        Ajax.post(url,{
            "options":"enable_pre_space",
            "requests":[{
                "writing_guide":{
                    "writing_area_width":this.canvas.width,
                    "writing_area_height":this.canvas.height
                },
                "ink":this.normalizeForGoogle(this.trace),
                "language":"en"
            }]
            },(result) => {
                let html = document.querySelector('#text');
                let predictions = result[1][0][1];

                html.innerHTML = predictions[0];
                // console.log(predictions);
                // html.innerHTML = "";
                // for(let ind=0; ind<predictions.length; ind++) {
                //     html.innerHTML = html.innerHTML + ', ' + predictions[ind];
                // }
            }
        );
    }

    _saveTrace(x,y) {
        this.trace.push({ x:x, y:y });
    }

    _setMouse(e) {
        let x = null;
        let y = null;

        if(e.changedTouches) {
            x = e.changedTouches[0].clientX;
            y = e.changedTouches[0].clientY;
        } else if (e.clientX) {
            x = e.clientX;
            y = e.clientY;            
        }
        
        this.mouse = {x:x, y:y};
    }
} 

new Canvas("#stage");