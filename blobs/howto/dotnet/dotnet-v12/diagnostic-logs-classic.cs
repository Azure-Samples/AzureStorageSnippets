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

using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System;

namespace dotnet_v12
{
    public class DiagnosticLogs
    {

        //-------------------------------------------------
        // Enable diagnostic logs
        //-------------------------------------------------

        public void EnableDiagnosticLogs()
        {
            var connectionString = Constants.connectionString;

            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            BlobServiceProperties serviceProperties = blobServiceClient.GetProperties().Value;

            serviceProperties.Logging.Delete = true;

            BlobRetentionPolicy retentionPolicy = new BlobRetentionPolicy();
            retentionPolicy.Enabled = true;
            retentionPolicy.Days = 2;
            serviceProperties.Logging.RetentionPolicy = retentionPolicy;

            blobServiceClient.SetProperties(serviceProperties);

            Console.WriteLine("Diagnostic logs are now enabled");
        }

        //-------------------------------------------------
        // Diagnostic logs snippet 2
        //-------------------------------------------------

        public void ExampleSnippet2(){

            Console.WriteLine("Snippet code goes for Example 2 goes in here");
        }

        //-------------------------------------------------
        // Diagnostic log menu
        //-------------------------------------------------
        
        public bool Menu()
        {
            Console.Clear();
            Console.WriteLine("Choose a diagnostic log scenario:");
            Console.WriteLine("1) Scenario 1");
            Console.WriteLine("2) Scenario 2");
            Console.WriteLine("3) Return to main menu");
            Console.Write("\r\nSelect an option: ");
 
            switch (Console.ReadLine())
            {
                case "1":
                   
                   EnableDiagnosticLogs();
                   Console.WriteLine("Press enter to continue");   
                   Console.ReadLine();          
                   return true;
                
                case "2":
                
                   ExampleSnippet2();
                   Console.WriteLine("Press enter to continue"); 
                   Console.ReadLine();              
                   return true;
                
                case "3":
                
                   return false;
                
                default:
                
                   return true;
            }
        }
        
    }

    


    
}
