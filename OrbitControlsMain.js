
// OrbitControls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

class OrbitControlsMain {

	constructor( domElement, worker  ) {

		this.worker = worker
		this.domElement = domElement;
		this.domElement.style.touchAction = 'none'; // disable touch scroll

		// Set to false to disable this control
		this.enabled = true;

		// the target DOM element for key events
		this._domElementKeyEvents = null;

		this.zoomToCursor = false;

		// The four arrow keys
		this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

		//
		// public methods
		//

		this.listenToKeyEvents = function ( domElement ) {

			domElement.addEventListener( 'keydown', onKeyDown );
			this._domElementKeyEvents = domElement;

		};

		this.stopListenToKeyEvents = function () {

			this._domElementKeyEvents.removeEventListener( 'keydown', onKeyDown );
			this._domElementKeyEvents = null;

		};

		this.dispose = function () {

			scope.domElement.removeEventListener( 'contextmenu', onContextMenu );

			scope.domElement.removeEventListener( 'pointerdown', onPointerDown );
			scope.domElement.removeEventListener( 'pointercancel', onPointerUp );
			scope.domElement.removeEventListener( 'wheel', onMouseWheel );

			scope.domElement.removeEventListener( 'pointermove', onPointerMove );
			scope.domElement.removeEventListener( 'pointerup', onPointerUp );


			if ( scope._domElementKeyEvents !== null ) {

				scope._domElementKeyEvents.removeEventListener( 'keydown', onKeyDown );
				scope._domElementKeyEvents = null;

			}

		};

		//
		// internals
		//

		const scope = this;

		const pointers = [];

		const pointerEvent = {};

		function handleKeyDown( event ) {

			let needsUpdate = false;

			switch ( event.code ) {

				case scope.keys.UP:

					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

						scope.worker.postMessage( { command: 'keysUpRotateUp', event: scope.domElement.clientHeight } );

					} else {

						scope.worker.postMessage( { command: 'keysUpPan' } );

					}

					needsUpdate = true;
					break;

				case scope.keys.BOTTOM:

					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

						scope.worker.postMessage( { command: 'keysBottomRotateUp', event: scope.domElement.clientHeight } );

					} else {

						scope.worker.postMessage( { command: 'keysBottomPan' } );

					}

					needsUpdate = true;
					break;

				case scope.keys.LEFT:

					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

						scope.worker.postMessage( { command: 'keysLeftRotateLeft', event: scope.domElement.clientHeight } );

					} else {

						scope.worker.postMessage( { command: 'keysLeftPan' } );

					}

					needsUpdate = true;
					break;

				case scope.keys.RIGHT:

					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

						scope.worker.postMessage( { command: 'keysRightRotateLeft', event: scope.domElement.clientHeight } );

					} else {

						scope.worker.postMessage( { command: 'keysRightPan' } );

					}

					needsUpdate = true;
					break;

			}

			if ( needsUpdate ) {

				// prevent the browser from scrolling on cursor keys
				event.preventDefault();

				scope.worker.postMessage( { command: 'update' } );

			}


		}

		function onPointerDown( event ) {

			if ( scope.enabled === false ) return;

			if ( pointers.length === 0 ) {

				scope.domElement.setPointerCapture( event.pointerId );

				scope.domElement.addEventListener( 'pointermove', onPointerMove );
				scope.domElement.addEventListener( 'pointerup', onPointerUp );

			}

			//

			setPointerEvent( event );

			addPointer( pointerEvent );

			if ( event.pointerType === 'touch' ) {

				scope.worker.postMessage( { command: 'onTouchStart', event: pointerEvent } );

			} else {

				scope.worker.postMessage( { command: 'onMouseDown', event: pointerEvent } );

			}

		}

		function onPointerMove( event ) {

			if ( scope.enabled === false ) return;

			setPointerEvent( event );

			if ( event.pointerType === 'touch' ) {

				scope.worker.postMessage( { command: 'onTouchMove', event: pointerEvent } );

			} else {

				scope.worker.postMessage( { command: 'onMouseMove', event: pointerEvent } );

			}

		}

		function onPointerUp( event ) {

			setPointerEvent( event );
			
			removePointer( pointerEvent );

			if ( pointers.length === 0 ) {

				scope.domElement.releasePointerCapture( event.pointerId );

				scope.domElement.removeEventListener( 'pointermove', onPointerMove );
				scope.domElement.removeEventListener( 'pointerup', onPointerUp );

			}

			scope.worker.postMessage( { command: 'onPointerUp' } );

		}

		function onMouseWheel( event ) {

			if ( scope.enabled === false ) return;

			event.preventDefault();

			setPointerEvent( event );
			
			scope.worker.postMessage( { command: 'onMouseWheel', event: pointerEvent } );

		}

		function onKeyDown( event ) {

			if ( scope.enabled === false ) return;

			handleKeyDown( event );

		}

		function onContextMenu( event ) {

			if ( scope.enabled === false ) return;

			event.preventDefault();

		}

		function addPointer() {

			pointers.push( pointerEvent );

			scope.worker.postMessage( { command: 'addPointer', event: pointerEvent } );

		}

		function removePointer() {

			for ( let i = 0; i < pointers.length; i ++ ) {

				if ( pointers[ i ].pointerId == pointerEvent.pointerId ) {

					pointers.splice( i, 1 );
					return;

				}

			}

			scope.worker.postMessage( { command: 'removePointer', event: pointerEvent } );

		}

		function setPointerEvent( event ) {

			pointerEvent.pointerId=event.pointerId;
			pointerEvent.pageX = event.pageX;
			pointerEvent.pageY = event.pageY;
			pointerEvent.clientX = event.clientX;
			pointerEvent.clientY = event.clientY;
			pointerEvent.deltaY = event.deltaY;
			pointerEvent.button = event.button;

			if ( event.pointerType === 'mouse' ) {

				pointerEvent.ctrlKey = event.ctrlKey;
				pointerEvent.metaKey = event.metaKey;
				pointerEvent.shiftKey = event.shiftKey;

			}

			if ( scope.zoomToCursor === true ) {

				if (pointerEvent.rect === undefined ) pointerEvent.rect = {};
				
				const rect = scope.domElement.getBoundingClientRect();
				pointerEvent.rect.left = rect.left;
				pointerEvent.rect.top = rect.top;

			} else if (pointerEvent.rect !== undefined ) delete pointerEvent.rect;

		}

		//

		scope.domElement.addEventListener( 'contextmenu', onContextMenu );

		scope.domElement.addEventListener( 'pointerdown', onPointerDown );
		scope.domElement.addEventListener( 'pointercancel', onPointerUp );
		scope.domElement.addEventListener( 'wheel', onMouseWheel, { passive: false } );

		// force an update at start

		scope.worker.postMessage( { command: 'update' } );

	}

}

export { OrbitControlsMain };
