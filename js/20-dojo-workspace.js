(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded',function(){
    var section=document.querySelector('#home > .learning-settings');
    var dialog=document.createElement('dialog');dialog.id='dojo-raid-dialog';dialog.className='dojo-dialog';
    dialog.innerHTML='<div class="page-head"><h2>みんなで修行</h2><button type="button" class="bkbtn" id="dojo-raid-close">とじる ×</button></div>';
    if(section)dialog.appendChild(section);
    document.body.appendChild(dialog);
    document.getElementById('dojo-raid-open').addEventListener('click',function(){dialog.showModal();});
    document.getElementById('dojo-raid-close').addEventListener('click',function(){dialog.close();});
    if(new URLSearchParams(location.search).get('code'))dialog.showModal();
  });
})();
