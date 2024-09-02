// const http = require('http')//this is http
// const fs = require('fs')//this is fs module


// const server = http.createServer((req,res)=>{
//     // fs.readFile("sample.txt",(err,data)=>{
//     //     res.end(data);
//     // })

//     const stream = fs.createReadStream("sample.txt");
//     stream.pipe(res); //this code is used for large data 
// })
// server.listen(3000)

//the readFile reads the entire file content and calls the callback function the call back returns the file data to the http client



// const http = require('http')
// const fs = require('fs')


// fs.readFile('home.html',(err,home)=>{
//     // console.log(home.toString());
//     if(err){
//         throw err;
//     }
//     http.createServer((reques,response)=>{
//         response.writeHeader(200,{"Content-Type":"text/html"});//says that content should be served as html
//         response.write(home);
//         response.end();
//     })
//     .listen(3000)
// })


const http = require('http')
const fs = require('fs')
const args = require("minimist")(process.argv.slice(2));


let homeContent = "";
let projectContent = "";
let registrationContent = "";

fs.readFile('home.html',(err,home)=>{
    // console.log(home.toString());
    if(err){
        throw err;
    }
    homeContent = home;  
});

fs.readFile("project.html",(err,project)=>{
    if(err){
        throw err;
    }
    projectContent = project;
})
fs.readFile("registration.html",(err,registration)=>{
    if(err){
        throw err;
    }
    registrationContent = registration;
})

http.createServer((request,response)=>{
    let url = request.url;
    response.writeHeader(200,{"Content-Type":"text/html"});
    switch(url){
        case "/project":
            response.write(projectContent);
            response.end();
            break;
        case "/registration":
            response.write(registrationContent);
            response.end();
            break;
        default:
            response.write(homeContent);
            response.end();
            break;
    }
    // console.log(`listening on port ${args.port}`)
}).listen(args.port)