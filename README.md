fixfixed - Smooth Scrolling with 60fps
======================================

Chrome extension to improve position:fixed elements with transform:translateZ(0) for smooth 60fps scrolling.

Find the extension in google store here: 
https://chrome.google.com/webstore/detail/fix-fixed/dgemgghfpehbgjofnpdeidajmobbkhfg

Also i have fixed chromium.app itself to optimized position:fixed directly: 
(but its outdated, so i removed the links)

It works as follows: 

* Chrome has bad rendering performance with style=position:fixed elements. 

* This patch will load all the stylesheets (and even fetch them via XHR if they are blocked due to https)

* It is checking all cssRules if they are style.position == "fixed" and creates new css-code

* At the same time style.tranform != '' are collected, because they can lead to errors

* the new css are appended and the layers are optimized in future , as the stylesheet is now optimized. 

* to avoid render-errors all real cssRules with transform in it are appended again and 
  they cancel out the translateZ(0) if neccessary. 
  
* All is done in one parse run, dom is not touched but only css-stylesheet is optimized in a way
  how the designer of the webpage should have done from the start. 
  
* if classes are added or removed during scroll (eg. menu shows on scrollback) then all is fine. 

 
