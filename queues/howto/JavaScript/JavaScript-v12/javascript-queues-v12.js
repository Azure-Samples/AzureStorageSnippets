// <Snippet_ImportStatements>
const { QueueClient, QueueServiceClient } = require("@azure/storage-queue");
// </Snippet_ImportStatements>

async function addMessages(queueClient, numMessages) {
    for (i = 1; i <= numMessages; i++)
    {
        message = "Message " + i.toString();
        console.log("Adding message: ", message);

        // Add a message to the queue
        await queueClient.sendMessage(message);
    }
}

async function main() {
    // <Snippet_CreateQueue>
    // Retrieve the connection from an environment
    // variable called AZURE_STORAGE_CONNECTION_STRING
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    // Create a unique name for the queue
    const queueName = "myqueue-" + Date.now().toString();

    console.log("Creating queue: ", queueName);

    // Instantiate a QueueServiceClient which will be used
    // to create a QueueClient and to list all the queues
    const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);

    // Get a QueueClient which will be used
    // to create and manipulate a queue
    const queueClient = queueServiceClient.getQueueClient(queueName);

    // Create the queue
    await queueClient.create();
    // </Snippet_CreateQueue>

    // <Snippet_AddMessage>
    messageText = "Hello, World";
    console.log("Adding message to the queue: ", messageText);

    // Add a message to the queue
    await queueClient.sendMessage(messageText);
    // </Snippet_AddMessage>

    // <Snippet_PeekMessage>
    // Peek at messages in the queue
    const peekedMessages = await queueClient.peekMessages({ numberOfMessages: 5 });

    for (i = 0; i < peekedMessages.peekedMessageItems.length; i++) {
        // Display the peeked message
        console.log("Peeked message: ", peekedMessages.peekedMessageItems[i].messageText);
    }
    // </Snippet_PeekMessage>

    // <Snippet_UpdateMessage>
    // Get the first message in the queue
    var receivedMessages = await queueClient.receiveMessages();
    const firstMessage = receivedMessages.receivedMessageItems[0];

    // Update the received message
    await queueClient.updateMessage(
        firstMessage.messageId,
        firstMessage.popReceipt,
        "This message has been updated"
    );
    // </Snippet_UpdateMessage>

    // <Snippet_DequeueMessage>
    // Get next message from the queue
    receivedMessages = await queueClient.receiveMessages();
    var message = receivedMessages.receivedMessageItems[0];

    console.log("Dequeuing message: ", message.messageText);

    await queueClient.deleteMessage(message.messageId, message.popReceipt);
    // </Snippet_DequeueMessage>

    await addMessages(queueClient, 20);

    // <Snippet_DequeueMessages>
    // Get up to 5 messages from the queue
    const receivedMsgsResp = await queueClient.receiveMessages({ numberOfMessages: 5, visibilityTimeout: 5 * 60 });

    for (i = 0; i < receivedMsgsResp.receivedMessageItems.length; i++)
    {
        message = receivedMsgsResp.receivedMessageItems[i];
        console.log("Dequeuing message: ", message.messageText);
        await queueClient.deleteMessage(message.messageId, message.popReceipt);
    }
    // </Snippet_DequeueMessages>

    // <Snippet_QueueLength>
    const properties = await queueClient.getProperties();
    console.log("Approximate queue length: ", properties.approximateMessagesCount);
    // </Snippet_QueueLength>

    // <Snippet_ListQueues>
    for await (const item of queueServiceClient.listQueues()) {
      console.log("Queue: ", item.name);
    }
    // </Snippet_ListQueues>

    // <Snippet_DeleteQueue>
    // Delete the queue
    console.log("Deleting queue: ", queueClient.name);
    await queueClient.delete();
    // </Snippet_DeleteQueue>
}

main().then(() => console.log("\nDone")).catch((ex) => console.log(ex.message));