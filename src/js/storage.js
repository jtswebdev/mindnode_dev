/**
 * Created by jtsjordan on 7/4/17.
 */


export { saveTree };
export { getSavedTree };



    // --- Local Storage Save/Retrieve ---


        // Save to localStorage
            function saveTree( tree ) {


                let flatArray = [];

                flattenTree( tree );

                saveToLocalStorage( stringify( flatArray ) );


                // Replaces Circular References With IDs
                    function flattenTree( tree ) {

                        tree.all( function ( node ) {

                            let model    = node.model;
                            let childIDs = [];
                            let parentID;

                            parentID = model.id === 'meta_node' ? undefined : node.parent.model.id;

                            for ( let i = 0; i < node.children.length; i++ ) {

                                let currentChild = node.children[ i ];

                                childIDs.push( currentChild.model.id );

                            }

                            let flatNode      = new FlatNode( model );
                            flatNode.parent   = parentID;
                            flatNode.children = childIDs;

                            flatArray.push( flatNode );

                        });

                    }

                // Stringify Flat Nodes
                    function stringify( itemToSave ) {

                        return JSON.stringify( itemToSave );

                    }

                // Save String to localStorage
                    function saveToLocalStorage( flatTree ) {

                        localStorage.setItem( 'saved_tree', flatTree );

                    }


            }


        // Get From localStorage
            function getSavedTree() {


                // Get String From localStorage
                    function getFromLocalStorage( key ) {

                        return parseString( localStorage.getItem( key ) );

                    }

                // Parse Stringified Nodes
                    function parseString( itemToGet ) {

                        return JSON.parse( itemToGet );

                    }


                return getFromLocalStorage( 'saved_tree' );


            }


    // -----------------------------------



    // --- Flat Node Constructor ---


        function FlatNode( data ) {

            this.data     = data;
            this.parent   = null;
            this.children = [];

        }


    // -----------------------------