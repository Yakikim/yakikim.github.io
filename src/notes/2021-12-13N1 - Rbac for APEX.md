---
layout: mynote
tags: [notes,apex, rbac, management, infrastructures , memo, op] 
created: 2021-12-13 16:52
modified: 2021-12-13 16:52
type: Document
title:  Rbac for APEX 
---
Week Of: [[2021-12-12]]
[[2021-12-13]]


# סיכום פגישה בנושא  [[RBAC]] for APEX

[[home]]/[[Open University]]/[[Memos]]

## רקע\תיאור
ישיבה זו היתה המשך לישיבה קודמת שנערכה בתאריך [[2021-12-07]] . בצמד הישיבות דנו במגוון נושאים שהיה צורך להבהירם ולדון בהם לאור הקמת הסביבה החדשה - סביבת האפליקציה של APEX. 
הישיבות עסקו בפן הטכני והמנהלי של ניהול הרשאות הגישה לאפליקציות בסביבה המוקמת 

### אופן אספקת השירותים ממערכת RBAC
כיום, הלוגיקה לבדיקת ההרשאות שבשימוש ה-FORMS ואפליקציות קיימות הנעזרות במערכת [[RBAC]] "משוכפל" בקוד PL-SQL על השרת TAMI.
חלק מאפליקציות ה-WEB משתמשות בשירות SOAP שנכתב וגם הוא מבצע את בדיקת הגישה. 
לאור החשש מהבדלים בין הלוגיקה הקיימת לבין הלוגיקה שבשירות ה-SOAP, הומלץ ע"י נחשון לייצא את הלוגיקה הקייימת על שרת ה-TAMI כשירות - ORDS.
### שיטת ההרשאות בסביבת ה-APEX החדשה
סוגיות שנידונו:
1. תהליך הקמת אפליקציה וניהול ההרשאות 
2. ניהול המשאבים במערכת הRBAC
3. שימוש באפשרות ה"רכיבים" (Sub-Resource) לטובת מהירות הגדרת אפליקציה חדשה וכן ריכוז חלק מן המערכות תחת משאב כללי, לשם הפשטה של תהליך ההרשאות.	
4. האם דרוש שינוי בתהליך ה Deployment	
5. Naming Convention וטבלת ההמרה המרכזת שבין שם המערכת ב-RBAC לבין האפליקציה ב-APEX		
6. האם יש להבדיל בין תהליך ההרשאות באפליקציות רוויות-קוד לבין אפליקציות מעוטות-קוד.
7. אילו שירותים נדרש לכתוב ובאיזו סכמה על שרת ה-TAMI

## משתתפים
- משולם יולזרי
- נחשון גבעוני
- שגיב ברהום
- יקי קמחי 

## מסקנות ופעולות

- צריכת השירותים בשכבת אפליקציית ה-APEX תיעשה, באמצעות פרוצדורה פנימית. (לצורך החלפה פשוטה של השירות בשירות REST גנרי עתידי שייכתב ויחליף את שירות ה-ORDS באופן שיהיה שקוף למשתמשים ולמפתחים)
- לא ינוהלו בקרות הרשאות OAuth2 ברמת הצרכן הסופי, אלא ברמת ה-Instance. כלומר, יוקם Client גנרי אחד שישרת את כל מי שיגש ולא יהיה שימוש ב-Client של האפליקציה ב-APEX המבקשת את השירות.
- שיטת ההרשאות לא תשתנה ותמשיך לייצג עולמות מוצר (תוכן) כמשאבים במערכת ה-RBAC . זאת לאור ההנחה שניהול ההרשאות יהיה בידי מי שמכיר את כלל המערכות, התהליכים והישויות והוא מנהל המוצר\מנתח המערכות.
- תוקם טבלת המרה בין ה-Application_id של ה-APEX לבין שם המשאב של ה-RBAC וייעשה בה שימוש בסביבת האפליקציה על אותו העיקרון כפי שנעשה כיום בסביבת ה-DB. 
- שמות המשאבים יהיו בשלב זה בתוספת APEX אך במדה ויוחלט להשתמש בשימוש חוצה פלטפורמות, תוסר תחילית ה-APEX ויעודכן במקביל טבלת ההמרה.
- ההעברה של הגדרת ההרשאות בין הסביבות תיעשה כפי שהיא כיום ועל שרת ה-TAMI. בשלב זה לא תיכתב מערכת שתבצע את ההעברה. 
###  Action Items	
באחריות שגיב:
תוקם סכמה (בשלב ראשון ב-DEVA) שתיקרא REST_AUTH.
לסכמה הזו יינתן הרשאה למארז AUTH_PKG.CHECK_ACCESS 

באחריות יקי:
פתיחת הסכמה ל-ORDS והקמת השירות שייקרא access ויהיה מבוסס על הפונקציה Check_access
איפיון וכתיבת התהליך של צריכת השירות שייעשה באמצעות פרוצדורה על ה-DB של האפליקציה שיבצע את הקריאה לשירות - access 

 
 
#memo #op/memo