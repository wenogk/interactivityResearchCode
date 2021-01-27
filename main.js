const puppeteer = require('puppeteer');
var pure_js_functions = require('./js_pure_functions');
async function main(settings) {
//https://nyuad.nyu.edu/en/
  let COMPUTED_INTERACTIVE_NODES = []
  let nativeEvents = ['click',' dblclick','mousedown','mouseup','mouseover','mousemove','mouseout','dragstart','drag','dragenter','dragleave','dragover','drop','dragend','keydown','keypress','keyup','load','unload','abort','error','resize','scroll','select','change','submit','reset','focus','blur','focusin','focusout','DOMActivate','DOMSubtreeModified','DOMNodeInserted','DOMNodeRemoved','DOMNodeRemovedFromDocument','DOMNodeInsertedIntoDocument','DOMAttrModified','DOMCharacterDataModified','loadstart','progress','error','abort','load','loadend']
 //let availableColors = ["pink","purple","yellow","orange","cyan","teal","mediumpurple","maroon","brown","palegreen","coral","gold","red","crimson"]
 let extendedColors = ["#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177" ,"#0d5ac1" ,
 "#f205e6" ,"#1c0365" ,"#14a9ad" ,"#4ca2f9" ,"#a4e43f" ,"#d298e2" ,"#6119d0",
 "#d2737d" ,"#c0a43c" ,"#f2510e" ,"#651be6" ,"#79806e" ,"#61da5e" ,"#cd2f00" ,
 "#9348af" ,"#01ac53" ,"#c5a4fb" ,"#996635","#b11573" ,"#4bb473" ,"#75d89e" ,
 "#2f3f94" ,"#2f7b99" ,"#da967d" ,"#34891f" ,"#b0d87b" ,"#ca4751" ,"#7e50a8" ,
 "#c4d647" ,"#e0eeb8" ,"#11dec1" ,"#289812" ,"#566ca0" ,"#ffdbe1" ,"#2f1179" ,
 "#935b6d" ,"#916988" ,"#513d98" ,"#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
 "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
 "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
 "#5be4f0", "#57c4d8", "#a4d17a", "#225b8", "#be608b", "#96b00c", "#088baf",
 "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
 "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
 "#fb21a3", "#51aed9", "#5bb32d", "#807fb", "#21538e", "#89d534", "#d36647",
 "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
 "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
 "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#21538e", "#89d534", "#d36647",
 "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
 "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
 "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#9cb64a", "#996c48", "#9ab9b7",
 "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
 "#73872a", "#520d3a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
 "#8fe22a", "#ef6e3c", "#243eeb", "#1dc18", "#dd93fd", "#3f8473", "#e7dbce",
 "#421f79", "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee", "#0f5997",
 "#409188", "#911e20", "#1350ce", "#10e5b1", "#fff4d7", "#cb2582", "#ce00be",
 "#32d5d6", "#17232", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
 "#fc6b57", "#f07815", "#8fd883", "#060e27", "#96e591", "#21d52e", "#d00043",
 "#b47162", "#1ec227", "#4f0f6f", "#1d1d58", "#947002", "#bde052", "#e08c56",
 "#28fcfd", "#bb09b", "#36486a", "#d02e29", "#1ae6db", "#3e464c", "#a84a8f",
 "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#c9d730", "#30cc49",
 "#3d6751", "#fb4c03", "#640fc1", "#62c03e", "#d3493a", "#88aa0b", "#406df9",
 "#615af0", "#4be47", "#2a3434", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
 "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c", "#dc1c06",
 "#f53b2a", "#b46238", "#2dfff6", "#a82b89", "#1a8011", "#436a9f", "#1a806a",
 "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101", "#ff065",
 "#71b1f4", "#a2f8a5", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
 "#1c65cb", "#5d1d0c", "#2d7d2a", "#ff3420", "#5cdd87", "#a259a4", "#e4ac44",
 "#1bede6", "#8798a4", "#d7790f", "#b2c24f", "#de73c2", "#d70a9c", "#25b67",
 "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
 "#f812b3", "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
 "#dba2e6", "#76fc1b", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca"]
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
            if(nativeEvents.includes(node.type)) {
              let index = nativeEvents.indexOf(node.type)
              borderColor = extendedColors[index]
            } else {
              borderColor = "green"
            }
            eventColors[node.type] = borderColor
            /*
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
            }*/

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
      
      //console.log(JSON.stringify(completeListenerObject,null, 2))
      //console.log("len" + completeListenerObject.listeners.length)
      //console.log(JSON.stringify(eventColors,null, 2))
      console.log(JSON.stringify(counterObj,null, 2))
      //console.log(JSON.stringify(finalArr, null, 2));
      //console.log(JSON.stringify(eventColors, null, 2))


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