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

// <snippet_AllCode>
using System;
// <snippet_UsingStatements>
using System.Threading.Tasks;
using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
// </snippet_UsingStatements>

namespace QueueApp
{
    class Program
    {
        // <snippet_Main>
        static async Task Main(string[] args)
        {
        // <snippet_DeclareConnectionString>
            string connectionString = Environment.GetEnvironmentVariable("AZURE_STORAGE_CONNECTION_STRING");
        // </snippet_DeclareConnectionString>

        // <snippet_CreateQueueClient>
            QueueClient queue = new QueueClient(connectionString, "mystoragequeue");
        // </snippet_CreateQueueClient>

            if (args.Length > 0)
            {
                string value = String.Join(" ", args);
                await InsertMessageAsync(queue, value);
                Console.WriteLine($"Sent: {value}");
            }
            else
            {
                string value = await RetrieveNextMessageAsync(queue);
                Console.WriteLine($"Received: {value}");
            }

            Console.Write("Press Enter...");
            Console.ReadLine();
        }
        // </snippet_Main>

        // <snippet_InsertMessage>
        static async Task InsertMessageAsync(QueueClient theQueue, string newMessage)
        {
            if (null != await theQueue.CreateIfNotExistsAsync())
            {
                Console.WriteLine("The queue was created.");
            }

            await theQueue.SendMessageAsync(newMessage);
        }
        // </snippet_InsertMessage>

        // <snippet_RetrieveMessage>
        static async Task<string> RetrieveNextMessageAsync(QueueClient theQueue)
        {
            if (await theQueue.ExistsAsync())
            {
                QueueProperties properties = await theQueue.GetPropertiesAsync();

                if (properties.ApproximateMessagesCount > 0)
                {
                    QueueMessage[] retrievedMessage = await theQueue.ReceiveMessagesAsync(1);
                    string theMessage = retrievedMessage[0].Body.ToString();
                    await theQueue.DeleteMessageAsync(retrievedMessage[0].MessageId, retrievedMessage[0].PopReceipt);
                    return theMessage;
                }
                else
                {
                    Console.Write("The queue is empty. Attempt to delete it? (Y/N) ");
                    string response = Console.ReadLine();

                    if (response.ToUpper() == "Y")
                    {
                        await theQueue.DeleteIfExistsAsync();
                        return "The queue was deleted.";
                    }
                    else
                    {
                        return "The queue was not deleted.";
                    }
                }
            }
            else
            {
                return "The queue does not exist. Add a message to the command line to create the queue and store the message.";
            }
        }
        // </snippet_RetrieveMessage>
    }
}
// </snippet_AllCode>
