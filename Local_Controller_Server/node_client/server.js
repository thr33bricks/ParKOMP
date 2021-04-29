//ParKOMP - Parking of the future
//Yordan Yordanov, March 2021
//Baba Tonka High School of Mathematics, Ruse
//For contacts - yyordanov2002@icloud.com

//IT IS FORBIDDEN TO USE THIS CODE IN ANY WAY
//WITHOUT THE PERMISSION OF THE OWNER


//ParKOMP Systems Local Parking Server

//This is the server which connects with the main server and manages
//multiple cameras and IP barriers on local level
//The program is responsible for interacting with the FastAPI LPR System Server

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
var fs = require('fs')
var axios = require('axios')
var Jimp = require('jimp')
var Promise = require('bluebird');

var entr = getInitializedEntrances()
var clients = null

//Connect to ParKOMP server
var socket = require('socket.io-client')('http://'+ process.env.main_server_ip + ':'+ process.env.main_server_port, {
    path: '/socketio'
})

const WebSocket = require('ws')
const s = new WebSocket.Server({ port: process.env.bar_server_port })


s.on('connection', (ws,req)=>{
    //======================================== ESP8266 Barriers Communication ========================================
    ws.on('message',(msg)=>{
        console.log('Received: ' + msg)

        //Authentication
        if(msg == 'send_auth')
            ws.send('auth')
        if(msg.includes('auth:')){
            let authReq = msg.split(':')
            if(authReq[1] == process.env.bar_server_token){
                ws.name = authReq[2]
                clients = s.clients
                console.log('ESP8266 barrier ' + ws.name + ' connected!\n')
            }
        }

        if(ws.name){
            if(msg == 'closed'){
                let en = getEntranceByName(entr, ws.name)
                en.f_opened = false
                en.last_cust = null //This line will be removed if cameras are more than one
                console.log('Barrier ' + ws.name + ' closed!\n')
                if(en.f_open_now){
                    en.f_open_now = false
                    en.f_opened = true
                    console.log('Barrier ' + ws.name + ' opened!')
                    ws.send('open')
                }
            }
        }
    })
    ws.on('close', function(){
        console.error('\x1b[41m%s\x1b[0m', 'ESP8266 Barrier: ' + ws.name + ' Disconnected! Take action immediately!')
    })

    //====================================== ParKOMP Main server communication ======================================
    
    socket.on('validated', (data)=>{
        if(data.res == 'no')
            console.log('Entrance: ' + data.entr + ' Customer not registered!\n')
        else if(data.res == 'err'){
            console.error('\x1b[41m%s\x1b[0m', 'Server SQL error!')
            console.log('\n')
            let en = getEntranceByName(entr, data.entr)
            en.last_cust = null
        }
        else if(data.res == 'in'){
            let en = getEntranceByName(entr, data.entr)
            console.log('Car with license plate: ' + en.last_cust + ' ENTERED the parking, entrance: ' + data.entr +'!\n')
            
            if(en.f_opened)
                en.f_open_now = true
            else{
                en.f_opened = true

                let wsClient = getBarrierClientByName(s.clients, data.entr)
                if(wsClient)
                    wsClient.send('open')
            }
        }
        else if(data.res == 'out'){
            let en = getEntranceByName(entr, data.entr)
            console.log('Car with license plate: ' + en.last_cust + ' EXITTED the parking, exit: ' + data.entr +'!\n')
            
            if(en.f_opened)
                en.f_open_now = true
            else{
                en.f_opened = true

                let wsClient = getBarrierClientByName(s.clients, data.entr)
                if(wsClient)
                    wsClient.send('open')
            }
        }
    })
})

socket.on('connect', ()=>{
    socket.emit('authenticate', {token: process.env.main_server_token})
})

socket.on('connected', ()=>{
    console.log('Client connected to ParKOMP server!')
})

//========================== ParKOMP FastAPI LPR System Server communication ==========================

repeatAsync(loopCameras, 10)
function repeatAsync(func, interval, success, error) {
    (function loop() {
        func(() => {setTimeout(loop, interval)})
    })()
}

async function loopCameras(callback){
    new Promise(function(resolve, reject) { 
        let i = 0;
        for(let cam in entr){
            if(i == Object.keys(entr).length - 1){
                readCamera(entr[cam], () => {resolve()})
                break
            }
            readCamera(entr[cam])
            i++
        }
    }).then(() => {
        callback()
    })
}

//====================================== Misc functions ======================================

function getInitializedEntrances(){
    //reads all entrances from 'entrancesIO.json', parses them in JSON format and initializes 
    //all entrances with the required fields
    const entrPlain = fs.readFileSync('./entrancesIO.json')
    let entrJSON = JSON.parse(entrPlain)
    
    for(let entr in entrJSON){
        entr.last_res = ''
        entr.last_cust = ''
        entr.f_opened = false
        entr.f_open_now = false
    }
    return entrJSON
}

function getImgWidth(cam){
    //Tested on Redmi Note 8T DIY IP Camera 1920x1080
    if (cam.cam_width == 1920 && cam.cam_height == 1080){
        return 900
    }
    else{
        return 1000
    }     
}

function getBarrierClientByName(clients, name){
    let returnClient = null
    clients.forEach((client) => {
        if(client.name == name){
            returnClient = client
        }
    })
    if(returnClient != null)
        return returnClient
    console.error('\x1b[41m%s\x1b[0m', 'Barrier by name: ' + name + ' not found!')
    return null
}

function getEntranceByName(entr, name){
    for(let e in entr){
        if(entr[e].name == name){
            return entr[e]
        }
    }
    console.error('\x1b[41m%s\x1b[0m', 'Entrance by name: ' + name + ' not found!')
    return null
}

async function readCamera(cam, callback){
    await Jimp.read('http://' + cam.cam_ip + ':' + cam.cam_port + '/shot.jpg', function(err,img){
        if (err){
            //console.log('One or more cameras not found!') 
            callback()
            return
        }
            
        img.resize(getImgWidth(cam), Jimp.AUTO).getBase64( Jimp.AUTO , function(e,img64){
            if(e) throw e
            if(img64){
                axios.defaults.headers.common = {
                    'access_token': process.env.lpr_server_token,
                  }

                axios
                .post('http://'+ process.env.lpr_server_ip +':'+ process.env.lpr_server_port + '/image', {
                    img: img64
                })
                .then(res => {
                    if(process.env.double_ver && res.data && cam.last_res != res.data){
                        cam.last_res = res.data
                        callback()
                        return
                    }
                    if(res.data && res.data != 'None' && cam.last_cust != res.data){
                        cam.last_cust = res.data
                        console.log('New customer: ' + res.data)
                        try{
                            if(getBarrierClientByName(clients, cam.name) != null)
                                socket.emit("new_cust", {lp: res.data, p_name: process.env.p_name, entr: cam.name})
                            else
                                console.error('No camera connected to entrance: ' + cam.name)
                        }catch(e){
                            console.error(e)
                        }
                    }
                    callback()
                })
                .catch(error => {
                    console.error(error)
                    callback()
                })
            }
        })
    })
}
    