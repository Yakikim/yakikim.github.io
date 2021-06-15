---
tags: [APEX, op, Infrastractures]
created: 2021-05-24 16:57
type: Document
title: Oracle APEX - Newest Versions
link: [[Oracle APEX - Newest Versions | סקירת הגרסה החדשה והמלצה]]
---

[[2021-05-24]]



 # Apex Versions: Newest APEX Versions


[[index]]/[[Open University]]/[[APEX]]/[[Management]]






<div dir="rtl">

## המלצה נכון ליום [[10/05/2021]] 

* המלצתי הינה המשך מעקב אחרי ה-[Known Issues](https://apex.oracle.com/pls/apex/apex_pm/r/apex211/known-issues) של גרסת 21.1 ובמדה והם לא יהיו קריטיים עבור צרכי הארגון, להתקין בסביבת ה-DB האפליקטיבי המוקמת, את הגרסה 21.1  ולא להמתין לגרסה 21.2.
* יש להבין כי מעת שהארגון מתמסר לפיתוח בכלי שממשק המשתמש שלו הינו תשתית ה- WEB, יש להגדיר מתודולוגיה גם בנושא הדפדפנים וניהול הגרסאות שלהם ברמת הארגון.
* על ההתקנה להביא בחשבון, כי התמיכה בדפדפן Explorer אינה קיימת בגרסאות המתקדמות,  וכי APEX מבוסס על  [HTML5 ](https://html5test.com/results/desktop.html) ולפיכך יש לבצע בדיקות ממשקי משתמש מקיפות בטרם שדרוג דפדפן Chrome\Edge וכן לשמור על עדכון הדפדפנים כך שיתמכו באופן מיטבי ב-HTML5.
	
		
##  המלצה לגבי שידרוגים עתידיים
כתוצאה מהמדיניות הזו של אורקל, בכל עת שיש שדרוג והוספת פונקציונליות אשר תוגדר כמשמעותית לארגון, יש להתכונן לתהליך חד שנתי \דו שנתי (לפי הצורך) שבמסגרתו יבוצע שדרוג גרסת ה-APEX. 
	לפיכך, יש לייסד תהליך סדור שבמסגרתו יתבצע: 
	- הגדרת דפדפן ארגוני וגרסת דפדפן ארגוני נתמכת שעליה ולפיה יתבצעו הבדיקות. לפי זה  יתקבלו ההחלטות וההמלצות בנוגע לשדרוגי גרסת APEX. 
	- מיפוי של כל הפונקציונאליות של המערכת שאותם יש לבדוק (והיכן מומשו בארגון) 
	- מיפוי שוטף ובדיקת טבלת התאמות ה-UI החריגות (Customizations) שבוצעו בכל אפליקציה.
	- כנ"ל לגבי התאמות נוספות שיש להתחשב בהן. 
	- יצירת סקריפט **מאוחד** שיבצע עדכון אובייקטים המבוססים על סכמות כגון APEX_200100  וכו' 
	

##  מדיניות שחרור גרסאות APEX 
החל משנת 2018 חברת Oracle החלה במדיניות של שחרור שני גרסאות בשנה.  
	בנוסף, החל משנה זו הגרסאות ממוספרות בהתאם לשנה בה הגרסה משוחררת. 
הגרסה הראשונה בכל שנה יוצאת בחודשים מרצ-מאי והגרסה השניה של השנה יוצאת בחודשים ספטמבר-נובמבר.
להלן תאריכי השחרורים האחרונים, החל משנת 2018:

| מספר גרסה | תאריך השחרור             |
| --------- | ------------------------ |
| 18.1      | May 24, 2018             |
| 18.2      | September 28, 2018       |
| 19.1      | March 29, 2019           |
| 19.2      | November 1, 2019         |
| 20.1      | April 23, 2020           |
| 20.2      | October 21, 2020         |
| 21.1      | בימים אלו [[10/05/2021]] |

שלא כהערכתי הקודמת, מדיניות אורקל **אינה** לייעד את הגרסאות השניות-בשנה (גרסאות XX.2) לתיקוני באגים ביחס לגרסה הראשונה של אותה השנה, אלא מלבד תיקוני באגים, הגרסה מכילה New Features (כמובן שמכילה בנוסף תיקוני באגים הידועים לחברה.)
	
היוצא מזה: יש להתקין את הגרסה היציבה ביותר ביחס לתועלות המתקבלות ממנה לארגון.
	
## פירוט התועלות בגרסה 21.1 
	
 **היתרונות שנקבל בגרסה 21.X ע"פ גרסאות קודמות הינם רבים ומשמעותיים ביותר לסביבה העתידית.
	חלק מהסיבות יפורט להלן: ** 	
	
###  תמיכה בהדפסת PDF בעברית.  
לפי הצהרת אורקל הבעיה של הדפסת ג'יבריש ושמלווה אותנו ב-APEX מאז ומעולם,  נפתרה בגרסה זו.
	
###  סינכרון שירותים לטבלאות	
בגרסה זו נוספה יכולת אדירה שתהיה מאד שימושית למערכת בתצורה של הפרדת DB אפליקטיבי מה-DB הארגוניים. 
	היכולת נקראת REST Data  Synchronizations שזה אומר שניתן יהיה להגדיר באמצעות מסך אפליקטיבי סינכרוניזציה בגישה לשירותים מסויימים עם קריטיות נמוכה - כך שנוצרת טבלה ב-DB האפליקטיבי שהיא שיקוף של הנתונים המתקבלים ע"י השירות. מדי תקופת זמן מוגדרת, הטבלה מתרעננת ומתמלאת (לפי הגדרה - או רק ההפרשים או רענון מלא)
	כך שניתן יהיה:
	1. להמעיט בקריאות ובצריכת שירותים מרובי DATA מסביבות ה-DB.
2. יכולות אדירות  ביצירת שלייפות מאוחדות ( Inner Joins ) בין שירותי  WebSource  קלאסיים לבין שירותי REST SQL.  או בין כמה שירותים באותה השליפה.

### תמיכה ב-Markdown 
פיצ'ר נוסף שאני צופה עבורו שימושיות גבוהה הוא הוספת Public API שמאפשר תמיכה בייצוא והצגת קבצי  Markdown  שאני מתכנן להשתמש בזה הן בהיבט תחזוקת ה Help   של הדפים והאפליקציות והן בהיבט האיפיון ותיעוד הגרסאות.
	
###  תמיכה ב***ייבוא*** אפליקציות בתצורת ZIP 
בעוד וכיום ניתן לבצע ייצוא של האפליקציה לרכיביה והקובץ שמייוצא הינו קובץ ZIP  הייבוא אפשרי רק באמצעות קובץ .sql הדבר המשתמע מכך הינו שבמדה ומעוניינים לבצע בקרת גרסאות באמצעות GIT, יש לייצא שני גרסאות - האחת לצורך הבקרה והשניה לצורך הייבוא.
	בגרסה זו ניתן יהיה לבצע ייבוא של הקובץ המיוצא כ-ZIP.
	
###  שיפור רכיב DatePicker 
רכיב של בחירת התאריך עבר שדרוג כמפורט לעייל
	
	
עוד ב[קישור הבא](https://apex.oracle.com/pls/apex/apex_pm/r/apex211/new-features)

## נקודות לבדיקה ובקרה (גרסה 21.1)
- שינויי UI והשינויים הנוגעים ל-Universal Theme
- עדכוני ספריות JavaScript ווידוא שהפיתוחים הנוכחיים לא ניזוקים מהם. 
- ביצוע הערכה נוספת ביחס לבאגים הידועים שיפורסמו [כאן](https://apex.oracle.com/pls/apex/apex_pm/r/apex211/known-issues) בטרם ההתקנה בסביבת הייצור.

 
</div>






#  New Features Details
-------
## Version 21.1
#### Active Map Region Type 

Visualize location data on a map with the new native Map Component in APEX 21.1.

-   Point, Line, Polygon, Heat Map and "3D Polygon" (Extruded Polygon) layer types.
-   Background maps from the [Oracle Elocation Service](http://maps.oracle.com/elocation/mapstyles.html). Ready to use, no API Key required.
-   Fully Interactive: Drag and Zoom, show details about objects on the map.
-   Oracle Spatial (SDO\_GEOMETRY), GeoJSON and simple numeric columns.
-   Leverages Oracle Spatial (Indexes, Coordinate Transformations), if available.
-   Visualize data from local SQL queries, REST Enabled SQL or from REST Data Sources.
-   Rich set of built-in marker icons and SVG shapes.
-   Built-in color schemes for thematic visualizations.
-   _Faceted Search_ integration.
-   Dynamic Action support and JavaScript API.

#### Active Markdown Support

-   New public PL/SQL API, **APEX\_MARKDOWN**, to convert Markdown into HTML.
-   Enhanced ‘Display Only’ item type which supports Markdown. Added new ‘Format’ attribute and removed ‘Escape Special Characters’ flag.
-   Renamed ‘Markdown’ Classic Report Column Type to ‘Rich Text’.
-   New ‘Rich Text’ Interactive Report column type.
-   Markdown support added to HTML format of Data Export.
-   Changed default of Rich Text Editor, Rich Text to use Markdown as secure out-of-the-box default

####  Universal Theme Enhancements

-   Enhanced "Redwood Light" Theme Style which is more inline with the Redwood Design System.
-   New "Row CSS Classes" Page Designer attribute added to to Region, Page Item, and Item Buttons.
-   New "Theme Style Page CSS Classes" attribute added to Theme Styles ( see Shared Components -> Theme -> Theme Styles ).

#### Import Application Export as ZIP

The App Builder now supports the import of an application export which has been created as a ZIP file.

-   Applications and components exported with the Export as Zip option can be re-imported.
-   Zip exports which have been extracted on a local file system can be re-compressed and imported.
-   Folder structures created with the APEXExport utility, using the -split option, can be compressed to a Zip file and imported.

#### Additional Lazy Loading Support

Classic and Interactive Reports now support Lazy Loading.

-   Enabling the Lazy Loading toggle improves initial page load speed, especially for pages containing reports with long running queries.
-   Report data is not loaded until the page has been rendered, or the tab that it is on has been activated.

#### New Application Data Loading

New Application Data Loading functonality, which supports CSV, XLSX, XML and JSON formats.

-   _Column Mapping_ at design time; no burden for end users any more.
-   Flexible column mappings based on simple names or regular expressions.
-   Data Conversion with Transformation Rules or Lookup Queries.
-   Super-Easy flow for end users: Just upload the file, verify the preview and load data.
-   CSV, XLSX, XML, and JSON data formats can be loaded to Tables or Collections.
-   Configure data loading to Append, Merge or Replace data, with or without Error Handling.
-   Simple new Process Type **Data Loading**: Customize Data Loading pages as you wish.
-   PL/SQL API **APEX\_DATA\_LOADING** available for custom processing.

#### Faceted Search Enhancements

Optional Facets with end user customization

-   Facet and Facet Groups now have two new Page Designer attributes under 'Advanced' called 'Display Toggling' and 'Initially Displayed'.
-   If ‘Display Toggling’ = On, End-Users can Show or Hide that facet from a new "More Facets" popup.
-   Use case: Hide some advanced and rarely used Facets out-of-the-box, but make them available on-demand.

#### New Date Picker Item Type

New Date Picker item type. This new modern, accessible item type is based on the Oracle JET Input Date Time, featuring.

-   Supports different display modes: JET-based Popup and Inline, and also Native HTML (no-JET, and better mobile UX)
-   All display modes support both Date, and Date and Time (time enabled through new dedicated attribute 'Show Time')
-   Includes ability to define dynamic Minimum / Maximum dates (for defining date ranges between items, eg 'From' and 'To')
-   Other new features include: Improved UX (especially around year and month selection), additional appearance options for example 'Show Week' and 'Days Outside Month', and a few other new attributes (check out the samples below)

#### REST Data Sources

-   Support for CSV data:  
    Use _Synchronization_ to schedule frequent loading of CSV data from the web to a local table.
-   Data conversions using Transformation Rules and Lookup Queries.
-   New Overview report on defined REST Data _Synchronizations_ in Shared Components, REST Data Sources.

#### New Color Picker Item Type

This new Color Picker replaces the old one and adds new configuration options. It utilizes the Oracle JET Color Spectrum component. New functionality includes:

-   Supports different display modes: Input + Popup, Color Only (button) + Popup, Inline, and also Native HTML color input.
-   Color presets: custom or from the theme.
-   Optional contrast checking.
-   Various value return formats: Hex, rgb/rgba, hsl/hsla, or any CSS color value.

#### Report Printing

-   Support for Complex Text layout languages, Hebrew and Arabic, when exporting to PDF.
####  Developer Experience

-   Monaco-based Code Editor upgraded
    -   New options for: Minimap, Show Suggestions, Show Line Numbers, Show Whitespace, Accessibility Mode (means that screen reader users no longer need to enable this every time they use APEX, which is much better).
    -   References to non-existent page items will be marked as such.
    -   Shortcuts for the built-in Transform Case actions Ctrl-Alt-U/L (Upper/Lower).
    -   New action: Transform Code Case- Ctrl-Alt-C. Toggles between upper and lower case while not affecting ' or " enclosed strings.
-   FullCalendar upgraded
    -   Lazy loading support
    -   Faceted Search Integration
 
 #### JavaScript Library Upgrades

-   Oracle JET 10.0.0
-   FullCalendar 5.5.1
-   CKEditor5 25.0.0
-   Monaco Editor 0.22.3

### For [[Oracle APEX - Older Versions]]


