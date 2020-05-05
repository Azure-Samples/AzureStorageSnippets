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
        // Submenu for security scenarios.
        //----------------------------------------------- 
        static bool Security()
        {
            Security security = new Security();

            while (security.MenuAsync().Result) { }

            return true;
        }

        //-----------------------------------------------
        // Submenu for diagnostic log scenarios.
        //----------------------------------------------- 
        static bool Monitoring()
        {
            Monitoring monitoring = new Monitoring();

            while (monitoring.Menu()){}

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
            Console.WriteLine("1) Security");
            Console.WriteLine("2) Monitoring");
            Console.WriteLine("3) Exit");
            Console.Write("\r\nSelect an option: ");
 
            switch (Console.ReadLine())
            {
                case "1":

                    return Security();

                case "2":

                    return Monitoring();          
                              
                case "3":
                   
                   return false;                
                
                default:
                   
                   return true;
            }
        }
    
    }    
}
