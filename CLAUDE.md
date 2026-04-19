We are going to work in Invoice generator for bluetooth invoice printing machine.

Mobile app for generating and sending QR2-style tickets via Bluetooth ESC/POS. Declarative template → interpreted on the client → printed on 58mm thermal paper. Supports company logos.

This is the flow of the application.
Control Panel → New Note → Add Entry → Preview → Print

Check the "Design reference location" in this file for futher details

TECHNICAL SPECIFICATIONS OF THE PRINTER USED FOR TESTING - 58MM THERMAL PRINTER
Model: Portable Thermal Receipt Printer (POS Type)
Printing Method: Direct thermal (no ink required)
Paper Width: 58 mm
Effective Print Width: 48 mm
Resolution: 203 DPI (8 dots/mm)
Print Speed: 70 mm/s - 90 mm/s
Interface: Bluetooth and USB port
Print Commands: ESC/POS (Standard)
Characters per Line: 32 characters (Font A) / 42 characters (Font B)
Maximum Paper Roll Diameter: 40 mm
Paper type: Standard thermal paper
Compatibility: Android, iOS, and Windows
Battery: Rechargeable lithium (7.4V / 1500mAh - 2000mAh depending on version)
Print head life: 50 km - 100 km of printed paper

Stack: Expo SDK 54, TypeScript, chosen Bluetooth + printer libraries
Rule: "Do not modify app.json, eas.json, or native folders without asking"
Rule: "Use functional components + hooks, no class components"
Folder conventions: (e.g., /screens, /components, /services/bluetooth)
Design reference location: "Go to /design folder, read its readme, and implement the relevant aspects of the design. 
Implement: TicketPOS App.html.
This was made with Claude Design, the main project must be in React native components"

App Name: Notavo
Notavo turns your phone into a pocket-sized cash register — create sale notes, calculate totals, and print receipts to any Bluetooth thermal printer in seconds.

Three-feature bullet version:
  - 🧾  Create sale notes with items, taxes, discounts, and change calculation
  - 🖨️ Print over Bluetooth to any 58mm ESC/POS thermal printer
  - 📚 Keep history offline — every ticket saved, searchable, reprintable

