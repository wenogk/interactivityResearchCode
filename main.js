const puppeteer = require('puppeteer');
var pure_js_functions = require('./js_pure_functions');
async function main(settings) {
//https://wenogk.github.io/comlab-assignment-1/
//https://nyuad.nyu.edu/en/
  let COMPUTED_INTERACTIVE_NODES = []
 let availableColors = ["pink","purple","yellow","orange","cyan","teal","mediumpurple","maroon","brown","palegreen","coral","gold","red","crimson"]
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

    const browser = await puppeteer.launch({headless: false});
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
        //  console.log(resolvedNode)
        
        //
          


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
          
          //insertElement
         
          
          
        } catch (e) {
          console.log(e)
            completeListenerObject.listeners[i]["indentifierInfo"] = null
            
        }

        //highlight the interactive elements
     try{

        await cdp.send('DOM.getDocument')
        
            const nodeIdarray = (await cdp.send('DOM.pushNodesByBackendIdsToFrontend', {
              backendNodeIds: [node.backendNodeId]
            }))

            //set border color based on event listener type
            
            let borderColor = settings.colors.defaultEventBorderColor
            let settingHrefCheck = true
            try {
            let hrefCheck = (nodeDescription.node.attributes["href"] != null)
            settingHrefCheck = ((settings.ignoreNormalLinks) || !hrefCheck);
            } catch {
              settingHrefCheck = true;
            }

            if(eventColors[node.type] != null) { // 
              if(!settingHrefCheck) {
                borderColor = eventColors[node.type]
              } else {
                borderColor = eventColors[node.type]
              }
              

            } else {
              let newColor = "green"
              if(availableColors.length > 0) {
                newColor = availableColors.pop()
              }
              eventColors[node.type] = newColor
              borderColor = eventColors[node.type]
            }

            //set css style (should be changed to draw border over)
            if(settings.cdpHighlight) {
              await cdp.send('DOM.setAttributeValue', {
                nodeId: nodeIdarray.nodeIds[0],
                name: "style",
                value: "border: dashed " + borderColor + ";"
              })
            }
            
           
           

     }  catch (err) {

        console.error(err);

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
      await page.screenshot({path: `screenshot-1.png`, fullPage: true});
      //e.type == "click" && && e.locationInfo.width > 0 && e.locationInfo.height > 0

      const finalArr = completeListenerObject.listeners.filter(e => {
        if(e.type != "bbc") {
          return false
        } else {return true;}
        if(e.locationInfo.width == 0 || e.locationInfo.height == 0) {
          return false;
        }

        let hrefCheck = (e.indentifierInfo.attributes["href"] != null)
        let settingHrefCheck = ((settings.ignoreNormalLinks) || !hrefCheck);

        return ( e.locationInfo != null && e.type == "click" && settingHrefCheck)

       });
       //test
       
       
        


      //count each type of event listener and put them in an object
      counterObj = {}
      completeListenerObject.listeners.forEach( (e) => {
        
        //console.log(JSON.stringify(e,null, 2))
        if(counterObj[e.type] == null) {

          counterObj[e.type] = 1

        } else {

          counterObj[e.type] += 1

        }

      });
      console.log(JSON.stringify(eventColors,null, 2))
      console.log(JSON.stringify(counterObj,null, 2))
      console.log(JSON.stringify(finalArr, null, 2));
    

    await cdp.send('Runtime.releaseObjectGroup', { objectGroup: 'romeno' });

    //await browser.close();
    if(settings.puppeteerManualHighlight) {
      try {
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        await page.evaluate((completeListenerObject) => {
          completeListenerObject.listeners.forEach((e) => {
          clientRectObj = e["locationInfo"]
          result = clientRectObj
          console.log(result)
          //document.body.innerHTML +='<h1 style ="background: green;">hvjhvjhvjvjhdsadsvjhv</h1>';
         document.body.innerHTML += '<div style="position:absolute;width:' + result.width + 'px;height:' + result.height + 'px;top:' + result.top + 'px;left:' + result.left + 'px;border-style: solid;border-color: black;z-index:99999999;"  onclick="alert(\' ' + e.type +  '\')"></div>';
        
        });
        }, completeListenerObject)
      } catch(e) {
      console.log("insert element err" + e)
    }
     }
  } catch (err) {
    console.error(err);
  }
  
}

const settings = {
    url: "http://www.bbc.com",
    getScriptSource : false,
    colors: {
      defaultEventBorderColor : "green",
      loadEventBorderColor: "red",
      clickEventBorderColor: "blue",
    },
    ignoreNormalLinks : true,
    cdpHighlight: true,
    puppeteerManualHighlight : false
}

main(settings)
