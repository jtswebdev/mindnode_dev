/**
 * Created by jtsjordan on 7/3/17.
 */


export const rootModel = {

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