// Desktop VoltPro Parallax — namespaced IDs (dv-*), timer-driven progress
(function(){
  "use strict";
  var clamp = function(v,lo,hi){return Math.max(lo,Math.min(hi,v));};
  var map = function(v,a,b,c,d){return c+(d-c)*clamp((v-a)/(b-a),0,1);};
  var easeIn3 = function(t){return t*t*t;};
  var easeOut3 = function(t){return 1-Math.pow(1-t,3);};

  // Timer-driven progress (set by initMobileShowcase in index.html)
  window.__deskVoltProgress = 0.15;

  var seqEl = document.getElementById('dv-hero');
  var stickyEl = seqEl;
  if(seqEl){
    var bg = document.getElementById('dv-seqBg');
    var panelContainer = document.getElementById('dv-panelContainer');
    var panelGlow = document.getElementById('dv-panelGlow');
    var panelEnergize = document.getElementById('dv-panelEnergize');
    var panelHud = document.getElementById('dv-panelHud');
    var panelPowered = document.getElementById('dv-panelPowered');
    var hudCircuits = document.getElementById('dv-hudCircuits');
    var intro = document.getElementById('dv-seqIntro');
    var phaseEl = document.getElementById('dv-seqPhase');
    var scrubFill = document.getElementById('dv-seqScrubFill');
    var finalEl = document.getElementById('dv-seqFinal');
    var svg = document.getElementById('dv-panelSvg');
    var ns = 'http://www.w3.org/2000/svg';

    function getProgress(){return window.__deskVoltProgress;}

    var lastPhase = '';
    function setPhase(text){
      if(text===lastPhase) return;
      lastPhase = text;
      phaseEl.style.opacity = '0';
      phaseEl.style.transform = 'translateX(-50%) translateY(7px)';
      setTimeout(function(){
        phaseEl.textContent = text;
        phaseEl.style.opacity = '1';
        phaseEl.style.transform = 'translateX(-50%) translateY(0)';
      },190);
    }

    // SVG element helper
    function svgEl(tag,attrs){
      var e = document.createElementNS(ns,tag);
      for(var k in attrs){if(attrs.hasOwnProperty(k)) e.setAttribute(k,String(attrs[k]));}
      return e;
    }

    // ═══ BUILD PANEL SVG ═══

    // Enclosure
    var gEnclosure = svgEl('g',{opacity:0});
    gEnclosure.appendChild(svgEl('rect',{x:10,y:35,width:460,height:700,rx:10,fill:'#3A3C42',stroke:'#555','stroke-width':1.5}));
    gEnclosure.appendChild(svgEl('rect',{x:25,y:52,width:430,height:666,rx:6,fill:'#555960'}));
    gEnclosure.appendChild(svgEl('rect',{x:28,y:55,width:424,height:660,rx:4,fill:'#4A4D52'}));
    [120,240,360].forEach(function(cx){
      gEnclosure.appendChild(svgEl('circle',{cx:cx,cy:42,r:14,fill:'#333',stroke:'#555','stroke-width':1}));
    });
    svg.appendChild(gEnclosure);

    // Yellow romex entry cables
    var gRomex = svgEl('g',{opacity:0});
    for(var ri=0;ri<16;ri++){
      var rx=90+ri*19;
      gRomex.appendChild(svgEl('line',{x1:rx+(ri%3-1)*2,y1:0,x2:rx,y2:52,stroke:'#C8A84E','stroke-width':3.5,'stroke-linecap':'round'}));
    }
    svg.appendChild(gRomex);

    // Terminal strip
    var gTerminal = svgEl('g',{opacity:0});
    gTerminal.appendChild(svgEl('rect',{x:40,y:62,width:400,height:16,rx:2,fill:'#1A1A1E'}));
    for(var ti=0;ti<26;ti++){
      gTerminal.appendChild(svgEl('circle',{cx:52+ti*15.2,cy:70,r:2,fill:'#444',stroke:'#666','stroke-width':0.5}));
    }
    // Ground/earth wires at top
    var groundCols = ['#2D8E42','#C8A84E','#2D8E42','#C8A84E','#2D8E42','#C8A84E','#2D8E42'];
    groundCols.forEach(function(c,gi){
      var gx = 70+gi*52;
      gTerminal.appendChild(svgEl('line',{x1:gx,y1:55,x2:gx,y2:62,stroke:c,'stroke-width':2.5,'stroke-linecap':'round'}));
    });
    svg.appendChild(gTerminal);

    // DIN Rails (3 rows)
    var dinYs = [220,420,610];
    var gDinRails = svgEl('g',{opacity:0});
    dinYs.forEach(function(dy){
      gDinRails.appendChild(svgEl('rect',{x:38,y:dy,width:404,height:14,rx:1,fill:'url(#dinRailGrad)'}));
      gDinRails.appendChild(svgEl('rect',{x:38,y:dy-2,width:404,height:3,rx:0.5,fill:'#AAA'}));
      gDinRails.appendChild(svgEl('rect',{x:38,y:dy+13,width:404,height:3,rx:0.5,fill:'#AAA'}));
    });
    svg.appendChild(gDinRails);

    // Breakers (MCBs) on DIN rails
    var breakerRows = [
      {y:165,count:8},
      {y:365,count:8},
      {y:555,count:6}
    ];
    var allBreakerPos = [];
    var breakerGroups = [];

    breakerRows.forEach(function(row,rowIdx){
      var g = svgEl('g',{opacity:0});
      var totalW = row.count*42+(row.count-1)*5;
      var sx = (480-totalW)/2;
      for(var bi=0;bi<row.count;bi++){
        var bx = sx+bi*47;
        var by = row.y;
        // Breaker body
        g.appendChild(svgEl('rect',{x:bx,y:by,width:42,height:55,rx:2,fill:'#E8E8E8',stroke:'#BBB','stroke-width':0.5}));
        // Toggle slot
        g.appendChild(svgEl('rect',{x:bx+14,y:by+14,width:14,height:20,rx:2,fill:'#333'}));
        // Toggle lever (OFF position)
        g.appendChild(svgEl('rect',{x:bx+16,y:by+24,width:10,height:8,rx:1.5,fill:'#555'}));
        // Circuit number
        var lbl = svgEl('text',{x:bx+21,y:by+50,'text-anchor':'middle',fill:'#888','font-size':7,'font-family':'var(--font-head)','font-weight':700});
        lbl.textContent = String(rowIdx*8+bi+1);
        g.appendChild(lbl);
        // ON indicator (hidden)
        g.appendChild(svgEl('circle',{cx:bx+21,cy:by+19,r:3,fill:'#4CAF50',opacity:0,class:'toggle-on'}));
        allBreakerPos.push({x:bx+21,y:by,row:rowIdx});
      }
      svg.appendChild(g);
      breakerGroups.push(g);
    });

    // ═══ WIRE SYSTEM v4: Simultaneous drops, dead front, toggle flips ═══

    // -- 1. BOTTOM TERMINAL STRIP (wires terminate here) --
    var gBottomTerminal = svgEl('g',{opacity:0});
    gBottomTerminal.appendChild(svgEl('rect',{x:40,y:696,width:400,height:16,rx:2,fill:'#1A1A1E'}));
    for(var bti=0;bti<26;bti++){
      gBottomTerminal.appendChild(svgEl('circle',{cx:52+bti*15.2,cy:704,r:2,fill:'#444',stroke:'#666','stroke-width':0.5}));
    }
    svg.insertBefore(gBottomTerminal,gDinRails);

    // -- 2. TRUNK WIRES (5 groups, ALL drop simultaneously) --
    var gTrunkWires = svgEl('g',{});
    var trunkWires = [];
    var trunkDefs = [
      {cx:68,count:6},
      {cx:148,count:6},
      {cx:240,count:7},
      {cx:332,count:6},
      {cx:412,count:6}
    ];
    var looseSpacing = 5.5;
    var tightSpacing = 2.8;

    trunkDefs.forEach(function(trunk,ti){
      for(var wi=0;wi<trunk.count;wi++){
        var looseX = trunk.cx+(wi-(trunk.count-1)/2)*looseSpacing;
        var tightX = trunk.cx+(wi-(trunk.count-1)/2)*tightSpacing;
        var isRed = (wi===2);
        var color = isRed?'#DC2626':'#2E86DE';
        var companion = isRed?'#E87070':'#5AADE2';

        // Main wire (top terminal y=78 to bottom terminal y=696)
        var d = 'M '+looseX+' 78 L '+looseX+' 696';
        var path = svgEl('path',{
          d:d,stroke:color,'stroke-width':2.4,fill:'none',
          'stroke-linecap':'round',class:'panel-wire'
        });
        gTrunkWires.appendChild(path);
        var len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;

        // Companion wire
        var d2 = 'M '+(looseX-2)+' 78 L '+(looseX-2)+' 696';
        var path2 = svgEl('path',{
          d:d2,stroke:companion,'stroke-width':1.6,fill:'none',
          'stroke-linecap':'round',class:'panel-wire',opacity:0.5
        });
        gTrunkWires.appendChild(path2);
        var len2 = path2.getTotalLength();
        path2.style.strokeDasharray = len2;
        path2.style.strokeDashoffset = len2;

        trunkWires.push({
          main:path,comp:path2,
          mainLen:len,compLen:len2,
          looseX:looseX,tightX:tightX,
          wireIdx:wi
        });
      }
    });
    svg.insertBefore(gTrunkWires,gDinRails);

    // -- 3. COLORED CABLE CLIPS --
    var gClips = svgEl('g',{opacity:0});
    var clipHeights = [180,330,500,650];
    var clipColors = ['#3B82F6','#EF4444','#8B5CF6','#10B981'];
    trunkDefs.forEach(function(trunk,ti){
      var tw = trunk.count*tightSpacing;
      clipHeights.forEach(function(cy,ci){
        gClips.appendChild(svgEl('rect',{
          x:trunk.cx-tw/2-2,y:cy,width:tw+4,height:3.5,rx:1,
          fill:clipColors[(ti+ci)%4],opacity:0.85
        }));
      });
    });
    svg.insertBefore(gClips,gDinRails);

    // -- 4. HORIZONTAL WIRE BUNDLES --
    var gHBundles = svgEl('g',{opacity:0});
    var hBundleYs = [252,452,640];
    hBundleYs.forEach(function(by,ri2){
      var wireCount = ri2<2?14:10;
      for(var hi=0;hi<wireCount;hi++){
        gHBundles.appendChild(svgEl('line',{
          x1:48,y1:by+hi*2.2,x2:432,y2:by+hi*2.2,
          stroke:(hi===3||hi===7)?'#DC2626':'#2E86DE',
          'stroke-width':2,'stroke-linecap':'round',opacity:0.75
        }));
      }
    });
    svg.insertBefore(gHBundles,gDinRails);

    // -- 5. CABLE TRUNKING CHANNELS --
    var gTrunking = svgEl('g',{opacity:0});
    gTrunking.appendChild(svgEl('rect',{x:30,y:78,width:16,height:632,rx:2,fill:'#C8AD8A',stroke:'#A89070','stroke-width':0.7}));
    gTrunking.appendChild(svgEl('rect',{x:434,y:78,width:16,height:632,rx:2,fill:'#C8AD8A',stroke:'#A89070','stroke-width':0.7}));
    [30,434].forEach(function(vx){
      gTrunking.appendChild(svgEl('line',{x1:vx+4,y1:78,x2:vx+4,y2:710,stroke:'#B89A78','stroke-width':0.5,opacity:0.6}));
      gTrunking.appendChild(svgEl('line',{x1:vx+12,y1:78,x2:vx+12,y2:710,stroke:'#B89A78','stroke-width':0.5,opacity:0.6}));
    });
    // Horizontal channels ABOVE and BELOW each breaker row
    var hChannelYs = [148,245,348,445,538,633];
    hChannelYs.forEach(function(hy){
      gTrunking.appendChild(svgEl('rect',{x:30,y:hy,width:420,height:14,rx:2,fill:'#C8AD8A',stroke:'#A89070','stroke-width':0.7}));
      gTrunking.appendChild(svgEl('line',{x1:30,y1:hy+4,x2:450,y2:hy+4,stroke:'#B89A78','stroke-width':0.5,opacity:0.6}));
      gTrunking.appendChild(svgEl('line',{x1:30,y1:hy+10,x2:450,y2:hy+10,stroke:'#B89A78','stroke-width':0.5,opacity:0.6}));
    });
    hChannelYs.forEach(function(hy){
      for(var cx=90;cx<=400;cx+=80){
        gTrunking.appendChild(svgEl('rect',{x:cx-3,y:hy-1,width:6,height:16,rx:1,fill:'#1A1A1E'}));
      }
    });
    svg.insertBefore(gTrunking,gDinRails);

    // -- 6. U-LOOP CONNECTIONS --
    var gULoops = svgEl('g',{});
    var uLoopPaths = [];

    // Pigtail-style connectors (below each breaker row)
    function makeULoops(rowDef,gapIdx,startY,loopDepth){
      var totalW = rowDef.count*42+(rowDef.count-1)*5;
      var sx = (480-totalW)/2;
      for(var ui=0;ui<rowDef.count;ui++){
        var ubx = sx+ui*47+16;
        var bottomY = startY+loopDepth;
        var isRedLoop = (ui%3===2);
        var loopColor = isRedLoop?'#DC2626':'#2E86DE';
        var d = 'M '+ubx+' '+startY+' L '+ubx+' '+(startY+8)+' C '+ubx+' '+bottomY+', '+(ubx+24)+' '+bottomY+', '+(ubx+24)+' '+(startY+8)+' L '+(ubx+24)+' '+startY;
        var uPath = svgEl('path',{
          d:d,stroke:loopColor,'stroke-width':3.8,fill:'none',
          'stroke-linecap':'round','stroke-linejoin':'round',class:'panel-wire'
        });
        gULoops.appendChild(uPath);
        var uLen = uPath.getTotalLength();
        uPath.style.strokeDasharray = uLen;
        uPath.style.strokeDashoffset = uLen;
        uLoopPaths.push({el:uPath,totalLength:uLen,gapIdx:gapIdx});
      }
    }

    // Upward pigtails (above each breaker row)
    function makeTopLoops(rowDef,gapIdx,endY,loopHeight){
      var totalW = rowDef.count*42+(rowDef.count-1)*5;
      var sx = (480-totalW)/2;
      for(var ui=0;ui<rowDef.count;ui++){
        var ubx = sx+ui*47+16;
        var isRedLoop = (ui%4===1);
        var loopColor = isRedLoop?'#DC2626':'#2E86DE';
        var d = 'M '+ubx+' '+endY+' L '+ubx+' '+(endY-6)+' C '+ubx+' '+(endY-loopHeight)+', '+(ubx+22)+' '+(endY-loopHeight)+', '+(ubx+22)+' '+(endY-6)+' L '+(ubx+22)+' '+endY;
        var uPath = svgEl('path',{
          d:d,stroke:loopColor,'stroke-width':3.8,fill:'none',
          'stroke-linecap':'round','stroke-linejoin':'round',class:'panel-wire'
        });
        gULoops.appendChild(uPath);
        var uLen = uPath.getTotalLength();
        uPath.style.strokeDasharray = uLen;
        uPath.style.strokeDashoffset = uLen;
        uLoopPaths.push({el:uPath,totalLength:uLen,gapIdx:gapIdx});
      }
    }

    // Below each row
    makeULoops(breakerRows[0],0,230,65);
    makeULoops(breakerRows[1],1,430,65);
    makeULoops(breakerRows[2],2,622,45);

    // Above each row
    makeTopLoops(breakerRows[0],3,165,35);
    makeTopLoops(breakerRows[1],4,365,35);
    makeTopLoops(breakerRows[2],5,555,35);

    svg.appendChild(gULoops);

    // -- 7. COPPER BUS BAR COMBS --
    var gBusBars = svgEl('g',{opacity:0});
    breakerRows.forEach(function(row,ri3){
      var totalW = row.count*42+(row.count-1)*5;
      var sx = (480-totalW)/2;
      gBusBars.appendChild(svgEl('rect',{
        x:sx,y:row.y-6,width:totalW,height:4,rx:1,
        fill:'#B87333',stroke:'#8B5A2B','stroke-width':0.5
      }));
      for(var bi=0;bi<row.count;bi++){
        var bx = sx+bi*47+18;
        gBusBars.appendChild(svgEl('line',{x1:bx,y1:row.y-6,x2:bx,y2:row.y+4,stroke:'#B87333','stroke-width':2.5,'stroke-linecap':'round'}));
        gBusBars.appendChild(svgEl('line',{x1:bx+6,y1:row.y-6,x2:bx+6,y2:row.y+4,stroke:'#B87333','stroke-width':2.5,'stroke-linecap':'round'}));
      }
    });
    svg.appendChild(gBusBars);

    // -- 7b. TOP-ENTRY BREAKER WIRES --
    var gTopWires = svgEl('g',{opacity:0});
    var topWirePaths = [];
    breakerRows.forEach(function(row,ri4){
      var totalW = row.count*42+(row.count-1)*5;
      var sx = (480-totalW)/2;
      for(var bi=0;bi<row.count;bi++){
        var bx = sx+bi*47+21;
        var by = row.y;
        var wireStartY = by-40;
        var wireEndY = by-2;
        var offsetX = (bi%2===0)?-8:8;
        var isRed = (bi%4===2);
        var color = isRed?'#DC2626':'#2E86DE';
        var d = 'M '+(bx+offsetX)+' '+wireStartY+' C '+(bx+offsetX)+' '+(wireStartY+20)+', '+bx+' '+(wireEndY-10)+', '+bx+' '+wireEndY;
        var twPath = svgEl('path',{
          d:d,stroke:color,'stroke-width':2.2,fill:'none',
          'stroke-linecap':'round',class:'panel-wire'
        });
        gTopWires.appendChild(twPath);
        var twLen = twPath.getTotalLength();
        twPath.style.strokeDasharray = twLen;
        twPath.style.strokeDashoffset = twLen;
        topWirePaths.push({el:twPath,totalLength:twLen,row:ri4});
      }
    });
    svg.appendChild(gTopWires);

    // -- 8. FERRULES --
    var gFerrules = svgEl('g',{opacity:0});
    allBreakerPos.forEach(function(bp){
      gFerrules.appendChild(svgEl('rect',{x:bp.x-3,y:bp.y-2,width:6,height:6,rx:1,fill:'#DC2626'}));
      var rowH = 55;
      gFerrules.appendChild(svgEl('rect',{x:bp.x-3,y:bp.y+rowH-4,width:6,height:6,rx:1,fill:'#DC2626'}));
    });
    svg.appendChild(gFerrules);

    // -- 9. CIRCUIT LABELS --
    var gLabels = svgEl('g',{opacity:0});
    allBreakerPos.forEach(function(bp,li){
      var labelBg = svgEl('rect',{x:bp.x-8,y:bp.y+56,width:16,height:8,rx:1,fill:'#FFF',opacity:0.9});
      gLabels.appendChild(labelBg);
      var labelTxt = svgEl('text',{x:bp.x,y:bp.y+62.5,'text-anchor':'middle',fill:'#222','font-size':5.5,'font-family':'var(--font-head)','font-weight':700});
      labelTxt.textContent = 'C'+(li+1);
      gLabels.appendChild(labelTxt);
    });
    svg.appendChild(gLabels);

    // -- 10. DEAD FRONT PLATE (with breaker cutouts) --
    var gCover = svgEl('g',{transform:'translate(0, -750)'});

    // Create SVG mask for breaker cutouts
    var coverDefs = svgEl('defs',{});
    var coverMask = svgEl('mask',{id:'dv-deadFrontMask'});
    coverMask.appendChild(svgEl('rect',{x:20,y:45,width:440,height:680,fill:'white'}));
    // Cut out breaker toggle windows
    breakerRows.forEach(function(row){
      var totalW = row.count*42+(row.count-1)*5;
      var sx = (480-totalW)/2;
      for(var bi=0;bi<row.count;bi++){
        var bx = sx+bi*47;
        coverMask.appendChild(svgEl('rect',{x:bx-1,y:row.y+8,width:44,height:30,rx:3,fill:'black'}));
      }
    });
    coverDefs.appendChild(coverMask);
    gCover.appendChild(coverDefs);

    // Dead front panel body (masked)
    gCover.appendChild(svgEl('rect',{x:28,y:55,width:424,height:660,rx:4,fill:'#3A3C42',stroke:'#555','stroke-width':1.2,mask:'url(#dv-deadFrontMask)'}));
    // Screw details on dead front
    [[80,80],[400,80],[80,680],[400,680],[240,80],[240,680]].forEach(function(sc){
      gCover.appendChild(svgEl('circle',{cx:sc[0],cy:sc[1],r:4,fill:'#555',stroke:'#666','stroke-width':0.5}));
      gCover.appendChild(svgEl('line',{x1:sc[0]-2.5,y1:sc[1],x2:sc[0]+2.5,y2:sc[1],stroke:'#777','stroke-width':0.8}));
    });
    // Row labels on dead front
    breakerRows.forEach(function(row,ri5){
      var totalW = row.count*42+(row.count-1)*5;
      var sx = (480-totalW)/2;
      var labelEl = svgEl('text',{x:sx-2,y:row.y+28,fill:'#888','font-size':7,'font-family':'var(--font-head)','font-weight':700});
      labelEl.textContent = ['MAIN','BRANCH','AUX'][ri5];
      gCover.appendChild(labelEl);
    });
    svg.appendChild(gCover);

    // -- 11. TOGGLE FLIP OVERLAYS --
    var toggleFlips = [];
    allBreakerPos.forEach(function(bp){
      var onLever = svgEl('rect',{
        x:bp.x-5,y:bp.y+14,width:10,height:8,rx:1.5,
        fill:'#4CAF50',opacity:0
      });
      svg.appendChild(onLever);
      var onDot = svgEl('circle',{
        cx:bp.x,cy:bp.y+13,r:2.5,
        fill:'#4CAF50',opacity:0
      });
      svg.appendChild(onDot);
      toggleFlips.push({lever:onLever,dot:onDot});
    });

    // Power light elements
    var powerLights = [];
    for(var pli=1;pli<=6;pli++){
      var plEl = document.getElementById('dv-pl'+pli);
      if(plEl) powerLights.push(plEl);
    }

    // ═══ SCROLL ANIMATION v4 ═══
    function update(){
      var p = getProgress();
      scrubFill.style.width = (p*100)+'%';

      // Intro fade
      intro.style.opacity = map(p,0,0.06,1,0);
      intro.style.pointerEvents = p>0.03?'none':'auto';

      // Background — keep black, no color changes

      // Panel container
      var pScale = map(p,0.05,0.14,0.9,1);
      var pOp = map(p,0.05,0.12,0,1);
      var fadeOut = p<0.84?1:map(p,0.84,0.94,1,0);
      panelContainer.style.opacity = String(pOp*fadeOut);
      panelContainer.style.transform = 'scale('+(pScale*(p<0.84?1:map(p,0.84,0.94,1,0.88)))+')';

      // SVG sizing — use pane height
      var vh = seqEl.clientHeight||seqEl.offsetHeight||400;
      var svgH = Math.min(vh*0.9,650);
      var svgW = svgH*(480/750);
      svg.setAttribute('width',svgW);
      svg.setAttribute('height',svgH);

      // Enclosure
      gEnclosure.setAttribute('opacity',String(map(p,0.05,0.12,0,1)));

      // Romex + terminal
      gRomex.setAttribute('opacity',String(map(p,0.08,0.14,0,1)*fadeOut));
      gTerminal.setAttribute('opacity',String(map(p,0.10,0.16,0,1)*fadeOut));

      // ═══ PHASE 1: ALL WIRES DROP SIMULTANEOUSLY ═══
      trunkWires.forEach(function(wire,i){
        var drawStart = 0.10+wire.wireIdx*0.006;
        var drawEnd = drawStart+0.14;
        var drawP = easeOut3(clamp((p-drawStart)/(drawEnd-drawStart),0,1));

        wire.main.style.strokeDashoffset = String(wire.mainLen*(1-drawP));
        wire.comp.style.strokeDashoffset = String(wire.compLen*(1-drawP));

        // PHASE 2: ORGANIZE (tighten)
        var orgP = easeOut3(clamp((p-0.28)/0.08,0,1));
        var currentX = wire.looseX+(wire.tightX-wire.looseX)*orgP;
        wire.main.setAttribute('d','M '+currentX+' 78 L '+currentX+' 696');
        wire.comp.setAttribute('d','M '+(currentX-2)+' 78 L '+(currentX-2)+' 696');

        wire.main.style.opacity = String(fadeOut);
        wire.comp.style.opacity = String(0.5*fadeOut);
      });

      // Bottom terminal
      gBottomTerminal.setAttribute('opacity',String(map(p,0.22,0.28,0,1)*fadeOut));

      // Clips
      gClips.setAttribute('opacity',String(map(p,0.30,0.36,0,1)*fadeOut));

      // ═══ PHASE 3: CABLE TRUNKING ═══
      gTrunking.setAttribute('opacity',String(map(p,0.34,0.40,0,1)*fadeOut));

      // ═══ PHASE 4: DIN RAILS + HORIZONTAL BUNDLES ═══
      gDinRails.setAttribute('opacity',String(map(p,0.38,0.44,0,1)*fadeOut));
      gHBundles.setAttribute('opacity',String(map(p,0.36,0.44,0,1)*fadeOut));

      // ═══ PHASE 5: BREAKERS ═══
      breakerGroups.forEach(function(g,ri6){
        var start = 0.42+ri6*0.03;
        var end = start+0.05;
        var bp2 = clamp((p-start)/(end-start),0,1);
        var bOp = easeOut3(bp2);
        g.setAttribute('opacity',String(bOp*fadeOut));
        var btx = (1-easeOut3(bp2))*(ri6%2===0?-12:12);
        g.setAttribute('transform','translate('+btx+', 0)');
      });

      // ═══ PHASE 6: U-LOOPS + BUS BARS ═══
      var uLanded = 0;
      uLoopPaths.forEach(function(uLoop,ui){
        var uStart = 0.50+uLoop.gapIdx*0.02+(ui%8)*0.003;
        var uEnd = uStart+0.05;
        var uP = easeOut3(clamp((p-uStart)/(uEnd-uStart),0,1));
        uLoop.el.style.strokeDashoffset = String(uLoop.totalLength*(1-uP));
        uLoop.el.style.opacity = String(fadeOut);
        if(uP>0.9) uLanded++;
      });

      if(hudCircuits) hudCircuits.textContent = String(Math.min(uLanded,22));
      gBusBars.setAttribute('opacity',String(map(p,0.54,0.60,0,1)*fadeOut));

      // Top-entry breaker wires
      topWirePaths.forEach(function(tw,twi){
        var twStart = 0.52+tw.row*0.02+(twi%8)*0.003;
        var twEnd = twStart+0.05;
        var twP = easeOut3(clamp((p-twStart)/(twEnd-twStart),0,1));
        tw.el.style.strokeDashoffset = String(tw.totalLength*(1-twP));
        tw.el.style.opacity = String(fadeOut);
      });

      // ═══ PHASE 7: FERRULES + LABELS ═══
      gFerrules.setAttribute('opacity',String(map(p,0.58,0.64,0,1)*fadeOut));
      gLabels.setAttribute('opacity',String(map(p,0.62,0.68,0,1)*fadeOut));

      // ═══ PHASE 8: TOGGLE FLIP ON OPEN PANEL ═══
      toggleFlips.forEach(function(tf,tfi){
        var flipTrigger = 0.66+tfi*0.005;
        var isOn = p>=flipTrigger;
        tf.lever.setAttribute('opacity',isOn?String(fadeOut):'0');
        tf.dot.setAttribute('opacity',isOn?String(fadeOut):'0');
      });

      // ═══ PHASE 9: DEAD FRONT SLIDES DOWN ═══
      var coverP = easeOut3(clamp((p-0.80)/0.06,0,1));
      gCover.setAttribute('transform','translate(0, '+(-750+750*coverP)+')');

      // ═══ PHASE 10: ENERGIZE + LET THERE BE LIGHT ═══
      var glowVal = map(p,0.84,0.90,0,1)*(p<0.97?1:map(p,0.97,1.0,1,0));
      panelGlow.style.opacity = String(Math.max(0,glowVal));

      if(p<0.85){
        panelEnergize.style.clipPath = 'inset(0 100% 0 0)';
      }else if(p<0.90){
        var right = map(easeOut3((p-0.85)/0.05),0,1,100,-2);
        panelEnergize.style.clipPath = 'inset(0 '+right+'% 0 0)';
      }else if(p<0.93){
        var left = map(easeIn3((p-0.90)/0.03),0,1,0,102);
        panelEnergize.style.clipPath = 'inset(0 0 0 '+left+'%)';
      }else{
        panelEnergize.style.clipPath = 'inset(0 0 0 102%)';
      }

      // Power-on lights
      powerLights.forEach(function(pl,li){
        var lightStart = 0.85+li*0.005;
        var lightEnd = lightStart+0.04;
        var lightP = clamp((p-lightStart)/(lightEnd-lightStart),0,1);
        var lightFade = p<0.97?1:map(p,0.97,1.0,1,0);
        var warmth = easeOut3(lightP)*lightFade;
        pl.style.background = 'rgba(251,191,36,'+(warmth*0.85)+')';
        pl.style.boxShadow = warmth>0.1?'0 0 '+Math.round(warmth*120)+'px '+Math.round(warmth*60)+'px rgba(251,191,36,'+(warmth*0.6)+'), 0 0 '+Math.round(warmth*200)+'px '+Math.round(warmth*100)+'px rgba(250,204,21,'+(warmth*0.25)+')':'none';
      });

      // Background warm blast removed — keep black

      // VOLTPRO text
      var powIn = easeOut3(clamp((p-0.86)/0.04,0,1));
      var powOut = p<0.97?1:map(p,0.97,1.0,1,0);
      panelPowered.style.opacity = String(Math.max(0,powIn*powOut));
      panelPowered.style.transform = 'scale('+map(p,0.86,0.90,0.85,1.05)+')';

      // HUD panels
      var hudIn = map(p,0.14,0.26,0,1);
      var hudOut = p<0.78?1:map(p,0.78,0.84,1,0);
      panelHud.style.opacity = String(clamp(hudIn*hudOut,0,1));

      // Final hero
      var fP = map(p,0.98,1.0,0,1);
      var fOp = easeOut3(fP);
      finalEl.style.opacity = String(fOp);
      finalEl.style.transform = 'translateY('+map(fP,0,1,26,0)+'px)';
      finalEl.classList.toggle('active',p>0.98);

      // Phase labels
      if     (p<0.05) setPhase('');
      else if(p<0.10) setPhase('MOUNTING ENCLOSURE');
      else if(p<0.28) setPhase('PULLING WIRE');
      else if(p<0.38) setPhase('ORGANIZING CONDUCTORS');
      else if(p<0.42) setPhase('INSTALLING CHANNELS');
      else if(p<0.50) setPhase('SETTING BREAKERS');
      else if(p<0.60) setPhase('MAKING CONNECTIONS');
      else if(p<0.66) setPhase('FINISHING DETAILS');
      else if(p<0.80) setPhase('FLIPPING BREAKERS');
      else if(p<0.84) setPhase('INSTALLING DEAD FRONT');
      else if(p<0.98) setPhase('LET THERE BE LIGHT');
      else            setPhase('');
    }

    (function loop(){
      requestAnimationFrame(loop);
      try{update();}catch(e){}
    })();

    window.addEventListener('resize',update,{passive:true});
  }
})();
