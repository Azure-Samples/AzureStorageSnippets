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
using Azure.Storage.Queues; // Namespace for Queue storage types
using Azure.Storage.Queues.Models; // Namespace for PeekedMessage
// </snippet_UsingStatements>

namespace dotnet_v12
{
    public class QueueBasics
    {
        //-------------------------------------------------
        // Create the queue service client
        //-------------------------------------------------
        public void CreateQueueClient()
        {
            // <snippet_CreateClient>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["storageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "myqueue");
            // </snippet_CreateClient>
        }

        //-------------------------------------------------
        // Create a message queue
        //-------------------------------------------------
        public void CreateQueue()
        {
            // <snippet_CreateQueue>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["storageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "myqueue");

            // Create the queue
            queueClient.CreateIfNotExists();
            // </snippet_CreateQueue>
        }

        public void InsertMessage(string message)
        {
            // CreateQueue() must be called before this method

            // <snippet_InsertMessage>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "myqueue");

            if (queueClient.Exists())
            {
                // Send a message to the queue
                queueClient.SendMessage(message);
            }
            // </snippet_InsertMessage>
        }

        public void PeekMessage()
        {
            // <snippet_PeekMessage>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "myqueue");

            if (queueClient.Exists())
            { 
                // Peek at the next message
                PeekedMessage[] peekedMessage = queueClient.PeekMessages();

                // Display the message
                Console.WriteLine(peekedMessage[0].MessageText);
            }
            // </snippet_PeekMessage>
        }

        public void UpdateMessage()
        {
            // <snippet_UpdateMessage>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "myqueue");

            if (queueClient.Exists())
            {
                // Get the message from the queue
                QueueMessage[] message = queueClient.ReceiveMessages();

                // Update the message contents
                queueClient.UpdateMessage(message[0].MessageId, 
                        message[0].PopReceipt, 
                        "Updated contents.",
                        TimeSpan.FromSeconds(60.0)  // Make it invisible for another 60 seconds
                    );
            }
            // </snippet_UpdateMessage>
        }

        public void DequeueMessage()
        {
            // <snippet_DequeueMessage>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "myqueue");

            if (queueClient.Exists())
            {
                // Get the next message
                QueueMessage[] retrievedMessage = queueClient.ReceiveMessages();

                //Process the message in less than 30 seconds, and then...

                // Delete the message
                queueClient.DeleteMessage(retrievedMessage[0].MessageId, retrievedMessage[0].PopReceipt);
            }
            // </snippet_DequeueMessage>
        }

        public void GetQueueLength()
        {
            // <snippet_GetQueueLength>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "myqueue");

            if (queueClient.Exists())
            {
                QueueProperties properties = queueClient.GetProperties();

                // Retrieve the cached approximate message count.
                int cachedMessagesCount = properties.ApproximateMessagesCount;

                // Display number of messages.
                Console.WriteLine("Number of messages in queue: " + cachedMessagesCount);
            }
            // </snippet_GetQueueLength>
        }

        public void DequeueMessages()
        {
            // <snippet_DequeueMessages>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "myqueue");

            if (queueClient.Exists())
            {
                // Receive and process 20 messages
                QueueMessage[] receivedMessages = queueClient.ReceiveMessages(20, TimeSpan.FromMinutes(5));

                foreach (QueueMessage message in receivedMessages)
                {
                    // Display the message
                    Console.WriteLine(message.MessageText);

                    //Process the message in less than 30 seconds, and then...

                    // Delete the message
                    queueClient.DeleteMessage(message.MessageId, message.PopReceipt);
                }
            }
            // </snippet_DequeueMessages>
        }

        public void DeleteQueue()
        {
            // <snippet_DeleteQueue>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "myqueue");

            if (queueClient.Exists())
            {
                // Delete the queue
                queueClient.Delete();
            }
            // </snippet_DeleteQueue>
        }

        public async Task<bool> QueueAsync()
        {
            // <snippet_AsyncQueue>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "myqueue");

            // Create the queue if it doesn't already exist
            await queueClient.CreateIfNotExistsAsync();

            if (await queueClient.ExistsAsync())
            {
                Console.WriteLine("Queue '{0}' Created", queueClient.Name);
            }
            else
            {
                Console.WriteLine("Queue '{0}' Exists", queueClient.Name);
            }

            // Async enqueue the message
            await queueClient.SendMessageAsync("Hello, World");
            Console.WriteLine("Message added");

            // Async receive the message
            QueueMessage[] retrievedMessage = await queueClient.ReceiveMessagesAsync();
            Console.WriteLine("Retrieved message with content '{0}'", retrievedMessage[0].MessageText);

            // Async delete the message
            await queueClient.DeleteMessageAsync(retrievedMessage[0].MessageId, retrievedMessage[0].PopReceipt);
            Console.WriteLine("Deleted message");

            // Async delete the queue
            await queueClient.DeleteAsync();
            Console.WriteLine("Deleted queue");
            // </snippet_AsyncQueue>

            return true;
        }

        //-------------------------------------------------
        // Basic queue operations menu
        //-------------------------------------------------
        public bool Menu()
        {
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
            //Console.WriteLine("9) Async queue operations");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                // Create a queue
                case "1":
                    CreateQueue();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Add messages to the queue
                case "2":
                    // Insert 25 messages into the queue
                    for (int i = 1; i <= 25; i++)
                    {
                        string message = "Message number: " + i.ToString();
                        InsertMessage(message);
                        Console.WriteLine("Inserted: " + message);
                    }
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Peek at next message
                case "3":
                    PeekMessage();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Update message
                case "4":
                    UpdateMessage();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Get queue length
                case "5":
                    GetQueueLength();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Dequeue one message
                case "6":
                    DequeueMessage();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Dequeue multiple messages
                case "7":
                    DequeueMessages();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Delete queue
                case "8":
                    DeleteQueue();
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
