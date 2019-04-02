# Pushing Data into Qlik Sense with EnigmaJs

This node JS app shows how to push ("trigger to load") a given data array into a Qlik Sense data model of an app. See this Youtube video for a demo https://www.youtube.com/watch?v=21rKG0SxPVQ 

Steps to prepare
 * install NodeJs (including npm)
 * extract this download into a folder
 * open Command Prompt, go to the folder just created, and run 
```
npm install 
```
(you can skip next 3 steps if this node app is run from the same machine where Qlik Sense server is installed)
 * make sure the port 4747 (Engine API port) is open on the Sense server 
 * copy the certificates (client.pem and client_key.pem) from the server (C:\ProgramData\Qlik\Sense\Repository\Exported Certificates\.Local Certificates) and put it into the same folder just created
 * edit the right address of the server in push.js (it shows 'localhost' after download)
#
 * edit push.js to match your app id, table and data structure
![alttext](https://github.com/ChristofSchwarz/pics/raw/master/pushdata.png "screenshot")
 * run it from the Command Prompt using "node push.js"

More info on Enigma can be found here> https://github.com/qlik-oss/enigma.js/

Enjoy pushing data into Qlik.

## Known issues
If you had "Autocalendar" generated fields in your app, those are gone after pushing data into the app with this script. The reason is that autocalendar fields are not persisted in the data model, but generated on the fly after reload.
