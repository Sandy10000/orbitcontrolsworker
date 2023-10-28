# orbitcontrolsworker
Three.js orbitControls split for main thread and worker thread for use in off-screen canvases

I haven't tested any touch controls because I'm not personally interested in them at the moment.

Corresponds to commit number 2563342.
  
It is assumed that the directory structure is as follows:  
* three  
  * build  
    * three.module.min.js  
* orbitcontrolsworker  
  * OrbitControlsMain.js  
  * OrbitControlsWorker.js  

If you want to use it with a different structure, you need to modify the import statement of orbitControlsWorker. js  
  
The zoomToCursor property exists on both the main thread side and the worker thread side. It works by setting both to true. If you set it to true on only one side, it will be ignored or an error will occur.
  
examples  
[simple](https://sandy10000.github.io/contents/demonstration/three/orbitcontrolsworker/simple/)  
[test all properties and methods](https://sandy10000.github.io/contents/demonstration/three/orbitcontrolsworker/all/)
