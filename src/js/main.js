
// import { rootModel }             from "./rootModel.js";

import { getSavedTree }          from "./storage.js";
import { createCoordinateSpace } from "./coordSpace.js";
import { startViewController }   from "./viewController.js";
import { saveVarsToView }        from "./views.js";
import { saveVarsToComponents }  from "./components.js";

let TreeModel = require( 'tree-model' );


let viewVars;
let nodeVars;

let tree;
let root;


$( document ).ready( function() {


    initializeApp();


});



// --- Initialize ---


    function initializeApp() {

        /* Module - coordSpace.js */
        // Sets Coordinate Space
        // Returns Two Attr Objects
        createCoordinateSpace( coordResponse );

    }


        function coordResponse( varObjects ) {

            viewVars = varObjects[ 0 ];
            nodeVars = varObjects[ 1 ];

            saveVarsToView( viewVars, nodeVars );
            saveVarsToComponents( viewVars, nodeVars );

            checkStorageForTree();

        }


        function checkStorageForTree() {

            let savedTree = getSavedTree();

            savedTree ? rebuildSavedTree( savedTree ) : populateTreeModel();

        }

        function rebuildSavedTree( savedTree ) {

            let obj = savedTree[ 0 ];

            tree = new TreeModel();
            root = tree.parse( obj.data );

            initializeInterface();

        }

        function populateTreeModel() {

            tree = new TreeModel();
            root = tree.parse( rootModel );

            initializeInterface();

        }


        function initializeInterface() {

            startViewController( tree, root );

        }


    // -----
        function testTree() {

            // Get node  id === "projects_node"
                let projectsNode = root.first( function( node ){

                   return node.model.id === 'projects_node';

                });

                console.log( projectsNode );

            // Get all nodes with no children
                let leafNodes = root.all( function( node ){

                    return node.children.length === 0;

                });

                console.log( leafNodes );

            // Drop node from tree, returns removed node
                projectsNode.drop();

            // Add node to tree
                let newProjectsNode = tree.parse( projectsNode );
                let oldSibling      = leafNodes[ 0 ];

                oldSibling.addChild( newProjectsNode );

            // Get node's path
                let path = newProjectsNode.getPath();

                // root --> schedule_node --> projects_node
                console.log( path );

        }
    // -----



const rootModel = {

    id: 'meta_node',
    children: [

        {
            id: 'schedule_node',
            children: [
                {
                    id: 'schedChild_node',
                    children: [
                        {
                            id: 'test2_node',
                            children: [],
                            icon: 'summaryIcon.png',
                            name: 'Level 3 Test',
                            text: 'Another test child for another depth.'
                        }
                    ],
                    icon: 'toParentIcon.png',
                    name: 'Level Two Test',
                    text: 'A test child with a hidden start.'
                }
            ],
            icon: 'scheduleIcon.png',
            name: 'Schedule Node',
            text: 'Make plans, set a timer, or save To-Dos.'
        },
        {
            id: 'projects_node',
            children: [],
            icon: 'projectIcon.png',
            name: 'Projects Node',
            text: 'Always know the next step with a solid project plan.'
        },
        {
            id: 'knowledge_node',
            children: [],
            icon: 'knowledgeIcon.png',
            name: 'Knowledge Node',
            text: 'Gain valuable insight on things by connecting dots.'
        },
        {
            id: 'notes_node',
            children: [],
            icon: 'noteIcon.png',
            name: 'Notes Node',
            text: 'Something on your mind? Jot it down!'
        }

    ],
    icon: 'atomIcon.png',
    name: 'Meta Node',
    text: 'This is the root node of the tree.'

};

/*

--- MODEL the DATA

        * Data Structure: Tree

            node:
                array of children
                ref to parent node Obj
                model obj

         * Data Traversal Methods:

            * Traverse Tree - Breadth First ( top down )
            * Traverse Tree - Depth First   ( bottom up )
            * Find Node ( id )
            * Find Parent
            * Find Children


--- VIEW the MODELS

        NAVIGATION VIEWS

           A) * Navigate Method ( Initial ):

                  1) takes node model as input
                  2) create  FOCUS  view for node
                  3) create  CHILD  views
                  4) create  PARENT view

           B) * Create Node Element Method

           C) * Adjust Element Style by Type ( FOCUS, CHILD,

                 - target node:     FOCUS
                 - target parent:   FADE
                 - target children: SHRINK
                 - everything else: HIDE

           D) * Place Elements

                 - FOCUS is centered
                 - parent is offset
                 - children are projected radially

            * Navigation Methods ( Secondary ):

                * clicked === CHILD

                    - FADE current FOCUS
                    - loop current CHILDREN
                        if === target
                            FOCUS
                        else
                            HIDE
                    - CHILD views for new FOCUS


                * clicked === PARENT

                    - FOCUS current FADE
                    - HIDE old FOCUS
                    - HIDE all CHILDREN
                    - CHILD views for new FOCUS


                * clicked === ROOT

                    - HIDE current FADE
                    - HIDE current FOCUS
                    - HIDE current CHILDREN

                    * Navigate Method ( Initial )

        NEW NODE VIEW

            click === space

                * New Node View

                    - Name : text_input
                    - Icon : selection menu

                    - Buttons:
                        - Save      (EDIT the MODELS)
                        - Cancel    (EDIT the MODELS)

        NODE DETAILS VIEW

            click === FOCUS

                * Node Details View

                    - Name : text
                    - Icon : image

                    - Buttons:
                        - Edit      (EDIT the MODELS)
                        - Delete    (EDIT the MODELS)


--- EDIT the MODELS

        * Data Manipulation Methods:

            * ADD NODE

                1) newNode = tree.parse( newNodeModel )

                2) parentNode.addChild( newNode )

                    ( parentNode defaults to current FOCUS )

            * REMOVE NODE

                1) nodeToDrop = Find Node ( id )

                2) nodeToDrop.drop()

            * EDIT NODE

                1) get Node to edit

                2) set node.model._attr-to-change_ = _attr-val_


--- STORE the MODELS

    * Store Tree


    * Retrieve Tree


    * Check Storage


 */