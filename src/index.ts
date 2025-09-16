import { WebSocketService } from "./services/WebSocketService.js"
import { Logger } from "./utils/logger.js";


async function main() {
    try {
        new WebSocketService(8080);
    } catch (error) {
        Logger.error(`Failed to start WS server: ${error}`)
    }
}

main();