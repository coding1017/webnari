// Mobile RoofPro Parallax — namespaced IDs (mr-*), timer-driven progress
(function(){
  "use strict";
  var clamp = function(v,lo,hi){return Math.max(lo,Math.min(hi,v));};
  var map = function(v,a,b,c,d){return c+(d-c)*clamp((v-a)/(b-a),0,1);};
  var easeOut3 = function(t){return 1-Math.pow(1-t,3);};
  var easeIn3 = function(t){return t*t*t;};

  // Timer-driven progress (set by initMobileShowcase in index.html)
  window.__mobRoofProgress = 0.15;

  var seqEl=document.getElementById('mr-hero'), stickyEl=document.getElementById('mr-seqSticky');
  if(seqEl&&stickyEl){
    var bg=document.getElementById('mr-seqBg');
    var sceneContainer=document.getElementById('mr-sceneContainer');
    var sceneGlow=document.getElementById('mr-sceneGlow');
    var sceneEnergize=document.getElementById('mr-sceneEnergize');
    var sceneHud=document.getElementById('mr-sceneHud');
    var scenePowered=document.getElementById('mr-scenePowered');
    var intro=document.getElementById('mr-seqIntro');
    var phaseEl=document.getElementById('mr-seqPhase');
    var scrubFill=document.getElementById('mr-seqScrubFill');
    var finalEl=document.getElementById('mr-seqFinal');
    var svg=document.getElementById('mr-sceneSvg');
    var ns='http://www.w3.org/2000/svg';

    function getProgress(){return window.__mobRoofProgress;}
    var lastPhase='';
    function setPhase(t){if(t===lastPhase)return;lastPhase=t;phaseEl.style.opacity='0';phaseEl.style.transform='translateY(7px)';setTimeout(function(){phaseEl.textContent=t;phaseEl.style.opacity='1';phaseEl.style.transform='translateY(0)';},190);}
    function svgEl(tag,attrs){var e=document.createElementNS(ns,tag);for(var k in attrs){if(attrs.hasOwnProperty(k))e.setAttribute(k,String(attrs[k]));}return e;}

    // ═══ BUILD ISOMETRIC ROOF — PIECE BY PIECE ═══
    // Every layer is built incrementally as you scroll, not dropped in
    var cx=525, baseY=300;
    var roofW=380, roofD=600, peakH=115;
    var wallW=345; // walls are narrower than roof = overhang
    var hd=roofD/2;

    // Isometric helpers
    function isoX(x,y){return cx+x*0.82+y*0.82;}
    function isoY(x,y,z){return baseY-z-x*0.38+y*0.38;}

    // All individual pieces go here for per-piece animation
    var allPieces=[]; // {el, phase, index, zOff}

    // ─── 0. HOUSE WALLS (LEFT side wall = viewer side + front wall) ───
    var gHouse=svgEl('g',{opacity:0});
    var wallH=500; // extends well off-screen (3-story feel)
    // LEFT side wall (at x=-wallW, set back from roof edge = overhang visible)
    var lwTF=isoX(-wallW,hd), lwTFy=isoY(-wallW,hd,0);
    var lwTB=isoX(-wallW,-hd), lwTBy=isoY(-wallW,-hd,0);
    var lwBF=isoX(-wallW,hd), lwBFy=isoY(-wallW,hd,-wallH);
    var lwBB=isoX(-wallW,-hd), lwBBy=isoY(-wallW,-hd,-wallH);
    gHouse.appendChild(svgEl('path',{d:'M'+lwTF+' '+lwTFy+' L'+lwTB+' '+lwTBy+' L'+lwBB+' '+lwBBy+' L'+lwBF+' '+lwBFy+' Z',fill:'#1E2028',stroke:'#2A2C38','stroke-width':0.8}));
    // Horizontal siding lines
    for(var sl=1;sl<14;sl++){
      var slZ=-sl*35;
      gHouse.appendChild(svgEl('line',{x1:isoX(-wallW,hd),y1:isoY(-wallW,hd,slZ),x2:isoX(-wallW,-hd),y2:isoY(-wallW,-hd,slZ),stroke:'#252830','stroke-width':0.5}));
    }
    // Side wall window helper (on LEFT wall at x=-roofW)
    function sideWin(wDepth,wZ){
      var wW=22, wH=38;
      var wtl=isoX(-wallW,wDepth-wW/2), wtly=isoY(-wallW,wDepth-wW/2,wZ+wH/2);
      var wtr=isoX(-wallW,wDepth+wW/2), wtry=isoY(-wallW,wDepth+wW/2,wZ+wH/2);
      var wbr=isoX(-wallW,wDepth+wW/2), wbry=isoY(-wallW,wDepth+wW/2,wZ-wH/2);
      var wbl=isoX(-wallW,wDepth-wW/2), wbly=isoY(-wallW,wDepth-wW/2,wZ-wH/2);
      gHouse.appendChild(svgEl('path',{d:'M'+wtl+' '+wtly+' L'+wtr+' '+wtry+' L'+wbr+' '+wbry+' L'+wbl+' '+wbly+' Z',fill:'#0A1828'}));
      var wmtx=isoX(-wallW,wDepth), wmty=isoY(-wallW,wDepth,wZ+wH/2);
      var wmbx=isoX(-wallW,wDepth), wmby=isoY(-wallW,wDepth,wZ-wH/2);
      var wmlx=isoX(-wallW,wDepth-wW/2), wmly=isoY(-wallW,wDepth-wW/2,wZ);
      var wmrx=isoX(-wallW,wDepth+wW/2), wmry=isoY(-wallW,wDepth+wW/2,wZ);
      gHouse.appendChild(svgEl('line',{x1:wmlx,y1:wmly,x2:wmrx,y2:wmry,stroke:'#3A4A5A','stroke-width':1}));
      gHouse.appendChild(svgEl('line',{x1:wmtx,y1:wmty,x2:wmbx,y2:wmby,stroke:'#3A4A5A','stroke-width':1}));
      gHouse.appendChild(svgEl('path',{d:'M'+wtl+' '+wtly+' L'+wtr+' '+wtry+' L'+wbr+' '+wbry+' L'+wbl+' '+wbly+' Z',fill:'none',stroke:'#4A5A6A','stroke-width':1.5}));
      gHouse.appendChild(svgEl('line',{x1:isoX(-wallW-2,wDepth-wW/2-2),y1:isoY(-wallW-2,wDepth-wW/2-2,wZ-wH/2),x2:isoX(-wallW-2,wDepth+wW/2+2),y2:isoY(-wallW-2,wDepth+wW/2+2,wZ-wH/2),stroke:'#5A6A7A','stroke-width':2}));
      gHouse.appendChild(svgEl('path',{d:'M'+wtl+' '+wtly+' L'+wtr+' '+wtry+' L'+wmrx+' '+wmry+' L'+wmlx+' '+wmly+' Z',fill:'rgba(100,160,220,0.06)'}));
    }
    // Top floor (3 windows)
    for(var wi=0;wi<3;wi++) sideWin(-hd+(wi+1)*roofD/4, -50);
    // 2nd floor (3 windows)
    for(var wi2=0;wi2<3;wi2++) sideWin(-hd+(wi2+1)*roofD/4, -155);
    // 3rd floor / ground (3 windows, further down)
    for(var wi3=0;wi3<3;wi3++) sideWin(-hd+(wi3+1)*roofD/4, -260);
    // Floor dividers
    gHouse.appendChild(svgEl('line',{x1:isoX(-wallW,hd),y1:isoY(-wallW,hd,-115),x2:isoX(-wallW,-hd),y2:isoY(-wallW,-hd,-115),stroke:'#3A3C48','stroke-width':1.2}));
    gHouse.appendChild(svgEl('line',{x1:isoX(-wallW,hd),y1:isoY(-wallW,hd,-220),x2:isoX(-wallW,-hd),y2:isoY(-wallW,-hd,-220),stroke:'#3A3C48','stroke-width':1.2}));
    // Right side wall edge
    gHouse.appendChild(svgEl('line',{x1:isoX(wallW,hd),y1:isoY(wallW,hd,0),x2:isoX(wallW,hd),y2:isoY(wallW,hd,-wallH),stroke:'#2A2C38','stroke-width':1.5}));
    // Soffit under left eave overhang (visible underside between wall and roof edge)
    var soffitL=svgEl('path',{fill:'#16181E',stroke:'#252830','stroke-width':0.5});
    soffitL.setAttribute('d','M'+isoX(-roofW,hd)+' '+isoY(-roofW,hd,0)+' L'+isoX(-wallW,hd)+' '+isoY(-wallW,hd,0)+' L'+isoX(-wallW,-hd)+' '+isoY(-wallW,-hd,0)+' L'+isoX(-roofW,-hd)+' '+isoY(-roofW,-hd,0)+' Z');
    gHouse.appendChild(soffitL);
    // Soffit under front eave overhang
    var soffitF=svgEl('path',{fill:'#14161C',stroke:'#252830','stroke-width':0.5});
    soffitF.setAttribute('d','M'+isoX(-roofW,hd)+' '+isoY(-roofW,hd,0)+' L'+isoX(roofW,hd)+' '+isoY(roofW,hd,0)+' L'+isoX(wallW,hd)+' '+isoY(wallW,hd,0)+' L'+isoX(-wallW,hd)+' '+isoY(-wallW,hd,0)+' Z');
    gHouse.appendChild(soffitF);
    // Fascia board along front eave (visible trim piece)
    gHouse.appendChild(svgEl('line',{x1:isoX(-roofW,hd),y1:isoY(-roofW,hd,0),x2:isoX(roofW,hd),y2:isoY(roofW,hd,0),stroke:'#4A5568','stroke-width':2.5}));
    // Fascia along left eave
    gHouse.appendChild(svgEl('line',{x1:isoX(-roofW,hd),y1:isoY(-roofW,hd,0),x2:isoX(-roofW,-hd),y2:isoY(-roofW,-hd,0),stroke:'#4A5568','stroke-width':2}));
    // Front wall (below gable, extends down off screen — viewer facing)
    var fwTL=isoX(-wallW,hd), fwTLy=isoY(-wallW,hd,0);
    var fwTR=isoX(wallW,hd), fwTRy=isoY(wallW,hd,0);
    var fwBL=isoX(-wallW,hd), fwBLy=isoY(-wallW,hd,-wallH);
    var fwBR=isoX(wallW,hd), fwBRy=isoY(wallW,hd,-wallH);
    gHouse.appendChild(svgEl('path',{d:'M'+fwTL+' '+fwTLy+' L'+fwTR+' '+fwTRy+' L'+fwBR+' '+fwBRy+' L'+fwBL+' '+fwBLy+' Z',fill:'#1C1E28',stroke:'#2A2C38','stroke-width':0.5}));
    // Horizontal siding lines on front wall
    for(var fsl=1;fsl<15;fsl++){
      var fslZ=-fsl*35;
      gHouse.appendChild(svgEl('line',{x1:isoX(-wallW,hd),y1:isoY(-wallW,hd,fslZ),x2:isoX(wallW,hd),y2:isoY(wallW,hd,fslZ),stroke:'#22242E','stroke-width':0.5}));
    }
    // Elegant windows on front wall — 2 floors visible
    // Helper to draw a window on the front wall
    function frontWin(xPos,zPos){
      var wHW=18, wHH=22; // half-width, half-height
      var tl=isoX(xPos-wHW,hd), tly=isoY(xPos-wHW,hd,zPos+wHH);
      var tr=isoX(xPos+wHW,hd), try2=isoY(xPos+wHW,hd,zPos+wHH);
      var br=isoX(xPos+wHW,hd), bry=isoY(xPos+wHW,hd,zPos-wHH);
      var bl=isoX(xPos-wHW,hd), bly=isoY(xPos-wHW,hd,zPos-wHH);
      var mx=isoX(xPos,hd), mty=isoY(xPos,hd,zPos+wHH), mby=isoY(xPos,hd,zPos-wHH);
      var mly=(tly+bly)/2, mry=(try2+bry)/2;
      // Glass recess
      gHouse.appendChild(svgEl('path',{d:'M'+tl+' '+tly+' L'+tr+' '+try2+' L'+br+' '+bry+' L'+bl+' '+bly+' Z',fill:'#0A1828'}));
      // Horizontal mullion
      gHouse.appendChild(svgEl('line',{x1:tl,y1:mly,x2:tr,y2:mry,stroke:'#3A4A5A','stroke-width':0.8}));
      // Vertical mullion
      gHouse.appendChild(svgEl('line',{x1:mx,y1:mty,x2:mx,y2:mby,stroke:'#3A4A5A','stroke-width':0.8}));
      // Frame
      gHouse.appendChild(svgEl('path',{d:'M'+tl+' '+tly+' L'+tr+' '+try2+' L'+br+' '+bry+' L'+bl+' '+bly+' Z',fill:'none',stroke:'#4A5A6A','stroke-width':1.2}));
      // Sill
      gHouse.appendChild(svgEl('line',{x1:bl-2,y1:bly+1,x2:br+2,y2:bry+1,stroke:'#5A6A7A','stroke-width':1.5}));
      // Glass reflection
      gHouse.appendChild(svgEl('path',{d:'M'+tl+' '+tly+' L'+tr+' '+try2+' L'+tr+' '+mry+' L'+tl+' '+mly+' Z',fill:'rgba(100,160,220,0.05)'}));
    }
    // Top floor windows (just below eave, 4 across)
    for(var fwi=0;fwi<4;fwi++) frontWin(-roofW*0.72+fwi*roofW*0.48, -60);
    // 2nd floor windows (4 across)
    for(var fwi2=0;fwi2<4;fwi2++) frontWin(-roofW*0.72+fwi2*roofW*0.48, -165);
    // 3rd floor / ground (4 across, extends toward bottom of screen)
    for(var fwi3=0;fwi3<4;fwi3++) frontWin(-roofW*0.72+fwi3*roofW*0.48, -270);
    // Floor divider lines between stories
    gHouse.appendChild(svgEl('line',{x1:isoX(-wallW,hd),y1:isoY(-wallW,hd,-115),x2:isoX(wallW,hd),y2:isoY(wallW,hd,-115),stroke:'#3A3C48','stroke-width':1.5}));
    gHouse.appendChild(svgEl('line',{x1:isoX(-wallW,hd),y1:isoY(-wallW,hd,-225),x2:isoX(wallW,hd),y2:isoY(wallW,hd,-225),stroke:'#3A3C48','stroke-width':1.5}));
    svg.appendChild(gHouse);
    allPieces.push({el:gHouse,phase:0,index:0,total:numT+2});

    // ─── 1. TRUSSES (individual triangular frames + ridge beam + eave beams) ───
    var gTrusses=svgEl('g',{});
    var numT=45;
    for(var ti=0;ti<numT;ti++){
      var tg=svgEl('g',{opacity:0});
      var frac=(ti+0.5)/numT;
      var ty=-hd+frac*roofD;
      var lx=isoX(-roofW,ty),ly=isoY(-roofW,ty,0);
      var rx=isoX(roofW,ty),ry=isoY(roofW,ty,0);
      var px=isoX(0,ty),py=isoY(0,ty,peakH);
      var mx=isoX(0,ty),my=isoY(0,ty,0);
      tg.appendChild(svgEl('line',{x1:lx,y1:ly,x2:rx,y2:ry,stroke:'#C49A64','stroke-width':2.5,'stroke-linecap':'round'}));
      tg.appendChild(svgEl('line',{x1:lx,y1:ly,x2:px,y2:py,stroke:'#D4A574','stroke-width':3,'stroke-linecap':'round'}));
      tg.appendChild(svgEl('line',{x1:rx,y1:ry,x2:px,y2:py,stroke:'#D4A574','stroke-width':3,'stroke-linecap':'round'}));
      tg.appendChild(svgEl('line',{x1:mx,y1:my,x2:px,y2:py,stroke:'#B8895A','stroke-width':2}));
      var qlx=isoX(-roofW*0.5,ty),qly=isoY(-roofW*0.5,ty,0);
      var qrx=isoX(roofW*0.5,ty),qry=isoY(roofW*0.5,ty,0);
      tg.appendChild(svgEl('line',{x1:qlx,y1:qly,x2:isoX(-roofW*0.25,ty),y2:isoY(-roofW*0.25,ty,peakH*0.75),stroke:'#B8895A','stroke-width':1.5}));
      tg.appendChild(svgEl('line',{x1:qrx,y1:qry,x2:isoX(roofW*0.25,ty),y2:isoY(roofW*0.25,ty,peakH*0.75),stroke:'#B8895A','stroke-width':1.5}));
      gTrusses.appendChild(tg);
      allPieces.push({el:tg,phase:0,index:ti,total:numT});
    }
    // Ridge beam + eave beams (appear after all trusses)
    var tBeams=svgEl('g',{opacity:0});
    tBeams.appendChild(svgEl('line',{x1:isoX(0,-hd),y1:isoY(0,-hd,peakH),x2:isoX(0,hd),y2:isoY(0,hd,peakH),stroke:'#D4A574','stroke-width':3.5,'stroke-linecap':'round'}));
    tBeams.appendChild(svgEl('line',{x1:isoX(-roofW,-hd),y1:isoY(-roofW,-hd,0),x2:isoX(-roofW,hd),y2:isoY(-roofW,hd,0),stroke:'#C49A64','stroke-width':2.5}));
    tBeams.appendChild(svgEl('line',{x1:isoX(roofW,-hd),y1:isoY(roofW,-hd,0),x2:isoX(roofW,hd),y2:isoY(roofW,hd,0),stroke:'#C49A64','stroke-width':2.5}));
    gTrusses.appendChild(tBeams);
    allPieces.push({el:tBeams,phase:0,index:numT,total:numT+1});
    svg.appendChild(gTrusses);

    // ─── 2. DECKING (plywood boards laid one by one across the slopes) ───
    var gDeck=svgEl('g',{});
    var numBoards=10;
    var deckColors=['#C9A96E','#B89A5F','#C4A468','#BA9C62'];
    for(var di=0;di<numBoards;di++){
      var df=di/numBoards, dfn=(di+1)/numBoards;
      // Left slope board strip (from eave line toward ridge)
      var bL=svgEl('path',{opacity:0,fill:deckColors[di%4],stroke:'#A08A52','stroke-width':0.5});
      var l1x=isoX(-roofW*(1-df),-hd),l1y=isoY(-roofW*(1-df),-hd,peakH*df);
      var l2x=isoX(-roofW*(1-dfn),-hd),l2y=isoY(-roofW*(1-dfn),-hd,peakH*dfn);
      var l3x=isoX(-roofW*(1-dfn),hd),l3y=isoY(-roofW*(1-dfn),hd,peakH*dfn);
      var l4x=isoX(-roofW*(1-df),hd),l4y=isoY(-roofW*(1-df),hd,peakH*df);
      bL.setAttribute('d','M'+l1x+' '+l1y+' L'+l2x+' '+l2y+' L'+l3x+' '+l3y+' L'+l4x+' '+l4y+' Z');
      gDeck.appendChild(bL);
      allPieces.push({el:bL,phase:1,index:di*2,total:numBoards*2});
      // Right slope board strip
      var bR=svgEl('path',{opacity:0,fill:deckColors[(di+2)%4],stroke:'#A08A52','stroke-width':0.5});
      var r1x=isoX(roofW*(1-df),-hd),r1y=isoY(roofW*(1-df),-hd,peakH*df);
      var r2x=isoX(roofW*(1-dfn),-hd),r2y=isoY(roofW*(1-dfn),-hd,peakH*dfn);
      var r3x=isoX(roofW*(1-dfn),hd),r3y=isoY(roofW*(1-dfn),hd,peakH*dfn);
      var r4x=isoX(roofW*(1-df),hd),r4y=isoY(roofW*(1-df),hd,peakH*df);
      bR.setAttribute('d','M'+r1x+' '+r1y+' L'+r2x+' '+r2y+' L'+r3x+' '+r3y+' L'+r4x+' '+r4y+' Z');
      gDeck.appendChild(bR);
      allPieces.push({el:bR,phase:1,index:di*2+1,total:numBoards*2});
    }
    svg.appendChild(gDeck);
    // Front gable decking face (built in strips from eave up to peak)
    var deckFrontStrips=8;
    for(var dfi=0;dfi<deckFrontStrips;dfi++){
      var df1=dfi/deckFrontStrips, df2=(dfi+1)/deckFrontStrips;
      var dfEl=svgEl('path',{opacity:0,fill:deckColors[dfi%4],stroke:'#A08A52','stroke-width':0.4});
      var dfl1x=isoX(-roofW*(1-df1),hd), dfl1y=isoY(-roofW*(1-df1),hd,peakH*df1);
      var dfr1x=isoX(roofW*(1-df1),hd), dfr1y=isoY(roofW*(1-df1),hd,peakH*df1);
      var dfl2x=isoX(-roofW*(1-df2),hd), dfl2y=isoY(-roofW*(1-df2),hd,peakH*df2);
      var dfr2x=isoX(roofW*(1-df2),hd), dfr2y=isoY(roofW*(1-df2),hd,peakH*df2);
      dfEl.setAttribute('d','M'+dfl1x+' '+dfl1y+' L'+dfl2x+' '+dfl2y+' L'+dfr2x+' '+dfr2y+' L'+dfr1x+' '+dfr1y+' Z');
      svg.appendChild(dfEl);
      allPieces.push({el:dfEl,phase:1,index:Math.round(dfi*numBoards*2/deckFrontStrips),total:numBoards*2});
    }

    // ─── 3. ICE & WATER SHIELD (8 strips covering FULL slope) ───
    var gIce=svgEl('g',{});
    var iceStrips=8;
    for(var ii=0;ii<iceStrips;ii++){
      // Each strip covers 1/8th of the full slope (0 to 1.0)
      var sf=ii/iceStrips, sfn=(ii+1)/iceStrips;
      // Left slope
      var icL=svgEl('path',{opacity:0,fill:'rgba(56,189,248,0.5)'});
      icL.setAttribute('d','M'+isoX(-roofW*(1-sf),-hd)+' '+isoY(-roofW*(1-sf),-hd,peakH*sf)+' L'+isoX(-roofW*(1-sfn),-hd)+' '+isoY(-roofW*(1-sfn),-hd,peakH*sfn)+' L'+isoX(-roofW*(1-sfn),hd)+' '+isoY(-roofW*(1-sfn),hd,peakH*sfn)+' L'+isoX(-roofW*(1-sf),hd)+' '+isoY(-roofW*(1-sf),hd,peakH*sf)+' Z');
      gIce.appendChild(icL);
      allPieces.push({el:icL,phase:2,index:ii*2,total:iceStrips*2});
      // Right slope
      var icR=svgEl('path',{opacity:0,fill:'rgba(56,189,248,0.5)'});
      icR.setAttribute('d','M'+isoX(roofW*(1-sf),-hd)+' '+isoY(roofW*(1-sf),-hd,peakH*sf)+' L'+isoX(roofW*(1-sfn),-hd)+' '+isoY(roofW*(1-sfn),-hd,peakH*sfn)+' L'+isoX(roofW*(1-sfn),hd)+' '+isoY(roofW*(1-sfn),hd,peakH*sfn)+' L'+isoX(roofW*(1-sf),hd)+' '+isoY(roofW*(1-sf),hd,peakH*sf)+' Z');
      gIce.appendChild(icR);
      allPieces.push({el:icR,phase:2,index:ii*2+1,total:iceStrips*2});
    }
    svg.appendChild(gIce);
    // Front gable ice shield face (strips from eave up)
    var iceFrontStrips=6;
    for(var ifi=0;ifi<iceFrontStrips;ifi++){
      var if1=ifi/iceFrontStrips, if2=(ifi+1)/iceFrontStrips;
      var ifEl=svgEl('path',{opacity:0,fill:'rgba(56,189,248,0.5)'});
      ifEl.setAttribute('d','M'+isoX(-roofW*(1-if1),hd)+' '+isoY(-roofW*(1-if1),hd,peakH*if1)+' L'+isoX(-roofW*(1-if2),hd)+' '+isoY(-roofW*(1-if2),hd,peakH*if2)+' L'+isoX(roofW*(1-if2),hd)+' '+isoY(roofW*(1-if2),hd,peakH*if2)+' L'+isoX(roofW*(1-if1),hd)+' '+isoY(roofW*(1-if1),hd,peakH*if1)+' Z');
      svg.appendChild(ifEl);
      allPieces.push({el:ifEl,phase:2,index:Math.round(ifi*iceStrips*2/iceFrontStrips),total:iceStrips*2});
    }

    // ─── 4. FELT UNDERLAYMENT (rolled out in 4 strips across full slope) ───
    var gFelt=svgEl('g',{});
    var feltStrips=4;
    for(var fi=0;fi<feltStrips;fi++){
      var ff=fi/feltStrips, ffn=(fi+1)/feltStrips;
      var fL=svgEl('path',{opacity:0,fill:'#707880'});
      fL.setAttribute('d','M'+isoX(-roofW*(1-ff),-hd)+' '+isoY(-roofW*(1-ff),-hd,peakH*ff)+' L'+isoX(-roofW*(1-ffn),-hd)+' '+isoY(-roofW*(1-ffn),-hd,peakH*ffn)+' L'+isoX(-roofW*(1-ffn),hd)+' '+isoY(-roofW*(1-ffn),hd,peakH*ffn)+' L'+isoX(-roofW*(1-ff),hd)+' '+isoY(-roofW*(1-ff),hd,peakH*ff)+' Z');
      gFelt.appendChild(fL);
      allPieces.push({el:fL,phase:3,index:fi*2,total:feltStrips*2});
      var fR=svgEl('path',{opacity:0,fill:'#808890'});
      fR.setAttribute('d','M'+isoX(roofW*(1-ff),-hd)+' '+isoY(roofW*(1-ff),-hd,peakH*ff)+' L'+isoX(roofW*(1-ffn),-hd)+' '+isoY(roofW*(1-ffn),-hd,peakH*ffn)+' L'+isoX(roofW*(1-ffn),hd)+' '+isoY(roofW*(1-ffn),hd,peakH*ffn)+' L'+isoX(roofW*(1-ff),hd)+' '+isoY(roofW*(1-ff),hd,peakH*ff)+' Z');
      gFelt.appendChild(fR);
      allPieces.push({el:fR,phase:3,index:fi*2+1,total:feltStrips*2});
    }
    svg.appendChild(gFelt);
    // Front gable felt face (strips from eave up)
    var feltFrontStrips=4;
    for(var ffi=0;ffi<feltFrontStrips;ffi++){
      var ff1=ffi/feltFrontStrips, ff2=(ffi+1)/feltFrontStrips;
      var ffEl=svgEl('path',{opacity:0,fill:ffi%2===0?'#707880':'#808890'});
      ffEl.setAttribute('d','M'+isoX(-roofW*(1-ff1),hd)+' '+isoY(-roofW*(1-ff1),hd,peakH*ff1)+' L'+isoX(-roofW*(1-ff2),hd)+' '+isoY(-roofW*(1-ff2),hd,peakH*ff2)+' L'+isoX(roofW*(1-ff2),hd)+' '+isoY(roofW*(1-ff2),hd,peakH*ff2)+' L'+isoX(roofW*(1-ff1),hd)+' '+isoY(roofW*(1-ff1),hd,peakH*ff1)+' Z');
      svg.appendChild(ffEl);
      allPieces.push({el:ffEl,phase:3,index:Math.round(ffi*feltStrips*2/feltFrontStrips),total:feltStrips*2});
    }

    // ─── 5. SHINGLES (rows with individual tabs for elegant detail) ───
    var gShingles=svgEl('g',{});
    var shingleRows=16;
    var shCols=['#4A5568','#546374','#3D4A5C','#475569','#4F5B6B','#5A6577'];
    var shPieceIdx=0, shTotal=shingleRows*2;
    for(var si=0;si<shingleRows;si++){
      var sf2=si/shingleRows, sfn2=(si+1)/shingleRows;
      // LEFT slope — row group with individual shingle tabs
      var rowL=svgEl('g',{opacity:0});
      // Base strip
      rowL.appendChild(svgEl('path',{
        d:'M'+isoX(-roofW*(1-sf2),-hd)+' '+isoY(-roofW*(1-sf2),-hd,peakH*sf2)+' L'+isoX(-roofW*(1-sfn2),-hd)+' '+isoY(-roofW*(1-sfn2),-hd,peakH*sfn2)+' L'+isoX(-roofW*(1-sfn2),hd)+' '+isoY(-roofW*(1-sfn2),hd,peakH*sfn2)+' L'+isoX(-roofW*(1-sf2),hd)+' '+isoY(-roofW*(1-sf2),hd,peakH*sf2)+' Z',
        fill:shCols[si%shCols.length],stroke:'#2D3748','stroke-width':0.3
      }));
      // Individual tab lines across the row (depth direction)
      var numTabs=8;
      for(var tab=1;tab<numTabs;tab++){
        var tFrac=tab/numTabs;
        var offset=(si%2)*0.5/numTabs; // stagger every other row
        var adjFrac=tFrac+offset;
        if(adjFrac>1) continue;
        var tabD=-hd+adjFrac*roofD;
        var t1x=isoX(-roofW*(1-sf2),tabD), t1y=isoY(-roofW*(1-sf2),tabD,peakH*sf2);
        var t2x=isoX(-roofW*(1-sfn2),tabD), t2y=isoY(-roofW*(1-sfn2),tabD,peakH*sfn2);
        rowL.appendChild(svgEl('line',{x1:t1x,y1:t1y,x2:t2x,y2:t2y,stroke:'#2D3748','stroke-width':0.5,opacity:0.6}));
      }
      // Shadow line at bottom edge of row
      rowL.appendChild(svgEl('path',{
        d:'M'+isoX(-roofW*(1-sf2),-hd)+' '+isoY(-roofW*(1-sf2),-hd,peakH*sf2)+' L'+isoX(-roofW*(1-sf2),hd)+' '+isoY(-roofW*(1-sf2),hd,peakH*sf2),
        fill:'none',stroke:'rgba(0,0,0,0.3)','stroke-width':0.8
      }));
      gShingles.appendChild(rowL);
      allPieces.push({el:rowL,phase:4,index:shPieceIdx++,total:shTotal});

      // RIGHT slope
      var rowR=svgEl('g',{opacity:0});
      rowR.appendChild(svgEl('path',{
        d:'M'+isoX(roofW*(1-sf2),-hd)+' '+isoY(roofW*(1-sf2),-hd,peakH*sf2)+' L'+isoX(roofW*(1-sfn2),-hd)+' '+isoY(roofW*(1-sfn2),-hd,peakH*sfn2)+' L'+isoX(roofW*(1-sfn2),hd)+' '+isoY(roofW*(1-sfn2),hd,peakH*sfn2)+' L'+isoX(roofW*(1-sf2),hd)+' '+isoY(roofW*(1-sf2),hd,peakH*sf2)+' Z',
        fill:shCols[(si+3)%shCols.length],stroke:'#2D3748','stroke-width':0.3
      }));
      for(var tab2=1;tab2<numTabs;tab2++){
        var tFrac2=tab2/numTabs;
        var offset2=(si%2)*0.5/numTabs;
        var adjFrac2=tFrac2+offset2;
        if(adjFrac2>1) continue;
        var tabD2=-hd+adjFrac2*roofD;
        var t3x=isoX(roofW*(1-sf2),tabD2), t3y=isoY(roofW*(1-sf2),tabD2,peakH*sf2);
        var t4x=isoX(roofW*(1-sfn2),tabD2), t4y=isoY(roofW*(1-sfn2),tabD2,peakH*sfn2);
        rowR.appendChild(svgEl('line',{x1:t3x,y1:t3y,x2:t4x,y2:t4y,stroke:'#2D3748','stroke-width':0.5,opacity:0.5}));
      }
      rowR.appendChild(svgEl('path',{
        d:'M'+isoX(roofW*(1-sf2),-hd)+' '+isoY(roofW*(1-sf2),-hd,peakH*sf2)+' L'+isoX(roofW*(1-sf2),hd)+' '+isoY(roofW*(1-sf2),hd,peakH*sf2),
        fill:'none',stroke:'rgba(0,0,0,0.2)','stroke-width':0.6
      }));
      gShingles.appendChild(rowR);
      allPieces.push({el:rowR,phase:4,index:shPieceIdx++,total:shTotal});
    }
    svg.appendChild(gShingles);
    // Front gable shingles face (strips with matching colors + tab details)
    var shFrontRows=12;
    for(var sfi=0;sfi<shFrontRows;sfi++){
      var sfg=svgEl('g',{opacity:0});
      var sf1=sfi/shFrontRows, sf2=(sfi+1)/shFrontRows;
      var sfl1x=isoX(-roofW*(1-sf1),hd), sfl1y=isoY(-roofW*(1-sf1),hd,peakH*sf1);
      var sfr1x=isoX(roofW*(1-sf1),hd), sfr1y=isoY(roofW*(1-sf1),hd,peakH*sf1);
      var sfl2x=isoX(-roofW*(1-sf2),hd), sfl2y=isoY(-roofW*(1-sf2),hd,peakH*sf2);
      var sfr2x=isoX(roofW*(1-sf2),hd), sfr2y=isoY(roofW*(1-sf2),hd,peakH*sf2);
      // Base strip with matching shingle color
      sfg.appendChild(svgEl('path',{d:'M'+sfl1x+' '+sfl1y+' L'+sfl2x+' '+sfl2y+' L'+sfr2x+' '+sfr2y+' L'+sfr1x+' '+sfr1y+' Z',fill:shCols[sfi%shCols.length],stroke:'#2D3748','stroke-width':0.3}));
      // Vertical tab lines (individual shingles)
      var tabCount=Math.max(3,Math.round((sfr1x-sfl1x)/25));
      var offset=(sfi%2)*0.5/tabCount;
      for(var vt=1;vt<tabCount;vt++){
        var vtf=vt/tabCount+offset;
        if(vtf>1) continue;
        var vtx1=sfl1x+(sfr1x-sfl1x)*vtf, vty1=sfl1y+(sfr1y-sfl1y)*vtf;
        var vtx2=sfl2x+(sfr2x-sfl2x)*vtf, vty2=sfl2y+(sfr2y-sfl2y)*vtf;
        sfg.appendChild(svgEl('line',{x1:vtx1,y1:vty1,x2:vtx2,y2:vty2,stroke:'#2D3748','stroke-width':0.5,opacity:0.5}));
      }
      // Shadow line at bottom
      sfg.appendChild(svgEl('line',{x1:sfl1x,y1:sfl1y,x2:sfr1x,y2:sfr1y,stroke:'rgba(0,0,0,0.25)','stroke-width':0.7}));
      svg.appendChild(sfg);
      allPieces.push({el:sfg,phase:4,index:Math.round(sfi*shTotal/shFrontRows),total:shTotal});
    }

    // ─── 6. RIDGE CAP (individual pieces along peak) ───
    var gRidge=svgEl('g',{});
    var numRC=10;
    for(var ri=0;ri<numRC;ri++){
      var rf=(ri+0.2)/numRC, rfn=(ri+0.8)/numRC;
      var ry1=-hd+rf*roofD, ry2=-hd+rfn*roofD;
      var rc=svgEl('path',{opacity:0,fill:'#3D4A5C',stroke:'#2D3748','stroke-width':0.5});
      // Small peaked cap piece straddling the ridge
      var p1x=isoX(-12,ry1),p1y=isoY(-12,ry1,peakH*0.97);
      var p2x=isoX(0,ry1),p2y=isoY(0,ry1,peakH*1.02);
      var p3x=isoX(12,ry1),p3y=isoY(12,ry1,peakH*0.97);
      var p4x=isoX(12,ry2),p4y=isoY(12,ry2,peakH*0.97);
      var p5x=isoX(0,ry2),p5y=isoY(0,ry2,peakH*1.02);
      var p6x=isoX(-12,ry2),p6y=isoY(-12,ry2,peakH*0.97);
      rc.setAttribute('d','M'+p1x+' '+p1y+' L'+p2x+' '+p2y+' L'+p3x+' '+p3y+' L'+p4x+' '+p4y+' L'+p5x+' '+p5y+' L'+p6x+' '+p6y+' Z');
      gRidge.appendChild(rc);
      allPieces.push({el:rc,phase:5,index:ri,total:numRC});
    }
    svg.appendChild(gRidge);

    // ─── 7. FLASHING (drip edges + ridge flashing + vent) ───
    var gFlashing=svgEl('g',{});
    var de1=svgEl('line',{x1:isoX(-roofW,-hd),y1:isoY(-roofW,-hd,0),x2:isoX(-roofW,hd),y2:isoY(-roofW,hd,0),stroke:'#A0AEC0','stroke-width':2.5,opacity:0});
    gFlashing.appendChild(de1); allPieces.push({el:de1,phase:6,index:0,total:4});
    var de2=svgEl('line',{x1:isoX(roofW,-hd),y1:isoY(roofW,-hd,0),x2:isoX(roofW,hd),y2:isoY(roofW,hd,0),stroke:'#A0AEC0','stroke-width':2.5,opacity:0});
    gFlashing.appendChild(de2); allPieces.push({el:de2,phase:6,index:1,total:4});
    var rf2=svgEl('line',{x1:isoX(0,-hd),y1:isoY(0,-hd,peakH),x2:isoX(0,hd),y2:isoY(0,hd,peakH),stroke:'#B0BEC5','stroke-width':2,opacity:0});
    gFlashing.appendChild(rf2); allPieces.push({el:rf2,phase:6,index:2,total:4});
    var vx=isoX(-roofW*0.4,0),vy=isoY(-roofW*0.4,0,peakH*0.45);
    var vent=svgEl('rect',{x:vx-10,y:vy-8,width:20,height:14,fill:'#64748B',stroke:'#4A5568','stroke-width':1,rx:2,opacity:0});
    gFlashing.appendChild(vent); allPieces.push({el:vent,phase:6,index:3,total:4});
    svg.appendChild(gFlashing);

    // ─── 8. GUTTERS (channels along eaves + front fascia + downspouts at front corners) ───
    var gGutters=svgEl('g',{});
    // Left eave gutter (runs front to back along left side)
    var gl=svgEl('line',{x1:isoX(-roofW-8,-hd),y1:isoY(-roofW-8,-hd,-4),x2:isoX(-roofW-8,hd),y2:isoY(-roofW-8,hd,-4),stroke:'#718096','stroke-width':5,'stroke-linecap':'round',opacity:0});
    gGutters.appendChild(gl); allPieces.push({el:gl,phase:7,index:0,total:8});
    // Right eave gutter
    var gr=svgEl('line',{x1:isoX(roofW+8,-hd),y1:isoY(roofW+8,-hd,-4),x2:isoX(roofW+8,hd),y2:isoY(roofW+8,hd,-4),stroke:'#718096','stroke-width':5,'stroke-linecap':'round',opacity:0});
    gGutters.appendChild(gr); allPieces.push({el:gr,phase:7,index:1,total:8});
    // Front fascia gutter (along front gable bottom edge, viewer side)
    var gf=svgEl('line',{x1:isoX(-roofW-8,hd),y1:isoY(-roofW-8,hd,-4),x2:isoX(roofW+8,hd),y2:isoY(roofW+8,hd,-4),stroke:'#718096','stroke-width':5,'stroke-linecap':'round',opacity:0});
    gGutters.appendChild(gf); allPieces.push({el:gf,phase:7,index:2,total:8});
    // Left downspout at FRONT corner — elbow back to wall, then straight down
    var ds1gx=isoX(-roofW-8,hd),ds1gy=isoY(-roofW-8,hd,-4); // gutter attachment
    var ds1wx=isoX(-wallW,hd),ds1wy=isoY(-wallW,hd,-20); // wall contact point (slightly below gutter)
    var ds1=svgEl('polyline',{points:ds1gx+','+ds1gy+' '+ds1wx+','+ds1wy+' '+ds1wx+','+(ds1wy+500),fill:'none',stroke:'#64748B','stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round',opacity:0});
    gGutters.appendChild(ds1); allPieces.push({el:ds1,phase:7,index:3,total:8});
    // Right downspout at FRONT corner — elbow back to wall, then straight down
    var ds2gx=isoX(roofW+8,hd),ds2gy=isoY(roofW+8,hd,-4); // gutter attachment
    var ds2wx=isoX(wallW,hd),ds2wy=isoY(wallW,hd,-20); // wall contact point
    var ds2=svgEl('polyline',{points:ds2gx+','+ds2gy+' '+ds2wx+','+ds2wy+' '+ds2wx+','+(ds2wy+500),fill:'none',stroke:'#64748B','stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round',opacity:0});
    gGutters.appendChild(ds2); allPieces.push({el:ds2,phase:7,index:4,total:8});
    // Gutter brackets along left eave
    for(var gi=0;gi<3;gi++){
      var gby=-hd+(gi+1)*roofD/4;
      var gbL=svgEl('line',{x1:isoX(-roofW,gby),y1:isoY(-roofW,gby,0),x2:isoX(-roofW-8,gby),y2:isoY(-roofW-8,gby,-4),stroke:'#8A9AAA','stroke-width':1.5,opacity:0});
      gGutters.appendChild(gbL); allPieces.push({el:gbL,phase:7,index:5+gi,total:8});
    }
    svg.appendChild(gGutters);

    // ─── 9. SOLAR PANELS (3 rows x 2 cols on BOTH slopes — 12 panels total) ───
    var gSolar=svgEl('g',{});
    var panelIdx=0, totalPanels=30;
    // Helper: place a sleek panel on a slope
    function addPanel(side,row,col){
      var spg=svgEl('g',{opacity:0});
      var rows=3, cols=5;
      // Panel position on slope: row determines height (eave→ridge), col determines depth (front→back)
      var yStart=0.12+row*0.24, yEnd=yStart+0.19; // height band on slope
      var dStart=0.03+col*0.19, dEnd=dStart+0.16; // depth band (5 cols)
      var d1=-hd+dStart*roofD, d2=-hd+dEnd*roofD;
      var sign=side==='left'?-1:1;
      // Four corners mapped to slope surface
      var c1x=isoX(sign*roofW*(1-yStart),d1), c1y=isoY(sign*roofW*(1-yStart),d1,peakH*yStart);
      var c2x=isoX(sign*roofW*(1-yEnd),d1), c2y=isoY(sign*roofW*(1-yEnd),d1,peakH*yEnd);
      var c3x=isoX(sign*roofW*(1-yEnd),d2), c3y=isoY(sign*roofW*(1-yEnd),d2,peakH*yEnd);
      var c4x=isoX(sign*roofW*(1-yStart),d2), c4y=isoY(sign*roofW*(1-yStart),d2,peakH*yStart);
      // Panel frame (black with silver border)
      spg.appendChild(svgEl('path',{d:'M'+c1x+' '+c1y+' L'+c2x+' '+c2y+' L'+c3x+' '+c3y+' L'+c4x+' '+c4y+' Z',fill:'#0D1B2A',stroke:'#B0BEC5','stroke-width':1.2}));
      // Inner cells (2x3 grid for premium look)
      for(var cr=0;cr<3;cr++){
        for(var cc=0;cc<2;cc++){
          var cf1=(cr)/3, cf2=(cr+1)/3, df1=(cc)/2, df2=(cc+1)/2;
          var inset=0.04;
          var f1=cf1+(cf2-cf1)*inset, f2=cf2-(cf2-cf1)*inset;
          var g1=df1+(df2-df1)*inset, g2=df2-(df2-df1)*inset;
          // Interpolate corners
          function lerp4(ax,ay,bx,by,cx2,cy2,dx,dy,u,v){
            var tx=ax+(bx-ax)*u, ty=ay+(by-ay)*u;
            var bx2=dx+(cx2-dx)*u, by2=dy+(cy2-dy)*u;
            return{x:tx+(bx2-tx)*v, y:ty+(by2-ty)*v};
          }
          var p1=lerp4(c1x,c1y,c2x,c2y,c3x,c3y,c4x,c4y,f1,g1);
          var p2=lerp4(c1x,c1y,c2x,c2y,c3x,c3y,c4x,c4y,f2,g1);
          var p3=lerp4(c1x,c1y,c2x,c2y,c3x,c3y,c4x,c4y,f2,g2);
          var p4=lerp4(c1x,c1y,c2x,c2y,c3x,c3y,c4x,c4y,f1,g2);
          spg.appendChild(svgEl('path',{d:'M'+p1.x+' '+p1.y+' L'+p2.x+' '+p2.y+' L'+p3.x+' '+p3.y+' L'+p4.x+' '+p4.y+' Z',fill:'#1A2744',stroke:'#263850','stroke-width':0.4}));
        }
      }
      // Sleek highlight (top edge glint)
      spg.appendChild(svgEl('line',{x1:c1x,y1:c1y,x2:c4x,y2:c4y,stroke:'rgba(176,190,197,0.4)','stroke-width':0.8}));
      // Subtle blue reflection
      spg.appendChild(svgEl('path',{d:'M'+c1x+' '+c1y+' L'+c2x+' '+c2y+' L'+c3x+' '+c3y+' L'+c4x+' '+c4y+' Z',fill:'rgba(100,160,220,0.06)'}));
      gSolar.appendChild(spg);
      allPieces.push({el:spg,phase:8,index:panelIdx++,total:totalPanels});
    }
    // Left slope: 3 rows x 5 cols
    for(var lr=0;lr<3;lr++) for(var lc=0;lc<5;lc++) addPanel('left',lr,lc);
    // Right slope: 3 rows x 5 cols
    for(var rr=0;rr<3;rr++) for(var rc2=0;rc2<5;rc2++) addPanel('right',rr,rc2);
    svg.appendChild(gSolar);

    // Phase names for labeling
    var phaseNames=['SETTING TRUSSES','DECKING','ICE & WATER SHIELD','UNDERLAYMENT','LAYING SHINGLES','RIDGE CAP','FLASHING','GUTTERS','SOLAR PANELS'];

    // Power lights
    var powerLights=[];
    for(var pli=1;pli<=6;pli++){var plEl=document.getElementById('mr-pl'+pli);if(plEl)powerLights.push(plEl);}

    // ═══ SCROLL ANIMATION ═══
    function update(){
      var p=getProgress();
      scrubFill.style.width=(p*100)+'%';
      intro.style.opacity=map(p,0,0.05,1,0);
      intro.style.pointerEvents=p>0.03?'none':'auto';

      // Background
      bg.style.opacity=String(p<0.88?1:map(p,0.92,0.96,0,1));

      var fadeOut=p<0.88?1:map(p,0.88,0.94,1,0);
      sceneContainer.style.opacity=String(map(p,0.05,0.10,0,1)*fadeOut);

      // SVG sizing
      var vh=stickyEl.offsetHeight;
      var vw=stickyEl.offsetWidth;
      var svgAspect=1050/600;
      var svgW=vw, svgH=svgW/svgAspect;
      if(svgH>vh*0.95){svgH=vh*0.95;svgW=svgH*svgAspect;}
      svg.setAttribute('width',svgW);
      svg.setAttribute('height',svgH);

      // ═══ PIECE-BY-PIECE ANIMATION ═══
      // 9 phases, each gets ~9% of scroll (0.06 to 0.87)
      var numPhases=9;
      var phaseLen=0.09;
      var buildStart=0.06;

      allPieces.forEach(function(pc){
        var phaseStart=buildStart+pc.phase*phaseLen;
        var phaseEnd=phaseStart+phaseLen;
        // Within each phase, stagger pieces by their index
        var pieceStart=phaseStart+pc.index*(phaseLen*0.8)/pc.total;
        var pieceEnd=pieceStart+phaseLen*0.15;

        var pieceP=easeOut3(clamp((p-pieceStart)/(pieceEnd-pieceStart),0,1));
        pc.el.setAttribute('opacity',String(pieceP));
      });

      // HUD
      var hudIn=map(p,0.08,0.14,0,1);
      var hudOut=p<0.88?1:map(p,0.88,0.92,1,0);
      sceneHud.style.opacity=String(clamp(hudIn*hudOut,0,1));

      // ═══ FINALE — RED GLOW (87-93%) ═══
      var glowVal=map(p,0.87,0.93,0,1);
      sceneGlow.style.opacity=String(clamp(glowVal,0,1));
      if(p>=0.87){
        var glowSpread=easeOut3(clamp((p-0.87)/0.06,0,1));
        sceneGlow.style.background='radial-gradient(ellipse '+(50+glowSpread*50)+'% '+(50+glowSpread*50)+'% at 50% 50%, rgba(230,57,70,'+(0.15+glowSpread*0.85)+'), rgba(230,57,70,'+(glowSpread*0.4)+') 50%, transparent 80%)';
      }

      // ROOFPRO text
      var pi3=easeOut3(clamp((p-0.87)/0.03,0,1));
      var poHold=p<0.93?1:map(p,0.93,1.0,1,0);
      scenePowered.style.opacity=String(pi3*poHold);
      scenePowered.style.transform='translate(-50%,-50%) scale('+map(p,0.87,0.93,0.85,1.15)+')';

      // Power lights
      powerLights.forEach(function(pl,li){
        var ls=0.86+li*0.004,le=ls+0.03;
        var lp3=clamp((p-ls)/(le-ls),0,1);
        var w=easeOut3(lp3)*poHold;
        pl.style.background='rgba(230,57,70,'+(w*0.9)+')';
        pl.style.boxShadow=w>0.1?'0 0 '+Math.round(w*120)+'px '+Math.round(w*60)+'px rgba(230,57,70,'+(w*0.7)+'), 0 0 '+Math.round(w*200)+'px '+Math.round(w*100)+'px rgba(230,57,70,'+(w*0.3)+')':'none';
      });

      // Background goes red-warm
      if(p>0.86){
        var bgRed=easeOut3(clamp((p-0.86)/0.05,0,1))*poHold;
        bg.style.background='rgb('+Math.round(10+bgRed*60)+','+Math.round(14+bgRed*15)+','+Math.round(18+bgRed*10)+')';
        bg.style.opacity=String(Math.min(bgRed*0.75,0.75));
      }

      // Hero CTA (93-100%)
      var fP=map(p,0.93,1.0,0,1);
      var fOp=easeOut3(fP);
      finalEl.style.opacity=String(fOp);
      finalEl.style.transform='translateY('+map(fP,0,1,20,0)+'px)';
      finalEl.classList.toggle('active',p>0.93);

      // Phase labels
      var currentPhase=Math.floor((p-buildStart)/phaseLen);
      if(p<0.06) setPhase('');
      else if(currentPhase>=0&&currentPhase<numPhases) setPhase(phaseNames[currentPhase]);
      else if(p>=0.87&&p<0.93) setPhase('ROOFPRO');
      else setPhase('');
    }

    

    (function loop(){requestAnimationFrame(loop);try{update();}catch(e){}})();
    window.addEventListener('resize',update,{passive:true});

    var countersRun=false;
    function animateCounters(){if(countersRun)return;countersRun=true;document.querySelectorAll('.stat-block .num').forEach(function(el){var raw=el.textContent.trim(),match=raw.match(/[\d,]+/);if(!match)return;var target=parseInt(match[0].replace(/,/g,''),10),suffix=raw.slice(match.index+match[0].length),t0=performance.now();(function tick(now){var frac=Math.min((now-t0)/1400,1),ease=1-Math.pow(1-frac,3);el.innerHTML=Math.round(target*ease).toLocaleString()+'<span>'+suffix+'</span>';if(frac<1)requestAnimationFrame(tick);})(t0);});}
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(entries){if(entries[0].isIntersecting&&getProgress()>0.85){animateCounters();io.disconnect();}},{threshold:0.1});io.observe(finalEl);}
  }
})();
