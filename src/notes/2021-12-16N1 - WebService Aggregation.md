---
layout: mynote
tags: [notes, memo, op] 
created: 2021-12-16 21:39
modified: 2021-12-16 21:39
type: Document
title:  WebService Aggregation 
---
Week Of: [[2021-12-12]]
[[2021-12-16]]


#  תזכיר בנושא  WebService Aggregation

[[home]]/[[Open University]]/[[Memos]]

## רקע\תיאור
           

שלום וברכה,

לדעתי הגעתי לפיצוח מעניין של אפשרות אגרגציה של נתונים שניתן להשתמש בה באופן יפה מאד. (מצרף לפה את אורי שעבר בשעה מאוחרת זו ותמה על שמחתי הרבה J ובמלים קלוקלות ניסיתי להסביר לו את זה)

התחקיתי אחרי פעולות ה-Parsing של ה-APEX והגעתי לדבר הבא שאולי יכול לקרות באופן אוטומטי ורוחבי עבור סוג השירותים שנרצה להתייחס אליהם כשירותים אגרגטיביים. (- כל שירות מסוג GET שמחזיר מספר רב של שורות) 
השליפה הבאה בעצם לוקחת שירות (ללא הזדהות Oauth בבדיקה זאת) ומציגה אותו כטבלא
````ad-code
collapse: open
title: Query
```plsql

SELECT SVC.*
FROM TABLE(WWV_FLOW_T_CLOB(APEX_WEB_SERVICE.MAKE_REST_REQUEST(P_URL         => 'https://apex-ora-devtest.openu.ac.il:8443/oradeva/auth/hr/employees/',
                                                                P_HTTP_METHOD => 'GET'))) APX,
       JSON_TABLE(APX.COLUMN_VALUE FORMAT JSON,
                  '$."items"[*]'
                  COLUMNS("empno" VARCHAR2(4000) PATH '$."empno"',
                          "rn" VARCHAR2(4000) PATH '$."rn"',
                          "ename" VARCHAR2(4000) PATH '$."ename"',
                          "job" VARCHAR2(4000) PATH '$."job"',
                          "mgr" VARCHAR2(4000) PATH '$."mgr"',
                          "sal" VARCHAR2(4000) PATH '$."sal"',
                          "comm" VARCHAR2(4000) PATH '$."comm"',
                          "deptno" VARCHAR2(4000) PATH '$."deptno"',
                          "hiredate" VARCHAR2(4000) PATH '$."hiredate"')) SVC;
```
````
שלב שני, יצרתי את זה כ-View
````ad-code
collapse: open

```plsql
CREATE OR REPLACE VIEW employees AS...
```
````

בצורה זאת ניתן לבצע פעולות אגרגטביות על שרת האפליקציה ולא על שרת ה-DB.
### דרישות ונקודות פתוחות
1. כדי לקבל תוצאות מלאות, נדרש ששירות המקור לא יגביל את מספר הרשומות לקריאה (או שיהיה נדרש לבצע את השליפה הזו בלולאה ולפתח לוגיקה לשם כך. אני לא בטוח שזה יותר טוב מאי הגבלה.) 
2. באם מעוניינים בתהליך רוחבי וכולל שיבוצע בעת רישום השירות, יש להקצות לכך את המשאבים
3. נקודה פתוחה - מבנה רצוי של Authentication&Authorization
4. כיצד יבוטאו שינויים שיבוצעו בהגדרת ה-WS

 
 
#memo #op/memo
