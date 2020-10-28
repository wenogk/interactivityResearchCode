const puppeteer = require('puppeteer');

async function main(settings) {
//https://wenogk.github.io/comlab-assignment-1/
//https://nyuad.nyu.edu/en/

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

      await page.screenshot({path: `screenshot-1.png`});

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
        console.log(resolvedNode)
        //
          try {

            //node.getBoundingClientRect()
            const boxMod = (await cdp.send('DOM.getBoxModel', {

              backendNodeId: node.backendNodeId,

            }))
            //print(await cdp.send('DOM.highlightNode'))
            
            completeListenerObject.listeners[i]["locationInfo"] = boxMod.model
            

          } catch {

            completeListenerObject.listeners[i]["locationInfo"] = null
            node = null

          }
          //get the description of the node element
          try {

          const nodeDescription = (await cdp.send('DOM.describeNode', {
            backendNodeId: node.backendNodeId,
          }))

          nodeDescription.node.attributes = deInterleaveArray(nodeDescription.node.attributes)
          completeListenerObject.listeners[i]["indentifierInfo"] = nodeDescription.node

        } catch {

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

            if(node.type == "click") {

              borderColor = settings.colors.clickEventBorderColor

            } else if(node.type == "load") {

              borderColor = settings.colors.loadEventBorderColor

            }

            //set css style (should be changed to draw border over)
            await cdp.send('DOM.setAttributeValue', {
                nodeId: nodeIdarray.nodeIds[0],
                name: "style",
                value: "border: dashed " + borderColor + ";"
              })
           
            await cdp.send('DOM.highlightNode', {
                highlightConfig: {
                    showInfo : true,
                    showRulers: true,
                    showExtensionLines: true,
                    borderColor: {r: 255,
                        g: 0,
                        b:0,
                        a: 1},
                    contentColor: {
                        r: 255,
                        g: 0,
                        b:0,
                        a: 1
                    }
                },
                backendNodeId: node.backendNodeId,
              })
             
              
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

      //e.type == "click" && && e.locationInfo.width > 0 && e.locationInfo.height > 0
      const finalArr = completeListenerObject.listeners.filter(e => {

        return ( e.locationInfo != null && e.locationInfo.width > 0 && e.locationInfo.height > 0)

       });

      //count each type of event listener and put them in an object
      counterObj = {}
      finalArr.forEach(e => {

        //console.log(JSON.stringify(e,null, 2))
        if(counterObj[e.type] == null) {

          counterObj[e.type] = 1

        } else {

          counterObj[e.type] += 1

        }

      });

      console.log(JSON.stringify(counterObj,null, 2))
      //console.log(JSON.stringify(completeListenerObject, null, 2));
    

    await cdp.send('Runtime.releaseObjectGroup', { objectGroup: 'romeno' });

    //await browser.close();
  } catch (err) {
    console.error(err);
  }
}

const settings = {

    url: "https://www.salesforce.com/eu/?ir=1",
    getScriptSource : false,
    colors: {
      defaultEventBorderColor : "green",
      loadEventBorderColor: "red",
      clickEventBorderColor: "blue",
    }

}

main(settings)
