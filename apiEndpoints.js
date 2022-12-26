const cors = require('cors');
const app = require('express')();

let currentCount = 0;

function endpointFunction(PORT){
    app.get('/getData',(req,res)=>{
        currentCount = currentCount+1;
        res.send('Hi');
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

module.exports={
    endpointFunction:endpointFunction,
    currentCount:currentCount
};