package com.queues.howto;

import java.time.Duration;

/**
 * Azure queue storage v12 SDK how-to
 */

// <Snippet_ImportStatements>
// Include the following imports to use queue APIs
import com.azure.core.util.*;
import com.azure.storage.queue.*;
import com.azure.storage.queue.models.*;
// </Snippet_ImportStatements>

public class App {
    public static void main(String[] args) {

        // <Snippet_ConnectionString>
        // Define the connection-string with your values
        final String connectStr = 
            "DefaultEndpointsProtocol=https;" +
            "AccountName=your_storage_account;" +
            "AccountKey=your_storage_account_key";
        // </Snippet_ConnectionString>

        String queueName = createQueue(connectStr);

        if (null != queueName) {
            addQueueMessage(connectStr, queueName, "Hello, World");
            peekQueueMessage(connectStr, queueName);
            updateQueueMessage(connectStr, queueName, "Hello, World", "Updated contents");
            updateFirstQueueMessage(connectStr, queueName, "Updated first message");

            // Wait 30 seconds for the message to become visible again
            try
            {
                System.out.println("Pausing for 30 seconds for updated message to become visible...");
                Thread.sleep(30000);
            }
            catch (InterruptedException e)
            {
                e.printStackTrace();
            }

            getQueueLength(connectStr, queueName);
            dequeueMessage(connectStr, queueName);

            // Add 20 messages to the queue
            for (int i = 0; i < 20; i++)
            {
                addQueueMessage(connectStr, queueName, String.format("Message %02d", i + 1));
            }

            dequeueMessages(connectStr, queueName);
            listQueues(connectStr);
            deleteMessageQueue(connectStr, queueName);
        }

    }

    // <Snippet_CreateQueue>
    public static String createQueue(String connectStr)
    {
        try
        {
            // Create a unique name for the queue
            String queueName = "queue-" + java.util.UUID.randomUUID();

            System.out.println("Creating queue: " + queueName);

            // Instantiate a QueueClient which will be
            // used to create and manipulate the queue
            QueueClient queue = new QueueClientBuilder()
                                    .connectionString(connectStr)
                                    .queueName(queueName)
                                    .buildClient();

            // Create the queue
            queue.create();
            return queue.getQueueName();
        }
        catch (QueueStorageException e)
        {
            // Output the exception message and stack trace
            System.out.println("Error code: " + e.getErrorCode() + "Message: " + e.getMessage());
            return null;
        }
    }
    // </Snippet_CreateQueue>

    // <Snippet_AddMessage>
    public static void addQueueMessage
        (String connectStr, String queueName, String messageText)
    {
        try
        {
            // Instantiate a QueueClient which will be
            // used to create and manipulate the queue
            QueueClient queueClient = new QueueClientBuilder()
                                        .connectionString(connectStr)
                                        .queueName(queueName)
                                        .buildClient();

            System.out.println("Adding message to the queue: " + messageText);

            // Add a message to the queue
            queueClient.sendMessage(messageText);
        }
        catch (QueueStorageException e)
        {
            // Output the exception message and stack trace
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }
    // </Snippet_AddMessage>

    // <Snippet_PeekMessage>
    public static void peekQueueMessage
        (String connectStr, String queueName)
    {
        try
        {
            // Instantiate a QueueClient which will be
            // used to create and manipulate the queue
            QueueClient queueClient = new QueueClientBuilder()
                                        .connectionString(connectStr)
                                        .queueName(queueName)
                                        .buildClient();

            // Peek at the first message
            PeekedMessageItem peekedMessageItem = queueClient.peekMessage();
            System.out.println("Peeked message: " + peekedMessageItem.getMessageText());
        }
        catch (QueueStorageException e)
        {
            // Output the exception message and stack trace
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }
    // </Snippet_PeekMessage>

    // <Snippet_UpdateSearchMessage>
    public static void updateQueueMessage
        (String connectStr, String queueName,
        String searchString, String updatedContents)
    {
        try
        {
            // Instantiate a QueueClient which will be
            // used to create and manipulate the queue
            QueueClient queueClient = new QueueClientBuilder()
                                        .connectionString(connectStr)
                                        .queueName(queueName)
                                        .buildClient();

            // The maximum number of messages to retrieve is 32
            final int MAX_MESSAGES = 32;

            // Iterate through the queue messages
            for (QueueMessageItem message : queueClient.receiveMessages(MAX_MESSAGES))
            {
                // Check for a specific string
                if (message.getMessageText().equals(searchString))
                {
                    // Update the message to be visible in 30 seconds
                    queueClient.updateMessage(message.getMessageId(),
                                              message.getPopReceipt(),
                                              updatedContents,
                                              Duration.ofSeconds(30));
                    System.out.println(
                        String.format("Found message: \'%s\' and updated it to \'%s\'",
                                        searchString,
                                        updatedContents)
                                      );
                    break;
                }
            }
        }
        catch (QueueStorageException e)
        {
            // Output the exception message and stack trace
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }
    // </Snippet_UpdateSearchMessage>

    // <Snippet_UpdateFirstMessage>
    public static void updateFirstQueueMessage
        (String connectStr, String queueName, String updatedContents)
    {
        try
        {
            // Instantiate a QueueClient which will be
            // used to create and manipulate the queue
            QueueClient queueClient = new QueueClientBuilder()
                                        .connectionString(connectStr)
                                        .queueName(queueName)
                                        .buildClient();

            // Get the first queue message
            QueueMessageItem message = queueClient.receiveMessage();

            // Check for a specific string
            if (null != message)
            {
                // Update the message to be visible in 30 seconds
                UpdateMessageResult result = queueClient.updateMessage(message.getMessageId(),
                                                                       message.getPopReceipt(),
                                                                       updatedContents,
                                                                       Duration.ofSeconds(30));
                System.out.println("Updated the first message with the receipt: " +
                        result.getPopReceipt());
            }
        }
        catch (QueueStorageException e)
        {
            // Output the exception message and stack trace
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }
    // </Snippet_UpdateFirstMessage>

    // <Snippet_GetQueueLength>
    public static void getQueueLength(String connectStr, String queueName)
    {
        try
        {
            // Instantiate a QueueClient which will be
            // used to create and manipulate the queue
            QueueClient queueClient = new QueueClientBuilder()
                                        .connectionString(connectStr)
                                        .queueName(queueName)
                                        .buildClient();

            QueueProperties properties = queueClient.getProperties();
            long messageCount = properties.getApproximateMessagesCount();

            System.out.println(String.format("Queue length: %d", messageCount));
        }
        catch (QueueStorageException e)
        {
            // Output the exception message and stack trace
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }
    // </Snippet_GetQueueLength>

    // <Snippet_DequeueMessage>
    public static void dequeueMessage(String connectStr, String queueName)
    {
        try
        {
            // Instantiate a QueueClient which will be
            // used to create and manipulate the queue
            QueueClient queueClient = new QueueClientBuilder()
                                        .connectionString(connectStr)
                                        .queueName(queueName)
                                        .buildClient();

            // Get the first queue message
            QueueMessageItem message = queueClient.receiveMessage();

            // Check for a specific string
            if (null != message)
            {
                System.out.println("Dequeing message: " + message.getMessageText());

                // Delete the message
                queueClient.deleteMessage(message.getMessageId(), message.getPopReceipt());
            }
            else
            {
                System.out.println("No visible messages in queue");
            }
        }
        catch (QueueStorageException e)
        {
            // Output the exception message and stack trace
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }
    // </Snippet_DequeueMessage>

    // <Snippet_DequeueMessages>
    public static void dequeueMessages(String connectStr, String queueName)
    {
        try
        {
            // Instantiate a QueueClient which will be
            // used to create and manipulate the queue
            QueueClient queueClient = new QueueClientBuilder()
                                        .connectionString(connectStr)
                                        .queueName(queueName)
                                        .buildClient();

            // The maximum number of messages to retrieve is 20
            final int MAX_MESSAGES = 20;

            // Retrieve 20 messages from the queue with a
            // visibility timeout of 300 seconds (5 minutes)
            for (QueueMessageItem message : queueClient.receiveMessages(MAX_MESSAGES,
                    Duration.ofSeconds(300), Duration.ofSeconds(1), new Context("key1", "value1")))
            {
                // Do processing for all messages in less than 5 minutes,
                // deleting each message after processing.
                System.out.println("Dequeing message: " + message.getMessageText());
                queueClient.deleteMessage(message.getMessageId(), message.getPopReceipt());
            }
        }
        catch (QueueStorageException e)
        {
            // Output the exception message and stack trace
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }
    // </Snippet_DequeueMessages>

    // <Snippet_ListQueues>
    public static void listQueues(String connectStr)
    {
        try
        {
            // Instantiate a QueueServiceClient which will be
            // used to list the queues
            QueueServiceClient queueServiceClient = new QueueServiceClientBuilder()
                                        .connectionString(connectStr)
                                        .buildClient();

            // Loop through the collection of queues.
            for (QueueItem queue : queueServiceClient.listQueues())
            {
                // Output each queue name.
                System.out.println(queue.getName());
            }
        }
        catch (QueueStorageException e)
        {
            // Output the exception message and stack trace
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }
    // </Snippet_ListQueues>

    // <Snippet_DeleteMessageQueue>
    public static void deleteMessageQueue(String connectStr, String queueName)
    {
        try
        {
            // Instantiate a QueueClient which will be
            // used to create and manipulate the queue
            QueueClient queueClient = new QueueClientBuilder()
                                        .connectionString(connectStr)
                                        .queueName(queueName)
                                        .buildClient();

            System.out.println("Deleting queue: " + queueClient.getQueueName());

            // Delete the queue
            queueClient.delete();
        }
        catch (QueueStorageException e)
        {
            // Output the exception message and stack trace
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }
    // </Snippet_DeleteMessageQueue>
}
