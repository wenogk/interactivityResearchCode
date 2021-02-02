const puppeteer = require('puppeteer');
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');
const fs = require('fs');

var pure_js_functions = require('./js_pure_functions');
let nativeEvents = ['click',' dblclick','mousedown','mouseup','mouseover','mousemove','mouseout','dragstart','drag','dragenter','dragleave','dragover','drop','dragend','keydown','keypress','keyup','load','unload','abort','error','resize','scroll','select','change','submit','reset','focus','blur','focusin','focusout','DOMActivate','DOMSubtreeModified','DOMNodeInserted','DOMNodeRemoved','DOMNodeRemovedFromDocument','DOMNodeInsertedIntoDocument','DOMAttrModified','DOMCharacterDataModified','loadstart','progress','error','abort','load','loadend']

async function main(settings, callback) {

  const db = new sqlite3.Database('./data.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the data.db database.');
});

// db.serialize let us run sqlite operations in serial order
db.serialize(() => {
    // 1rst operation (run create table statement)
    db.run('CREATE TABLE IF NOT EXISTS AlexaData(id INTEGER PRIMARY KEY, url text, type text, xpath text, location text, timeRecorded datetime, nativeEvent integer)', (err) => {
        if (err) {
            console.log(err);
            throw err;
        }
    });

});


  let COMPUTED_INTERACTIVE_NODES = []

 let eventColors = {
   "click" : "blue"
 }

function deInterleaveArray(arr) {

    //This function turns interleaved attribute array sent from chrome dev tools to an object of named attributes and values

    index = 0
    result = {}
    while(index<arr.length) {
        result[arr[index]] = arr[index+1]
        index+=2
    }
    return result;

}

  try {

    const browser = await puppeteer.launch({
      headless: true,
      args: [ '--proxy-server=192.168.1.117:9300' ]
    });
    const [page] = await browser.pages();
    await page.setViewport({ width: 1000, height: 700});
    await page.goto(settings.url, {
      waitUntil: 'networkidle2',
    });

    await page.evaluate( () => {

      window.scrollBy(0, window.innerHeight);

  });
    
    const cdp = await page.target().createCDPSession();

      

    const nodeObject = (await cdp.send('Runtime.evaluate', {

      expression: "document.querySelector('body')",
      objectGroup: 'romeno',

    })).result;

    const completeListenerObject = (await cdp.send('DOMDebugger.getEventListeners', {

        objectId: nodeObject.objectId,
        depth: -1

      }))

      //find the locations
      for (let i = 0; i < completeListenerObject.listeners.length; i ++) {

        node = completeListenerObject.listeners[i]
        const resolvedNode = (await cdp.send('DOM.resolveNode', {

            backendNodeId: node.backendNodeId,

          }))

          //get the description of the node element
          try {

            const nodeDescription = (await cdp.send('DOM.describeNode', {
              backendNodeId: node.backendNodeId,
            }))
          

//following function is to get xpath and is from https://stackoverflow.com/a/5178132
          let functionCode = pure_js_functions.getXpathFunction
          //console.log("OBJECT ID " +(resolvedNode.object.objectId))
          completeListenerObject.listeners[i]["indentifierInfo"] = nodeDescription.node

          try {
            nodeDescription.node.attributes = deInterleaveArray(nodeDescription.node.attributes)
            let callXpathFunction = (await cdp.send('Runtime.callFunctionOn', {
              functionDeclaration : functionCode,
              objectId: resolvedNode.object.objectId,
            })) 
            completeListenerObject.listeners[i]['xpathInfo'] = callXpathFunction.result.value
          } catch(e) {
            console.log(e)
          }

          //start location info
          try {
            let getBoundingClientRectFunction = `
            function() {
              let rect = this.getBoundingClientRect()
              result = {}
              for (var key in rect) {
                if(typeof rect[key] !== 'function') {
                  result[key] = rect[key]
                }
              }
              return JSON.stringify(result)
            }
            `

           let callGetBoundingClientRectFunction = (await cdp.send('Runtime.callFunctionOn', {
            functionDeclaration : getBoundingClientRectFunction,
            objectId: resolvedNode.object.objectId,
          })) 

          completeListenerObject.listeners[i]["locationInfo"] = JSON.parse(callGetBoundingClientRectFunction.result.value)
          clientRectObj = JSON.parse(callGetBoundingClientRectFunction.result.value)
          

          } catch(e) {
            console.log("bixmod error" + e)
            completeListenerObject.listeners[i]["locationInfo"] = null
            node = null

          }
          //end location info
        } catch (e) {
          console.log(e)
            completeListenerObject.listeners[i]["indentifierInfo"] = null
            
        }
          //get the source of the script
          if(settings.getScriptSource && node != null) {

            try {

                await cdp.send('Debugger.enable')
                const scriptInfo = (await cdp.send('Debugger.getScriptSource', {
                    scriptId: node.scriptId,
                  }))
                  completeListenerObject.listeners[i]["scriptInfo"] = scriptInfo

              } catch {
    
              }
          }
          
      }
      //await page.screenshot({path: `screenshot-1.png`, fullPage: true});
      //e.type == "click" && && e.locationInfo.width > 0 && e.locationInfo.height > 0

      const finalArr = completeListenerObject.listeners.filter(e => {
        if(e.type != "bbc") {
          return false
        } else {
          return true;
        }

       });

      //count each type of event listener and put them in an object
      counterObj = {}

      numberOfNewDBRecordsForURL = 0
      completeListenerObject.listeners.forEach( (e) => {
        
        //console.log(JSON.stringify(e,null, 2))
        if(counterObj[e.type] == null) {

          counterObj[e.type] = 1

        } else {

          counterObj[e.type] += 1

        }
        //console.log("checking")
        
        db.all(`SELECT * FROM AlexaData WHERE url = ? AND xpath = ?`, [settings.url,e.xpathInfo], (err, rows) => {
          
          if (err) {
              console.log(err);
              throw err;
          }
          if(rows.length == 0){
            let nativeEventVal = (nativeEvents.includes(e.type)) ? 1 : 0
            db.run("INSERT INTO AlexaData(id, url, type, xpath, location, timeRecorded, nativeEvent) VALUES(NULL, ?, ?, ?, ?, datetime('now', 'localtime'), ?)", [settings.url,e.type,e.xpathInfo,JSON.stringify(e.locationInfo), nativeEventVal], (err) => {
              if(err) {
                return console.log(err.message); 
              }
              numberOfNewDBRecordsForURL+= 1
              console.log("Added " + numberOfNewDBRecordsForURL + " new records for " + settings.url)
            });
          }
      });

      

      });

    
      

    //   db.all(`SELECT * FROM AlexaData`, [], (err, rows) => {
    //     if (err) {
    //         console.log(err);
    //         throw err;
    //     }
    //     console.log("Total rows in db: " + JSON.stringify(rows[0], null, 2))
    // });
      
      
      //console.log(JSON.stringify(completeListenerObject,null, 2))
      //console.log("len" + completeListenerObject.listeners.length)
      //console.log(JSON.stringify(eventColors,null, 2))
      //console.log(JSON.stringify(counterObj,null, 2))
      //console.log(JSON.stringify(finalArr, null, 2));
      //console.log(JSON.stringify(eventColors, null, 2))


    await cdp.send('Runtime.releaseObjectGroup', { objectGroup: 'romeno' });

    await browser.close();

    callback()
    
  } catch (err) {
    callback()
  }
  
  

}



// const readInterface = readline.createInterface({
//   input: fs.createReadStream('./top-1m.csv'),
//   output: process.stdout,
//   console: false
// });

//  readInterface.on('line', async function(line) {

// }
//   await main(settings)
// });


var parse = require('csv-parse');
var async = require('async');

var inputFile='./top-1m.csv';

var parser = parse({delimiter: ','}, function (err, data) {
  async.eachSeries(data, function (line, next) {
    // do something with the line
    let url = "http://www." + line[1]
    console.log("url: ", url)
    let lineNum = parseInt(line[0])
    if(lineNum < 622) {
      next()
      return
    }
    if(lineNum < 1001) {
      //console.log(line)
      try {
        const settings = {
          url: url,
          getScriptSource : false,
          ignoreNormalLinks : true,
          cdpHighlight: true,
          puppeteerManualHighlight : false
        }
        main(settings, next)
      } catch {
        next()
      }
        
    }
      
  })
});
fs.createReadStream(inputFile).pipe(parser);
//
