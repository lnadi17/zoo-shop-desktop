# Shop Desktop

An offline Georgian-language inventory and checkout app for one Windows workstation. The executable contains the shop interface, local server, and SQLite database engine.

## გაშვება Windows-ზე

1. [ჩამოტვირთეთ ბოლო ვერსია](https://github.com/lnadi17/zoo-shop-desktop/releases/latest) და გაუშვით `Shop-Windows-x64.exe`.
2. პროგრამა გაიხსნება თქვენს ბრაუზერში. მუშაობისას დატოვეთ პროგრამის კონსოლის ფანჯარა ღია. თუ ბრაუზერი არ გაიხსნა, გახსენით კონსოლში მითითებული მისამართი.
3. „პროდუქცია“ → „პროდუქტის დამატება“. ჩაწერეთ კოდი, სახელი, გასაყიდი ფასი, საწყისი მარაგი და შესყიდვის ფასი.
4. „გაყიდვა“ → დაასკანერეთ შტრიხკოდი ან მოძებნეთ პროდუქტი სახელით. შეამოწმეთ რაოდენობა და დაადასტურეთ გაყიდვა. შედეგს ნახავთ „ისტორიაში“.
5. სარეზერვო ასლის შესანახად გახსენით „პარამეტრები“ → „სარეზერვო ასლი“. პროგრამიდან გასასვლელად დახურეთ კონსოლი და ბრაუზერის ჩანართი.

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
