---
tags: apex, op, wiki, guide
type: Document
title:  עקרונות ניהול Lifecycle APEX
link: [[Oracle Lifecycle Management | סיכום המלצות Oracle ]]
---

[[2021-01-02]]

<div dir="rtl">

#  עקרונות ניהול Lifecycle APEX 

[[index.html]]/[[Open University]]/[[APEX]]/[[Management]]

 

## ניהול הסביבות


#### Supporting Objects
  
 פונקציה שנועדה לטובת התקנת אפליקציה כשהאובייקטים של ה-DB כבר נמצאים בפנים.  הבעיה עלולה לצוץ כשהאובייקטים בסביבת היעד מעודכנים יותר וכשמעלים גרסה עלולים בטעות *_להוריד_* גרסה. 
זאת פונקציה שנועדה בעיקר לפיתוחים ששולחים **החוצה** ולא לפיתוחים שנעשים בארגון.  

_**המלצה: לא להשתמש. העברת אובייקטי DB תבוצע במקביל לאפליקציה בלבד.**_



<a id="env"> </a>

#### סביבות  
בדרך כלל במחזור חיים של פיתוח ישנם לפחות שלש סביבות שיכולות להיות על DB שונים או על PDB שונים על סביבת Oracle Database 12c Multitenant. הסביבות הן:
- Development
- QA/TEST
- Production


מומלץ לבצע Export&Import של Workspaceses שלמים מסביבות ה-Dev לסביבות ה-Test&Prod ככה שיישארו ה-ID של האפליקציות ובצורה הזו יתאפשר להעביר קומפוננטות בודדות כגון Single Page  ישירות לאפליקציה שנבנתה כי יש לה את אותו ה-ID כפי שהוגדר בסביבת הDev.

(לבדיקה: האם ייצוא וייבוא של אפליקציות עם הפונקציה של שמירה על ה-ID המקורי, פותר את הבעיה)


_**המלצה: להתחיל כל פיתוח בסביבת DEVA/NEWT**_



#### Runtime Only

זאת פונקציה שמונעת את הגישה לApplication Builder  וכן ל-SQL Workshop כתוצאה מזה מובטח שמפתחים לא יבצעו בניית אפליקציות חדשות בסביבת ה-QA וה-PROD וכן לא יהיו בעיות עם הVersion Control .  
(אני חושב שניתן לעקוף זאת בצורה שבסביבת ה-Test יהיה לינק לסביבות PROD של הנתונים ובסביבת Development יהיה לינק לסביבות הטסט השונות. ככה שכל פיתוח יצטרך להתחיל בסביבת ה-Development. י.ק.)


_**המלצה פנימית: לעבור  לתצורה זו, אם כיום כל המפתחים הרשומים ב-PROD הינם ""שלנו". התקנת אפליקציה תתבצע ע"י המאשרים ולאחר שנבדקה בסביבת בדיקות. ב-ERP, אין הכרח מאחר ואני מנהל אותו. נתחיל בבדיקות בסביבת TESTC + CLN.**_

#### אפליקציית בסיס

יש לנהל את אפליקציית הבסיס בסביבה אחת בלבד! אין לנהל אותה 


#### Workspaces 
מספר הWS אינו מוגבל ומומלץ לנהל את זה לפי יחידות פיתוח ויחידות עסקיות. 
(הסיכונים שאני רואה בזה הם: 1. שיתוף סשנים לא אפשרי בין אפליקציות שאינם באותה יחידה עסקית. 2. אפליקציות בסיס ינוהלו באופן בעייתי. י.ק.)

_**המלצה: לייחד WS שיהיה עבור התקנות אפליקציות Sample**_


#### ניהול גרסאות
 
כל העלאת גרסה ושחרור פונקציונאליות חדשה על המפתח לוודא שהקבצים הבאים צורפו לתיקיית המקור המנוהלת: 
* APEX Export File(s)
* DDL Scripts
* DML Scripts 
* מסמכים נוספים כגון לוגו וקבצי CSS     

המפתח יהיה אחראי לצרף את קובץ הRelease.sql  שיריץ ויתקין את הקבצים הללו על ה-DB.   
אם יש צורך בצירוף של קבצים לשרת הWeb יש לצרף את קובץ הRelease.sh

לאחר צירוף הקבצים הללו, על הRelease Manager לבצע את הרצת הסקריפטים הללו בסביבת Test/Prod 
 
> הורדת הסביבה\אפליקציה במהלך השדרוג:  
> במהלך השדרוג ניתן להפוך אפליקציה לפעילה\לא פעילה באמצעות הפיכת הסטטוס שלה מAvailable ל Unavailable. כך שאם משתמש נמצא בתוך האפליקציה, הוא יראה הודעה מתאימה שתוגדר באפליקציה. 

> המלצה: לדאוג לניהול שוטף של גרסאות ומידע על שינויי גרסאות ברמת הגדרת המערכת (Application properties) 

#### Build Option
באם מוציאים פיתוח לא מושלם או שלא נבדק כולו לסביבת הייצור, מומלץ להגדיר Build Option לדוגמא:
![Build Option's definition](BuildOption.jpg)
בעת הגדרת Build Option , תחת Shared Objects, ניתן לציין שהגרסה המוצגת למשתמש לא תכלול את הפונקציונליות שהאפשרות הזו תשוייך להם, וניתן גם לציין שהייצוא לא יכלול את הרכיבים הללו. לאחר מכן ניתן לסמן עמודים, אזורים, פריטים, כפתורים, תהליכים, Authorizations , Dynamic Actions, LOV וכו' באותו ה-Build Option:   
![Build Option in use](BuildOption2.jpg)

_**יש לבדוק ב-Live בהקדם. לא להדרכה**_


## ניהול הפיתוח
#### מספר האפליקציות
באם עובדים מספר צוותים על פיתוח מסויים (חושן כמשל) ובעל מספר רב של דפים ואובייקטים מומלץ לחלק את הפיתוח למספר אפליקציות כמספר האזורים התפעוליים. לדוגמא, חלוקת הפיתוח לפי מחלקות משתמשים ובמדת הצורך יהיה Session Sharing כך שהעלאה ועדכון האפליקציה יבוצעו באופן יעיל וללא בעיות של דריסת פיתוחים בעת שמירה ועדכון.
ככלל, מספר הדפים המומלץ לאפליקציה הינו 50.  

#### Master Application
באם משתמשים בשיטה הזו (וייתכן שגם סתם כך) מומלץ להגדיר אפליקציה שתוגדר כאפליקציית Master ובה יוגדרו רשימות הערכים, לוגיקת הכניסה למערכת וההרשאות, Lists וכו'. מיתר האפליקציות תבוצע העתקה בשיטת Copy and Subscribe שזה אומר העתקה עם שמירת הקשר לאפליקציה הקודמת כך שכל עדכון שיבוצע באפליקציית ה-Master, יעדכן את האפליקציה הכפופה.

#### ניהול קוד חיצוני
בפיתוח וולידציות, פעולות DML וכו' מומלץ להשתמש בפונקציות ובStored Precedures במקום בקוד שכותבים בדף עצמו. כך ניתן לקדם שימוש חוזר ותחזוקה נוחה של הקוד (בעת המעבר לארכיטקטורה החדשה הדבר נדרש להיבחן מחדש י.ק.)

**נכון בעיקר לוולידציות וכו'. מאושר.**


#### Developer skill sets
בכל צוות פיתוח בינוני עד גדול של APEX סוגי המפתחים אמורים להיות:  
1. **Basic Developer:** אמור לדעת SQL באופן בסיסי ובאופן יותר ספציפי אמור לדעת PL/SQL.
רוב השימוש יהיה ברכיבים מובנים של ה-APEX ובמסדי הנתונים.  
2. **Advanced Developer:**
נסיון של מספר שנים בפיתוח APEX, ידע מעמיק ב-PL/SQL וכן JavaScript. אמור לבקר פעילות של מפתחים אחרים, לכתוב מסמכי איפיון והגדרת סטנדרטים של פיתוח.  
3. **UI Developer:**
	זהו תפקיד המצריך מומחיות ב- HTML, CSS ובעקרונות עיצוב ממשק משתמש (UI). אמור להיות אחראי על הגדרת ה-Look&Feel עבור כל היישומים. אמור להיות אחראי להבטחת חוויית משתמש עקבית (UX) בכל האפליקציות בארגון.  
4.  **Integration Developer:**
ככל שאפליקציות הולכות ונהיות מורכבות, כמו יישומים בענן המתקשרים עם מערכות או משאבים אחרים דרך האינטרנט, הדרישה הולכת וגוברת למומחים במבני נתונים ופרוטוקולים כמו REST, SSL, JSON,
ופרוטוקולים אחרים. בדרך כלל מוטלת על המומחים הללו להגדיר ולהטמיע תהליכי העברת נתונים מ- ואל  היישומים השונים.  
5. **DBA:** מומחי מסדי נתונים של אורקל הם לעתים קרובות קריטיים, במיוחד עבור פרוייקטי פיתוח בקנה מידה גדול. עליהם להיות מעורבים מאוד בתכנון, יצירה וניהול של
אובייקטים ושל מסדי נתונים ע"מ להבטיח מעקב אחר הסטנדרטים של הארגון. לדוגמא, ווידוא של כתיבת קוד תקינה כך שביצועי האפליקציה וה-DB יהיו תקינים ולא יורעו ע"י קוד באיכות נמוכה.  
בנוסף, מפעם לפעם יש צורך לנהל   SSL Certificates, DB Wallets ו-
היבטים נוספים של ארכיטקטורת המערכת.  

החלק העיקרי של מפתחי ה-APEX זקוקים לידע ב-SQL & PL.SQL ולא כולם אמורים להיות מומחים ב-CSS, HTML, ו- JavaScript וכן לא מומחים ב-UX אולם מומלץ לייחד מספר מועט  של מפתחים מומחים לעניינים אלו ולהגביל את יתר המפתחים לטפל אך ורק בתחומי הקומפוננטות הסטנדרטיות של APEX.
כך לדוגמא, מפתח שאינו מומחה ב-JavaScript יכול לבזבז זמן עתק בפיתוח יישומון מגניב בJavascript אך התוצאה לרוב אינה תואמת את יתר הפעולות באפליקציה ולכן הינה בזבוז זמן פיתוח יקר. גרוע מכך, אותה הפעולה יכולה היתה להתממש בקלות יותר, באמצעות פעולה דקלרטיבית פשוטה יותר אם היתה נעשית ע"י המפתח המומחה לעניין.


## ייצוא אפליקציות 

האפליקציות המיוצאות מכילות את כל האובייקטים של האפליקציה, הכוללים פלאג-אין, CSS, JS, רשימות ערכים, תמונות וכו' אך לא את אובייקטי ה-DB שהיא משתמשת בהם וכן לא Data.  
על האפליקציות המיוצאות להישמר במערכת לשמירת גרסאות, כחלק מניהול הגרסאות הכולל, ולאחר ביצוע ה-CHeckOut ניתן לייבא אותה לסביבות ה-Test וכן ה-Production.  

>  מומלץ מאד, לייבא את האפליקציה לסביבות הבאות עם **אותו מזהה אפליקציה.**   

> (לבדיקה: איך ניתן לייצא Workspace שלם ** כולל האפליקציות שבתוכו**.)
> בנוסף לנסות את האקספורט של אובייקט כולל ה
 

ניתן לייצא כל קומפוננטה בנפרד ובכך לשמור על ייצוא וייבוא סטרילי יותר, אך יש בכך סיכון שהייצוא לא יכלול רכיבים קריטיים. כך לדוגמא רשימת ערכים שעלולה להיות חסרה.

> על מנת להיות מסוגל לייבא רכיבים באופן סלקטיבי, ללא בעיית התנגשות מזהים, יש לייצא ולייבא Workspace שלמים. כפי שהוזכר לעייל בסעיף [סביבות](Oracle%20Lifecycle%20Management.md#env)
 
 
>  **שים לב: התערבות בתהליך הייצוא, איחוד קבצים מיוצאים, החזרה מגרסה אחרת, או כל התערבות אחרת בקובץ המיוצא עלול לגרום לתהליך הייבוא להיכשל. במקרים קשים, זה עלול להסתיים ב-Data Corruption של האפליקציה ובחוסר יכולת להתאושש מתהליך כושל שכזה.**
>  

## גיבוי שחזור והתאוששות

בכל פעילות פיתוח בהיקף גדול, יש לתכנן את האפשרות של אבדן מידע או תקלת Data corruption כזה או אחר במסד הנתונים. יש לקחת בחשבון נפילה מלאה או חלקית של מסד הנתונים המכיל את האפליקציות, לרבות מצב שבו בטעות בוצעה מחיקה של סכמת APEX_200100 כדוגמא. כמענה לבעיות אלו, יש לוודא שאנו יודעים: 

* האם ניתן לשחזר את הסביבה\אפליקציות?
* כמה זמן זה ייקח?
* כמה פיתוחים יאבדו?

#### אפליקציית Application Archive 
במסגרת היישומים המגיעים כ-Packaged Applications הוא APEX Application Archive.  
היישום הזה מאפשר לבצע גיבוי של האפליקציות לתוך טבלאות בתוך סכמת הAPEX המשוייכת ל-Workspace של המפתח הרלוונטי. המידע יכול להשמר בצורה אינקרמטלית  עבור כל שינוי או כגיבוי מלא של האפליקציה. ניתן לבחור אילו אפליקציות יגובו בכל אחד מסוגי הגיבוי.  בשלב מאוחר יותר, ניתן לבצע שחזור ישירות מהארכיב או לבצע הורדה למחשב של המפתח והעלאה חזרה לסביבה הייעודית.  
כמו"כ, האפליקציה עוקבת אוטומטית אחר הגרסאות ומראה מתי כל אחת מהאפליקציות שלך גובתה לאחרונה וכן מאפשרת לציין את מספר הגרסאות שברצונך לשמור לכל יישום ומתי ניתן למחוק גרסאות ישנות יותר.

#### גיבוי חיצוני של אפליקציות
אלטרנטיבה לאפליקציית Application Archive היא גיבוי חיצוני של הסכמה בתיקיות Source Control חיצוני כדוגמת Git. תיקיית ה-ZIP של התקנת סכמת ה-APEX המקורית מכילה שתי תוכניות JAVA תחת /utilities/oracle/apex.  

- APEXExport.class
- APEXExportSplitter.class 

התוכניות הללו יכולות לשמש לצורך ייצוא אפליקציות ו\או רכיבים באפליקציה ישירות לשרת הגיבוי כגיבוי לילי.  זה מענה טוב מאד ל-Disaster Recovery. כמו בייצוא של אפליקציה דרך הדפדפן, גם הייצוא של התוכניות הללו הם קבצי סקריפט SQL  שיכולים לשמש כקבצי התקנה של Workspace שלם או של אפליקציה בודדת. התוכנית APEXExport יכולה לשמש לצורך ייצוא של אפליקציה בודדה\Workspace דרך Command Line וללא הצורך בביצוע ייצוא ידני של האפליקציה דרך הדפדפן. התוכנית APEXExportSplitter יכולה לייצא אפליקציה כשכל רכיב מיוצא לקובץ סקריפט נפרד. באופן הייצוא הזה, ניתן לנטר שינויים שחלו לפי רכיב באפליקציה וללא צורך בחפירה מיותרת בקוד.  
הג'ובים האלו יכולים להיות ממוכנים בקלות באמצעות CRON Jobs שמריצים Shell Scripts שיבצע את הייצוא וההעברה של הסקריפטים לSource Control כמו Git.  

#### שחזור רכיבי אפליקציה ששונו\נמחקו 
ניתן לשחזר רכיבים באפליקציה ששונו או נמחקו, כמו דף באפליקציה או כל רכיב אחר. השחזור יכול להתבצע באמצעות ייצוא של האפליקציה עם ציון כמות הדקות אחורה שבנקודת הזמן ההיא, האפליקציה היתה טובה יותר בעיני המפתח. הפעולה מבצעת ייצוא של האפליקציה ללא כל השינויים שהיו בתקופת הזמן שצויינה - בין הרצויים ובין שאינם רצויים.   <p dir="ltr">
This utility uses the Oracle Database dbms_flashback package, and utilizes the Oracle Database undo logs. The length of time a
developer can go back is determined by the Oracle Database startup parameter undo_retiention, and
how quickly the undo tablespace is archived.  
</p>

#### שחזור סביבת פיתוח

בהנחה שה- DBA מריץ גיבויים ליליים מלאים של מסדי הנתונים המלא ניתן לשחזר את סביבת הפיתוח בכל התרחישים. אך גיבויים קבועים של Workspaces & Applications אל תיקיות  Source Controls יהפכו את ההתאוששות למהירה יותר ופשוטה יותר ועם איבוד זמן פיתוח מועט יותר.
אם מסד הנתונים נפגם כולו או חלקו, ונדרש לשחזר את בסיס הנתונים כולו, עם השחזור של מסד הנתונים ישחוזרו באופן מלא גם סביבות העבודה של הAPEX  כפי שהיו בזמן הגיבוי.  
עם זאת, אם רק סכמת APEX_XXXXXX נפגמה וצריכה להיות משוחזרת מתוך הגיבוי המלא של מסד הנתונים, זה הופך להיות מורכב הרבה יותר כאשר אין גיבוי מקומי של הסביבה בקבצי הסקריפט.  
ע"מ לשחזר את הסכמה, יהיה צורך להוריד את הגירסה המתאימה של Application Express מאורקל, ואז להתקין אותה ב-DB. אם קיימים גיבויים מתאימים, ניתן יהיה בשלב הזה להריץ את הסקריפטים שיטענו את האפליקציות פנימה. אם לא, ה- DBA יצטרך להקים DB חדש בו הוא ישחזר את הגיבוי המלא. ואז לבצע ייצוא וייבוא של כל ה- Workspaces ו\או Applications לסביבת הפיתוח שנפגמה. 

#### סיכום 
בניית אפליקציות מבוססות WEB באמצעות APEX היא דרך יעילה מאוד. בין אם מדובר במפתח אחד, או צוות מפתחים. בהתחשב בהבדלים בין האופן שבו מפתחים עובדים עם אפליקציות APEX לבין שפות המבוססות על כתיבת קבצים, חשוב להבין וליישם את הBest Practice עבור פיתוח ו-Deploy של אפליקציות במספר סביבות ו\או מספר מהדורות.
המלצות אלו חשובות עבור כל פיתוח ובמיוחד עבור צוותי פיתוח גדולים יותר המפתחים יישומים מורכבים וקריטיים יותר, לא מעט בגלל שהם מאפשרים לנהל פרויקטים של אפליקציית אקספרס באותו אופן כמו אלה המבוססים על טכנולוגיות אחרות.  

>יש לקחת בחשבון את הדברים הבאים: 
>
• יש לשמור את כל אובייקטי מסד הנתונים באמצעות קבצי סקריפט SQL  
• יש להשתמש בקבצי סקריפט SQL כדי לבצע את שינויי ה(DDL - database definition language) וכן שינויי הנתונים הנדרשים (DML - database manipulating language)  
• יש להתקין את אפליקציית APEX בהגדרה של Run Only בסביבות QA / TEST (סביבה שעליה תבוצע בדיקת ה-Deploy) וכן PROD.  
• ייצוא של Workspaces שלמים מסביבת הפיתוח וייבואם ל- QA / TEST ו-PROD  
• יש לוודא ע"י המפתחים שכל גרסאות קבצי ההרצה נשמרים בתיקיית ה-Source Control u ונשלח ל-DBA קובץ סקריפט release.sql אחד ויחיד לצורך ההרצה ב- QA / Test ו- PROD  
• יש לשחרר במידת האפשר ובהקדם הניתן תיקוני באגים כחלק מהעלאת גרסה  תקופתית.  
• יש להשתמש ב Build Option כדי לא לכלול רכיבים, הנמצאים תחת פיתוח, בקובץ המיוצא  
• עדיף להפריד פונקציונליות לאפליקציות בודדות וקטנות יותר במקום אפליקציה אחת וגדולה יותר  
• יש להגדיר אפליקציית "מאסטר" ושכל האפליקציות האחרות יהיו רשומות על הרכיבים המרכזיים של אפליקציית המאסטר כ-Subscribe  
• יש לכתוב את הלוגיקה העסקית ככל האפשר מחוץ לאפליקציה. עדיפות לכתיבת פרוצדורה\פונקציה במסד הנתונים במקום לכתוב את הלוגיקה בפרוצדורות באפליקציה עצמה.  
• ביצוע Export של אפליקציות שלמות ולא ייצוא של רכיבים מתוך האפליקציות, למעט תיקוני באגים בקריטיות גבוהה.  
• לצורך גיבוי אפליקציות מתוזמן יש להשתמש ב-Application Archive של APEX ו / או APEXExport.class ו- APEXExportSplitter.class באמצעות תהליך מתוזמן ושמירת הסקריפטים בתיקיית ה-Source Control





</div>

## Additional technical information
##### Comparing Application Exports
There is an excellent open source product called [APEX Diff](https://github.com/OraOpenSource/apex-diff) which creates JSON exports of an application
which can be easily compared with other versions of the application.  
This product is one of the best alternatives for comparing different releases of an application.  
Using regular ‘diff’ tools to analyze the deltas between two application export files, exported from
different environments, will raise a very large number of false positives, making it nearly impossible
to identify true differences in functionality. The main reason for this is that every component ID is
different when an application is exported from a different environment.
Regular ‘diff’ tools can identify differences between two exports of the same application taken from
the same environment at different times, for example two different versions stored in source
control. The differences will be represented as changed API parameters, such as in calls to
<a>wwv_flow_api.create_page_plug</a>, in the script files. As such reviewing such differences is of limited value, except to very experienced Application Express developers who have an intimate
understanding of the underlying meta-data tables, and can correlate differences in API parameters to
specific application components. The application statistics at the top of the export files will provide differences in total components, which may provide some value.  

>  **Warning: Merging of application export files, or in any way modifying the application export
script files is not supported. Updating one of these files, directly with a diff tool or text editor,
may cause the import of the application to fail. This may also corrupt your Application
Express meta data, which may be unrecoverable.**


#### Command-Line Export Utilities
An alternative to storing application archives directly within your development schema is to back up
your applications into your source control system. The Oracle Application Express installation zip
file include two Java programs APEXExport.class and APEXExportSplitter.class. Both files can be
found under /utilities/oracle/apex.  
These programs can be used for extracting applications and/or
application components directly into source control on a nightly basis. These backups are excellent
for disaster recovery. The output from these Java programs are SQL script files that can be used to
completely rebuild an entire workspace and/or applications as needed.  
The program APEXExport can be used to export Oracle Application Express applications or
workspaces from the command-line, without requiring a manual export from the Web interface of
Oracle Application Express.  
 The program APEXExportSplitter can be used used to split Oracle
Application Express export files into separate SQL scripts. This is useful for management of files
corresponding to the discrete elements of an Application Express application. These jobs can easily
be set up within a CRON job, that runs a shell script, to automatically export the required
applications, and use command line source control tools, such as git, to check the artifacts into your
source control system.  


You must be in the utilities directory when executing any of the code examples below.  
To review all of the available options, run the following:  
```shell

 java oracle.apex.APEXExport
 ```
 
To generate an SQL script file for each workspace, run the following:  
```shell  
java oracle.apex.APEXExport -db localhost:1521:ORCL -user system -password
systems_password -expWorkspace 
```  

To generate an SQL script file for every application in all workspaces, run the following:  
```shell  
java oracle.apex.APEXExport -db localhost:1521:ORCL -user system -password
systems_password -instance
 ```  

To generate an SQL script file for all applications in a single workspace, run the following:  
```shell  
java oracle.apex.APEXExport -db localhost:1521:ORCL -user system -password
systems_password –workspaceid 9999
``` 
To generate an SQL script file for a single application, run the following:  
```shell
java oracle.apex.APEXExport -db localhost:1521:ORCL -user system -password
systems_password –applicationid 31500 
```
To generate multiple SQL script files for an application, run the following:  
```shell
java oracle.apex.APEXExportSplitter f31500.sql
``` 
#### Example Utilization of Command-Line Export Utility  
The Application Express Development Team utilizes Hudson to automate our continuous
integration, whereby the complete development environment is exported into subversion and then
rebuilt into a new environment nightly. Using built-in Hudson capabilities you can define shell
scripts similar to the example below.  
The process followed in the script is to first check out the current version of each application from
source code control utilizing Hudson's SVN integration features. The application SVN files can be
locked or created as required.  
```svn 
svn co $SVN_URL $APP_DIR
svn lock –force --message "$LOCK_MSG" "$appFileName" || { touch "$appFileName" && svn
add "$appFileName" ; } 
```
After the SVN structure has been established, the APEXExport tool is used to extracted the current
version of the application file. Options below remove the date stamp from the export (-
skipExportDate) to allow SVN to recognize differences in the exports.
```shell
java oracle.apex.APEXExport \
-db $APEXDB \
-user $APEXDB_UN \
-password $APEXDB_PW \
-applicationid $appID\
-skipExportDate
```
The output file from APEXExport is saved to the current (utilities) directory. Then the file names
are adjusted and moved to the appropriate location in the SVN directory.
```shell 
mv -f f${appID}.sql $appFileName
```
Commit the new version of the application to SVN
```shell
svn commit --non-interactive --message "$COMMIT_MSG"
svn unlock --force
```