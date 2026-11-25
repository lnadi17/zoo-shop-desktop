# Shop Desktop

An offline Georgian-language inventory and checkout app for one Windows workstation. The executable contains the shop interface, local server, and SQLite database engine.

[გახსენით გამოშვების გვერდი](https://github.com/lnadi17/zoo-shop-desktop/releases/latest)

## მაღაზიის თანამშრომლის გზამკვლევი

### 1. პროგრამის ჩამოტვირთვა და გაშვება

1. გამოშვების გვერდზე, **Assets** განყოფილებაში, აირჩიეთ **Shop-Windows-x64.exe**. GitHub-ის ანგარიში არ გჭირდებათ. ფაილი განკუთვნილია 64-ბიტიანი Windows-ისთვის.
2. ორჯერ დააწკაპუნეთ ჩამოტვირთულ ფაილზე. გაიხსნება შავი კონსოლის ფანჯარა და ბრაუზერში გამოჩნდება „მაღაზია“. მუშაობისას კონსოლი ღია დატოვეთ. თუ ბრაუზერი თავისით არ გაიხსნა, კონსოლიდან დააკოპირეთ მისამართი, რომელიც იწყება `http://127.0.0.1:`-ით, და ჩასვით ბრაუზერის მისამართის ველში.
3. პირველ გაშვებაზე პროდუქციის სია ცარიელია. მომდევნო დღეებში იმავე კომპიუტერზე და Windows-ის იმავე მომხმარებლის ანგარიშით გაუშვით პროგრამა, რომ თქვენი მარაგი და ისტორია დაგხვდეთ. ჩამოტვირთვის შემდეგ მუშაობა ინტერნეტის გარეშეც შეგიძლიათ.

### 2. პირველი პროდუქტისა და საწყისი მარაგის შეყვანა

1. გახსენით **პროდუქცია → პროდუქტის დამატება**.
2. **კოდი** ველში ჩაწერეთ ან დაასკანერეთ შტრიხკოდი. თუ პროდუქტს შტრიხკოდი არ აქვს, მიანიჭეთ უნიკალური კოდი. შეავსეთ **სახელი** და აირჩიეთ **ტიპი**. დასაწყისისთვის შეგიძლიათ დატოვოთ „სხვა“.
3. რაოდენობის ტიპად აირჩიეთ **ცალობითი** ან **წონითი**. ველში **გაყიდვის ფასი** ჩაწერეთ ერთი ცალის ან ერთი კილოგრამის ფასი ლარში.
4. **რაოდენობები** განყოფილების პირველ სტრიქონში მიუთითეთ მიღებული რაოდენობა და **ასაღები ფასი** — რამდენი დაგიჯდათ ერთი ცალი ან ერთი კილოგრამი. დააჭირეთ **დასტური** და გადაამოწმეთ ნაშთი პროდუქციის სიაში.

მაგალითად, თუ მიიღეთ 10 შეკვრა ჩაი, თითოეული 4 ₾ დაგიჯდათ და 6 ₾-ად ყიდით, აირჩიეთ „ცალობითი“. რაოდენობა იქნება **10**, ასაღები ფასი **4**, გაყიდვის ფასი კი **6**.

### 3. ახალი პარტიის მიღება და ფასის შეცვლა

**პროდუქცია** გვერდზე იპოვეთ არსებული პროდუქტი. დიდ სიაში მის მოსაძებნად გამოიყენეთ **ფილტრი** და შეიყვანეთ სახელი ან კოდი. პროდუქტის სტრიქონის მარჯვნივ დააჭირეთ **რედაქტირება** ხატულას.

- **ახალი პარტიის მისაღებად** დააჭირეთ დამატების ნიშნულს **რაოდენობები** ველთან. ახალ სტრიქონში ჩაწერეთ მხოლოდ ახლად მიღებული რაოდენობა და ამ პარტიის ერთეულის შესყიდვის ფასი. წინა პარტიების ნაშთები დატოვეთ თავიანთ სტრიქონებში. გაყიდვისას პროგრამა მარაგს ჯერ ყველაზე ძველი პარტიიდან აკლებს.
- **საცალო ფასის შესაცვლელად** განაახლეთ **გაყიდვის ფასი**. ცვლილებების შესანახად დააჭირეთ **დასტური** და სიაში გადაამოწმეთ ახალი ფასი ან ნაშთი.

### 4. როგორ გაატაროთ გაყიდვა

1. გახსენით **გაყიდვა**. ველში **პროდუქტის სახელი ან შტრიხკოდი** დაასკანერეთ კოდი. ხელით შეყვანისას აკრიფეთ სრული კოდი და დააჭირეთ **Enter**, ან ჩაწერეთ სახელის ნაწილი და სიიდან აირჩიეთ პროდუქტი.
2. კალათაში შეამოწმეთ რაოდენობა და ერთეულის ფასი. ცალობით პროდუქტზე ჩაწერეთ მთელი რიცხვი. წონით პროდუქტზე რაოდენობა კილოგრამებში შეიყვანეთ — მაგალითად, **250 გრამი = 0.250 კგ**. დაამატეთ მომხმარებლის დანარჩენი პროდუქტებიც.
3. შეცდომით დამატებული სტრიქონის მოსაშორებლად დააჭირეთ **ამოღება**. მთელი დაუდასტურებელი კალათის დასაცარიელებლად გამოიყენეთ **კალათის გასუფთავება**.
4. გადაამოწმეთ **სულ** და დააჭირეთ **გაყიდვის დადასტურება**. შეტყობინება **„გაყიდვა შენახულია“** ნიშნავს, რომ გაყიდვა ისტორიაში ჩაიწერა და მარაგი შემცირდა. ბარათით გადახდა ცალკე გაატარეთ ტერმინალზე.
5. თუ გამოჩნდა **„მარაგი არასაკმარისია“**, შეამოწმეთ შესაბამისი პროდუქტის ნაშთი და შეასწორეთ კალათა. თუ კავშირი დადასტურებისას გაწყდა, დატოვეთ იგივე კალათა გახსნილი და უცვლელად სცადეთ ხელახლა. თუ გვერდი უკვე დახურეთ, გაყიდვის თავიდან შეყვანამდე შეამოწმეთ **ისტორია**.

ჩაის მაგალითში ორი შეკვრის გაყიდვის შემდეგ ნაშთი იქნება **8 შეკვრა**, ნავაჭრი **12 ₾**, ხოლო ამ გაყიდვის მოგება **4 ₾**.

### 5. დღის შედეგები და Excel-ის ანგარიში

- **ისტორია** გვერდზე გადაამოწმეთ გაყიდული პროდუქტის კოდი, თარიღი, რაოდენობა, ფასი და მოგება. ძველი გაყიდვის საპოვნელად გამოიყენეთ **ფილტრი**. ისტორიიდან ჩანაწერის წაშლა პროდუქტის ნაშთს ავტომატურად არ აღადგენს.
- **მთავარი** გვერდის **დღიური** განყოფილებაში ნახავთ დღევანდელ ნავაჭრსა და მოგებას. „ნავაჭრი“ გაყიდვების ჯამია. „მოგება“ აქ გაყიდვების თანხასა და გაყიდული საქონლის შესყიდვის ღირებულებას შორის სხვაობაა.
- დღის გაყიდვების Excel-ში შესანახად აირჩიეთ **ისტორია → Excel**. საწყის და საბოლოო თარიღად მიუთითეთ დღევანდელი დღე და დააჭირეთ **გენერაცია**. მარაგის სია შეგიძლიათ ჩამოტვირთოთ **პროდუქცია → Excel**-იდან. ორივე ანგარიშში მონიშნული **ოფიციალური** შესაბამისი ნიშნით შენახულ ჩანაწერებს მოიცავს. მოხსნილი მონიშვნით დანარჩენ ჩანაწერებს მიიღებთ.

### 6. დღის დასრულება, სარეზერვო ასლი და აღდგენა

1. დაასრულეთ ბოლო გაყიდვა და გადაამოწმეთ მისი ჩანაწერი **ისტორია** გვერდზე.
2. გახსენით **პარამეტრები → სარეზერვო ასლი**. ბრაუზერი ჩამოტვირთავს დათარიღებულ `.sqlite` ფაილს, რომელიც შეიცავს მარაგს, გაყიდვებსა და პარამეტრებს. ასლი შეინახეთ ცალკე დისკზეც, რომ კომპიუტერის დაზიანების შემთხვევაშიც გქონდეთ.
3. სამუშაოს დასრულებისას დახურეთ ბრაუზერის ჩანართი და პროგრამის კონსოლი. ვერსიის განახლებისას იმავე კომპიუტერზე დახურეთ ძველი პროგრამა და გაუშვით ახალი ფაილი.

**სარეზერვო ასლიდან აღსადგენად** დახურეთ პროგრამის ყველა გაშვებული ასლი. Windows-ის File Explorer-ის მისამართის ველში ჩაწერეთ `%LOCALAPPDATA%`. არსებულ `ZooShopDesktop` საქაღალდეს შეუცვალეთ სახელი და შეინახეთ, რომ საჭიროებისას წინა მდგომარეობას დაუბრუნდეთ. შექმენით ახალი `ZooShopDesktop` საქაღალდე, მასში გადაიტანეთ სარეზერვო ფაილის ასლი და დაარქვით ზუსტად `shop.sqlite`. გაუშვით პროგრამა და პირველ გაყიდვამდე გადაამოწმეთ ნაშთი და ბოლო ჩანაწერი ისტორიაში. აღდგენილ ბაზაში მონაცემები ასლის შენახვის მომენტამდეა ასახული.

## Run and back up

Download the Windows x64 executable from Releases and double-click it. It opens your default browser and listens on the local loopback address. Keep its console window open while working. The app creates an empty shop on first launch. The executable is unsigned.

The database is stored at `%LOCALAPPDATA%\ZooShopDesktop\shop.sqlite`. Replacing or moving the executable preserves that file. Download a consistent SQLite backup from Settings. To restore, close all copies of the app, move the existing database folder to a safe location, recreate the folder, and copy your downloaded backup into it as `shop.sqlite`. Launch the app again.

Sales deduct the oldest stock lots first. A checkout records the entire basket and sale history in a single transaction. Counted items use whole units and weighted items allow three decimal places. An interrupted checkout can be retried from the same cart. Excel inventory and sales reports remain available on their respective screens.

## Transfer an existing MongoDB shop

On the original workstation, use MongoDB Database Tools to export from the existing `zoo_shop` database. Pause stock changes and sales until all three exports finish. In PowerShell, run the following from a new folder.

```powershell
mongoexport --db zoo_shop --collection products --jsonArray --out products.json
mongoexport --db zoo_shop --collection sellhistories --jsonArray --out sellhistories.json
mongoexport --db zoo_shop --collection parameters --jsonArray --out parameters.json
```

Copy those files to the new workstation. Close the app and import into an empty desktop shop. Substitute the path to your export folder.

```powershell
.\Shop-Windows-x64.exe --import-mongo "C:\ZooShopExport"
```

The importer preserves IDs, stock lots and historical sale records. It rolls back the import if a file or record fails validation. Compare stock and sale totals with the original shop before using the new workstation.

## Build and verify

Use Node.js 24 and Bun 1.3.6. From the repository root run the following commands.

```sh
npm ci
bun test
npm run windows
```

The resulting file is `dist/Shop-Windows-x64.exe`. On a Windows machine with Chrome installed, run `node scripts/smoke.mjs dist/Shop-Windows-x64.exe` for the end-to-end check. Chrome is a test dependency only. For local development, run `npm run build` followed by `npm start`. Use `ZOO_DATA_DIR` to select an isolated database directory and `--no-browser` to start the server without opening a tab.

## Upstream projects

The Georgian interface, reporting screens and shop workflows derive from [beq0/Zoo-Shop-Front](https://github.com/beq0/Zoo-Shop-Front/tree/61f32ef077a36bb61afae2ef1ce099c0fe6f0401). The Express product, sales history and parameter routes and bundled web assets derive from [beq0/Zoo-Shop-Back](https://github.com/beq0/Zoo-Shop-Back/tree/d05ef354bf7f0039dfdb822bd11a6db94483898d). This desktop edition adapts the original MongoDB data model to SQLite.
