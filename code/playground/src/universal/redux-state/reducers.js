import { combineReducers } from "redux";
import { COMMAND_INITIALIZE, COMMAND_NOTE_ADD } from "../redux-actions/commands";
import { EVENT_ENTITY_EVENTS_FETCHING_SUCCEEDED } from "../redux-actions/events";
import { mergeEntityEventArrays } from "../entities/EntityEvent";
import { NoteEntity } from "../entities/NoteEntity";
import { CreateNoteEntityEvent } from "../entities/NoteEntityEvents";
import { EntityEventFactory, entityNamesToClasses } from "../entities/EntityEventFactory";

export const emptyState = () => {

    const entities = {};

    for (const entityName in entityNamesToClasses) {
        entities[entityName] = {
            allEvents: [],
            unsyncedEvents: [],
            calculatedEntities: [],
        };
    }

    return {
        entities: entities,
        debugInfo: ""
    };
};


const entities = (state = emptyState().entities, action) => {
    switch (action.type) {
        case COMMAND_INITIALIZE:
            return emptyState().entities;
        case COMMAND_NOTE_ADD: {
            const createNoteEntityEvent = CreateNoteEntityEvent.withTitle(action.noteTitle);
            const updatedAllEvents = state[NoteEntity.entityName()].allEvents.concat(createNoteEntityEvent);
            const updatedUnsyncedEvents = state[NoteEntity.entityName()].unsyncedEvents.concat(createNoteEntityEvent);
            const updatedCalculatedEntities = entityNamesToClasses[NoteEntity.entityName()].entityClass.createFromEntityEvents(updatedAllEvents);
            return {
                ...state,
                [NoteEntity.entityName()]: {
                    allEvents: updatedAllEvents,
                    unsyncedEvents: updatedUnsyncedEvents,
                    calculatedEntities: updatedCalculatedEntities
                }
            };
        }
        case EVENT_ENTITY_EVENTS_FETCHING_SUCCEEDED: {
            const receivedEntityEvents = action.json.map((entityEventObject) => EntityEventFactory.createEntityEventFromObject(entityEventObject));
            const updatedAllEvents = mergeEntityEventArrays(state[NoteEntity.entityName()].allEvents, receivedEntityEvents);
            const updatedCalculatedEntities = entityNamesToClasses[NoteEntity.entityName()].entityClass.createFromEntityEvents(updatedAllEvents);
            return {
                ...state,
                [NoteEntity.entityName()]: {
                    ...state[NoteEntity.entityName()],
                    allEvents: updatedAllEvents,
                    calculatedEntities: updatedCalculatedEntities
                }
            };
        }
        default:
            return state;
    }
};

const debugInfo = (state = emptyState().debugInfo, action) => {
    switch (action.type) {
        case COMMAND_INITIALIZE:
            return emptyState().debugInfo;
        case EVENT_ENTITY_EVENTS_FETCHING_SUCCEEDED:
            return JSON.stringify(action.json);
        default:
            return state;
    }
};

export const rootReducer = combineReducers({
    entities,
    debugInfo
});
