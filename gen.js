const getPixels = require("get-pixels")
const fs = require('fs');
const path = require('path');
const resizeImg = require('resize-img');
const cfg = require('./config.json');

var experiments = [];

fs.readdir('learning', (err, dirs) => {
    dirs.forEach(dir => {
        fs.readdir('learning/' + dir + "/images", (err, files) => {
            fs.readdir('learning/'+ dir + "/tmp/", (err, f) => {
                if (err) throw err;
              
                for (const file of f) {
                  fs.unlink(path.join('learning/'+ dir + "/tmp/", file), err => {
                    if (err) throw err;
                  });
                }
            });
            files.forEach(file => {
                resizeImg(fs.readFileSync('learning/'+ dir + "/images/" + file), {width: cfg.width, height: cfg.height}).then(buf => {
                    fs.writeFileSync('learning/' + dir + "/tmp/" + file, buf);
                    createExperiment('learning/'+ dir + "/tmp/", dir, file);
                    console.log(dir)
                });
            });
        })

    });
})

console.log("finish");

function createExperiment(path, dir, file){
    getPixels(path + file, function(err, pixels) {
        if(err) {
            console.log("Bad image path")
            return
        }

        var ar = [];
        var output = require('./learning/'+ dir +'/output.json').output;


        for (var i = 0; i < pixels.data.length; i+=4) {
            if(pixels.data[i] > 155 && pixels.data[i+1] > 155 && pixels.data[i+2] >155 && pixels.data[i+3] > 155){
                ar.push(0);
            }else{
                ar.push(1);
            }
        }

        var s = [];
        for (var i = 0, j = 0; i < ar.length; i+=cfg.height) {
            s.push(ar.slice(i, i+cfg.width));
        }
        experiments.push({
            input: ar,
            output: output
        });

        let content = JSON.stringify(experiments);

        fs.writeFile(__dirname + "/net/exp.json", content, function (err) {
            if (err) {
                return console.log(err);
            }
        
            //console.log("Network's data was saved!");
        }); 
    })
    
}
