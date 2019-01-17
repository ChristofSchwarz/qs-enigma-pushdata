// need the following node modules: run
// npm install fs ws enigma.js

const serverUri = 'localhost';
const clientCertFile = '.\\client.pem';
const clientCertKey = '.\\client_key.pem';
const enigma = require('./node_modules/enigma.js/enigma.min.js');
const WebSocket = require('ws');
const fs = require('fs');
const schema = require('./node_modules/enigma.js/schemas/12.170.2.json'); 
// match this schema to your Qlik Sense version.
const defaultCertPath = 'C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates';

const session = enigma.create({
    schema,
    url: `wss://${serverUri}:4747/app/engineData`,
    createSocket: url => new WebSocket(url, {
        rejectUnauthorized: false,  
        //ca: [fs.readFileSync('.\\root.pem')],  // you can skip ca if you set rejectUnautzoried to false
        key: fs.existsSync(clientCertKey)?fs.readFileSync(clientCertKey)
            :fs.readFileSync(`${defaultCertPath}\\client_key.pem`),
        cert: fs.existsSync(clientCertFile)?fs.readFileSync(clientCertFile)
            :fs.readFileSync(`${defaultCertPath}\\client.pem`),
        headers: { "X-Qlik-User": 'UserDirectory=INTERNAL;UserId=sa_engine' }
    })
});

var addToApp = '4c85c23b-19f2-4bd1-952d-5627618ba044';
var addToTable = 'MyTable';
var timestampField = 'timeAdded'; // set to '' if no timestamp needed;
var addData = [
	{name: "Jesus", age: 15}
];


session.open().then(function (global) {
    console.log('>> Session was opened successfully');
	var app;
	var origScript;
    //console.log(global);
    return global.engineVersion().then(ret => {
        console.log('Engine Version: ', ret);
        //return global.getDocList();
		return global.openDoc(addToApp);
    }).then(ret => {
        app = ret;
        return app.getScript();
    }).then(script => {
		origScript = script;
		script = [];
		script.push(`//header of generated script`);
		addData.forEach(row => {
			script.push(`CONCATENATE ([${addToTable}])`);
			script.push(`ADD LOAD`);
			// compute a Qlik LOAD AUTOGENERATE statement
			var n = 0;
			if (timestampField.length > 0) {
				script.push(`TimeStamp(Now()) AS [${timestampField}]`);
				n++;
			}
			for (key in row) {
				if (!isNaN(parseFloat(row[key])) && isFinite(row[key])) {
					// value is numeric, make sure JavaScript and Qlik number formatting work
					script.push((n>0?',':'') + `Num(${row[key]}) AS [${key}]`);
				} else {
					// value is text, if a single-quote is in the text, use Chr() formula instead 
					script.push((n>0?',':'')  + `'${row[key].replace("'", "'&Chr(39)&'")}' AS [${key}]`);
				}
				n++;
			}
			script.push(`AUTOGENERATE(1);`);
		})
		script.push(`EXIT SCRIPT;`);
        script = script.join('\n'); // implode script array into new-line separated string
		
		console.log('---begin of new script---\n');
		console.log(script);
		console.log('\n---end of new script---');
        return app.setScript(script);
    }).then(ret => {
        console.log('>> App script changed, now reloading (pushing new data):');
        return app.doReload(0, true);        // true = Partial Reload
	}).then(ret => {
		console.log('>> Reload finished: ', ret);
		return app.setScript(origScript);
	}).then(ret => {
		console.log('>> Load script reverted to original script. Now saving.');
		return app.doSave();
    }).catch(error => {
        console.error('Error', error);
    });
}).then(ret => {
    session.close();
	console.log('>> Done.');
}).catch(error => {
    console.error('Error', error);
});


