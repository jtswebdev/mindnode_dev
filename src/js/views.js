/**
 * Created by jtsjordan on 7/3/17.
 */


import { EllipseButton }       from './components.js';
import { DetailsWidget }       from './components.js';
import { NodeCreationWidget }  from './components.js';
import { blackHoleRect }       from './components.js';

import { nodeClicked }         from './viewController.js';
import { getPanelInputValues } from './viewController.js';

import { createGroup }         from './components.js';

export { freshRender };
export { saveVarsToView };

export { fadeNode };
export { focusNode };
export { cornerNode };
export { hideNode };
export { createNode };

export { closeNodeDetailsAnimation };
export { panelRouterInterface };
export { removeElement };

export { calculateTargetCoords };


// Node Containers
    let $root_view  = $( '.root_node_view' );
    let $focus_view = $( '.focus' );
    let $child_view = $( '.focus_children' );
    let $fade_view  = $( '.fade' );

// Depth
    let $at_depth = $( '.at_depth' );
    let $at_shallow = $( '.at_shallow' );

// UI Components

    // Gooey
        let $gooeyUI  = $('#gooey_ui_components');
    // Normal
        let $normalUI = $( '#normal_ui_components' );


// Panel Container
    let $panel = $( '.panel_view_back' );

// Node Property Obj
    let nVars;

// View Dimensions
    let viewW;
    let viewH;
    let xMid;
    let yMid;




    // --- Initial Interface Rendering ---


        // Module Entry
            function freshRender( root ) {

                    let newNode = createNode( root );

                    focusNode( newNode );

            }


    // -----------------------------------



    // --------- Tree Navigation ---------


            // FOCUS Node

                function focusNode( node ) {

                    let nodeBack = $( node ).find( '.node' );
                    let nodeIcon = $( node ).find( '.node_icon' );

                    appendFocus( node );

                    clearOldChildren();

                    animateNodeFocus( node, nodeBack, nodeIcon );

                }

                function appendFocus( node ) {

                    if ( !$.data( node, 'root' ) ) {

                        $focus_view.append( node );

                    } else {

                        $root_view.append( node );

                    }

                    $.data( node, 'clickAction', 'showDetails' );

                }

                function animateNodeFocus( node, nodeBack, nodeIcon ) {

                    let timeline = new TimelineMax();
                    let focRad   = nVars.focusRadius;
                    let nodeObj  = $.data( node, 'model' );

                    let oX = Math.round( xMid - focRad / 2 );
                    let oY = Math.round( yMid - focRad / 2 );

                    timeline.to( nodeBack, .5, { attr: { rx: focRad, ry: focRad }, ease: Back.easeOut }, 0 );
                    timeline.to( nodeIcon, .5, { attr: { x: oX, y: oY, width: focRad, height: focRad }, ease: Back.easeOut }, 0 );
                    timeline.to( node,     .5, { attr: { x: 0, y: 0 }, ease: Back.easeIn }, 0 );
                    timeline.to( node,     .5, { autoAlpha: 1 }, 0 );

                    timeline.call( createChildNodes, [ nodeObj.children ], null, .5 );

                }


            // FADE Node

                function fadeNode( node ) {

                    let nodeBack = $( node ).find( '.node' );
                    let nodeIcon = $( node ).find( '.node_icon' );

                    clearOldFade();

                    appendFade( node );

                    animateNodeFade( node, nodeBack, nodeIcon );

                }

                function appendFade( node ) {

                    if ( $.data( node, 'root' ) === false ) {

                        $( '.fade' ).append( node );

                    }

                    $.data( node, 'clickAction', 'navigateUp' );

                }

                function animateNodeFade( node, nodeBack, nodeIcon ) {

                    let timeline = new TimelineMax();

                    timeline.to( nodeBack, .5, { attr: { rx: 30, ry: 30 }, ease: Back.easeOut }, 0 );
                    timeline.to( nodeIcon, .5, { attr: { x: xMid - 20, y: yMid - 20, width: 40, height: 40 }, ease: Back.easeOut }, 0 );

                    if ( $.data( node, 'fromSpace' ) ) {

                        timeline.fromTo( node, .5, { attr: { x: nVars.fadeX * .5, y: nVars.fadeY * 2 } }, { attr: { x: nVars.fadeX, y: nVars.fadeY }, ease: Power2.easeIn }, 0 );
                        $.data( node, 'fromSpace', false );

                    } else {

                        timeline.to( node, .5, { attr: { x: nVars.fadeX, y: nVars.fadeY }, ease: Back.easeIn }, 0 );

                    }

                    timeline.to( node, .5, { autoAlpha: .2 }, 0 );

                }


            // CORNER Node

                function cornerNode( node ) {

                    let nodeBack = $( node ).find( '.node' );
                    let nodeIcon = $( node ).find( '.node_icon' );

                    $.data( node, 'clickAction', 'navigateJump' );

                    animateNodeCorner( node, nodeBack, nodeIcon );

                }

                function animateNodeCorner( nodeSVG, nodeBack, nodeIcon ) {

                    let timeline = new TimelineMax();

                    timeline.to( nodeBack, .5, { attr: { rx: 32, ry: 32 }, ease: Back.easeIn }, 0 );
                    timeline.to( nodeIcon, .5, { attr: { x: xMid - 16, y: yMid - 16, width: 32, height: 32 }, ease: Back.easeIn }, 0 );
                    timeline.to( nodeSVG, .5, { attr: { x: nVars.cornerX, y: nVars.cornerY }, ease: Back.easeIn }, 0 );

                    timeline.to( nodeSVG, .5, { autoAlpha: 1 }, .5 );

                }


            // CHILD Node

                function appendChild( node ) {

                    $child_view.append( node );

                    $.data( node, 'clickAction', 'navigateDown' );

                }

                function animateChildren( childNodes, coords ) {

                    for ( let i = 0; i < childNodes.length; i++ ) {

                        let coord     = coords[ i ];
                        let childNode = childNodes[ i ];

                        TweenLite.to( childNode, 1, { attr: { x: coord[ 0 ], y: coord[ 1 ] }, ease: Back.easeOut } );

                    }

                }


            // HIDE  Node

                function hideNode( node ) {

                    let nodeBack = $( node ).find( '.node' );
                    let nodeIcon = $( node ).find( '.node_icon' );

                    animateNodeRemoval( node, nodeBack, nodeIcon );

                }

                function clearNodes() {

                    clearOldChildren();


                }

                function clearOldChildren() {

                    let oldChildren = $child_view.children();

                    if ( oldChildren.length > 0 ) {

                        for ( let i = 0; i < oldChildren.length; i++ ) {

                            hideNode( oldChildren[ i ] );

                        }

                    }

                }

                function clearOldFade() {

                    let oldFade = $fade_view.children();

                    if ( oldFade.length > 0 ) {

                            hideNode( oldFade[ 0 ] );

                    }

                }

                function animateNodeRemoval( nodeSVG, nodeBack, nodeIcon ) {

                    let timeline = new TimelineMax();

                    timeline.to( nodeBack, .25, { attr: { rx: 0, ry: 0 }, ease: Back.easeIn }, 0 );
                    timeline.to( nodeIcon, .25, { css: { scale: 0, transformOrigin: 'center' }, ease: Back.easeIn }, 0 );

                    timeline.call( removeElement, [ nodeSVG ], null, .25 );

                }


    // -----------------------------------



        // ----- ROUTER -----


            function panelRouterInterface( type, props ) {

                switch ( type ) {

                    case 'showDetails':
                        createDetailsView( props.node, props.fade );
                        break;
                    case 'hideDetails':
                        closeNodeDetailsAnimation( props.cornerClose, props.doSave );
                        break;
                    case 'showNodeCreation':
                        createNewNodeView( props.node, props.fade );
                        break;
                    case 'hideNodeCreation':
                        closeNodeCreationAnimation( props.cornerClose, props.doSave );
                        break;
                    case 'close':
                        closeNodeDetailsAnimation();
                        break;
                    case 'edit':
                        detailsEditableAnimation( props.node );
                        break;
                    case 'stop_edit':
                        detailsUneditableAnimation( props.node );
                        break;
                    case 'delete':
                        deleteNodeAnimation( props.node );
                        break;
                    default:
                        console.log( 'Unknown Router Type: ' + type );

                }

            }


        // ------------------



    // -------- Node Details View --------


        function createDetailsView( node, fade ) {

            let model = $.data( node, 'model' );

            // Hide Children
                clearOldChildren();

            // Create Widget
                let detailsWidget = new DetailsWidget({ text: model.model.text, name: model.model.name });

                $.data( detailsWidget, 'panelType', 'nodeDetails' );
                $.data( detailsWidget, 'focus', node );
                $.data( detailsWidget, 'fade', fade );

                $panel.append( detailsWidget );

            // Show Widget
                showNodeDetailsAnimation( node, fade, $( detailsWidget ).children() );

        }


        // Show/Close Node Details
            function showNodeDetailsAnimation( node, fade, comps ) {

                let expX      = nVars.expandedX;
                let nodeTitle = $( node ).children()[ 2 ];

                let textDivFO = comps[ 2 ];
                let textDiv   = $( textDivFO ).children()[ 0 ];

                let timeline  = new TimelineMax();

                // Hide Fade
                    timeline.to( fade, .25, { css: { autoAlpha: 0 }, ease: Back.easeIn }, 0 );

                // Position Edit Button to Top Right and Hide
                    timeline.set( comps[ 3 ], { attr: { x: 124, y: -36 }, ease: Back.easeInOut }, 0 );
                    timeline.set( comps[ 3 ], { css: { strokeOpacity: 0, autoAlpha: 0 } }, 0 );

                // Hide Components

                    // Delete Button
                        timeline.set( comps[ 0 ], { autoAlpha: 0 }, 0 );
                    // Text Div
                    //     timeline.set( comps[ 2 ], { autoAlpha: 0 }, 0 );
                    // timeline.set( comps[ 2 ], { css: { scaleY: 0, transformOrigin: 'top', autoAlpha: 0 } }, 0 );
                    // Text Input
                    //     timeline.set( comps[ 4 ], { css: { scaleY: 0, transformOrigin: 'top' } }, 0 );


                // Name Input

                    // Position
                        timeline.set( comps[ 5 ], { attr: { x: xMid - 135, y: yMid - 120 } }, 0 );                      // NameInput
                    // Shrink Down
                    //     timeline.set( comps[ 5 ], { css: { scaleY: 0, transformOrigin: 'bottom' } }, 0 );

                        let nameInput = $( comps[ 5 ] ).find( '.text_input' )[ 0 ];
                        timeline.set( nameInput, { css: { scaleY: 1, transformOrigin: 'bottom', autoAlpha: 0 } }, 0 );

                // Node to Left
                    timeline.to( node, .5, { attr: { x: expX }, ease: Back.easeOut }, 0 );

                // Ellipse
                    timeline.to( $( node ).children()[ 0 ], .25, { attr: { rx: 90, ry: 50 }, ease: Back.easeOut }, 0 );
                    timeline.to( $( node ).children()[ 0 ], .5, { attr: { rx: 40, ry: 120 }, ease: Back.easeOut }, .25 );

                // Icon
                    timeline.to( $( node ).children()[ 1 ], .25, { css: { scale: .7, transformOrigin: 'center' }, ease: Back.easeOut }, 0 );
                    timeline.to( $( node ).children()[ 1 ], .25, { css: { scale: .8, transformOrigin: 'center' }, ease: Back.easeOut }, .25 );

                // Title Reveal
                    timeline.fromTo( nodeTitle, .5, { css: { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0 } }, { css: { scaleX: 1, transformOrigin: 'left center', autoAlpha: 1 } }, .5 );

                // Reveal Back Card
                    timeline.fromTo( comps[ 1 ], .5, { css: { scaleY: 0, transformOrigin: 'top', autoAlpha: 0 } }, { css: { scaleY: 1, transformOrigin: 'top', autoAlpha: 1 } }, .25 );

                // Show Edit Button
                    timeline.to( comps[ 3 ], .5, { autoAlpha: 1 }, .5 );

                // Reveal Card Text
                    timeline.fromTo( textDiv, .5, { css: { scaleX: 0, transformOrigin: 'left', autoAlpha: 0 } }, { css: { scaleX: 1, transformOrigin: 'left', autoAlpha: 1 } }, .75 );

                timeline.call( iconSelectionsVisible, null, null, 1 );

                function iconSelectionsVisible() {

                    $( '.selection_back' ).css( 'visibility', 'visible' );
                    $( '.selection_icon' ).css( 'visibility', 'visible' );

                }

            }

            function closeNodeDetailsAnimation( cornerClose, doSave ) {

                let panelSVG  = $panel.children()[ 0 ];
                let comps     = $( panelSVG ).children();

                let selMenu   = $at_depth.children()[ 0 ];
                let node      = $.data( panelSVG, 'focus' );
                let fade      = $.data( panelSVG, 'fade' );

                let nodeTitle = $( node ).children()[ 2 ];

                doSave ? getPanelInputValues( panelSVG ) : console.log( '- DONT SAVE -' );

                let timeline  = new TimelineMax();

                timeline.to( $( panelSVG ).children()[ 1 ], .25, { autoAlpha: 0, ease: Sine.easeIn }, 0 );
                timeline.to( nodeTitle, .25, { autoAlpha: 0, ease: Sine.easeIn }, 0 );

                // Title Reveal
                    timeline.to( nodeTitle, .5, { css: { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0 } }, 0.25 );

                // Reveal Back Card
                    timeline.to( comps[ 1 ], .5, { css: { scaleX: 0, transformOrigin: 'left', autoAlpha: 0 } }, 0.25 );

                // Show Edit Button
                    timeline.to( comps[ 3 ], .5, { css: { scaleX: 0, transformOrigin: 'left', autoAlpha: 0 } }, 0.25 );

                // Reveal Card Text
                    timeline.to( comps[ 2 ], .5, { css: { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0.25 } }, 0 );

                // Show Fade
                    timeline.to( fade, 1, { autoAlpha: .2, ease: Back.easeOut }, 1 );

                !cornerClose ? timeline.call( focusNode, [ node ], null, .5 ) : null;
                timeline.call( removeElement, [ panelSVG ], null, .5 );
                timeline.call( removeElement, [ selMenu ], null, .5 );

            }

        // Toggle Edit Details States
            function detailsEditableAnimation( node ) {


                let panelSVG     = $panel.children()[ 0 ],   // Widget SVG
                    uiComponents = $( panelSVG ).children(), // Widget UI Component Array


                // Components

                        deleteBtn = uiComponents[ 0 ],  editBtn    = uiComponents[ 3 ],         // Edit/Delete
                        textDivFO = uiComponents[ 2 ],  textAreaFO = uiComponents[ 4 ],         // Text Comps

                        nameInput   = uiComponents[ 5 ],                          nodeName  = $( node ).children()[ 2 ],      // Name Comps
                        nameInputEl = $( nameInput ).find( '.text_input' )[ 0 ],  nodeNameEl = $( nodeName ).children()[ 0 ], // Name Input El

                        editIcon    = $( editBtn ).children()[ 1 ],              // Edit Icon


                // Calc Button Alpha
                        deleteAlpha = getDeleteAlpha( panelSVG );


                // Animation Sequence
                let timeline = new TimelineMax();


                // Icon : Edit -> Close
                    $( editIcon ).attr( 'xlink:href', 'src/styles/images/closeIcon.png' );


                // Fill/Stroke Background
                    timeline.set( $( deleteBtn ).children()[ 0 ], { css: { fill: '#ff3e3e', stroke: '#778899', strokeWidth: 2 } }, 0 );


                // Slide In
                    timeline.to( deleteBtn, .5, { attr: { x: 168, y: 80 }, autoAlpha: deleteAlpha, ease: Back.easeOut }, 0 );


                // Shrink Up / Expand Down
                    timeline.to( $( textDivFO ).children()[ 0 ], .5, { css: { scaleY: 0, transformOrigin: 'center top' }, ease: Sine.easeIn }, 0.25 );

                    timeline.to( textAreaFO, .5, { css: { scaleY: 1, transformOrigin: 'center top', autoAlpha: 1 }, ease: Sine.easeIn }, .75 );
                    timeline.to( $(textAreaFO).children()[0], .5, { css: { scaleY: 1, transformOrigin: 'center top', autoAlpha: 1 }, ease: Sine.easeIn }, .75 );


                // Fade / Expand Up
                    timeline.to( nodeName, .5, { css: { autoAlpha: 0 }, ease: Sine.easeIn }, 0 );

                    timeline.to( nameInput, .5, { css: { scaleY: 1, transformOrigin: 'bottom', autoAlpha: 1 }, ease: Sine.easeInOut }, .5 );
                    timeline.to( nameInputEl, .5, { css: { scaleY: 1, transformOrigin: 'bottom', autoAlpha: 1 } }, .5 );
            }

            function detailsUneditableAnimation( node ) {

                let panelSVG = $panel.children()[ 0 ];
                let comps    = $( panelSVG ).children();

                let nodeTitle = $( node ).children()[ 2 ];

                let timeline = new TimelineMax();

                let editIcon = $( comps[ 3 ] ).children()[ 1 ];
                $( editIcon ).attr( 'xlink:href', 'src/styles/images/menuIcon.png' );

                // Delete Button
                    timeline.to( comps[ 0 ], .5, { attr: { x: 0, y: 0 }, autoAlpha: 0, ease: Back.easeIn }, 0 );

                // Shrink Text Area / Expand Text Div - Top
                    timeline.to( $( comps[ 4 ] ).children()[ 0 ], .5, { css: { scaleY: 0, transformOrigin: 'center top' }, ease: Sine.easeIn }, 0 );
                    timeline.to( $( comps[ 2 ] ).children()[ 0 ], .5, { css: { scaleY: 1, transformOrigin: 'center top' }, ease: Sine.easeIn }, .5 );

                // Shrink Name Input / Expand Node Title - Left
                    timeline.to( comps[ 5 ], .5, { css: { scaleY: 0, transformOrigin: 'bottom' }, ease: Sine.easeInOut }, 0 );
                    timeline.to( nodeTitle, .5, { css: { autoAlpha: 1 }, ease: Sine.easeIn }, .5 );

                    timeline.to( $( comps[ 5 ] ).find( '.text_input' )[ 0 ], .5, { css: { scaleY: 0, transformOrigin: 'center bottom' } }, 0 );

            }


    // -----------------------------------




    // -------- Add New Node View --------


        function createNewNodeView( node, fade ) {

            let model = $.data( node, 'model' );

            // Hide Children
                clearOldChildren();

                let createNodeWidget = new NodeCreationWidget({});

                $.data( createNodeWidget, 'panelType', 'nodeCreation' );
                $.data( createNodeWidget, 'focus', node );
                $.data( createNodeWidget, 'fade', fade );

            $panel.append( createNodeWidget );

            newNodeCreationAnimation( node, fade, $( createNodeWidget ).children() );

        }


        // Show/Close New Node Creation
            function newNodeCreationAnimation( node, fade, comps ) {

                let timeline = new TimelineMax();

                let canvasSVG   = comps[ 2 ];
                let canvas_back = $( canvasSVG ).children()[ 0 ];
                let canvas_icon = $( canvasSVG ).children()[ 1 ];

                // Hide Icon Button / Delete Button / Text / Text Input
                    timeline.set( comps[ 0 ], { autoAlpha: 0 }, 0 ); // Confirm Button
                    timeline.set( comps[ 1 ], { autoAlpha: 0 }, 0 ); // Cancel Button
                    timeline.set( comps[ 3 ], { attr: { x: xMid - 240, y: yMid - 170, width: 240, height: 40 }, autoAlpha: 0 }, 0 ); // Name Text_Input
                    timeline.set( comps[ 4 ], { attr: { x: xMid - 120, y: yMid + 65, width: 240, height: 40 }, autoAlpha: 0 }, 0 );  // Text Text_Input

                // Hide Focus/Fade
                    timeline.to( fade, .25, { css: { autoAlpha: 0, pointerEvents: 'none' }, ease: Back.easeOut }, 0 );
                    timeline.to( node, .25, { css: { autoAlpha: 0, pointerEvents: 'none' }, ease: Back.easeOut }, 0 );

                // Reveal Back Card
                    timeline.to( canvasSVG, .5, { autoAlpha: 1 }, .25 );
                    timeline.fromTo( canvas_back, .5, { attr: { rx: 0, ry: 0 }, autoAlpha: 0 }, { attr: { rx: 120, ry: 120 }, autoAlpha: 1, ease: Back.easeOut }, .25 );
                    timeline.to( canvas_icon, .5, { attr: { x: xMid - 45, y: yMid - 45, width: 90, height: 90 }, autoAlpha: 0.25, ease: Back.easeOut }, .25 );

                // Reveal Name Input
                    timeline.fromTo( comps[ 3 ], .5, { css: { scaleX: 0, transformOrigin: "right", autoAlpha: 0 } }, { css: { scaleX: 1, transformOrigin: "right", autoAlpha: 1 }, ease: Back.easeOut }, .25 );
                    timeline.fromTo( $( comps[ 3 ] ).find( '.text_input' )[ 0 ], .5, { css: { scaleX: 0, transformOrigin: "right", autoAlpha: 0 } }, { css: { scaleX: 1, transformOrigin: "right", autoAlpha: 1 }, ease: Back.easeOut }, .25 );

                // Separate non-glow elements into exterior layer
                    $normalUI.append( comps[ 3 ] );

                // Separate elements that glow, but must be in front of other components
                    $gooeyUI.append( comps[ 4 ] );

                // Reveal Text Input
                    timeline.fromTo( comps[ 4 ], .5, { css: { scaleX: 0, scaleY: .1, transformOrigin: "left top", autoAlpha: 0 } }, { css: { scaleX: 1, transformOrigin: "left top", autoAlpha: 1 }, ease: Power2.easeInOut }, .75 );
                    timeline.to( comps[ 4 ], .5, { css: { scaleY: 1, transformOrigin: 'top' }, ease: Back.easeOut }, 1.25 );

                // Reveal Confirm / Cancel Buttons
                    timeline.to( comps[ 0 ], .5, { attr: { x: 240, y: 70 }, autoAlpha: 1 }, .5 );
                    timeline.to( comps[ 1 ], .5, { attr: { x: 210, y: 100 }, autoAlpha: 1 }, .5 );

                timeline.call( iconSelectionsVisible, null, null, 1 );

                function iconSelectionsVisible() {

                    $( '.selection_back' ).css( 'visibility', 'visible' );
                    $( '.selection_icon' ).css( 'visibility', 'visible' );

                }

            }

            function closeNodeCreationAnimation( cornerClose, doSave ) {

                let panelSVG  = $panel.children()[ 0 ];
                let gooeyUI   = $gooeyUI.children()[ 0 ];  // Text Input
                let normalUI  = $normalUI.children()[ 0 ]; // Name Input

                let comps     = $( panelSVG ).children();

                let selMenu   = $at_depth.children()[ 0 ];
                let node      = $.data( panelSVG, 'focus' );
                let fade      = $.data( panelSVG, 'fade' );

                let nodeTitle = $( node ).children()[ 2 ];


                doSave ? getPanelInputValues( panelSVG, [ gooeyUI, normalUI ] ) : console.log( '- DONT SAVE -' );


                let timeline  = new TimelineMax();


                // Temporary solution for hiding the creation panel
                    timeline.to( panelSVG, .5, { autoAlpha: 0 }, 0 );
                    timeline.to( gooeyUI , .5, { autoAlpha: 0 }, 0 );
                    timeline.to( normalUI, .5, { autoAlpha: 0 }, 0 );

                // Re-enable Pointer Events for Focus/Fade
                    timeline.to( fade, .25, { css: { pointerEvents: 'all' } }, .5 );
                    timeline.to( node, .25, { css: { pointerEvents: 'all' } }, .5 );


                // Title Reveal
                //     timeline.to( nodeTitle, .5, { css: { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0 } }, 0 );

                // Reveal Back Card
                //     timeline.to( comps[ 1 ], .5, { css: { scaleX: 0, transformOrigin: 'left', autoAlpha: 0 } }, 0 );
                //
                // // Show Edit Button
                //     timeline.to( comps[ 3 ], .5, { css: { scaleX: 0, transformOrigin: 'left', autoAlpha: 0 } }, 0 );
                //
                // // Reveal Card Text
                //     timeline.to( comps[ 2 ], .5, { css: { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0 } }, 0 );
                //
                // // Show Fade
                //     timeline.to( fade, 1, { autoAlpha: .2, ease: Back.easeOut }, 1 );


                // Call focusNode unless the corner node triggered this update
                    !cornerClose ? timeline.call( focusNode, [ node ], null, .5 ) : null;

                // Unhide the fade node if it exists
                    fade !== 'none' ? timeline.to( fade, 1, { autoAlpha: .2 }, .5 ) : null;

                timeline.call( removeElement, [ panelSVG ], null, .5 );
                timeline.call( removeElement, [ gooeyUI ], null, .5 );
                timeline.call( removeElement, [ normalUI ], null, .5 );
                timeline.call( removeElement, [ selMenu  ], null, .5 );

            }


    // -----------------------------------



    // ------ Delete Node Animation ------


        function deleteNodeAnimation() {

            // Panel / Delete Button
                let panelSVG  = $panel.children()[ 0 ];
                let deleteBtn = $( panelSVG ).children()[ 0 ];

            // Focus / Fade
                let node = $.data( panelSVG, 'focus' );
                let fade = $.data( panelSVG, 'fade' );

            // Icon Selection Menu
                let selMenu = $at_depth.children()[ 0 ];


            let timeline  = new TimelineMax();

            // Remove Delete Button Icon
                removeElement( $( deleteBtn ).children()[ 1 ] );

            // Remove Delete Button from Panel
                $at_depth.append( deleteBtn );

            // Shallow Portion of Hole, Covers "Sucked In" Objects
                let blackRect = blackHoleRect();
                $normalUI.append( blackRect );

            // Reskin Buttons to Black Hole
                timeline.to( $( deleteBtn ).children()[ 0 ], .25, { css: { fill: '#000000', stroke: '#bcffca', strokeWidth: 2, pointerEvents: 'none' } }, 0 );

            // Move Hole Right
                timeline.to( deleteBtn, .5, { attr: { x: 190, y: 0 }, ease: Back.easeOut }, 0 );

            // Stretch Hole
                timeline.to( $( deleteBtn ).children()[ 0 ], .5, { attr: { ry: 180 }, ease: Back.easeOut }, 0 );

            // Wrap Panel in Group
                let panelWrapper = wrapPanelComponents( panelSVG, node );

            // 'Suck' Panel into Hole
                timeline.to( panelWrapper, .5, { x: 50 , ease: Sine.easeIn }, 0 );
                timeline.to( panelWrapper, .5, { scaleX: 0, scaleY: 0.7, transformOrigin: 'right center', ease: Sine.easeIn }, 0.25 );

                timeline.to( $( panelSVG ).children()[ 4 ], .25, { autoAlpha: 0, ease: Sine.easeIn }, 0 );
                timeline.to( $( panelSVG ).children()[ 3 ], .25, { autoAlpha: 0, ease: Sine.easeIn }, 0 );

            // // Hide Black Rect
                timeline.set( blackRect, { autoAlpha: 0 }, .65 );

            // Shrink Hole
                timeline.to( $( deleteBtn ).children()[ 0 ], .5, { attr: { rx: 0, ry: 0 }, ease: Back.easeIn }, .65 ); // 1

            timeline.call( removeElement, [ deleteBtn ]   , null, 1.25 );
            timeline.call( removeElement, [ panelWrapper ], null, 1.25 );
            timeline.call( removeElement, [ selMenu ]     , null, 1.25 );
            timeline.call( removeElement, [ blackRect ]   , null, 1.25 );

            timeline.call( focusNode, [ fade ], null, 1.25 );

        }


            function wrapPanelComponents( panelSVG, node ) {

                let attr  = { id: "panel_wrapper" };
                let group = createGroup( attr );

                $panel.append( group );

                group.append( panelSVG );
                group.append( node );

                return group;

            }


    // -----------------------------------


    // ------ Node Element Creation ------


        // Create Child Nodes
            function createChildNodes( nodes ) {

                let childNodes = [];

                for ( let i = 0; i < nodes.length; i++ ) {

                    let childNode = createNode( nodes[ i ] );

                    appendChild( childNode );
                    childNodes.push( childNode );

                }

                getChildDestinations( childNodes );

            }


        // Create Node
            function createNode( nodeObj ) {

                let nodeEl = createNodeEl( nodeObj );

                bindData( nodeEl, nodeObj );

                return nodeEl;

            }


                function createNodeEl( nodeObj ) {

                    return new EllipseButton({

                        class: 'node_group',
                        id: nodeObj.model.id,
                        cx: xMid,
                        cy: yMid,
                        rx: nVars.childRadius,
                        ry: nVars.childRadius,
                        name: nodeObj.model.name,
                        text: nodeObj.model.text,
                        icon: nodeObj.model.icon,
                        imgURL: nodeObj.model.imgURL }, nodeClicked );

                }

                function bindData( el, obj ) {

                    $.data( el, 'root', obj.isRoot() );
                    $.data( el, 'model', obj );

                }


    // -----------------------------------



    // ------ Node Element Removal -------

        function removeElements( els ) {

            for( let i = 0; i < els.length; i++ ) { removeElement( els[ i ] ); }

        }

        function removeElement( el ) {

            $( el ).unbind();
            $( el ).remove();

        }

    // -----------------------------------



    // ---------- Helpers -----------


        // Save dimension vars from initialization to this module
            function saveVarsToView( viewVars, nodeVars ) {

                nVars = nodeVars;

                viewW = viewVars.viewWidth;
                viewH = viewVars.viewHeight;
                xMid  = viewVars.xMid;
                yMid  = viewVars.yMid;

            }


        // Get Child Destination Coords
            function getChildDestinations( childNodes ) {

                let coordArray  = calculateTargetCoords( childNodes.length, 0, nVars.projectRadius );

                animateChildren( childNodes, coordArray );

            }


        // Returns Array of Points Around a Circle
            function calculateTargetCoords( totalPoints, iStart, radius ) {

                let pointArray  = [];

                for ( let i = iStart; i < totalPoints; i++ ) {

                    let coord  = getPoint( radius, i, totalPoints ); // i + rotationFactor

                    pointArray.push( coord );

                }

                return pointArray;

            }


        // Returns Coordinate Pair
            function getPoint( radius, currentPoint, totalPoints ) {

                let theta = ( ( Math.PI * 2 ) / totalPoints );
                let angle = ( theta * currentPoint );

                let x = Math.round( ( radius * Math.cos( angle ) ) ); // + xMid;
                let y = Math.round( ( radius * Math.sin( angle ) ) ); // + yMid;

                return [ x, y ];

            }


        // Get Delete Alpha
            function getDeleteAlpha( panelSVG ) {

                let focus = $.data( panelSVG, 'focus' );
                let model = $.data( focus, 'model' );

                return model.isRoot() ? 0 : 1;

            }


    // -----------------------------------






    // ------ Touch Event Processing -----



    // -----------------------------------