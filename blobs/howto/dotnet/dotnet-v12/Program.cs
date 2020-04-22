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
