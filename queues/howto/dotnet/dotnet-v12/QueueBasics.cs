//----------------------------------------------------------------------------------
// Microsoft Developer & Platform Evangelism
//
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, 
// EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES 
// OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
//----------------------------------------------------------------------------------
// The example companies, organizations, products, domain names,
// e-mail addresses, logos, people, places, and events depicted
// herein are fictitious.  No association with any real company,
// organization, product, domain name, email address, logo, person,
// places, or events is intended or should be inferred.
//----------------------------------------------------------------------------------

// <snippet_UsingStatements>
using System; // Namespace for Console output
using System.Configuration; // Namespace for ConfigurationManager
using System.Threading.Tasks; // Namespace for Task
using Azure.Identity;
using Azure.Storage.Queues; // Namespace for Queue storage types
using Azure.Storage.Queues.Models; // Namespace for PeekedMessage
// </snippet_UsingStatements>

namespace dotnet_v12
{
    public class QueueBasics
    {
        // <snippet_CreateClient>
        //-------------------------------------------------
        // Create the queue service client
        //-------------------------------------------------
        public void CreateQueueClient(string queueName)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, queueName);
        }
        // </snippet_CreateClient>

        // <snippet_CreateQueue>
        //-------------------------------------------------
        // Create a message queue
        //-------------------------------------------------
        public bool CreateQueue(string queueName)
        {
            try
            {
                // Get the connection string from app settings
                string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

                // Instantiate a QueueClient which will be used to create and manipulate the queue
                QueueClient queueClient = new QueueClient(connectionString, queueName);

                // Create the queue
                queueClient.CreateIfNotExists();

                if (queueClient.Exists())
                {
                    Console.WriteLine($"Queue created: '{queueClient.Name}'");
                    return true;
                }
                else
                {
                    Console.WriteLine($"Make sure the Azurite storage emulator running and try again.");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}\n\n");
                Console.WriteLine($"Make sure the Azurite storage emulator running and try again.");
                return false;
            }
        }
        // </snippet_CreateQueue>

        // <Snippet_CreateQueueAsync>
        //-------------------------------------------------
        // Create a message queue
        //-------------------------------------------------
        public async Task<bool> CreateQueueAsync(Uri queueUri)
        {
            try
            {
                QueueClient queueClient = new QueueClient(queueUri, new DefaultAzureCredential());

                // Create the queue
                await queueClient.CreateIfNotExistsAsync();

                if (await queueClient.ExistsAsync())
                {
                    Console.WriteLine($"Queue created: '{queueClient.Name}'");
                    return true;
                }
                else
                {
                    Console.WriteLine($"Make sure the Azurite storage emulator running and try again.");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}\n\n");
                Console.WriteLine($"Make sure the Azurite storage emulator running and try again.");
                return false;
            }
        }
        // </Snippet_CreateQueueAsync>

        // <snippet_InsertMessage>
        //-------------------------------------------------
        // Insert a message into a queue
        //-------------------------------------------------
        public void InsertMessage(string queueName, string message)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, queueName);

            // Create the queue if it doesn't already exist
            queueClient.CreateIfNotExists();

            if (queueClient.Exists())
            {
                // Send a message to the queue
                queueClient.SendMessage(message);
            }

            Console.WriteLine($"Inserted: {message}");
        }
        // </snippet_InsertMessage>

        // <snippet_PeekMessage>
        //-------------------------------------------------
        // Peek at a message in the queue
        //-------------------------------------------------
        public void PeekMessage(string queueName)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, queueName);

            if (queueClient.Exists())
            { 
                // Peek at the next message
                PeekedMessage[] peekedMessage = queueClient.PeekMessages();

                // Display the message
                Console.WriteLine($"Peeked message: '{peekedMessage[0].Body}'");
            }
        }
        // </snippet_PeekMessage>

        // <snippet_UpdateMessage>
        //-------------------------------------------------
        // Update an existing message in the queue
        //-------------------------------------------------
        public void UpdateMessage(string queueName)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, queueName);

            if (queueClient.Exists())
            {
                // Get the message from the queue
                QueueMessage[] message = queueClient.ReceiveMessages();

                // Update the message contents
                queueClient.UpdateMessage(message[0].MessageId, 
                        message[0].PopReceipt, 
                        "Updated contents",
                        TimeSpan.FromSeconds(60.0)  // Make it invisible for another 60 seconds
                    );
            }
        }
        // </snippet_UpdateMessage>

        // <snippet_DequeueMessage>
        //-------------------------------------------------
        // Process and remove a message from the queue
        //-------------------------------------------------
        public void DequeueMessage(string queueName)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, queueName);

            if (queueClient.Exists())
            {
                // Get the next message
                QueueMessage[] retrievedMessage = queueClient.ReceiveMessages();

                // Process (i.e. print) the message in less than 30 seconds
                Console.WriteLine($"Dequeued message: '{retrievedMessage[0].Body}'");

                // Delete the message
                queueClient.DeleteMessage(retrievedMessage[0].MessageId, retrievedMessage[0].PopReceipt);
            }
        }
        // </snippet_DequeueMessage>

        // <snippet_GetQueueLength>
        //-----------------------------------------------------
        // Get the approximate number of messages in the queue
        //-----------------------------------------------------
        public void GetQueueLength(string queueName)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, queueName);

            if (queueClient.Exists())
            {
                QueueProperties properties = queueClient.GetProperties();

                // Retrieve the cached approximate message count.
                int cachedMessagesCount = properties.ApproximateMessagesCount;

                // Display number of messages.
                Console.WriteLine($"Number of messages in queue: {cachedMessagesCount}");
            }
        }
        // </snippet_GetQueueLength>

        // <snippet_DequeueMessages>
        //-----------------------------------------------------
        // Process and remove multiple messages from the queue
        //-----------------------------------------------------
        public void DequeueMessages(string queueName)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, queueName);

            if (queueClient.Exists())
            {
                // Receive and process 20 messages
                QueueMessage[] receivedMessages = queueClient.ReceiveMessages(20, TimeSpan.FromMinutes(5));

                foreach (QueueMessage message in receivedMessages)
                {
                    // Process (i.e. print) the messages in less than 5 minutes
                    Console.WriteLine($"De-queued message: '{message.Body}'");

                    // Delete the message
                    queueClient.DeleteMessage(message.MessageId, message.PopReceipt);
                }
            }
        }
        // </snippet_DequeueMessages>

        // <snippet_DeleteQueue>
        //-------------------------------------------------
        // Delete the queue
        //-------------------------------------------------
        public void DeleteQueue(string queueName)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, queueName);

            if (queueClient.Exists())
            {
                // Delete the queue
                queueClient.Delete();
            }

            Console.WriteLine($"Queue deleted: '{queueClient.Name}'");
        }
        // </snippet_DeleteQueue>

        // <snippet_AsyncQueue>
        //-------------------------------------------------
        // Perform queue operations asynchronously
        //-------------------------------------------------
        public async Task QueueAsync(string queueName)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, queueName);

            // Create the queue if it doesn't already exist
            await queueClient.CreateIfNotExistsAsync();

            if (await queueClient.ExistsAsync())
            {
                Console.WriteLine($"Queue '{queueClient.Name}' created");
            }
            else
            {
                Console.WriteLine($"Queue '{queueClient.Name}' exists");
            }

            // Async enqueue the message
            await queueClient.SendMessageAsync("Hello, World");
            Console.WriteLine($"Message added");

            // Async receive the message
            QueueMessage[] retrievedMessage = await queueClient.ReceiveMessagesAsync();
            Console.WriteLine($"Retrieved message with content '{retrievedMessage[0].Body}'");

            // Async delete the message
            await queueClient.DeleteMessageAsync(retrievedMessage[0].MessageId, retrievedMessage[0].PopReceipt);
            Console.WriteLine($"Deleted message: '{retrievedMessage[0].Body}'");

            // Async delete the queue
            await queueClient.DeleteAsync();
            Console.WriteLine($"Deleted queue: '{queueClient.Name}'");
        }
        // </snippet_AsyncQueue>

        //-------------------------------------------------
        // Basic queue operations menu
        //-------------------------------------------------
        public bool Menu()
        {
            string queueName = "myqueue";

            Console.Clear();
            Console.WriteLine("Choose a basic queue scenario:");
            Console.WriteLine("1) Create a queue");
            Console.WriteLine("2) Add messages to the queue");
            Console.WriteLine("3) Peek at next message");
            Console.WriteLine("4) Update message");
            Console.WriteLine("5) Get queue length");
            Console.WriteLine("6) Dequeue one message");
            Console.WriteLine("7) Dequeue multiple messages");
            Console.WriteLine("8) Delete queue");
            Console.WriteLine("9) Create a queue with Azure AD credentials");
            //Console.WriteLine("9) Async queue operations");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                // Create a queue
                case "1":
                    CreateQueue(queueName);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Add messages to the queue
                case "2":
                    // Insert 25 messages into the queue
                    for (int i = 1; i <= 25; i++)
                    {
                        string message = "Message number: " + i.ToString();
                        InsertMessage(queueName, message);
                    }
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Peek at next message
                case "3":
                    PeekMessage(queueName);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Update message
                case "4":
                    UpdateMessage(queueName);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Get queue length
                case "5":
                    GetQueueLength(queueName);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Dequeue one message
                case "6":
                    DequeueMessage(queueName);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Dequeue multiple messages
                case "7":
                    DequeueMessages(queueName);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Delete queue
                case "8":
                    DeleteQueue(queueName);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "9":
                    Uri queueUri = new Uri(string.Format("https://{0}.queue.core.windows.net/{1}",
                                                             Constants.storageAccountName,
                                                             Constants.queueName));

                    CreateQueueAsync(queueUri);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;


                // Async queue operations
                // case "9":
                //     await QueueAsync();
                //     Console.WriteLine("Press enter to continue");
                //     Console.ReadLine();
                //     return true;

                // Exit to the main menu
                case "X":
                case "x":
                    return false;

                default:
                    return true;
            }
        }
    }
}
