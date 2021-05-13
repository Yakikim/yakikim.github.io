
<div dir="rtl">

#  גרסאות  Oracle APEX
----- 

##  המלצה נכון ליום [[10/05/2021]] 

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

## Version 20.2

Released October 21, 2020

This release of Oracle APEX introduces a number of exciting new features and enhancements to help deliver a functionally rich and modern user experience.

[View Announcement](https://blogs.oracle.com/apex/announcing-oracle-apex-202) [See What's New](https://apex.oracle.com/en/platform/features/whats-new/)

-  
   #### Cards Region
    
   The new Cards Region is a lightweight report region, declaratively supporting customizations of layout, appearance, icon, badge, media and actions. Use cards to embed and share media sourced from BLOB column, URL or video in iFrame. Cards are useful for presenting a variety of information in small blocks. As Cards usually provide entry to more detailed information, you can include a number of actions as button or links declaratively.
    
-  
   #### Automations
    
   Automations are a sequential set of PL/SQL actions, triggered by query results. They are used to monitor data and then perform the appropriate action (examples are auto-approving specific requests and sending email alerts). An automation can be triggered on Schedule or on Demand, by invoking the APEX\_AUTOMATION package. Query results can be derived from: Table or View, SQL Query or a PL/SQL function returning a SQL Query. Local Database or REST Enabled SQL. REST Data Source (aka Web Source Modules).
-  
   #### Faceted Search Enhancements
    
   Faceted Search has been enhanced to generating bar or pie charts of facet value counts, grouping checkbox facets for Boolean columns, supporting comparing user-entered value with the facet column in Input Field facet type and performance optimization for distinct value facets.
    
- 
  #### Report Printing
    
   Built-in PDF printing is supported in Interactive Reports, Interactive Grids and Classic Reports and in Chinese, Japanese and Korean languages. You can attach any download formats in Interactive Report - Send Email. Enhanced integration with BI publisher. Use new APEX\_REGION.EXPORT\_DATA and APEX\_DATA\_EXPORT APIs to programmatically generate PDF, CSV, Excel, HTML, JSON and XML files.
   
- 
#### REST Data Source Synchronization
APEX supports data synchronization from a REST Data Source (formerly known as Web Source Modules) to a local table. Synchronization can run either on Schedule or on Demand, by calling the APEX\_REST\_SOURCE\_SYNC package. Developers don't need to build custom PL/SQL code in order to copy data from REST services to local tables; APEX provides this as a declarative option.
    
- 
    
    #### REST Data Source Connector Plug-Ins
    
    The APEX Plug-In infrastructure has been extended to support Connector Plug-Ins for external REST APIs. This enables APEX to fully leverage REST API features like result pagination or server-side filtering, also for 3rd Party REST Services which are not ORDS or Oracle Fusion SaaS Services.
    
-  
    
    #### New Web Credential Types
    
    APEX 20.2 introduces new URL Query String and HTTP Header types for Web Credentials. This allows developers to use the secure and encrypted credential storage also for REST Services which expect e.g. an API key as part of the URL. APEX makes sure that such sensitive parts are not written to debug or execution logs. A web credential can now be protected by providing a URL pattern. APEX will only use the Web Credential for URLs starting with the given pattern; otherwise an error message will be raised. To change the URL pattern, the secret part of the Web Credential needs to be entered again.
    
-   
    
    #### Redwood UI
    
    Universal Theme now supports a new Redwood Light theme style, available via Theme Roller. Refresh your existing apps to uptake the latest version of Universal Theme and this new theme style.
    
-   
    
    #### Developer Experience
    
    Improved developer experience by introducing multiple tabs in the Property Editor pane in page designer, a new code editor, an embedded code utility and saving a model in Quick SQL.
    
-  
    
    #### New and Improved Items
    
    New checkbox item type. The file browse, rich text editor, text field textarea item types have been improved.
    

### Other Features

-   Tree region type has been enhanced to support lazy loading and refresh without having to reload the full page.
-   New Interactive Grid Saved Report Static ID Support.
-   Web Source Modules are now named REST Data Sources.

## Version 20.1

Released April 23, 2020

This release of Oracle APEX introduces a number of exciting new features and enhancements to help deliver a functionally rich and modern user experience.

[View Announcement](https://blogs.oracle.com/apex/announcing-oracle-apex-201) [Documentation](https://apex.oracle.com/en/learn/documentation/)

-  
    
    #### APEX + Redwood
    
    The user interface of APEX and the App Builder has been refreshed to align with Redwood, Oracle's new user experience design system. The new design and color scheme extends across the full developer experience and provides refreshing new visuals. The appearance of APEX can now automatically switch between the dark and light appearance modes based on your OS or platform setting, enabling APEX to seamlessly integrate with your workflow.
    
-  
    
    #### Faceted Search Enhancements
    
    Faceted Search has been enhanced to allow for cascading list of values, conditional facets and compact count display, among other enhancements.
    
- 
    
    #### Friendly URLs
    
    The URL syntax for APEX apps has been simplified to allow for friendlier URLs at runtime. The new syntax provides a Search Engine Optimization (SEO)-friendly URL structure which is far easier to understand and provides immediate context as to where you are within an app. The URL no longer features application or page numbers, and instead, uses the workspace path prefix, application and page aliases, and standard web parameter syntax for its URL structure.
    
-  
    
    #### Improvements in Deployments and Exports
    
    There have been numerous improvements in application lifecycle management including one-click app deployments, automated backups, zip exports, and more. These features make it easy to deploy APEX apps and integrate it into your existing workflow.
    
-  
    
    #### Native PDF Printing
    
    You can now print PDF files directly from Interactive Grids. This feature produces a PDF file which includes formatting options such as highlighting, column grouping, and column breaks.
    
    -
    
    #### Mega Menus
    
    Universal Theme now includes Mega Menus for your application's navigation. Mega Menus render the navigation menu as a collapsible floating panel that displays all navigation items at once. It is especially useful for displaying the various aspects of your application and enables direct access to sections of your app.
    

### Other Features

-   Users will now be alerted shortly before their APEX session is about to expire and will have the opportunity to extend it.
-   SQL Workshop has now been extended to support Simple Oracle Document Access (SODA) Collections.
-   There have been a number of improvements and bug fixes within Universal Theme for right-to-left languages.
-   Filtering of data in an Interactive Grid is now supported through URL parameters as well as the new APEX\_IG API.
-   The version of the Oracle JavaScript Extension Toolkit (JET) library has been upgraded to version 8.0.

## Version 19.2

Released November 1, 2019

This release is the first update to APEX 19.1 and includes a number of new features, bug fixes, and general improvements.

[View Announcement](https://blogs.oracle.com/apex/announcing-oracle-apex-192) [Documentation](https://apex.oracle.com/en/learn/documentation/)

-   
    
    #### Faceted Search
    
    Introducing Faceted Search, a new component that enables you to quickly search and filter your data like never before. Empower your users to see data in new ways, and discover new insights, effortlessly, with just a few clicks.
    
-   
    
    #### All New Team Development
    
    Team Development has been completely reimagined to provide a simple and easy way for your team to collaborate together. Whether it's an enhancement request, a new feature, or a bug – everything is now tracked as an Issue that can easily be assigned, labeled, and managed. You can even receive notifications and see a full timeline of everything that's happening from a single page.
    
- 
    
    #### New and Improved Item Types
    
    From a completely reimagined Popup LOV component to an all new UI for the Switch item, get more out-of-the-box with these new and improved item types in this release.
    
-   
    
    #### Expanded Shared LOVs
    
    There are numerous enhancements to Shared List of Values (LOV) including support for additional data sources, declarative column mappings, and multiple display column.
    
-   
    
    #### Builder Improvements
    
    There have been numerous changes and user experience enhancements to the Oracle APEX App Builder to make it even more productive.
    
-   
    
    #### Universal Theme
    
    Universal Theme has been refreshed with UI refinements, accessibility improvements, new template options, and deeper control via Theme Roller to help your applications look better than ever.
    

### Other Features

-   Developer Toolbar allows setting the Default Debug Level and remembers the debug level when run again from the App Builder.
-   Interactive Report, Interactive Grid, and Popup LOV searches can be passed to a REST service. Enable the Use for Row Search switch for a Web Source Module parameter in order to use this feature.
-   The data upload functionality in SQL Workshop has been extended to allow uploading native Excel, CSV, XML, and JSON documents into existing tables.
-   SQL Workshop Data Loading and the APEX\_DATA\_PARSER package support up to 20 CLOB columns.
-   If an Oracle Text Index Column is chosen, Interactive Report and Popup LOV row searches will benefit from advanced searching capabilities such as fuzzy or linguistic search. Note: For Popup LOV, the Oracle Text Index Column is chosen in the Shared LOV definition.
-   Several libraries have been updated to newer releases including Oracle JET, jQuery, FullCalendar, CKEditor, CodeMirror and more!

## Version 19.1

Released March 29, 2019

This is the first release 2019 and includes a number of new features, bug fixes, and general improvements.

[View Announcement](https://blogs.oracle.com/apex/announcing-oracle-apex-191) [Documentation](https://apex.oracle.com/en/learn/documentation/)

-  
    
    #### Dark Mode
    
    The development environment of APEX can now be rendered with a darker color scheme, which reduces eye strain and is especially helpful for those who are developing late into the night.
    
-   
    
    #### Create App from File
    
    The data upload functionality in SQL Workshop and Create Application From a File have been modernized with a new drag & drop user interface and support for native Excel, CSV, XML and JSON documents. A new public data loading PL/SQL API is also available.
    
-   
    
    #### REST Enabled Forms
    
    The built-in support for REST Enabled SQL and Web Sources has been extended to Form regions, allowing read and write access to remote data sources.
    
-   
    
    #### Form Region Type
    
    The new Form region type significantly improves and streamlines how data is retrieved and processed for page items.
    

### Other Features

-   New Status Meter Gauge Chart
-   Declarative font formatting for charts
-   You can now define group and category labels for stacked charts.
-   Gantt charts now include declarative tooltip support.
-   Accessibility improvements in Universal Theme including new "Skip to Main Content" link.
-   There are now two additional styles for the tree-based Navigation Menu for Universal Theme
-   There is a new Inline Popup region template for Universal Theme
-   Improved responsive behavior for breadcrumbs and several other UI components in Universal Theme
-   A number of new declarative attributes have been added to Interactive Grids such as Select First Row and new Toolbar Controls.
-   New dynamic actions for opening and closing regions have been added.
-   Authentication to the App Builder can now be configured to use Social Login.
-   New Additions to JavaScript API Doc
-   Save Session State just in memory
-   APEX Upgrade will automatically copy ACLs
-   Improved translation editing
-   APEX\_STRING enhancements
-   APEX\_SESSION additions
-   Removal of jQuery Mobile
-   Removal of APEXExportSplitter

## Version 18.2

Released September 28, 2018

This release is the first update to APEX 18.1 and includes a number of new features, bug fixes, and general improvements.

[View Announcement](https://blogs.oracle.com/apex/announcing-oracle-apex-182) [Documentation](https://apex.oracle.com/en/learn/documentation/)

-   
    
    #### Streamlined Workspace Requests
    
    There are additional options to simplify and reduce the number of steps for new workspace requests.
    
-   
    
    #### New Page Types in Create Page Wizard
    
    You can now create side-by-side master detail and dashboard pages from the Create Page wizard.
    
-   
    
    #### Create Apps from Sample Datasets
    
    Installing a sample dataset will allow you to jump into the Create App wizard with predefined pages.
    
-  
    
    #### New Static List of Values Editor
    
    You can now easily define static list of values in Page Designer
    

### Other Features

-   Improved warnings within REST Workshop to prevent loss of custom definitions.
-   More comprehensive JavaScript API documentation.
-   Ability to update Font APEX stylesheets and font files independent of Oracle APEX releases.
-   Font APEX has been updated to version 2.1 and includes a number of bug fixes.
-   EMP / DEPT Sample Dataset is now localized in 10 languages.
-   Numerous improvements to handling of touch events.
-   General improvements and bug fixes to Universal Theme.
-   Added "Getting Started" links to primary pages across the builder.

## Version 18.1

Released May 24, 2018

This release brings a dramatic leap forward in both the ease of integration with remote data sources, and the easy inclusion of robust, high-quality application features.

[View Announcement](https://blogs.oracle.com/apex/announcing-oracle-apex-181) [Documentation](https://apex.oracle.com/en/learn/documentation/)

-   
    
    #### Application Features
    
    Easily add higher-level application features to your app, including access control, feedback, activity reporting, email reporting, dynamic user interface selection, and more.
    
-  
    
    #### REST Enabled SQL Support
    
    You can now build charts, reports, calendars, trees and even invoke processes against Oracle REST Data Services (ORDS)-provided REST Enabled SQL Services.
    
-   
    
    #### Web Source Modules
    
    Declaratively access data services from a variety of REST endpoints, including ordinary REST data feeds, REST Services from Oracle REST Data Services, and Oracle Cloud Applications REST Services.
    
-   
    
    #### REST Workshop
    
    A completely rearchitected REST Workshop, to assist in the creation of REST Services against your Oracle database objects.
    
-   
    
    #### Social Authentication
    
    Developers can now easily create APEX applications which can use Oracle Identity Cloud Service, Google, Facebook, generic OpenID Connect and generic OAuth2 as the authentication method.
    
-  
    
    #### Universal Theme + Mobile UI
    
    There are a number of features in Universal Theme to enable developers to build common mobile UI patterns. There are also new components based on jQuery Mobile widgets to assist in the creation of mobile applications.
    

### Other Features

-   Wizards have been streamlined with smarter defaults and fewer steps, enabling developers to create components quicker than ever before.
-   Font APEX 2: there is a new set of high-resolution icons which include much greater detail.
-   APEX Advisor now includes a collection of accessibility-focused tests.
-   New Chart Types - You can now create Gantt, box-plot, and pyramid charts
-   Enhanced Sample Charts application
-   New Chart-Level and Series-Level attributes
-   Interactive Grids: there is a new Copy Down feature to copy data from one row to other rows.
-   Interactive Grids: You can now Copy to Clipboard for row or cell range selections.
-   Interactive Grids: User settable report setting "Actions > Format > Stretch" Column Widths and column attribute "Stretch" provides declarative control over how the column width will stretch to fill available space or not
-   Documentation of public JavaScript widget APIs
-   Page Designer: Updated UI to improve usability and improved "Go to group" functionality
-   Sticky Filters: You can now pin keywords to have them persist as you click around Page Designer
-   Upgraded jQuery and jQuery UI libraries: jQuery 3.1.1 and jQuery UI 1.12.0
-   New Oracle JET libraries: Oracle JET 4.2.0
-   APEX Search: Provides quick navigation and unified search experience across APEX. Activate by clicking search button from header, or using the keyboard shortcut.
-   New "Text Field with Autocomplete" item type based on Oracle JET Input Search component.
-   Developer Toolbar now shows a red indicator if there is any JavaScript error on the page. Page Info > Show Page Timing displays the page performance timing
-   Declarative support for touch-based dynamic actions, tap and double tap, press, swipe, and pan, supporting the creation of rich and functional mobile applications
-   Universal Theme: There are multiple template options to support mobile UI patterns including sticky headers and footers for button placement
-   Universal Theme: There is a new Tabs-based navigation menu template that is optimized for mobile devices.
-   Universal Theme: There is a new template option for classic reports to hide pagination when pagination is not available
-   Universal Theme Sample App has been enhanced with Mobile UI patterns and a number of other enhancements

## Version 5.1

Last Updated December 17, 2017 (Version 5.1.4) - Initial Release December 21, 2016

This release is a great leap forward in end-user productivity and introduces powerful new declarative features, enabling you to develop, design and deploy beautiful, responsive, database-driven desktop and mobile applications using only a browser.

[View Announcement](https://blogs.oracle.com/apex/oracle-announces-oracle-application-express-51) [Documentation](https://docs.oracle.com/database/apex-5.1/index.htm)

-   
    
    #### Interactive Grids
    
    You can now create an interactive grid, a rich, client-side region type that allows rapid editing of multiple rows of data in a dynamic, JSON-enabled grid. Interactive Grid combines the best features from both Interactive Reports and Tabular Forms. With Interactive Grids, developers can now easily render master-detail-detail relationships that can be n-levels deep or across.
    
-   
    
    #### Oracle JET Charts
    
    The data visualization engine of Oracle Application Express is now powered by Oracle JET (JavaScript Extension Toolkit), a modular open source toolkit based on modern JavaScript, CSS3 and HTML5 design and development principles. This JavaScript charting solution is highly customizable, accessible, interactive, and incorporates automatic responsive design support. With Oracle JET integration into Application Express, you can now build charts that are beautiful, fast, highly customizable, and extremely versatile.
    
-   
    
    #### Universal Theme
    
    Universal Theme has been streamlined and features improved design and UI throughout all of its components. This release introduces new templates, theme styles and Live Template Options. Live Template Options enables you to customize your application in real time, allowing you to try out various template options to get the perfect UI for your application.
    
-   
    
    #### Application Builder Improvements
    
    Wizards have been streamlined with smarter defaults and fewer steps, enabling developers to create components quicker than ever before.
    
-   
    
    #### Productivity Apps
    
    Enhancements to all existing productivity and sample apps, and also introduces three new productivity apps: Competitive Analysis, Quick SQL and REST Client Assistant.
    
-  
    
    #### Wizard Simplification
    
    Wizards have been streamlined with smarter defaults and fewer steps, enabling developers to create components quicker than ever before.
    

### Other Features

-   Universal Theme now provides declarative support for right-to-left languages, modal dialogs that will automatically grow or shrink in height to fit their contents, and over 100 other enhancements
-   Font APEX is a new icon library with over 1,100 icons, which has been specifically designed to complement the development of business applications with Oracle Application Express and Universal Theme.
-   The Sample Charts app has been completely revamped to showcase the all new Oracle JET Charts
-   The Sample Master-Detail app now highlights the different ways related tables can be displayed using a marquee page or different combinations of Interactive Grids
-   Three new Sample apps: Sample Interactive Grids, Sample Projects, and Sample REST Services. The Sample Interactive Grids app demonstrates the rich functionality of Interactive Grids including read-only, editable, and advanced capabilities.
-   To assist developers with the transition to Page Designer, a new Component View tab is now included in Page Designer. You can see your page as it looks when viewing the Legacy Component View.
-   Page Designer now supports a Two Pane mode so you can focus on two panes at a time.
-   You can now customize Page Designer by reordering tabs within and across panes.
-   You can now quickly search and find a specific attribute or group in the Property Editor by entering part or all of the associated property name in the search dialog. In the Property Editor, changed properties are now indicated with a blue marker until the page has been saved.
-   Numerous Improvements to Calendar component include: Inclusive End Date, JavaScript Customization, Dynamic Action Events, and Keyboard Support
-   APEX Builder UI enhancements - Rather than just being able to upload a single file (or zip file), developers can now upload multiple files or multiple zip files. This is available in Static Workspace Files, Static Application Files, Theme Files, and Plug-In Files.
-   Item Types - File Browse page items can be configured to support multiple file uploads, and can be restricted by file types.
-   Page Submit - New Page Attribute "Reload On Submit" allows developers to specify when the page should be reloaded following a page submission. Submitting a page has been changed to not use the parameters of the wwv\_flow.accept procedure anymore, instead all page item values are stored in a JSON document which is passed to wwv\_flow.accept. With this change,there is no more 200 page items limit per page.