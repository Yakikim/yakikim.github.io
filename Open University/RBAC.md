---
tags: [apex, op, wiki, guide, rbac]  
created: 2021-04-25 16:10
modified: 2021-05-31 15:05
type: Document
title: RBAC
---
[[2021-04-01]]


# ממשק להפעלת מודל ניהול הרשאות – RBAC מתוך האורקל

[[index.html]]/[[Open University]]

# הקדמה


הפונקציות המרכיבות את הממשק מוגדרות במארז AUTH\_PKG שנמצא בסכמה amsterdam. בנוסף קיימים מספר Views שניתן להשתמש בהם כמפורט להלן.

יש לשים לב להגבלות הבאות:

1. יש להמנע משימוש ישיר בטבלאות המודל.

2. אין להשתמש בערך ID המופיע בטבלאות המודל. הוא מיועד לשימוש פנימי ועשוי להתחלף במשך הזמן ובין סביבות ריצה שונות.

3. חלק מהפרוצדורות והפונקציות המוגדרות ב-auth\_pkg מיועדות לשימוש פנימי. יש להשתמש רק בפונקציות המוגדרות במסמך זה.

# פונקציות ב-AUTH\_PKG

## הפונקציה check\_access

### תיאור

הפונקציה בודקת קיום הרשאה למשתמש.

### חתימה

```sql

-- returns TRUE when the specified user has a permission for the specified action on the specified resource and item
-- use cached roles
FUNCTION check_access(
    p_user_id VARCHAR2,
    p_resource VARCHAR2,
    p_resource_item VARCHAR2,
    p_action VARCHAR2,
    p_dynamic_roles VARCHAR2 := NULL)
RETURN BOOLEAN

```

           

### פרמטרים

p\_user\_id – מזהה המשתמש (נכון להיום ת"ז).

p\_resource – שם המשאב. למשל: 'Sheilta'.

p\_resource\_item – רכיב במערכת. כשאין מדיניות ברמת רכיב (בדרך כלל זה המצב) יש לתת את הערך NULL.

p\_action – שם ההרשאה. למשל: 'Access'.

p\_dynamic\_roles – אפשרות להוספת תפקידים באופן דינאמי בעקבות חישוב לוגי באפליקציה. כמו כן ניתן להציב כאן את הערך שחזר מהפונקציה get\_roles\_by\_context המתוארת בהמשך המסמך. הערך מורכב ממזהי התפקידים מופרדים בפסיקים. למשל: 'Special\_role,StudentM2,WORKER'.

## הפונקציה get\_roles\_by\_context

### תיאור

הפונקציה מחזירה רשימת תפקידים של המשתמש בהקשר נתון. את הערך שחוזר ניתן להעביר לפונקציה check\_access בפרמטר p\_dynamic\_roles על מנת שבדיקת ההרשאה תקח בחשבון גם את התפקידים בהקשר הנתון. יש לשים לב שחוזרים רק תפקידים שיש להם מדיניות על המשאב p\_resource. כלומר, יחזרו רק תפקידים שתהיה להם השפעה על ביצוע ה-check\_access בשלב הבא.

### חתימה

```sql

-- Returns roles associated with the user in the given context which are relevant to the specific application (has policies).
-- NO CACHE is used.
FUNCTION get_roles_by_context(
    p_user_id VARCHAR2,
    p_resource VARCHAR2,
    p_item_resource VARCHAR2,
    p_item_type VARCHAR2,
    p_item_value VARCHAR2)
RETURN VARCHAR2
```

           

### פרמטרים

p\_user\_id – מזהה המשתמש (נכון להיום ת"ז).

p\_resource – שם המשאב המכיל את **המדיניות** המבוקשת. כלומר על המשאב הזה יתבצע ה-check\_access בשלב הבא. למשל: Sheilta. בדרך כלל זהה לפרמטר p\_item\_resource, אבל יכול להיות שונה במקרה של "בשימוש מערכת".

p\_item\_resource – שם המשאב עליו מוגדרים התפקידים בהקשר וסוג הפריט המבוקש.

p\_item\_type – שם סוג הפריט.

p\_item\_value – ערך הפריט (ה"הקשר").

## הפונקציה get\_allowed\_resources

### תיאור

הפונקציה מחזירה רשימת משאבים שיש בהם למשתמש את ההרשאה הנתונה. נמצא בשימוש בעיקר עם הפרמטר p\_action=>'Access' לשם קבלת רשימת אפליקציות שלמשתמש יש אליהם הרשאת גישה.

### חתימה

```sql 
-- returns all allowed resources (RES | RES/ITEM) for specified resource type and action
-- no cache is used
FUNCTION get_allowed_resources(
    p_user_id VARCHAR2,
    p_resource_type VARCHAR2,
    p_action VARCHAR2)
RETURN VARCHAR2

```

           

### פרמטרים

p\_user\_id – מזהה המשתמש (נכון להיום ת"ז).

p\_resource\_type – מזהה מספרי של סוג המשאב. הערך שנפוץ בשימוש הוא **21** (אפליקציה).

p\_action – שם ההרשאה. למשל: 'Access'.

### דוגמה

```sql
SELECT * 
FROM my_appliations_table 
WHERE app_name IN (SELECT * FROM TABLE(str.split_to_table(
    auth_pkg.get_allowed_resources(:USER_ID, '21', 'Access')
)))

```

           

## הפונקציה get\_allowed\_resource\_items

### תיאור

הפונקציה מחזירה רשימת רכיבים במערכת שיש בהם למשתמש את ההרשאה הנתונה. יש לשים לב שבשונה מהפונקציה הקודמת, הבדיקה כאן תחומה לרשימת רכיבים בתוך משאב מסויים.

 ###  חתימה
 
 ```sql
 -- returns all allowed resource items for specific resource and action
-- no cache is used
FUNCTION get_allowed_resource_items(
    p_user_id VARCHAR2,
    p_resource VARCHAR2,
    p_action VARCHAR2)
RETURN VARCHAR2
```

           

### פרמטרים

p\_user\_id – מזהה המשתמש (נכון להיום ת"ז).

p\_resource – שם המשאב. למשל: 'Sheilta'.

p\_action – שם ההרשאה. למשל: 'Access'.

### דוגמה
```sql
SELECT * 
FROM my_appliations_table 
WHERE app_name IN (SELECT * FROM TABLE(str.split_to_table(
    auth_pkg.get_allowed_resource_items(:USER_ID, 'APEX', 'Access')
)))
```


           

## הפונקציה get\_allowed\_items

### תיאור

הפונקציה מחזירה את כל הפריטים שלמשתמש יש בהקשר שלהם את ההרשאה הנתונה. לדוגמה, באמצעות פונקציה זו ניתן לבקש את רשימת הקורסים עבורם רשום המשתמש בתפקיד "מרכז בקורס" בזכותם הוא מקבל הרשאה מסויימת במערכת הנתונה.

### חתימה

```sql
-- returns all allowed items for specific item type, resource and action
-- mandatory policies is not taken into account
-- no cache is used
FUNCTION get_allowed_items(
    p_user_id VARCHAR2,
    p_resource VARCHAR2,
    p_resource_item VARCHAR2,
    p_action VARCHAR2,
    p_item_resource VARCHAR2,
    p_item_type VARCHAR2)
```

           

### פרמטרים

p\_user\_id – מזהה המשתמש (נכון להיום ת"ז).

p\_resource – שם המשאב בו מוגדרת המדיניות. למשל: 'Sheilta'.

p\_resource\_item – הרכיב במערכת עליו מוגדרת המדיניות. במידה ורוצים את המדיניות הכללית (בדרך כלל זה המצב) יש לתת את הערך NULL.

p\_action – שם ההרשאה.

p\_item\_resource – שם המשאב עליו מוגדר סוג הפריט המבוקש.

p\_item\_type – שם סוג הפריט.

## הפונקציה get\_allowed\_actions

### תיאור

הפונקציה מחזירה את רשימת ההרשאות שיש למשתמש נתון במשאב נתון. שימושי ליצירת תפריט מותאם להרשאות משתמש. כדי לבדוק הרשאה על פעולה נתונה, עדיף להשתמש ב-check\_access.

### חתימה

```sql
-- returns all allowed actions for specified resource and item
-- no cache is used
FUNCTION get_allowed_actions(
    p_user_id VARCHAR2,
    p_resource VARCHAR2,
    p_resource_item VARCHAR2 := NULL)
RETURN VARCHAR2
```

           

### פרמטרים

p\_user\_id – מזהה המשתמש (נכון להיום ת"ז).

p\_resource – שם המשאב. למשל: 'Sheilta'.

p\_resource\_item – רכיב במערכת. כשאין מדיניות ברמת רכיב (בדרך כלל זה המצב) יש לתת את הערך NULL.

## הפונקציה is\_in\_role

### תיאור

הפונקציה בודקת קיומו של תפקיד עבור משתמש נתון.

עדיף להימנע משימוש בעבודה ישירה עם תפקידים באמצעות פונקציה זו, ולהעדיף עבודה מול הרשאות.

### חתימה
```sql
-- returns TRUE when the specified user has the specified role
-- cache is used
FUNCTION is_in_role(
    p_user_id VARCHAR2,
    p_resource VARCHAR2,
    p_role VARCHAR2)
RETURN BOOLEAN
```

           

## משתמשים בתפקיד - RBAC\_CLAIM\_USERS\_VU

### תיאור

מתאר את הקשר משתמשים בתפקיד. ניתן לקבל באמצעות ה-View את כל המשתמשים בתפקיד מסויים לפי resource\_name ו-claim\_value. ה-View לוקח בחשבון יחסי ירושה בין התפקידים. ה-View לוקח בחשבון תפקידים ארגוניים-אוטומטיים שמקורם בטבלאות  tvphonebook\_all\_um1 ו- employee\_details\_tab. ה-View **לא** לוקח בחשבון תפקידים אוטומטיים שמקורם בטבלאות הסטודנטים, tstuser\_tikshuv\_um1 ודומיהם. ה-View לא מחזיר תפקידים שהשיוך שלהם למשתמש מוגבל בזמן והם אינם בתוקף כעת.

### עמודות

claim\_id – אין להשתמש בעמודה זו.

resource\_name – שם המשאב עליו מוגדר התפקיד המבוקש.

claim\_value – שם התפקיד.

user\_id – מזהה המשתמש המשויך לתפקיד.

parent\_level – רמת שיוך: 0 => שיוך ישיר. 1 => המשתמש שייך לתפקיד בן של התפקיד הנוכחי. 2 => המשתמש שייך לתפקיד צאצא (שאינו בן) של התפקיד הנוכחי.

reason – סיבת השיוך. רשימת התפקידים בגללם קיבל המשתמש את השיוך לתפקיד הנוכחי (כולל ירושה). תפקידים בסוגריים מרובעים הם תפקידים אוטומטיים.

valid\_from – תאריך תחילת התוקף של השיוך (אם קיים).

valid\_to – תאריך פקיעת התוקף של השיוך (אם קיים).
	
## ייצוא וייבוא מסביבה לסביבה 

           

בסכמה Amsterdam יש פקג' RBAC\_EXIM.

מפעילים בסביבת המקור את הפונקציה export עם

clean\_all \= TRUE/FALSE

p\_resource \= מזהה האפליקציה (השם באנגלית). 

מתקבל קובץ CLOB עם סקריפט שניתן להריץ בסביבת היעד.
דוגמא להרצת הקובץ:

OP/ZYRMUGES50@ORATESTA

**נדרש לבצע COMMIT/ROLBACK בסיום!**
	
	</div>

#op/infrastractures
#rbac
#op/apex/management