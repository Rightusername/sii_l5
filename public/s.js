var lineWidth = 15;
var dragging = false;
var canvas = document.getElementById('canvas');
var canSmall = document.getElementById('can-small');
var context = canvas.getContext("2d");
var smCtx = canSmall.getContext("2d");
var cfg = {height:0, width:0};




makeDroppable(document.body, (e)=>{
    console.log(e);
    var reader = new FileReader();
    reader.onload = function (e) {
        console.log(e.target.result);
        
        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 0, 0,300,300);
            smallCanvas();
        };
        image.src = e.target.result;

        };
    reader.readAsDataURL(e[0]);

})




$(function(){
    var url = "http://localhost:3000/"

    
    smCtx.webkitImageSmoothingEnabled = false;
    smCtx.mozImageSmoothingEnabled = false;
    smCtx.imageSmoothingEnabled = false; /// future


    $.get( "settings", function( data ) {
        data = JSON.parse( data );
        canSmall.setAttribute('width', data.width);
        canSmall.setAttribute('height', data.height);
        cfg.height = data.height;
        cfg.width = data.width;
        smCtx.scale(data.width/300,data.height/300);
        smCtx.drawImage(canvas,0,0);
        console.log(300/data.width,300/data.height);
    });


    canvas.addEventListener("mousemove", putPoint, false);
    canvas.addEventListener("mousedown", engage, false);
    canvas.addEventListener("mouseup", disengage, false);

    context.lineWidth = lineWidth*2;


    function engage(e){
        dragging = true;
        putPoint(e);
    }

    function disengage(e){
        dragging = false;
        context.beginPath();
        smallCanvas();
    }

    function putPoint(e){
        if(!dragging) return;
        context.lineTo(e.offsetX, e.offsetY);
        context.stroke();
        context.beginPath();
        context.arc(e.offsetX, e.offsetY, lineWidth, 0, Math.PI*2);
        context.fill();
        context.beginPath();
        context.moveTo(e.offsetX, e.offsetY);
    }
    
});


function smallCanvas(){

    smCtx.drawImage(canvas,0,0);
    sendCanvas();
}

function sendCanvas(){
    $.ajax({
        type: "POST",
        url: "canvas",
        data: "canvas=" + JSON.stringify( convertCanvas() ),
        success : (dataFromServer) =>{
            console.log(dataFromServer);
            showAnswer(dataFromServer);
        }
    });        
}

function convertCanvas(){
    var ar = [];
    for (var i = 0; i < smCtx.canvas.width; i++) {
        for (var j = 0; j < smCtx.canvas.height; j++) {
            if( smCtx.getImageData(j, i, 1, 1).data[3] > 30 && smCtx.getImageData(j, i, 1, 1).data[2] < 5 && smCtx.getImageData(j, i, 1, 1).data[1] <5 && smCtx.getImageData(j, i, 1, 1).data[0] <5  ){
                ar.push( 1 );
            } else {
                ar.push( 0 );
            }
        }
    }
    return ar;
}

function showAnswer(ar){
    let max = ar[0];
    let index = 0;
    
    for (var i = 1; i < ar.length; i++) {
        if(ar[i] > max){
            max = ar[i];
            index = i;
        }
    }
    console.log(index);

    switch(index){
        case 0:
            $('#answer').html("Это крест");
            break;
            
        case 1:
            $('#answer').html("Это буба");
            break;
        case 2:
            $('#answer').html("Это сердце");
            break;
        case 3:
            $('#answer').html("Это пика");
            break;
        case 4:
            $('#answer').html("Это точка");
            break;
    }


}


function clearCanvas(){
    //context.clearRect(0,0,300,300);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    //console.log(smCtx.canvas.width, smCtx.canvas.height);
    //smallCanvas();
    $('#answer').html('');
    var img = smCtx.createImageData(smCtx.canvas.width, smCtx.canvas.height);
    for (var i = img.data.length; --i >= 0; )
      img.data[i] = 0;
      smCtx.putImageData(img, 0, 0);
}


function makeDroppable(element, callback) {
    
      var input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('multiple', true);
      input.style.display = 'none';
    
      input.addEventListener('change', triggerCallback);
      element.appendChild(input);
      
      element.addEventListener('dragover', function(e) {
        e.preventDefault();
        //e.stopPropagation();
        element.classList.add('dragover');
      });
    
      element.addEventListener('dragleave', function(e) {
        e.preventDefault();
        //e.stopPropagation();
        element.classList.remove('dragover');
      });
    
      element.addEventListener('drop', function(e) {
        e.preventDefault();
        //e.stopPropagation();
        element.classList.remove('dragover');
        triggerCallback(e);
      });
      
    //   element.addEventListener('click', function() {
    //     input.value = null;
    //     input.click();
    //   });
    
      function triggerCallback(e) {
        var files;
        if(e.dataTransfer) {
          files = e.dataTransfer.files;
        } else if(e.target) {
          files = e.target.files;
        }
        callback.call(null, files);
      }
    }