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

using System;
using System.Threading.Tasks;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Queue;

namespace QueueApp
{
    class Initial
    {
        static async Task SendNonExpiringMessageAsync(CloudQueue theQueue, string newMessage)
        {
            CloudQueueMessage message = new CloudQueueMessage(newMessage);

            // <snippet_SendNonExpiringMessage>
            await theQueue.AddMessageAsync(message, TimeSpan.FromSeconds(-1), null, null, null);
            // </snippet_SendNonExpiringMessage>
        }

        // <snippet_InitialRetrieveMessage>
        static async Task<string> RetrieveNextMessageAsync(CloudQueue theQueue)
        {
            if (await theQueue.ExistsAsync())
            {
                CloudQueueMessage retrievedMessage = await theQueue.GetMessageAsync();

                if (retrievedMessage != null)
                {
                    string theMessage = retrievedMessage.AsString;
                    await theQueue.DeleteMessageAsync(retrievedMessage);
                    return theMessage;
                }

                return null;
            }

            return null;
        }
        // </snippet_InitialRetrieveMessage>
    }

}
