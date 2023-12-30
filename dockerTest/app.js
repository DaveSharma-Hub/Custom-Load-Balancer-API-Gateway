const app = require('express')();
const cors = require('cors');

const PORT = 8080;

app.use(cors());

app.get('/testDocker',(req,res)=>{
    res.send({
        id:1,
        description:'Testing dockerizeing node.js application'
    });
})

app.listen(PORT,()=>{console.log(`Listening on port ${PORT}`)});