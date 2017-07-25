/**
 * Created by jtsjordan on 7/3/17.
 */

import { buttonClicked }    from "./viewController.js";

export { saveVarsToComponents };

export { getEl };

export { RectButton };
export { CircleButton };
export { EllipseButton };

export { DrawInput };
export { TextInput };


export { DetailsWidget };
export { NodeCreationWidget };

export { createIconSelection };

export { blackHoleRect };

export { createGroup };

// Container
    let $at_depth = $( '.at_depth' );

// Node Property Obj
    let nVars;

// View Dimensions
    let viewW;
    let viewH;
    let xMid;
    let yMid;


// --- UI Components ---


    // ----- WIDGETS -----


        // Node Details
            function DetailsWidget( attr ) {

                let detailsSVG   = createSVG({ id: 'details_widget', class: 'widget_svg', vis: 'visible' });
                let detailsBack  = getDetailsBase();
                let detailsText  = getDetailsText( attr.text );

                let inputs       = getDetailsInputs( attr );

                $( inputs[ 2 ] ).css( 'visibility', 'hidden' );
                // $( inputs[ 3 ] ).css( 'visibility', 'hidden' );

                detailsSVG.append( inputs[ 1 ] );
                detailsSVG.append( detailsBack, detailsText );
                detailsSVG.append( inputs[ 0 ], inputs[ 2 ] );
                detailsSVG.append( inputs[ 3 ] );

                createIconSelection( 'details' );

                return detailsSVG;

            }


        // Node Creation
            function NodeCreationWidget( attr ) {

                attr.id = 'icon_canvas'; attr.class = 'canvas_back'; attr.vis = 'visible'; attr.visibility = 'visible'; attr.icon = 'imageIcon.png';

                let creationSVG = createSVG({ id: 'node_creation_widget', class: 'widget_svg', vis: 'visible' });
                let iconCanvas  = new EllipseButton( attr, buttonClicked );

                $.data( iconCanvas, 'clickAction', 'showIconSelection' );

                let inputs      = getCreationInputs( attr );

                // Appends
                    creationSVG.append( inputs[ 3 ], inputs[ 2 ] );
                    creationSVG.append( iconCanvas );
                    creationSVG.append( inputs[ 0 ], inputs[ 1 ] );

                createIconSelection( 'creation' );

                return creationSVG;

            }



        // ----- Widget Methods -----


            // Details
                function getDetailsBase() {

                    return createRect({ class: 'widget_back', x: xMid - 150, y: yMid - 62, width: 300, height: 125, vis: 'visible' });

                }
                function getDetailsText( text ) {

                    let textFO = createForeignObject({ 'class': 'details_text_fo', 'x': xMid - 120, 'y': yMid - 55, 'width': 205, 'height': 110, 'vis': 'visible' });
                    $( textFO ).append( $( "<div>", { class: "widget_text_div", text: text }) );

                    return textFO;

                }
                function getDetailsInputs( attr ) {

                    attr.icon = 'menuIcon.png'; attr.id = 'edit';
                    let editButton     = new RectButton( attr, buttonClicked ); attr.icon = 'deleteIcon.png'; attr.id = 'delete';
                    let deleteButton   = new EllipseButton( attr, buttonClicked ); attr.icon = 'imageIcon.png';

                    $.data( editButton, 'clickAction', 'edit' );
                    $.data( deleteButton, 'clickAction', 'delete' );

                    attr.x        = '' + xMid - 155;
                    attr.y        = '' + yMid - 25;
                    attr.width    = '' + 270;
                    attr.height   = '' + 135;

                    let textInput = new TextArea( attr );

                    attr.text = attr.name;
                    attr.id   = 'name';

                    let nameInput = new TextInput( attr );

                    return [ editButton, deleteButton, textInput, nameInput ];

                }

            // Creation
                function getCreationBase() {

                    return new IconCanvas( buttonClicked );

                }
                function getCreationInputs( attr ) {

                    // Text Inputs
                        attr.id = 'creation_name'; attr.text = 'Name'; let nameInput = new TextInput( attr );
                        attr.id = 'creation_text'; attr.text = 'Text'; let textInput = new TextInput( attr );

                    // Buttons
                        attr.id = 'confirm_creation'; attr.icon = "checkIcon.png"; let confirmButton = new EllipseButton( attr, buttonClicked );
                        attr.id = 'cancel_creation';  attr.icon = "closeIcon.png"; let cancelButton  = new EllipseButton( attr, buttonClicked );

                    $.data( confirmButton, 'clickAction', 'confirm' );
                    $.data( cancelButton, 'clickAction', 'cancel' );

                    return [ nameInput, textInput, confirmButton, cancelButton ];


                }

                function IconCanvas( attr ) {
                    attr.icon = 'plusIcon.png'; attr.id = 'canvas_back'; attr.class = 'canvas_back';
                    let canvasSVG  = createSVG({ id: 'icon_canvas', class: 'icon_canvas', vis: 'visible' });
                    let canvasBack = new EllipseButton({ attr, buttonClicked });
                    let canvasIcon = createImage({ 'class': 'icon_canvas_icon', 'icon': "plusIcon.png", 'x': xMid - 40, 'y': yMid - 40, 'width': '80', 'height': '80', 'vis': 'visible' });

                    $( canvasSVG ).append( canvasBack );
                    $( canvasSVG ).append( canvasIcon );

                    return canvasSVG;

                }



    // --------------------------




    // ----- SELECTION MENU -----



        // selectionType INTERFACE  --  ToDo


        // Creat Menu
            function createIconSelection( context ) {

                let selectionContainerSVG  = createSVG({ id: 'icon_selection_container', class: 'selection_container', vis: 'hidden' });

                $( selectionContainerSVG ).append( createSingleSelection( 'knowledgeIcon.png' , context ) );
                $( selectionContainerSVG ).append( createSingleSelection( 'nodeIcon.png'      , context ) );
                $( selectionContainerSVG ).append( createSingleSelection( 'noteIcon.png'      , context ) );
                $( selectionContainerSVG ).append( createSingleSelection( 'projectIcon.png'   , context ) );
                $( selectionContainerSVG ).append( createSingleSelection( 'scheduleIcon.png'  , context ) );

                $at_depth.append( selectionContainerSVG );

                return selectionContainerSVG;

            }

        // Create Single Menu Selection
            function createSingleSelection( icon, context ) {

                let iconName = icon.replace( '.png', '' );

                let selectionSVG  = createSVG({ id: 'icon_selection' + iconName, class: 'icon_selection', vis: 'visible' });
                let selectionBack = createEllipse({ class: 'selection_back', cx: xMid, cy: yMid, rx: '30', ry: '20', vis: 'hidden' });
                let selectionIcon = createImage({ 'class': 'selection_icon', 'icon': icon, 'x': xMid-10, 'y': yMid-10, 'width': ''+20, 'height': ''+20, 'vis': 'hidden' });

                $( selectionSVG ).append( selectionBack );
                $( selectionSVG ).append( selectionIcon );

                $.data( selectionSVG, 'clickAction', 'changeIcon' );
                $.data( selectionSVG, 'context', context );

                $( selectionSVG ).click( buttonClicked );

                return selectionSVG;

            }


    // --------------------------




    // ----- BUTTONS -----


        // Rect
            function RectButton( attr, callback ) {

                let type = 'svg_button';

                let buttonBase = getRectBase( attr, type, callback );
                let buttonIcon = getIcon( attr );
                let buttonText = getRectText( attr );

                $( buttonBase ).append( buttonIcon, buttonText );

                return buttonBase;

            }

        // Circle
            function CircleButton( attr, callback ) {

                // attr: [ cx, cy, r, text ]

                this.attr = attr;
                let buttonSVG  = createSVG({ id: attr.text + '_svg_button', class: 'svg_button', vis: 'visible' });
                let buttonBack = createCircle({ class: 'node', cx: attr.cx, cy: attr.cy, r: attr.r, vis: 'visible' });

                // HTML Text
                let textFO  = createForeignObject({ 'class': 'button_text_fo', 'x': attr.cx - .5 * attr.r, 'y': attr.cy - .5 * attr.r, 'width': attr.r, 'height': attr.r, 'vis': 'visible' });
                let textDiv = $( "<div>", { class: "button_text_div", text: attr.text });

                $( textFO ).append( textDiv );

                $( buttonSVG ).append( buttonBack );
                $( buttonSVG ).append( textFO );

                $( buttonBack ).click( callback );

                return buttonSVG;

            }

        // Ellipse
            function EllipseButton( attr, callback ) {

                let type = attr.class == 'node_group' ? attr.class : 'svg_button';

                let buttonBase = getEllipseBase( attr, type, callback );
                let buttonIcon = getIcon( attr );
                let buttonText = getEllipseText( attr );

                $( buttonBase ).append( buttonIcon, buttonText );

                return buttonBase;

            }



        // ----- Button Methods -----


            // Rect
                function getRectBase( attr, type, callback ) {

                    let buttonSVG  = createSVG({ id: attr.id + '_' + type, class: type, vis: 'hidden' });
                    let buttonBack = createRect({ class: 'svg_button_back', x: xMid - 25, y: yMid - 25, width: 50, height: 50, vis: 'visible' });

                    $( buttonSVG ).append( buttonBack );

                    $( buttonBack ).click( callback );

                    return buttonSVG;

                }
                function getRectText( attr ) {

                    let textFO = createForeignObject({ 'class': 'button_text_fo', 'x': xMid - 100, 'y': yMid - 50, 'width': 100, 'height': 50, 'vis': 'hidden' });
                    $( textFO ).append( $( "<div>", { class: "button_text_div", text: attr.name }) );

                    return textFO;

                }

            // Ellipse
                function getEllipseBase( attr, type, callback ) {

                    let backType;
                    if ( type == 'canvas_back' ) { backType = type }
                    else {  backType = type == 'svg_button' ? 'svg_button_back' : 'node'; }
                    // let backType = type == 'svg_button' ? 'svg_button_back' : 'node';
                    // let backType = attr.class;

                    let buttonSVG  = createSVG({ id: attr.id + '_' + type, class: type, vis: 'hidden' });
                    let buttonBack = createEllipse({ class: backType, cx: xMid, cy: yMid, rx: attr.rx, ry: attr.ry, vis: 'visible' });

                    $( buttonSVG ).append( buttonBack );

                    $( buttonBack ).click( callback );

                    return buttonSVG;

                }
                function getEllipseText( attr ) {

                    let textFO = createForeignObject({ 'class': 'button_text_fo', 'x': xMid + 50, 'y': yMid - 105, 'width': 250, 'height': 40, 'vis': 'hidden' });
                    $( textFO ).append( $( "<div>", { class: "button_text_div", text: attr.name }) );

                    return textFO;

                }


    // --------------------------




    // ----- INPUTS -----


        // Canvas
            function DrawInput() {

                let clickX     = [];
                let clickY     = [];
                let clickDrag  = [];
                let clickColor = [];
                let clickSize  = [];
                let clickTool  = [];

                let paint;

                let colorPurple = "#cb3594";
                let colorGreen  = "#659b41";
                let colorYellow = "#ffcf33";
                let colorBrown  = "#986928";
                let colorBlack  = "#000000";

                let strokeSizeObj = {

                    huge: 30,
                    large: 15,
                    normal: 5,
                    small: 2

                };

                let currentColor = colorBlack;
                let currentSize  = "large";
                let currentTool  = "marker";

                let canvasFO = document.getElementById( 'canvasFO' );
                let canvas   = canvasFO.getElementsByTagNameNS( "http://www.w3.org/1999/xhtml", 'canvas' )[ 0 ];
                let context  = canvas.getContext( '2d' );

                canvasContext = context;

                // TweenLite.to( canvasFO, 1, { x: '50%' } );
                TweenLite.to( canvas, 1, { autoAlpha: 1 } );

                function addClick( x, y, dragging ) {

                    clickX.push( x );
                    clickY.push( y );
                    clickDrag.push( dragging );

                    if ( currentTool == "eraser" ) {

                        clickColor.push( "white" );

                    } else {

                        clickColor.push( currentColor );

                    }

                    // clickColor.push( currentColor );
                    clickSize.push( currentSize );

                }

                function redraw() {

                    context.clearRect( 0, 0, context.canvas.width, context.canvas.height ); // Clears the canvas

                    context.lineJoin    = "round";

                    for( let i = 0; i < clickX.length; i++ ) {

                        context.beginPath();

                        if ( clickDrag[ i ] && i ) {

                            context.moveTo( clickX[ i - 1 ], clickY[ i - 1 ] );

                        } else {

                            context.moveTo( clickX[ i ] - 1, clickY[ i ] );

                        }

                        context.lineTo( clickX[ i ], clickY[ i ] );
                        context.closePath();
                        context.strokeStyle = clickColor[ i ];
                        context.lineWidth   = strokeSizeObj[ currentSize ];
                        context.stroke();

                    }

                    if ( currentTool == "crayon" ) {

                        context.globalAlpha = 0.4;
                        // context.drawImage( crayonTextureImage, 0, 0, 250, 250 );

                    } else {

                        context.globalAlpha = 1;

                    }

                }

                // Mouse DOWN
                function clickDown( e ) {

                    e.preventDefault();

                    let mouseX = e.pageX - this.offsetLeft;
                    let mouseY = e.pageY - this.offsetTop;

                    paint = true;

                    addClick( e.pageX - this.offsetLeft, e.pageY - this.offsetTop );
                    redraw();

                }
                function drag( e ) {

                    e.preventDefault();

                    if ( paint ) {

                        addClick( e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true );
                        redraw();

                    }

                }
                function clickUp( e ) {

                    e.preventDefault();

                    paint = false;

                }
                function leftBounds( e ) {

                    e.preventDefault();

                    paint = false;

                }

                canvas.addEventListener( startEvent, clickDown, false );
                canvas.addEventListener( endEvent, clickUp, false );
                canvas.addEventListener( moveEvent, drag, false );
                // canvas.addEventListener( startEvent, leftBounds, false );

            }


        // Text
            function TextInput( attr ) {

                // HTML Text Input
                    let textInputFO = createForeignObject({ 'class': 'text_input_fo', 'x': attr.x, 'y': attr.y, 'width': attr.width, 'height': attr.height, 'vis': 'visible' });
                    let form        = $( "<form>", { class: "text_input_form" } );
                    let textInput   = $( "<input>", { type: "text", name: "Name", value: attr.name ? attr.name : attr.text, id: attr.id + "_text_input", class: "text_input", text: attr.text });

                $( form ).append( textInput );

                $( textInputFO ).append( form );

                return textInputFO;

            }


        // Text Area
            function TextArea( attr ) {

                let textFO = createForeignObject({ 'class': 'details_text_fo', 'x': xMid - 120, 'y': yMid - 55, 'width': 205, 'height': 110, 'vis': 'visible' });
                $( textFO ).append( $( "<textarea>", { class: "widget_text_area", text: attr.text, cols: 8, rows: 1  }) );

                return textFO;

            }


    // -----------------

            function blackHoleRect() {

                return createRect({ class: 'black_hole_rect', x: xMid + 180, y: yMid - 100, width: 25, height: 200, vis: 'visible' });

            }

    // ----- ELEMENTS -----


    function getEl( type, attr ) {

        switch ( type ) {

            case 'circle':
                return createCircle( attr );

            case 'ellipse':
                return createEllipse( attr );

            case 'rect':
                return createRect( attr );

            case 'svgRect':
                return createSVGRect( attr );

            case 'path':
                return createPath( attr );

            case 'image':
                return createImage( attr );

            case 'customImage':
                return createCustomImage( attr );

            case 'text':
                return createText( attr );

            case 'g':
                return createGroup( attr );

            case 'svg':
                return createSVG( attr );

            case 'htmlText':
                return createHTMLText( attr );

            case 'foreignObject':
                return createForeignObject( attr );

            default:
                return 'Unknown';

        }

    }

    function getIcon( attr ) {

        if ( attr.imgURL ) {

            return createCustomImage({ 'icon': attr.imgURL, 'x': xMid - 17, 'y': yMid - 17, 'width': 34, 'height': 34, 'vis': 'visible' });

        } else {

            return createImage({ 'icon': attr.icon, 'x': xMid - 17, 'y': yMid - 17, 'width': 34, 'height': 34, 'vis': 'visible' });

        }

    }



    // --- SVG Elements ---


        function createCircle( attr ) {

            let circle = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );

            circle.setAttributeNS( null, 'class', attr.class || 'new_circle' );
            circle.setAttributeNS( null, 'cx', attr.cx || 0 );
            circle.setAttributeNS( null, 'cy', attr.cy || 0 );
            circle.setAttributeNS( null, 'r', attr.r || 30 );
            circle.setAttributeNS( null, 'cursor', 'pointer' );
            circle.setAttributeNS( null, 'visibility', attr.vis || 'visible' );

            return circle;

        }
        function createEllipse( attr ) {

            let ellipse = document.createElementNS( 'http://www.w3.org/2000/svg', 'ellipse' );

            ellipse.setAttributeNS( null, 'class', attr.class || 'new_ellipse' );
            ellipse.setAttributeNS( null, 'cx', attr.cx || 0 );
            ellipse.setAttributeNS( null, 'cy', attr.cy || 0 );
            ellipse.setAttributeNS( null, 'rx', attr.rx || 30 );
            ellipse.setAttributeNS( null, 'ry', attr.ry || 30 );
            ellipse.setAttributeNS( null, 'cursor', 'pointer' );
            ellipse.setAttributeNS( null, 'visibility', attr.vis || 'visible' );

            return ellipse;

        }
        function createRect( attr ) {

            let rectangle = document.createElementNS( 'http://www.w3.org/2000/svg', 'rect' );

            rectangle.setAttributeNS( null, 'class', attr.class || 'new_rect' );
            rectangle.setAttributeNS( null, 'x', attr.x || 0 );
            rectangle.setAttributeNS( null, 'y', attr.y || 0 );
            rectangle.setAttributeNS( null, 'width', attr.width || 100 );
            rectangle.setAttributeNS( null, 'height', attr.height || 35 );
            rectangle.setAttributeNS( null, 'cursor', 'pointer' );
            rectangle.setAttributeNS( null, 'visibility', attr.vis || 'visible' );

            return rectangle;

        }
        function createSVGRect( attr ) {

            let rectangle = document.createElementNS( 'http://www.w3.org/2000/svg', 'SVGRect' );

            rectangle.setAttributeNS( null, 'class', attr.class || 'new_svg_rect' );
            rectangle.setAttributeNS( null, 'x', attr.x || 0 );
            rectangle.setAttributeNS( null, 'y', attr.y || 0 );
            rectangle.setAttributeNS( null, 'width', attr.width || 50 );
            rectangle.setAttributeNS( null, 'height', attr.height || 50 );
            rectangle.setAttributeNS( null, 'cursor', 'pointer' );
            rectangle.setAttributeNS( null, 'visibility', attr.vis || 'visible' );

            return rectangle;

        }
        function createPath( attr ) {

            let path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );

            path.setAttribute( 'class', 'connector' );
            path.setAttribute( 'd', attr.d || '' );
            path.setAttribute( 'stroke', '#687886' );
            path.setAttribute( 'stroke-width', attr.strokeWidth || 2 );

            return path;

        }
        function createImage( attr ) {

            let icon = document.createElementNS('http://www.w3.org/2000/svg','image' );

            icon.setAttributeNS( 'http://www.w3.org/1999/xlink', 'xlink:href', "src/styles/images/" + ( attr.icon || 'atomIcon.png' ) );
            icon.setAttributeNS( null, 'class', attr.class || 'node_icon' );
            icon.setAttributeNS( null, 'height', attr.height || 50 );
            icon.setAttributeNS( null, 'width', attr.width || 50 );
            icon.setAttributeNS( null, 'x', attr.x || 0 );
            icon.setAttributeNS( null, 'y', attr.y || 0 );
            icon.setAttributeNS( null, 'visibility', attr.vis || 'visible' );
            icon.setAttributeNS( null, 'pointer-events', 'none' );

            return icon;

        }
        function createCustomImage( attr ) {

            let icon = document.createElementNS('http://www.w3.org/2000/svg','image' );

            icon.setAttributeNS( 'http://www.w3.org/1999/xlink', 'xlink:href', attr.icon );
            icon.setAttributeNS( null, 'class', 'node_icon' );
            icon.setAttributeNS( null, 'height', attr.height || 100 );
            icon.setAttributeNS( null, 'width', attr.width || 100 );
            icon.setAttributeNS( null, 'x', attr.x || 0 );
            icon.setAttributeNS( null, 'y', attr.y || 0 );
            icon.setAttributeNS( null, 'visibility', attr.vis || 'visible' );
            icon.setAttributeNS( null, 'pointer-events', 'none' );

            return icon;

        }
        function createText( attr ) {

            let newText = document.createElementNS( 'http://www.w3.org/2000/svg','text' );

            newText.setAttributeNS( null, 'class', attr.class || 'new_text' );
            newText.setAttributeNS( null, 'x', attr.x || 0 );
            newText.setAttributeNS( null, 'y', attr.y || 0 );
            newText.setAttributeNS( null, 'font-family', 'Arial, Helvetica, sans-serif' );
            newText.setAttributeNS( null, 'font-size', attr.fontSize || 16 );
            newText.setAttributeNS( null, 'pointer-events', 'none' );
            newText.setAttributeNS( null, 'visibility', attr.vis || 'visible' );

            newText.textContent = attr.title;

            return newText;
        }
        function createGroup( attr ) {

            let newGroup = document.createElementNS( 'http://www.w3.org/2000/svg', 'g' );

            newGroup.setAttributeNS( null, 'id', attr.id );
            newGroup.setAttributeNS( null, 'class', attr.class || 'new_group' );
            newGroup.setAttributeNS( null, 'visibility', attr.vis || 'visible' );

            return newGroup;

        }
        function createSVG( attr ) {

            let newSVG = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );

            newSVG.setAttributeNS( null, 'id', attr.id );
            newSVG.setAttributeNS( null, 'class', attr.class || 'new_svg' );
            newSVG.setAttributeNS( null, 'visibility', attr.vis || 'visible' );
            newSVG.setAttributeNS( null, 'x', 0 );
            newSVG.setAttributeNS( null, 'y', 0 );

            return newSVG;

        }
        function createHTMLText( attr, text ) {

            // HTML Text
            let textFO  = createForeignObject({ 'class': 'html_text_fo', 'x': attr.oX || 0, 'y': (attr.oY + ( attr.height * .3 )) || 0, 'width': attr.width || 150, 'height': (attr.height * .5 ) || 35, 'vis': 'visible' });
            let textDiv = $( "<div>", { class: "html_text_div", text: text });

            $( textFO ).append( textDiv );

            return textFO;

        }
        function createTextArea() {



        }
        function createForeignObject( attr ) {

            let newFO = document.createElementNS( 'http://www.w3.org/2000/svg', 'foreignObject' );

            newFO.setAttributeNS( null, 'class', attr.class || 'new_foreign_object' );
            newFO.setAttributeNS( null, 'x', attr.x || 0 );
            newFO.setAttributeNS( null, 'y', attr.y || 0 );
            newFO.setAttributeNS( null, 'width', attr.width || 150 );
            newFO.setAttributeNS( null, 'height', attr.height || 40 );
            newFO.setAttributeNS( null, 'visibility', attr.vis || 'visible' );

            return newFO;

        }


    // --------------------




    // Save dimension vars from initialization to this module
        function saveVarsToComponents( viewVars, nodeVars ) {

            nVars = nodeVars;

            viewW = viewVars.viewWidth;
            viewH = viewVars.viewHeight;
            xMid = viewVars.xMid;
            yMid = viewVars.yMid;

        }