// Generated PNG sheets plus an original code-drawn fallback. Runtime atlases
// use transparent 64px cells and feet at y=58; loading never gates learning.
(function () {
  'use strict';
  var poses = ['idle','slash','throw','clone','hurt','win','smoke','bow','defeat'];
  var cache = {};
  var generated = {}, loading = {}, diagnostics = {};
  var heroRows=['idle','slash','throw','clone','hurt','win','smoke'];
  var enemyRows=['idle','slash','hurt','defeat','bow'];
  // Generated art is arranged in rows, but its weapons and feet do not obey
  // equal-sized cells. Follow transparent seams instead of cropping a grid.
  // Detached props cannot always be assigned by transparency alone. These two
  // source-space ownership hints keep the star/bomb with the throwing hand.
  var propHints={hero1:[{pose:'smoke',boundary:2,top:1506/1659,bottom:1545/1659,min:496/948}],hero3:[{pose:'throw',boundary:2,top:568/1659,bottom:618/1659,min:520/948}]};
  function splitFrames(source,rows,key){
    var w=source.width,h=source.height,data=source.getContext('2d').getImageData(0,0,w,h).data;
    var projection=new Uint32Array(h),cuts=[0],frames=[],report={width:w,height:h,cuts:cuts,rows:[],cutPixels:0,gridCutPixels:0,sourcePixels:0,coveredPixels:0};
    for(var y=0;y<h;y++)for(var x=0;x<w;x++)if(data[(y*w+x)*4+3]>32){projection[y]++;report.sourcePixels++;}
    for(var r=1;r<rows.length;r++){
      var target=Math.round(h*r/rows.length),range=Math.round(h/rows.length*.22),best=target,score=Infinity;
      for(y=target-range;y<=target+range;y++){var value=projection[y]*10000+Math.abs(y-target);if(value<score){score=value;best=y;}}
      cuts.push(best);report.cutPixels+=projection[best];
      report.gridCutPixels+=projection[target];
    }
    cuts.push(h);
    for(r=0;r<rows.length;r++){
      var top=cuts[r],bottom=cuts[r+1],height=bottom-top,seams=[];
      for(var boundary=1;boundary<4;boundary++){
        var nominal=Math.round(w*boundary/4),reach=Math.round(w/4*.36),lo=nominal-reach,hi=nominal+reach,span=hi-lo+1;
        var hint=(propHints[key]||[]).filter(function(item){return item.pose===rows[r]&&item.boundary===boundary;})[0];
        var prev=new Float64Array(span),next=new Float64Array(span),back=new Int16Array(span*height);
        for(var yy=0;yy<height;yy++){
          for(var i=0;i<span;i++){
            x=lo+i;var alpha=data[((top+yy)*w+x)*4+3];
            var cost=(alpha>32?1000+alpha:alpha/255)+Math.abs(x-nominal)/span*.015;
            if(hint&&top+yy>=hint.top*h&&top+yy<=hint.bottom*h&&x<hint.min*w)cost=Infinity;
            var parent=i,total=yy?prev[i]:0;
            if(yy){for(var step=-2;step<=2;step++){var p=i+step;if(p>=0&&p<span&&prev[p]+Math.abs(step)*.02<total){parent=p;total=prev[p]+Math.abs(step)*.02;}}}
            next[i]=cost+total;back[yy*span+i]=parent;
          }
          var swap=prev;prev=next;next=swap;
        }
        var last=0;for(i=1;i<span;i++)if(prev[i]<prev[last])last=i;
        var seam=new Uint16Array(height);for(yy=height-1;yy>=0;yy--){seam[yy]=lo+last;last=back[yy*span+last];}
        seams.push(seam);
        for(yy=0;yy<height;yy++){
          if(data[((top+yy)*w+seam[yy])*4+3]>32)report.cutPixels++;
          if(data[((top+yy)*w+nominal)*4+3]>32)report.gridCutPixels++;
        }
      }
      report.rows.push(seams.map(function(s){return Array.from(s);}));
      for(var frame=0;frame<4;frame++){
        var minX=w,minY=height,maxX=-1,maxY=-1,count=0;
        for(yy=0;yy<height;yy++){
          var left=frame?seams[frame-1][yy]:0,right=frame<3?seams[frame][yy]:w;
          for(x=left;x<right;x++)if(data[((top+yy)*w+x)*4+3]>32){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,yy);maxY=Math.max(maxY,yy);count++;}
        }
        if(maxX<0)throw new Error('Empty sprite frame');
        // Copy the full alpha, retaining antialiased edge pixels around bounds.
        minX=Math.max(0,minX-2);minY=Math.max(0,minY-2);maxX=Math.min(w-1,maxX+2);maxY=Math.min(height-1,maxY+2);
        var canvas=document.createElement('canvas');canvas.width=maxX-minX+1;canvas.height=maxY-minY+1;
        var context=canvas.getContext('2d'),pixels=context.createImageData(canvas.width,canvas.height);
        for(yy=minY;yy<=maxY;yy++){
          left=frame?seams[frame-1][yy]:0;right=frame<3?seams[frame][yy]:w;
          for(x=Math.max(left,minX);x<=maxX&&x<right;x++){
            var src=((top+yy)*w+x)*4,dst=((yy-minY)*canvas.width+x-minX)*4;
            pixels.data.set(data.subarray(src,src+4),dst);
          }
        }
        context.putImageData(pixels,0,0);report.coveredPixels+=count;
        frames.push({pose:rows[r],frame:frame,canvas:canvas,box:{x:minX,y:top+minY,w:canvas.width,h:canvas.height},pixels:count});
      }
    }
    report.frames=frames.map(function(f){return {pose:f.pose,frame:f.frame,box:f.box,pixels:f.pixels};});
    return {frames:frames,report:report};
  }
  function loadGenerated(kind,stage){
    var key=kind+stage;if(loading[key])return;loading[key]='loading';
    var image=new Image();image.onload=function(){
      try{
        // Normalize complete, individually separated PNG frames into the atlas.
        // Alpha bounds supply the feet anchor; one scale is used for all poses.
        var rows=kind==='hero'?heroRows:enemyRows;
        var source=document.createElement('canvas');source.width=image.naturalWidth;source.height=image.naturalHeight;
        var sc=source.getContext('2d');sc.drawImage(image,0,0);
        var split=splitFrames(source,rows,key),frames=split.frames,maxWidth=0,maxHeight=0;
        diagnostics[key]=split.report;
        frames.forEach(function(f){maxWidth=Math.max(maxWidth,f.box.w);maxHeight=Math.max(maxHeight,f.box.h);});
        if(!maxWidth||!maxHeight)throw new Error('Empty sprite atlas');
        var atlas=document.createElement('canvas');atlas.width=256;atlas.height=poses.length*64;
        var c=atlas.getContext('2d');c.imageSmoothingEnabled=false;
        var scale=Math.min(60/maxWidth,56/maxHeight);
        frames.forEach(function(f){if(!f.box)return;var b=f.box,dw=Math.max(1,Math.round(b.w*scale)),dh=Math.max(1,Math.round(b.h*scale));
          c.drawImage(f.canvas,0,0,b.w,b.h,f.frame*64+Math.round((64-dw)/2),poses.indexOf(f.pose)*64+58-dh,dw,dh);
        });
        // Non-player poses are not needed on the hero sheet. Provide safe idle
        // copies for diagnostics/asset previews instead of empty unexpected rows.
        if(kind==='hero')['bow','defeat'].forEach(function(pose){c.drawImage(atlas,0,0,256,64,0,poses.indexOf(pose)*64,256,64);});
        generated[key]=atlas;loading[key]='ready';window.dispatchEvent(new Event('ninja-battle-art-ready'));
      }catch(e){loading[key]='failed';console.warn('Using fallback battle art:',kind,e);}
    };
    image.onerror=function(){loading[key]='failed';};
    image.src='./img/battle/'+(kind==='hero'?'hero-'+stage:kind)+'.png';
  }
  function rect(c, color, x, y, w, h) {
    c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), w, h);
  }
  function poly(c, color, points) {
    c.fillStyle = color; c.beginPath();
    points.forEach(function(p,i) { if(i) c.lineTo(p[0],p[1]); else c.moveTo(p[0],p[1]); });
    c.closePath(); c.fill();
  }
  function star(c,x,y,color) {
    poly(c,color,[[x,y-5],[x+2,y-2],[x+5,y],[x+2,y+2],[x,y+5],[x-2,y+2],[x-5,y],[x-2,y-2]]);
    rect(c,'#182336',x-1,y-1,2,2);
  }
  function ninja(c, stage, kind, pose, frame) {
    var enemy = kind !== 'hero', gold = stage >= 3 && !enemy;
    var dark='#111b2b', mid=enemy?'#3b3857':'#283349', light=enemy?'#686182':'#4c5c72';
    var accent=enemy?'#8c68b3':stage===2?'#287ebc':'#c33c46';
    var edge=gold?'#e9ba57':stage===2?'#68c3e0':'#8996a3';
    if(kind==='samurai'){mid='#503742';light='#9d5b58';accent='#ba8245';edge='#e0c078';}
    if(kind==='master'){mid='#3b504d';light='#779485';accent='#ddd5b8';edge='#d5b369';}
    var attack=pose==='slash'||pose==='clone', throwing=pose==='throw';
    var lean=attack ? [0,2,3,0][frame] : pose==='hurt' ? [-2,-3,-1,0][frame] : 0;
    var bob=pose==='idle'&&frame===2 ? -1 : pose==='bow' ? [0,1,2,1][frame] : 0;
    if(pose==='defeat') { c.globalAlpha=[1,.8,.4,0][frame]; }
    if(pose==='smoke' && frame>1) return;
    c.save(); c.translate(lean,bob);
    // Scabbard, legs and boots.
    poly(c,dark,[[22,20],[25,19],[42,45],[39,47]]);
    poly(c,edge,[[21,18],[24,17],[29,24],[26,26]]);
    poly(c,dark,[[24,38],[43,38],[43,48],[47,55],[46,58],[36,58],[34,48],[30,49],[29,58],[17,58],[18,55],[22,47]]);
    poly(c,mid,[[24,39],[33,42],[29,51],[22,51],[23,47]]);
    poly(c,mid,[[34,40],[40,41],[40,48],[43,52],[36,52],[34,48]]);
    rect(c,light,21,53,7,2);rect(c,light,37,53,7,2);
    rect(c,gold?edge:mid,20,56,9,1);rect(c,gold?edge:mid,36,56,10,1);
    // Coat and rear hand.
    poly(c,dark,[[23,24],[38,23],[42,28],[40,35],[42,41],[33,44],[23,41],[21,34],[17,32],[18,28]]);
    poly(c,mid,[[24,25],[37,25],[37,33],[40,39],[32,41],[24,39],[25,33],[21,30]]);
    poly(c,light,[[25,27],[28,28],[34,35],[31,37],[27,33]]);
    poly(c,dark,[[18,29],[23,31],[23,36],[19,40],[15,37]]);
    rect(c,light,17,33,4,3);rect(c,'#bd8866',17,37,4,3);rect(c,'#f2c69b',17,37,3,2);
    rect(c,dark,23,37,16,3);rect(c,edge,28,37,3,2);star(c,36,38,'#c8dce0');
    // Forward arm: drawn poses rather than only translating an idle image.
    if(attack && frame>0 && frame<3){
      poly(c,dark,[[36,25],[41,24],[48,29],[50,27],[54,29],[52,34],[47,34],[39,30]]);
      rect(c,light,43,29,5,2);rect(c,'#f2c69b',49,28,4,4);
      poly(c,edge,[[51,29],[54,28],[61,12],[60,11]]);rect(c,'#f4f0d5',59,12,1,5);
    } else if(throwing){
      poly(c,dark,[[36,25],[40,25],[47,22],[49,24],[48,28],[40,31]]);
      rect(c,'#f2c69b',46,22,4,3);star(c,54,23,edge);
    } else {
      poly(c,dark,[[36,26],[41,27],[44,33],[43,39],[39,40],[36,33]]);
      rect(c,light,39,30,3,5);rect(c,'#f2c69b',39,37,4,3);
      if(pose!=='win'&&pose!=='bow'){
        poly(c,edge,[[42,37],[45,37],[51,21],[50,20]]);rect(c,'#e1edf0',48,26,1,6);
        rect(c,'#977243',41,36,5,2);
      }
    }
    // Hood, eyes, red scarf (the existing character's silhouette).
    poly(c,dark,[[24,8],[34,6],[41,10],[43,18],[40,25],[26,26],[20,20],[20,13]]);
    poly(c,mid,[[24,10],[34,8],[39,11],[41,16],[22,16],[22,13]]);
    poly(c,light,[[25,10],[32,9],[38,11],[39,13],[34,11]]);
    poly(c,accent,[[21,14],[41,14],[42,17],[22,18]]);
    poly(c,'#ab303c',[[22,15],[14,15],[8,12],[11,18],[20,18]]);
    poly(c,'#e1504d',[[20,17],[13,20],[8,19],[13,23],[23,19]]);
    rect(c,'#d9a57a',25,18,15,4);rect(c,'#f4cfa1',26,18,13,3);
    rect(c,'#f7efdf',29,18,3,2);rect(c,dark,31,18,1,2);
    rect(c,'#f7efdf',36,18,3,2);rect(c,dark,38,18,1,2);
    poly(c,stage===1&&!enemy?accent:dark,[[25,22],[40,21],[38,25],[30,27],[25,25]]);
    rect(c,light,27,23,7,1);
    if(stage>1&&!enemy){rect(c,edge,31,14,5,3);rect(c,'#fff0c0',32,14,3,1);}
    if(gold){rect(c,edge,22,26,5,2);rect(c,edge,36,25,5,3);rect(c,edge,39,34,4,1);}
    if(kind==='samurai'){
      poly(c,edge,[[20,10],[16,5],[19,6],[24,10],[37,10],[43,5],[44,6],[41,13]]);
      rect(c,accent,22,29,4,7);rect(c,accent,34,29,4,7);
    }
    if(kind==='master'){rect(c,'#e6dec6',26,24,10,3);rect(c,'#f9eccc',28,27,6,2);}
    c.restore(); c.globalAlpha=1;
  }
  function monster(c,kind,pose,frame) {
    var attack=pose==='slash'&&frame>0&&frame<3, hurt=pose==='hurt';
    if(pose==='defeat') c.globalAlpha=[1,.7,.3,0][frame];
    c.save();c.translate(hurt?-2:attack?2:0,pose==='idle'&&frame===2?-1:0);
    var dark='#242134', mid=kind==='oni'?'#a9484d':kind==='tengu'?'#993f4c':'#326e67';
    var light=kind==='oni'?'#d47758':kind==='tengu'?'#d0655d':'#67a98a';
    if(kind==='serpent'||kind==='dragon'){
      poly(c,dark,[[9,52],[12,44],[26,43],[22,35],[25,30],[32,26],[39,16],[47,14],[52,18],[56,21],[52,26],[46,29],[37,34],[34,39],[44,43],[47,49],[42,57],[17,58]]);
      poly(c,mid,[[12,52],[16,47],[30,46],[27,36],[31,33],[37,29],[42,19],[48,18],[51,23],[44,27],[32,35],[31,41],[41,46],[43,50],[39,54],[18,55]]);
      poly(c,light,[[17,51],[32,51],[38,48],[39,51],[33,54],[18,54]]);
      rect(c,'#f2df7b',46,20,4,3);rect(c,dark,49,20,1,2);
      for(var i=0;i<5;i++)rect(c,light,30+i*2,33-i*2,2,2);
      if(kind==='dragon'){
        poly(c,'#d1b667',[[41,18],[36,10],[40,12],[44,17],[49,18],[53,11],[53,18]]);
        poly(c,mid,[[29,35],[14,18],[16,32],[10,35],[27,41]]);
        poly(c,light,[[27,35],[17,24],[19,33],[15,35],[26,39]]);
      }
    } else {
      poly(c,dark,[[22,32],[44,32],[46,46],[48,55],[46,58],[35,58],[33,46],[29,48],[27,58],[15,58],[18,52]]);
      rect(c,mid,21,43,8,10);rect(c,mid,36,43,8,10);rect(c,'#e4bc74',20,54,8,2);rect(c,'#e4bc74',36,54,9,2);
      poly(c,dark,[[19,21],[40,20],[48,29],[45,40],[32,44],[18,38],[13,29]]);
      poly(c,mid,[[21,23],[39,23],[43,29],[40,37],[31,40],[21,36],[17,28]]);
      poly(c,light,[[23,25],[27,24],[35,29],[35,34],[25,34],[21,29]]);
      rect(c,'#3b384c',20,37,22,5);rect(c,'#dfbd77',29,38,6,3);
      poly(c,dark,[[19,25],[17,30],[14,38],[10,36],[11,27],[16,22]]);
      rect(c,mid,12,28,4,8);rect(c,light,11,35,5,4);
      poly(c,dark,[[39,25],[44,24],[49,31],[48,39],[43,39],[40,32]]);
      rect(c,mid,44,29,4,8);rect(c,light,43,36,6,4);
      poly(c,dark,[[22,8],[35,6],[43,12],[42,22],[35,26],[23,24],[18,18],[19,12]]);
      poly(c,mid,[[23,10],[34,9],[39,13],[39,20],[33,23],[24,21],[21,17]]);
      rect(c,'#f1dca3',24,15,5,3);rect(c,dark,27,15,2,2);rect(c,'#f1dca3',33,14,5,3);rect(c,dark,34,14,2,2);
      rect(c,dark,26,20,10,2);rect(c,'#f4e9cb',28,20,2,2);rect(c,'#f4e9cb',33,20,2,2);
      if(kind==='oni'){
        poly(c,'#e6c487',[[22,11],[21,3],[25,8],[35,8],[40,2],[39,12]]);
        rect(c,dark,49,16,5,24);rect(c,'#777783',48,13,7,17);
        for(var n=0;n<3;n++)rect(c,'#b5b8bb',47,15+n*5,9,2);
      }else{
        poly(c,mid,[[33,16],[48,18],[48,20],[33,20]]);
        rect(c,dark,26,6,10,5);rect(c,'#ddab4e',28,7,6,2);
        poly(c,dark,[[18,26],[6,18],[9,29],[6,35],[18,37]]);
        poly(c,'#535164',[[17,28],[9,23],[12,30],[9,33],[18,34]]);
      }
    }
    c.restore();c.globalAlpha=1;
  }
  function dummy(c,pose,frame){
    var y=pose==='bow'?frame%2:0;
    rect(c,'#413328',20,53,26,5);rect(c,'#6b4934',29,24+y,8,30);
    rect(c,'#bb8f55',31,25+y,3,28);rect(c,'#493b2c',22,10+y,21,20);
    rect(c,'#b58a56',24,12+y,17,16);rect(c,'#ddbc7b',26,14+y,3,10);
    rect(c,'#68503b',15,28+y,34,6);rect(c,'#d3aa6f',16,29+y,31,2);
    rect(c,'#483629',29,18+y,3,2);rect(c,'#483629',36,18+y,3,2);
  }
  function sheet(kind,stage){
    if(kind!=='hero')stage=1;
    var key=kind+stage;loadGenerated(kind,stage);if(generated[key])return generated[key];if(cache[key])return cache[key];
    var canvas=document.createElement('canvas');canvas.width=256;canvas.height=poses.length*64;
    var c=canvas.getContext('2d');if(!c)throw new Error('Pixel canvas unavailable');
    c.imageSmoothingEnabled=false;
    poses.forEach(function(pose,row){for(var f=0;f<4;f++){
      c.save();c.translate(f*64,row*64);
      if(kind==='dummy')dummy(c,pose,f);
      else if(['oni','tengu','serpent','dragon'].indexOf(kind)>=0)monster(c,kind,pose,f);
      else ninja(c,stage,kind,pose,f);
      c.restore();
    }});cache[key]=canvas;return canvas;
  }
  function draw(c,kind,stage,pose,frame,x,y,scale,flip){
    var row=Math.max(0,poses.indexOf(pose));c.save();c.imageSmoothingEnabled=false;
    c.translate(Math.round(x),Math.round(y));if(flip){c.translate(64*scale,0);c.scale(-1,1);}
    c.drawImage(sheet(kind,stage),frame*64,row*64,64,64,0,0,64*scale,64*scale);c.restore();
  }
  window.NinjaBattleArt={draw:draw,sheet:sheet,star:star,rect:rect,poly:poly,poses:poses,status:function(){return Object.assign({},loading);},diagnostics:function(kind,stage){return diagnostics[kind+(kind==='hero'?stage:1)];}};
})();
