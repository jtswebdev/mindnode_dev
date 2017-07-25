/**
 * Created by jtsjordan on 7/3/17.
 */

export { createCoordinateSpace };


// Attribute Value Objects

    // View
        let viewVars = {

            viewDims   : 0,
            viewWidth  : 0,
            viewHeight : 0,
            xMid       : 0,
            yMid       : 0

        };

    // Node
        let nodeVars = {

            projectRadius  : 240,
            focusRadius    : 80,
            childRadius    : 30,
            iconMenuRadius : 200,

            fadeX : 0,
            fadeY : 0,

            cornerX : 0,
            cornerY : 0,

            expandedX : -165,
            expandedY : -200

        };


// --- Coordinate Space Calculations ---


    // Starts Process / Returns Results
        function createCoordinateSpace( callback ) {

            let process = setWidthAndHeight();

            callback( process );

        }

        function setWidthAndHeight() {

            viewVars.viewDims = getWindowDimensions();

            return roundWindowDimensions();

        }

        function getWindowDimensions() {

            let doc = document, w = window;

            let docEl = ( doc.compatMode && doc.compatMode === 'CSS1Compat' )?
                doc.documentElement: doc.body;

            let width  = docEl.clientWidth;
            let height = docEl.clientHeight;

            // mobile zoomed in?
            if ( w.innerWidth && width > w.innerWidth ) {
                width  = w.innerWidth;
                height = w.innerHeight;
            }

            return { width: width, height: height };

        }

        function roundWindowDimensions() {

            viewVars.viewWidth  = rd( viewVars.viewDims.width );
            viewVars.viewHeight = rd( viewVars.viewDims.height );

            return setMidPoints();

        }

        function setMidPoints() {

            viewVars.xMid = Math.round( viewVars.viewWidth * .5 );
            viewVars.yMid = Math.round( viewVars.viewHeight * .5 );

            return applyDimensionsToBody();

        }

        function applyDimensionsToBody() {

            let vW = viewVars.viewWidth;
            let vH = viewVars.viewHeight;

            $( 'body' ).css({ 'width': vW, 'height': vH });

            return getValuesForScreenSize( vW, vH );

        }

        function getValuesForScreenSize( vW, vH ) {

            let attrs;

            vW < 600 ? attrs = [ 130, 50, 30, 95, -150, -135, rd( vW * .3 ), rd( -vH * .3 ), rd( -vW * .35 ), rd( -vH * .4 ) ] : attrs = [ 240, 80, 30, 200, -175, -120, rd( -vW * .2 ), rd( -vH * .2 ), rd( -vW * .45 ), rd( -vH * .4 ) ];

            return setNodeDimensionValues( attrs );

        }

        function setNodeDimensionValues( attrs ) {

                nodeVars.projectRadius  = attrs[ 0 ];
                nodeVars.focusRadius    = attrs[ 1 ];
                nodeVars.childRadius    = attrs[ 2 ];
                nodeVars.iconMenuRadius = attrs[ 3 ];

                nodeVars.expandedX      = attrs[ 4 ];
                nodeVars.expandedY      = attrs[ 5 ];

                nodeVars.fadeX          = attrs[ 6 ];
                nodeVars.fadeY          = attrs[ 7 ];

                nodeVars.cornerX        = attrs[ 8 ];
                nodeVars.cornerY        = attrs[ 9 ];

            return returnValueObjects();

        }

        function returnValueObjects() {

            return [ viewVars, nodeVars ];

        }


// ---

    // Shorthand Math.round()
        function rd( val ) {

            return Math.round( val );

        }

// ---