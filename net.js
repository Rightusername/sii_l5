const fs = require('fs');
const cfg = require('./config.json');
const exp = require('./net/exp.json');

module.exports =  class Net{

    constructor(){
        this.learningRate = 0.1;
        this.epochs = 2000;
        this.error = 0.14;
        this.height = cfg.height; 
        this.width = cfg.width; // высота и ширина картинки
        this.inputsAmount = this.width * this.height;
        this.neuronsAmount = parseInt(this.inputsAmount/2);
        this.outputsAmount = 5;
        this.neurons = [];
        this.inputs = [];
        this.outputs = [];

        this.load();

        // this.experiments = [
        //     {
        //         input: [1,1,1,0,1,0,0,1,0],
        //         output: [0,0,0,1,0]
        //     },
        //     {
        //         input: [0,1,0,0,1,0,0,1,0],
        //         output: [1,0,0,0,0]
        //     },
        //     {
        //         input: [0,0,0,1,1,1,0,0,0],
        //         output: [0,1,0,0,0]
        //     },
        //     {
        //         input: [0,1,0,0,1,0,1,1,1],
        //         output: [0,0,1,0,0]
        //     },
        //     {
        //         input: [0,1,0,0,1,0,0,1,0],
        //         output: [1,0,0,0,0]
        //     },
        //     {
        //         input: [0,0,0,0,1,0,0,0,0],
        //         output: [0,0,0,0,1]
        //     }
        // ];
        this.experiments = this.shuffle( exp );

        //this.train();
    }
 

    createNetwork(){
        this.initMatrix();
        this.calcNeurons();
    }

    train(){
        this.createNetwork();


        for (var e = 0; e < this.epochs; e++) {

            let s = 0;
            for (var trains = 0; trains < this.experiments.length; trains++) {

                s+=this.calcEffect(this.experiments[trains].output);
                
                this.inputs = this.experiments[trains].input;
                this.calcNeurons();
                this.calcOutputs();

                //console.log(this.outputs);
                //console.log(this.outputs);

                
                for (var j = 0; j < this.outputs.length; j++) {   
                    var weights_delta = (this.experiments[trains].output[j] - this.outputs[j]) * this.sigmoid( this.outputs[j] ) * ( 1 - this.sigmoid( this.outputs[j] ) );
                    //var weights_delta = (this.experiments[trains].output[j] - this.outputs[j])*(this.experiments[trains].output[j] - this.outputs[j]);
                    //console.log(weights_delta);


                    for (var v_index = 0; v_index < this.neurons.length; v_index++) {
                        this.neurons[v_index].d += weights_delta * this.neurons[v_index].outputs[j];
                      //  this.neurons[v_index].outputs[j] = this.neurons[v_index].outputs[j] + this.neurons[v_index].value * weights_delta * this.learningRate;
                        this.neurons[v_index].outputs[j] = this.neurons[v_index].outputs[j] + this.neurons[v_index].value * weights_delta * this.learningRate;
                    }
                }

                for (var t = 0; t < this.neurons.length; t++) {
                    var error = this.neurons[t].d * this.sigmoid( this.neurons[t].value ) * ( 1 - this.sigmoid( this.neurons[t].value ) )

                    for (var w_index = 0; w_index < this.inputs.length; w_index++) {
                        this.neurons[t].inputs[w_index] = this.neurons[t].inputs[w_index] + this.inputs[w_index] * error * this.learningRate;
                    }
                }

            }

            if(s/this.experiments.length < this.error){
                this.save();
                break;
            }
            console.log(e, s/this.experiments.length);







         }
         this.save();
    }

    calcEffect(expect){
        var s = 0;
        for (var i = 0; i < expect.length; i++) {
           // console.log(this.outputs[i] , expect[i])
            s+= Math.pow( this.outputs[i] - expect[i], 2);
        } 
        return s;
    }
    
    
    
    initMatrix(){
        for (var i = 0; i < this.neuronsAmount; i++) {
            this.neurons[i] = {
                inputs: [],
                outputs: [],
                value: null,
                d: 0
            };
            for (var j = 0; j < this.inputsAmount; j++) {
                var a = Math.random()*0.6 - 0.3;
                if(a == 0)
                    a = 0.1;
                this.neurons[i].inputs.push(a);
            }
        }

        for (var i = 0; i < this.outputsAmount; i++) {
            for (var j = 0; j < this.neuronsAmount; j++) {
                var a = Math.random()*0.6 - 0.3;
                if(a == 0)
                    a = 0.1;
                this.neurons[j].outputs.push(a);
            }
        }
    

    }
        
    calcNeurons(){
        var ar = [];
        for (var i = 0; i < this.neuronsAmount; i++) {
            var s = 0;
            for (var j = 0; j < this.inputs.length; j++) {
                s+=this.inputs[j] * this.neurons[i].inputs[j];
            }
            
            this.neurons[i].value = this.sigmoid(s);  
            this.neurons[i].d = 0;  
        }
    }
    
    calcOutputs(){
        var ar = [];
        for (var i = 0; i < this.outputsAmount; i++) {
            var s = 0;
            for (var j = 0; j < this.neuronsAmount; j++) {
                s+=this.neurons[j].value*this.neurons[j].outputs[i];
            }
            ar.push(this.sigmoid(s));  

        }
        this.outputs = ar;
        //console.log(this.outputs);
    }
    
    sigmoid(value){
        return 1/( 1 + Math.pow( Math.E, -value ) );
    }

    save(){
        let content = JSON.stringify( {
            neurons:this.neurons
        } );

        fs.writeFile(__dirname + "/net/network.json", content, function (err) {
            if (err) {
                return console.log(err);
            }
        
            console.log("Network's data was saved!");
        }); 
    }

    load(){
        var obj = fs.readFileSync(__dirname + "/net/network.json");
        obj = JSON.parse(obj);
        this.neurons = obj.neurons;
    }

    shuffle(array) {
        let counter = array.length;
    
        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            let index = Math.floor(Math.random() * counter);
    
            // Decrease counter by 1
            counter--;
    
            // And swap the last element with it
            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
    
        return array;
    }
    
    
    
    change(){
    
    }
}

