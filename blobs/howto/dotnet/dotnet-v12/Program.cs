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
        static bool DiagnosticLogs()
        {
            DiagnosticLogs diagnosticLogs = new DiagnosticLogs();

            while (diagnosticLogs.Menu()){}

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
            Console.WriteLine("1) Diagnostic logs (classic)");
            Console.WriteLine("2) Feature area 2");
            Console.WriteLine("3) Feature area 3");
            Console.WriteLine("4) Exit");
            Console.Write("\r\nSelect an option: ");
 
            switch (Console.ReadLine())
            {
                case "1":
                    
                    return DiagnosticLogs();
                
                case "2":
                   
                   return true;               
                
                case "3":
                   
                   return true;
                
                case "4":
                   
                   return false;                
                
                default:
                   
                   return true;
            }
        }
    
    }    
}
