const getXpathFunction = `
function() {
  elm = this;
  var allNodes = document.getElementsByTagName('*'); 
  for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
  { 
      if (elm.hasAttribute('id')) { 
              var uniqueIdCount = 0; 
              for (var n=0;n < allNodes.length;n++) { 
                  if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
                  if (uniqueIdCount > 1) break; 
              }; 
              if ( uniqueIdCount == 1) { 
                  segs.unshift('id("' + elm.getAttribute('id') + '")'); 
                  return segs.join('/'); 
              } else { 
                  segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
              } 
      } else if (elm.hasAttribute('class')) { 
          segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'); 
      } else { 
          for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
              if (sib.localName == elm.localName)  i++; }; 
              segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
      }; 
  }; 
  return segs.length ? '/' + segs.join('/') : null;
}
`

const insertMarkerElementAndReturnRect = `
function() {
    let rect = this.getBoundingClientRect()
    result = {}
    for (var key in rect) {
      if(typeof rect[key] !== 'function') {
        result[key] = rect[key]
      }
    }
    
    document.body.innerHTML += '<div style="position:absolute;width:' + result.width + ';height:' + result.height + ';top:' + result.top + ';left:' + result.left + ';opacity:0.3;z-index:100;background:green;"></div>';
    return JSON.stringify(result);
  }
`
//
module.exports = {
    getXpathFunction,
    insertMarkerElementAndReturnRect
};