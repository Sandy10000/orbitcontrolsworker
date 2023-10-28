# orbitcontrolsworker
Three.js orbitControls split for main thread and worker thread for use in off-screen canvases

It is assumed that the directory structure is as follows:  
* three  
  * build  
    * three.module.min.js  
* orbitcontrolsworker  
  * OrbitControlsMain.js  
  * OrbitControlsWorker.js  

If you want to use it with a different structure, you need to modify the import statement of orbitControlsWorker. js  
