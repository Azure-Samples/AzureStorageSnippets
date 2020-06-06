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

namespace dotnet_v12
{
    class Program
    {      
        //-----------------------------------------------
        // Submenu for basic file scenarios.
        //----------------------------------------------- 
        static async Task<bool> FileShare()
        {
            FileShare fileShare = new FileShare();

            while (await fileShare.Menu()){}

            return true;
        }


       //------------------------------------------------
       // Main function
       //------------------------------------------------
        static async Task Main(string[] args)
        {
            // Only one set of scenarios 
            // for now, so just run it!
            await FileShare();

            // Uncomment when we have more scenarios
            //while (await MainMenu()){}
        }

        //-----------------------------------------------
        // Main menu
        //-----------------------------------------------
        private async static Task<bool> MainMenu()
        {
            Console.Clear();
            Console.WriteLine("Choose a feature area:");
            Console.WriteLine("1) Basic file share scenarios");
            Console.WriteLine("X) Exit");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":
                    return await FileShare();

                case "X":
                case "x":
                    return false;

                default:
                    return true;
            }
        }
    
    }    
}
