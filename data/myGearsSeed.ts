/**
 * قائمة المعدات من جدول My Gears (Google Sheets)
 * المصدر: https://docs.google.com/spreadsheets/d/1iRroxaLRLIZdqRd7tAF2fi-OLukeQOrQ9ODCPxaT3pA/edit?usp=sharing
 */

export interface MyGearsRow {
  type: string;
  name: string;
  quantity: number;
  brand: string;
  condition: string;
}

export const MY_GEARS_SEED: MyGearsRow[] = [
  { type: 'Camera', name: 'Camera A7IV Body', quantity: 1, brand: 'Sony', condition: 'Good' },
  { type: 'Lens', name: '20mm Viltrox F2.8', quantity: 1, brand: 'Viltrox', condition: 'Good' },
  { type: 'Lens', name: '24 - 105 F4 Sony G', quantity: 1, brand: 'Sony', condition: 'Good' },
  { type: 'Lens', name: '17 - 28 F2.8 Tamron', quantity: 1, brand: 'Tamron', condition: 'Good' },
  { type: 'Lens', name: '85mm F1.4 Manual Focus', quantity: 1, brand: 'Samyang', condition: 'Good' },
  { type: 'Lens', name: '50mm F1.8 Sony', quantity: 1, brand: 'Sony', condition: 'Normal' },
  { type: 'Battery', name: 'NP-FZ100 Sony Battery', quantity: 2, brand: 'Sony', condition: 'Good' },
  { type: 'Battery', name: 'NP-FZ100 Sony Battery', quantity: 1, brand: '-', condition: 'Missing' },
  { type: 'Lights', name: 'Godox TL 30', quantity: 2, brand: 'Godox', condition: 'Good' },
  { type: 'Lights', name: 'Godox SL60D', quantity: 1, brand: 'Godox', condition: 'Good' },
  { type: 'Lights', name: 'Godox speedlight for Sony mirrorless TTL HSS', quantity: 1, brand: 'Godox', condition: 'Good' },
  { type: 'Monitor', name: 'Portkeys PT6 5.2-Inch Camera Monitor with 600nits Brightness', quantity: 1, brand: 'Portkeys', condition: 'Good' },
  { type: 'Battery', name: 'Monitor Battery NP-F970', quantity: 1, brand: '-', condition: 'Normal' },
  { type: 'Lights', name: 'Softbox 90CM Neewer', quantity: 1, brand: 'Neewer', condition: 'Good' },
  { type: 'Lights', name: 'Softbox 55CM Neewer', quantity: 1, brand: 'Neewer', condition: 'Good' },
  { type: 'Lights', name: 'Light Reflector 90*120CM', quantity: 1, brand: '-', condition: 'Good' },
  { type: 'Lights', name: 'T - Shape Stand', quantity: 1, brand: 'Neewer', condition: 'Good' },
  { type: 'Lights', name: 'RGB Light Box Square', quantity: 2, brand: '-', condition: 'Good' },
  { type: 'Lights', name: 'Snoot Light Shape', quantity: 1, brand: 'DF DIGITALFOTO', condition: 'Good' },
  { type: 'Lights', name: 'Green/Blue Portable Screen 100* 150 CM', quantity: 1, brand: 'E winner', condition: 'Good' },
  { type: 'Lights', name: 'Light Stand', quantity: 1, brand: 'Neewer', condition: 'Good' },
  { type: 'Accessories', name: 'Camera Slider', quantity: 1, brand: '-', condition: 'Good' },
  { type: 'Accessories', name: '72" Camera Tripod', quantity: 1, brand: 'Neewer', condition: 'Good' },
  { type: 'Accessories', name: 'Camera Tripod', quantity: 1, brand: '-', condition: 'Good' },
  { type: 'Accessories', name: 'Mobile Tripod', quantity: 1, brand: '-', condition: 'Good' },
  { type: 'Accessories', name: 'Dji Ronin RS3', quantity: 1, brand: 'DJI', condition: 'Good' },
  { type: 'Accessories', name: 'Magic Arm', quantity: 1, brand: 'Neewer', condition: 'Good' },
  { type: 'Accessories', name: 'RS3 Vertical Mount', quantity: 1, brand: 'DF DIGITALFOTO', condition: 'Good' },
  { type: 'Battery', name: 'NP-F970 Battery Charger', quantity: 1, brand: '-', condition: 'Good' },
  { type: 'Accessories', name: 'Camera Cooling Fan', quantity: 1, brand: 'DF DIGITALFOTO', condition: 'Good' },
  { type: 'Microphone', name: 'Boya link Mic Single', quantity: 1, brand: 'Boya', condition: 'Good' },
  { type: 'Accessories', name: 'HDMI Cable', quantity: 3, brand: '-', condition: 'Good' },
  { type: 'Drone', name: 'Dji Drone 4K Mini', quantity: 1, brand: 'DJI', condition: 'Good' },
  { type: 'Accessories', name: 'L Bracket', quantity: 1, brand: '-', condition: 'Good' },
  { type: 'Battery', name: 'Engoin NF-Z100 Battery Charger', quantity: 1, brand: 'Engoin', condition: 'Good' },
  { type: 'Storage', name: 'SanDisk SD Card 128 GB', quantity: 1, brand: 'SanDisk', condition: 'Good' },
  { type: 'Storage', name: 'SanDisk SD Card 256 GB', quantity: 1, brand: 'SanDisk', condition: 'Good' },
  { type: 'Accessories', name: 'K&F ND Filter 88mm', quantity: 1, brand: 'K&F', condition: 'Good' },
  { type: 'Battery', name: 'NF-Z100 Battery Charging Case with 2 batteries', quantity: 1, brand: 'Neewer', condition: 'Good' },
  { type: 'Storage', name: 'Lexar Pro SD CARD 256 GB', quantity: 1, brand: 'Lexar', condition: 'Arriving soon' },
  { type: 'Microphone', name: 'Holly Land Lark Mark 2', quantity: 1, brand: 'Holly Land', condition: 'Good' },
  { type: 'Accessories', name: 'DJI RS5 Combo', quantity: 1, brand: 'DJI', condition: 'Good' },
  { type: 'Drone Accessories', name: 'Drone battery Charging Case With 2 Batteries', quantity: 1, brand: '-', condition: 'Normal' },
  { type: 'Drone Accessories', name: 'Drone Case', quantity: 1, brand: '-', condition: 'Arriving Soon' },
  { type: 'Storage', name: 'SSD San Disk 2TB', quantity: 1, brand: 'SanDisk', condition: 'Good' },
  { type: 'Storage', name: 'SSD San Disk 2TB', quantity: 1, brand: 'SanDisk', condition: 'Good' },
  { type: 'Telepromter', name: 'Teleprompter 12 Inch', quantity: 1, brand: 'Neewer', condition: 'Good' },
  { type: 'Laptop', name: 'Macbook Pro M3 Max 16.2" 1TB SSD, 48GB RAM', quantity: 1, brand: 'Apple', condition: 'Good' },
  { type: 'Laptop', name: 'Macbook Pro M1, 13", 256GB SSD, 8GB RAM', quantity: 1, brand: 'Apple', condition: 'Good' },
  { type: 'ipad', name: 'ipad air 11" M2 256GB', quantity: 1, brand: 'Apple', condition: 'Good' },
  { type: 'iphone', name: 'iphone 15 Pro Max 256GB', quantity: 1, brand: 'Apple', condition: 'Good' },
  { type: 'iphone', name: 'iphone 7 Plus 128GB', quantity: 1, brand: 'Apple', condition: 'Normal' },
  { type: 'Monitor', name: 'Viewsonic 27" LCD', quantity: 1, brand: 'Viewsonic', condition: 'Good' },
  { type: 'Keyboard', name: 'Magic Keyboard', quantity: 1, brand: 'Apple', condition: 'Normal' },
  { type: 'Mouse', name: 'Magic Mouse', quantity: 1, brand: 'Apple', condition: 'Good' },
  { type: 'Mouse', name: 'Ugreen wireless mouse', quantity: 1, brand: 'Ugreen', condition: 'Good' },
  { type: 'Battery', name: 'Monitor pack batteries with charger 2 batteries NF-P550', quantity: 1, brand: 'Neewer', condition: 'Arriving Soon' },
];
