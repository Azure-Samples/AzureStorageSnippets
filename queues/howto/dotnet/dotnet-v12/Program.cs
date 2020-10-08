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

namespace dotnet_v12
{
    class Program
    {      
        //-----------------------------------------------
        // Submenu for diagnostic log scenarios.
        //----------------------------------------------- 
        static bool Monitoring()
        {
            Monitoring monitoring = new Monitoring();

            while (monitoring.Menu()){}

            return true;
        }

        //-----------------------------------------------
        // Submenu for basic queue scenarios.
        //----------------------------------------------- 
        static bool QueueBasics()
        {
            QueueBasics queueBasics = new QueueBasics();

            while (queueBasics.Menu()){}

            return true;
        }


       //------------------------------------------------
       // Main function
       //------------------------------------------------
        static void Main(string[] args)
        {
            while (MainMenu()){}
        }

        //-----------------------------------------------
        // Main menu
        //-----------------------------------------------
        private static bool MainMenu()
        {
            Console.Clear();
            Console.WriteLine("Choose a feature area:");
            Console.WriteLine("1) Queue basics");
            Console.WriteLine("2) Monitoring");
            Console.WriteLine("X) Exit");
            Console.Write("\r\nSelect an option: ");
 
            switch (Console.ReadLine())
            {
                case "1":
                    return QueueBasics();

                case "2":
                    return Monitoring();

                case "X":
                case "x":
                   return false;
                
                default:
                   return true;
            }
        }
    
    }    
}
