import { WebsocketEventTypes } from '../enums';

export interface WebsocketEvent {
    type: WebsocketEventTypes;
    data: unknown;
}
