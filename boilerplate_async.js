// need the following node modules: run
// npm install fs ws enigma.js

const WebSocket = require('ws');
const fs = require('fs');
const enigma = require('./node_modules/enigma.js/enigma.min.js');
const schema = require('./node_modules/enigma.js/schemas/12.170.2.json'); 
// match this schema to your Qlik Sense version.

/// IMPORTANT
// Choose 1 of the 4 configs below depending on your scenario:

/*
// [1] Config for Qlik Sense Desktop
const config = {
    serverUri: 'localhost',
    enginePort: 4848,
    protocol: 'ws',
    wsParams: {}
};
*/
/*
// [2] Config for Qlik Sense Server when run on the same machine
// it will pick the necessary certificates from the default folder under C:\ProgramData\...
const config = {
    serverUri: 'localhost',
    enginePort: 4747,
    protocol: 'wss',
    wsParams: {
        rejectUnauthorized: false,  
        // you can skip providing "ca" if you set "rejectUnautzoried" to false
        //ca: fs.readFileSync('C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\root.pem'),  
        key: fs.readFileSync('C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\client_key.pem'),
        cert: fs.readFileSync('C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\client.pem'),
        headers: { "X-Qlik-User": 'UserDirectory=INTERNAL;UserId=sa_engine' }
    }
}
*/
/*
// [3] config for Qlik Sense Server but NodeJs is run on a remote machine 
// You need to copy the client.pem and client_key.pem files of the Sense server
// to the same folder where this .js code is run from
const config = {
    serverUri: 'qmi-qs-sn',
    enginePort: 4747,
    protocol: 'wss',
    wsParams: {
        rejectUnauthorized: false,  
        // you can skip providing "ca" if you set "rejectUnautzoried" to false
        //ca: fs.readFileSync('.\\root.pem'),  
        key: fs.readFileSync('.\\client_key.pem'),
        cert: fs.readFileSync('.\\client.pem'),
        headers: { "X-Qlik-User": 'UserDirectory=INTERNAL;UserId=sa_engine' }
    }
}
*/
/*
// [4] Config for Qlik Core running in a Docker Container
// Internally the engine port is 9076, externally whatever you configured
const config = {
    serverUri: '192.168.56.19',
    enginePort: 19076,
    protocol: 'ws',
    wsParams: {}
};
*/

const session = enigma.create({
    schema,
    url: `${config.protocol}://${config.serverUri}:${config.enginePort}/app/engineData`,
    createSocket: url => new WebSocket(url, config.wsParams)
});

function run() {
  return new Promise(async function(res,rej){
    try {
        var global = await session.open();    
        console.log('Session opened with ' + global.session.config.url);
        var version = await global.engineVersion();
        console.log('Engine version:', version);
        //var newApp = await global.createApp("App" + Math.random());
        //var app = await global.openDoc(newApp.qAppId);
        await session.close();
        res();
    } catch(err) {
        await session.close();
        rej(err);
    }
  }) 
}

run().then(()=>{console.log('Bye.')}).catch((err)=>{console.log('Error',err)});




