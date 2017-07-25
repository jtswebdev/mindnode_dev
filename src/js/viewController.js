/**
 * Created by jtsjordan on 7/4/17.
 */


import { freshRender }           from "./views.js";
import { focusNode }             from "./views.js";
import { fadeNode }              from "./views.js";
import { cornerNode }            from "./views.js";
import { hideNode }              from "./views.js";
import { createNode }            from "./views.js";

import { panelRouterInterface }  from "./views.js";
import { removeElement }         from "./views.js";

import { calculateTargetCoords } from "./views.js";

import { saveTree }              from "./storage.js";

export { startViewController };

export { nodeClicked };
export { buttonClicked };

export { getPanelInputValues };
export { startSave };


//------------------------------------------------

// Background
    let $space = $( '.space_back' );

// Depth Container
    let $at_depth   = $( '.at_depth' );
    let $at_base    = $( '.at_component_base' );
    let $at_shallow = $( '.at_shallow' );

// Panel Container
    let $panel = $( '.panel_view_back' );
    let $panel_front = $( '.panel_view_front' );

// Node Containers
    let $root  = $( '.root_node_view' );
    let $focus = $( '.focus' );
    let $fade  = $( '.fade' );



    // Check for iOS Browser
        let isOnIOS   = navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
        let eventName = isOnIOS ? "pagehide" : "onbeforeunload";

        console.log( 'iOS Browser? : ' + isOnIOS );

    let tree;
    let root;

// -----------------------------------------------




        // Module Entry
            function startViewController( mainTree, mainRoot ) {

                tree = mainTree;
                root = mainRoot;

                $space.click( spaceClicked );

                freshRender( root );

            }



    // --- Navigation Methods ---


        function navigateDown( node ) {

            let currentFocus = getCurrentFocus();

            // Root to CORNER?
                handleRoot( currentFocus );

            // FADE current FOCUS
                fadeNode( currentFocus );

            // FOCUS node
                focusNode( node );

        }

        function navigateUp( node ) {

            // HIDE current FOCUS
                hideNode( $focus.children()[ 0 ] );

            // FOCUS node
                focusNode( node );

            // node.parent = new FADE
                checkFocusParent( $.data( node, 'model' ) );

        }

        function navigateJump( node ) {

            // HIDE current FOCUS
                hideNode( $focus.children()[ 0 ] );

            // HIDE current FADE
                hideNode( $fade.children()[ 0 ] );

            // FOCUS node
                focusNode( node );

        }



        // ----- Panel Logic -----


            // Check For Open Panel
                function checkPanelState( doClose, isCorner ) {

                    let activePanel = $panel.children()[ 0 ];

                    if ( activePanel && doClose ) {

                        closeActivePanels( activePanel, isCorner );

                    }

                    return $panel.children()[ 0 ];

                }


            // Close Active Panels Before Navigation
                function closeActivePanels( panel, isCorner ) {

                    let panelType = $.data( panel, 'panelType' );

                    panelType == 'nodeDetails' ? closeNodeDetails( isCorner ) : closeNodeCreation( isCorner );

                }

                // Close Node Details
                    function closeNodeDetails( isCorner ) {

                        hideIconSelection( true );
                        panelRouterInterface( 'hideDetails', { cornerClose: isCorner, doSave: true } );

                    }

                // Close Node Creation
                    function closeNodeCreation( isCorner ) {

                        hideIconSelection( true );
                        panelRouterInterface( 'hideNodeCreation', { cornerClose: isCorner, doSave: false } );

                    }


        // ----------------------



        // ----- Icon Selection Logic -----


            // Menu States

                // Reveal Icon Select Menu
                    function showIconSelection( selections, isNewNode ) {

                        let timeline = new TimelineMax();

                        // Alter Menu's Alignment by Panel Type
                            let points = isNewNode ? calculateTargetCoords( 29, 12, 260 ) : calculateTargetCoords( 30, 13, 260 );

                        for ( let i = 0; i < selections.length; i++ ) {

                            let point = points[ i ];

                            timeline.to( selections[ i ], .5, { attr: { x: point[ 0 ], y: point[ 1 ] }, autoAlpha: 1, ease: Back.easeOut }, 0 + (.1*i) );

                        }

                    }

                // Hide Icon Select Menu
                    function hideIconSelection( doQuick ) {

                        let depth    = $at_depth.children()[ 0 ];
                        let children = $( depth ).children();

                        let timeline = new TimelineMax();

                        let x = 0;
                        for ( let i = children.length - 1; i > -1; i-- ) {

                            timeline.to( children[ x ], doQuick ? .1 : .25, { attr: { x: 0, y: 0 }, autoAlpha: 0, ease: Back.easeIn }, doQuick ? 0 : 0 + (.1*i) );
                            x++;

                        }

                    }


            // Menu Action Router

                function iconToChange( selectionSVG ) {

                    let icon     = $( selectionSVG ).children()[ 1 ];
                    let iconPath = $( icon ).attr( 'xlink:href' );
                    let context  = $.data( selectionSVG, 'context' );

                    context === 'creation' ? changeCreationIcon( iconPath, selectionSVG.cloneNode( true ) ) : changeDetailsIcon( iconPath, selectionSVG.cloneNode( true ) );

                }


            // Menu Action Routes

                // Details

                    function changeDetailsIcon( iconPath, selClone ) {

                        $at_shallow.append( selClone );

                        let timeline = new TimelineMax();

                        // Move Selection to Target
                            timeline.to( selClone, .5, { attr: { x: -175, y: 0 }, ease: Power2.easeInOut }, 0 );

                        // Size Selection to Target
                            timeline.to( $( selClone ).children()[ 0 ], .5, { attr: { rx: 40, ry: 120 }, ease: Power2.easeInOut }, 0 );

                        // Fade Selection
                            timeline.to( selClone, 1, { autoAlpha: 0 }, .5 );

                        timeline.call( setDetailsIconPath, [ iconPath ], null, .5 );
                        timeline.call( removeElement, [ selClone ], null, 1 );

                    }

                    function setDetailsIconPath( iconPath ) {

                        let detailsWidget = $panel.children()[ 0 ];
                        let node          = $.data( detailsWidget, 'focus' );
                        let icon          = $( node ).children()[ 1 ];

                        $( icon ).attr( 'xlink:href', iconPath );

                    }

                // Creation

                    function changeCreationIcon( iconPath, selClone ) {

                        $at_base.append( selClone );

                        let timeline = new TimelineMax();

                        // Move Selection to Target
                            timeline.to( selClone, .5, { attr: { x: 0, y: 0 }, ease: Power2.easeInOut }, 0 );

                        // Size Selection to Target
                            timeline.to( $( selClone ).children()[ 0 ], .5, { attr: { rx: 120, ry: 120 }, ease: Power2.easeInOut }, 0 );

                        // Fade Selection
                            timeline.to( selClone, 1, { autoAlpha: 0 }, .5 );

                        timeline.call( setCreationIconPath, [ iconPath ], null, .5 );
                        timeline.call( removeElement, [ selClone ], null, 1 );

                    }

                    function setCreationIconPath( iconPath ) {

                        let creationWidget = $panel.children()[ 0 ];
                        let iconCanvas     = $( creationWidget ).children()[ 2 ];
                        let icon           = $( iconCanvas ).children()[ 1 ];

                        $( icon ).attr( 'xlink:href', iconPath );

                        TweenLite.set( icon, { autoAlpha: 1 } );

                    }


            // Menu Helpers

                // Returns: Array of Menu Selections
                    function getSelections() {

                        // Gather Selections
                        let selection = $at_depth.children()[ 0 ];
                        return $( selection ).children();

                    }


        // --------------------------------




        // ----- Edit Logic -----


            function setEditState( setActive ) {

                setActive ? editOn() : editOff();

            }


                function editOn() {

                    // Notify View Module
                        panelRouterInterface( 'edit', { node: getCurrentFocus() } );

                    // Show Menu Selection
                        showIconSelection( getSelections() );

                }

                function editOff() {

                    let panel = $panel.children()[ 0 ];

                    // Update Widget's Text Value
                        checkTextValues( panel );

                    // Update Widget's Name Value
                        checkNameValues( panel );

                    // Hide Menu Selection
                        hideIconSelection();

                    // Notify View Module
                        panelRouterInterface( 'stop_edit', { node: getCurrentFocus() } );

                }


            // Text
                function checkTextValues( panel ) {

                    // Panel Text / TextArea Values
                        let textValue     = getTextDivValue( panel );
                        let textAreaValue = getTextAreaValue( panel );

                    if ( textValue !== textAreaValue ) {

                        textValue = textAreaValue;

                    }

                    updatePanelTextValues( panel, textValue );

                    return textValue;

                }

                    function getTextDivValue( panel ) {

                        // Panel Text Div
                            let panelTextFO = $( panel ).children()[ 2 ];
                            let textDiv     = $( panelTextFO ).children()[ 0 ];

                        return textDiv.textContent;

                    }

                    function getTextAreaValue( panel ) {

                        // Panel Text Area
                            let panelTextAreaFO = $( panel ).children()[ 4 ];
                            let textArea        = $( panelTextAreaFO ).children()[ 0 ];

                        return $( textArea ).val();

                    }


                function updatePanelTextValues( panel, textValue ) {

                    // Panel Text Div
                        let panelTextFO = $( panel ).children()[ 2 ];
                        let textDiv     = $( panelTextFO ).children()[ 0 ];

                    textDiv.textContent = textValue;

                }


            // Name
                function checkNameValues( panel ) {

                    let node = getCurrentFocus();

                    // Panel Text / TextArea Values
                        let nameValue      = getNodeTitleValue( node );
                        let nameInputValue = getNameInputValue( panel );

                    if ( nameValue !== nameInputValue ) {

                        nameValue = nameInputValue;

                    }

                    updateNodeTitleValue( node, nameValue );

                    return nameValue;

                }

                    function getNodeTitleValue( node ) {

                        // Panel Text Div
                            let nodeTitleFO = $( node ).children()[ 2 ];
                            let nameDiv     = $( nodeTitleFO ).children()[ 0 ];

                        return nameDiv.textContent;

                    }

                    function getNameInputValue( panel ) {

                        // Panel Text Area
                            let panelNameInputFO = $( panel ).children()[ 5 ];
                            let form             = $( panelNameInputFO ).children()[ 0 ];
                            let nameInput        = $( form ).children()[ 0 ];

                        return $( nameInput ).val();

                    }


                function updateNodeTitleValue( node, nameValue ) {

                    // Panel Text Div
                        let nodeTitleFO = $( node ).children()[ 2 ];
                        let nameDiv     = $( nodeTitleFO ).children()[ 0 ];

                    nameDiv.textContent = nameValue;

                }


        // ----------------------




        // --- Click Handlers ---


            function spaceClicked( e ) {

                e.preventDefault();

                let activePanel = checkPanelState( true, false );

                if ( !activePanel ) {

                    panelRouterInterface( 'showNodeCreation', { node: getCurrentFocus(), fade: getCurrentFade() } );

                }

            }

            function nodeClicked( e ) {

                e.preventDefault();

                let nodeSVG = $( e.target ).parent()[ 0 ];
                let action  = $.data( nodeSVG, 'clickAction' );

                nodeEventRouter( nodeSVG, action );

            }

            function buttonClicked( e ) {

                e.preventDefault();

                let buttonSVG = $( e.target ).parent()[ 0 ];
                let action    = $.data( buttonSVG, 'clickAction' );

                buttonEventRouter( buttonSVG, action );


            }


        // ----------------------




        // ----- Routers -----


            // Node Event Router
                function nodeEventRouter( node, action ) {

                    switch( action ) {

                        case 'navigateDown':

                            navigateDown( node );
                            break;

                        case 'navigateUp':

                            navigateUp( node );
                            break;

                        case 'navigateJump':

                            checkPanelState( true, true );
                            navigateJump( node );
                            break;

                        case 'showDetails':

                            $.data( node, 'clickAction', 'hideDetails' );
                            panelRouterInterface( 'showDetails', { node: node, fade: getCurrentFade() } );
                            break;

                        case 'hideDetails':

                            $.data( node, 'clickAction', 'showDetails' );
                            hideIconSelection( true );
                            panelRouterInterface( 'hideDetails', { cornerClose: false, doSave: true } );
                            break;

                        default:

                            console.log( 'Unknown Event Type' );

                    }

                }

            // Button Event Router
                function buttonEventRouter( button, action ) {

                    switch ( action ) {

                        case 'edit':

                            $.data( button, 'clickAction', 'stop_edit' );
                            setEditState( true );
                            break;


                        case 'stop_edit':

                            $.data( button, 'clickAction', 'edit' );
                            setEditState( false );
                            break;


                        case 'delete':

                            console.log( '- DELETE PROCESS -' );
                            deleteNode( getCurrentFocus() );
                            hideIconSelection( true );
                            panelRouterInterface( 'delete', { node: getCurrentFocus() } );
                            break;


                        case 'confirm':

                            hideIconSelection( true );
                            panelRouterInterface( 'hideNodeCreation', { cornerClose: false, doSave: true } );
                            break;


                        case 'cancel':

                            hideIconSelection( true );
                            panelRouterInterface( 'hideNodeCreation', { cornerClose: false, doSave: false } );
                            break;


                        case 'showIconSelection':
                            console.log('show icon selection');
                            $.data( button, 'clickAction', 'hideIconSelection' );
                            showIconSelection( getSelections(), true );
                            break;


                        case 'hideIconSelection':

                            $.data( button, 'clickAction', 'showIconSelection' );
                            hideIconSelection();
                            break;


                        case 'changeIcon':

                            iconToChange( button );
                            break;

                        default:

                            console.log( 'Unknown Action: ' + action );

                    }

                }


        // --------------------



        // ----- Helpers -----


            // Find or make node to FADE
                function checkFocusParent( model ) {

                    if ( model.isRoot() ) {

                        // Do Nothing, Root Has No Parent

                    } else if ( model.parent.isRoot() ) {

                        // Root is Parent, FADE it
                        fadeNode( $root.children()[ 0 ] );

                    } else {

                        // Create el for FADE
                        let newFade = createNode( model.parent );

                        // Data to alter entrance animation
                        $.data( newFade, 'fromSpace', true );

                        fadeNode( newFade );

                    }

                }

            // Return Current Focus Node
                function getCurrentFocus() {

                    let currentFocus = $focus.children();

                    if ( currentFocus.length > 0 ) {

                        return currentFocus[ 0 ];

                    } else {

                        return $root.children()[ 0 ];

                    }

                }

            // Return Current Fade Node
                function getCurrentFade() {

                    let currentFade = $fade.children();

                    if ( currentFade.length > 0 ) {

                        return currentFade[ 0 ];

                    } else {

                        let currentFocus = getCurrentFocus();
                        let root         = $root.children()[ 0 ];
                        if ( currentFocus == root ) { return 'none'; } else { return root; }

                    }

                }

            // Root to CORNER ?
                function handleRoot( currentFocus ) {

                    // Send Root to CORNER if it would be removed
                    if ( !$.data( currentFocus, 'root' ) ) {

                        cornerNode( $root.children()[ 0 ] );

                    }

                }


        // -------------------



        // ----- Model Updates -----


            // Update Router
                function getPanelInputValues( panel, externalComps ) {

                    let panelType = $.data( panel, 'panelType' );

                    panelType == 'nodeDetails' ? getDetailsValues( panel ) : getCreationValues( panel, externalComps );

                }


                // Update Details

                    function getDetailsValues( panel ) {

                        let textValue = checkTextValues( panel );
                        let nameValue = checkNameValues( panel );

                        let node = $.data( panel, 'focus' );

                        // icon value
                            let nodeIcon    = $( node ).children()[ 1 ];
                            let iconPath    = $( nodeIcon ).attr( 'xlink:href' );
                            let iconValue   = iconPath.replace( 'src/styles/images/', '' );

                        let model = $.data( node, 'model' );

                        updateNodeValues( model, [ textValue, iconValue, nameValue ] );

                    }

                    function updateNodeValues( nodeObj, values ) {

                        nodeObj.model.text = values[ 0 ];
                        nodeObj.model.icon = values[ 1 ];
                        nodeObj.model.name = values[ 2 ];

                        // Save Changes If iOS
                            isOnIOS ? startSave() : null;

                    }


                // New Tree Node

                    function getCreationValues( panel, externalComps ) {

                                    // Panel Components
                                    let comps = $( panel ).children();
                                    let text  = externalComps[ 0 ];
                                    let name  = externalComps[ 1 ];

                                    // Parent Node & Model
                                    let parentNode = $.data( panel, 'focus' );
                                    let parentObj  = $.data( parentNode, 'model' );

                                    // Pull Icon Path from Canvas
                                    let nodeIcon  = $( comps[ 2 ] ).children()[ 1 ];
                                    let iconPath  = $( nodeIcon ).attr( 'xlink:href' );

                                    // Icon, Name, & Text Values for New Node
                                    let iconValue = iconPath.replace( 'src/styles/images/', '' );
                                    let nameValue = $( name ).find( '.text_input' )[ 0 ].value;
                                    let textValue = $( text ).find( '.text_input' )[ 0 ].value;

                                    addNodeToTree( parentObj, [ nameValue, iconValue, textValue ] );

                                }

                    function addNodeToTree( parentObj, values ) {

                        let newNode = tree.parse({ id: values[ 0 ], name: values[ 0 ], icon: values[ 1 ], text: values[ 2 ] });

                        parentObj.addChild( newNode );

                        startSave();

                    }


            // Delete Node
                function deleteNode( focus ) {

                    let node = $.data( focus, 'model' );
                    node.drop();

                    // Save Changes If iOS
                        isOnIOS ? startSave() : null;

                }


        // -------------------------



        // ----- Storage Methods -----


            function startSave() {

                // console.log( "-- Save --" );

                saveTree( root );

            }


        // ---------------------------


        // Save Data Before Window Close/Refresh
        //     window.onbeforeunload = function( e ) {
        //
        //         let dialogText = 'Oh sheeee...';
        //         startSave();
        //         // e.returnValue  = dialogText;
        //         // return dialogText;
        //
        //     };


        // let isOnIOS   = navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
        // let eventName = isOnIOS ? "pagehide" : "onbeforeunload";

        // console.log( 'iOS? : ' + isOnIOS );
        // console.log( 'Event Name: ' + eventName );

        if ( isOnIOS ) {

            // Save Data Before Window Close/Refresh
            //     document.unload = function( e ) {
            //
            //         let dialogText = 'Oh sheeee...';
            //         alert('Triggered.');
            //         startSave();
            //         // e.returnValue  = dialogText;
            //         // return dialogText;
            //
            //     };


        } else {

            // Save Data Before Window Close/Refresh
                window.onbeforeunload = function( e ) {

                    let dialogText = 'Oh sheeee...';
                    startSave();
                    // e.returnValue  = dialogText;
                    // return dialogText;

                };

        }
