const cors = require('cors');
const app = require('express')();
const cluster = require('cluster');
const endpoint = require('./apiEndpoints');
const numberOfCPUCores = require('os').cpus().length;
// const PORT = 8000;
let currentCount = 0;
let aboveThreshold = currentCount>2 ? true : false;
const CACHED_THRESHOLD = 1000;
let cachedData = [];

function updateWorkers(){
    Object.values(cluster.workers).forEach((worker)=>{
        worker.on('message',msg=>{
           cachedData.push(msg.tmpData);
        })
        worker.send({cachedData})
    })
}

function runLoadBalancer(PORT){
    if(cluster.isMaster){
        console.log(`Parent process ${process.pid} running`);
        for(let i=0;i<numberOfCPUCores;i=i+1){
            cluster.fork();
        }
        updateWorkers();
        setInterval(updateWorkers, 10000);
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
        });
    }
    else{
        console.log(`Child process ${process.pid}`);
        endpointFunction(PORT);
    }
}

function sleep(time){
    const start = Date.now();
    while(Date.now()-start<time){}   
}

function findData(tmpData,query){
    let data = tmpData.filter((data)=>data.query===query)
    return data.length>0 ? data[0] : null;
}

function cachedDataHandler(inputData){
    if(cachedData.length>CACHED_THRESHOLD){
        cachedData = cachedData.splice(cachedData.length/2);
    }
    cachedData.push(inputData);
    /*
        inputData = {
            query:String (GET,POST,PUT)
            params:String (Query Params)
            data:Array/Object
        }
    */
}

function endpointFunction(PORT){
    // let tmpData = [];
    process.on('message',msg=>{
        cachedData = [...cachedData,...msg.cachedData];
        // console.log(cachedData);
    })
    app.get('/getData',(req,res)=>{
        const data = findData(cachedData,'getData');
        // console.log(data,cachedData);
        if(data){
            process.send({tmpData:cachedData});
            res.send(data.data);
        }else{
            //get data from DB
            cachedDataHandler({
                query:'getData',
                params:'',
                data:'Hi'
            });
            res.send('Hi');
        }
    })
    app.get('/getSecond',(req,res)=>{
        currentCount = currentCount+1;
        res.send('Hello');
    })
    app.get('/getThird',(req,res)=>{
        currentCount = currentCount+1;
        res.send('Bye');
    })
    app.use(cors());

    app.listen(PORT,()=>console.log(`Listening on PORT ${PORT}`));
}

runLoadBalancer(8000);
// endpointFunction(8000);


