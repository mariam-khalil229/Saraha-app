import { EventEmitter } from "events";

export const eventEmitter = new EventEmitter();

eventEmitter.on("confirmationEmail", async (fn) => {
    await fn();
});


export default eventEmitter;