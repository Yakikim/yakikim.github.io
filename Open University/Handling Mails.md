---
tags: [documents, spec, op, po , suppliers, assessment ]  
created: 2021-01-06 17:23
modified: 2021-05-24 17:34
type: Document
title: Handling Mails
---
<div dir="rtl">


[[2021-05-23]]

# איסוף מידע וחילול הודעות MAIL
	
[[index]]/[[Open University]]/[[ERP]]/[[Purchasing]]/[[Supplier Assessment]]
## אובייקטים ותוכניות עזר
### עדכונים באובייקטים קיימים

>יש לשנות את טבלת  OP_APEX_141_MAIL_PARAMTERS ולהוסיף בה עמודה מסוג Varchar2  
>יש לשקף את תוספת העמודה גם במסך האפליקציה.  

>```sql
ALTER TABLE OP_APEX_141_MAIL_PARAMTERS 
ADD MAIL_TO VARCHAR2(100);
>```

### מבנה נתונים : T_PO_ROW
מבנה הנתונים יכיל:

| שם משתנה | סוג הנתונים |
| :--| :-- |
| TYPE | VARCHAR |
|VENDOR_NAME | VARCHAR2|
|PO_NUMBER | VARCHAR2|
|PO_DESCRIPTION |VARCHAR2|
 |APPROVED_DATE| DATE |
 |ITEM_DESCRIPTION| VARCHAR2|
 |QUANTITY | NUMBER |
 |UOM | VARCHAR2|
 | UNIT_PRICE | NUMBER |
 |NEED_BY_DATE |DATE |
 |PO_AMMOUNT | VARCHAR2| 
|LAST_PO_RECEIPT | DATE |
|ACTIVE_ENC_AMOUNT | NUMBER |

### תוכנית עזר: GET_PO_DETAIL
> ##### תיאור הפונקציה:
התוכנית הזו תספק מידע מההזמנות המקושרות לחשבונית מסויימת ובכך תסייע להצגת מידע תומך למשתמשים שנדרשים לבצע הערכת ספקים. 
####  קלט ופלט:  
| | משתנה | סוג |
|-- | :--| :-- |
| **קלט** | P_INVOICE_ID | NUMBER |
| **קלט** | P_IS_ACTIVE | VARCHAR2| 
| **פלט** | V_PO_ROWS|  TABLE OF T_PO_ROW |

#### פעולת הפונקציה 
הפונקציה תחזיר את המידע דלהלן כמבנה נתונים מסוג TABLE OF T_PO_ROW העשוי להכיל כמה שורות של מבנה הנתונים מסוג T_PO_ROW.

```sql
SELECT 'הזמנה סטנדרטית' TYPE,
       VEND.VENDOR_NAME,
       PHA.SEGMENT1 PO_NUMBER,
       PHA.COMMENTS PO_DESCRIPTION,
       PHA.APPROVED_DATE,
       PLA.ITEM_DESCRIPTION,
       PLLA.QUANTITY,
       PLA.UNIT_MEAS_LOOKUP_CODE UOM,
       PLA.UNIT_PRICE ||
       DECODE(PHA.CURRENCY_CODE, 'ILS', '', ' ' || PHA.CURRENCY_CODE) UNIT_PRICE,
       PLLA.NEED_BY_DATE,
       SUM(CASE
             WHEN (NVL(PHA.CANCEL_FLAG, 'N') = 'Y' OR
                  NVL(PLA.CANCEL_FLAG, 'N') = 'Y' OR
                  NVL(PLLA.CANCEL_FLAG, 'N') = 'Y') THEN
              NVL(PDA.AMOUNT_BILLED, 0) * NVL(PDA.RATE, 1)
             WHEN (NVL(PHA.CLOSED_CODE, '?') = 'FINALLY CLOSED' OR
                  NVL(PLA.CLOSED_CODE, '?') = 'FINALLY CLOSED' OR
                  NVL(PLLA.CLOSED_CODE, '?') = 'FINALLY CLOSED') THEN
              NVL(PDA.AMOUNT_BILLED, 0) * NVL(PDA.RATE, 1)
             WHEN NVL(PHA.AUTHORIZATION_STATUS, '?') NOT IN
                  ('PRE-APPROVED', 'IN PROCESS', 'APPROVED') THEN
              NVL(PDA.AMOUNT_BILLED, 0) * NVL(PDA.RATE, 1)
             ELSE
              GREATEST(NVL(NVL(PDA.AMOUNT_BILLED, 0) * NVL(PDA.RATE, 1), 0),
                       NVL(NVL(PDA.QUANTITY_ORDERED, 0) * NVL(PLA.UNIT_PRICE, 0) *
                           NVL(PDA.RATE, 1),
                           0))
           END) ||
       DECODE(PHA.CURRENCY_CODE, 'ILS', '', ' ' || PHA.CURRENCY_CODE) PO_AMMOUNT,
       (SELECT MAX(TRANSACTION_DATE)
          FROM MTL_MATERIAL_TRANSACTIONS
         WHERE TRANSACTION_ACTION_ID != 24
           AND (ORGANIZATION_ID = 42)
           AND (TRANSACTION_TYPE_ID = 18 AND TRANSACTION_SOURCE_TYPE_ID = 1 AND
               TRANSACTION_SOURCE_ID = PHA.PO_HEADER_ID)
           AND (LOGICAL_TRANSACTION = 2 OR LOGICAL_TRANSACTION IS NULL)) LAST_PO_RECEIPT,
       SUM(PO_INQ_SV.GET_ACTIVE_ENC_AMOUNT(PDA.RATE,
                                           PDA.ENCUMBERED_AMOUNT,
                                           PLLA.SHIPMENT_TYPE,
                                           PDA.PO_DISTRIBUTION_ID)) ACTIVE_ENC_AMOUNT
  FROM PO_HEADERS_ALL               PHA,
       PO_VENDORS_ACTIVE_AP_V       VEND,
       PO_LINES_ALL                 PLA,
       PO_LINE_LOCATIONS_ALL        PLLA,
       PO_DISTRIBUTIONS_ALL         PDA,
       AP_INVOICE_DISTRIBUTIONS_ALL AIDA
 WHERE PHA.PO_HEADER_ID = PLA.PO_HEADER_ID
   AND PLA.PO_LINE_ID = PLLA.PO_LINE_ID
   AND PLLA.LINE_LOCATION_ID = PDA.LINE_LOCATION_ID
   AND AIDA.PO_DISTRIBUTION_ID = PDA.PO_DISTRIBUTION_ID
   AND PHA.VENDOR_ID = VEND.VENDOR_ID
   AND PHA.AUTHORIZATION_STATUS = 'APPROVED'
   AND PHA.TYPE_LOOKUP_CODE = 'STANDARD'
   AND PDA.PO_RELEASE_ID IS NULL
   AND (PO_INQ_SV.GET_ACTIVE_ENC_AMOUNT(PDA.RATE,
                                           PDA.ENCUMBERED_AMOUNT,
                                           PLLA.SHIPMENT_TYPE,
                                           PDA.PO_DISTRIBUTION_ID) > 0.1 OR NVL(P_IS_ACTIVE, 'N') = 'N')
   AND AIDA.INVOICE_ID = &P_INVOICE_ID
 GROUP BY VEND.VENDOR_NAME,
          PHA.SEGMENT1,
          PHA.COMMENTS,
          PHA.APPROVED_DATE,
          PLA.ITEM_DESCRIPTION,
          PLLA.QUANTITY,
          PLA.UNIT_MEAS_LOOKUP_CODE,
          PLA.UNIT_PRICE,
          PHA.CURRENCY_CODE,
          PLLA.NEED_BY_DATE,
          PHA.PO_HEADER_ID
UNION ALL
SELECT 'שחרור מהסכם' TYPE,
       VEND.VENDOR_NAME,
       PHA.SEGMENT1 || '/' || PRA.RELEASE_NUM PO_NUMBER,
       PHA.COMMENTS PO_DESCRIPTION,
       PRA.APPROVED_DATE,
       PLA.ITEM_DESCRIPTION,
       PLLA.QUANTITY,
       PLA.UNIT_MEAS_LOOKUP_CODE UOM,
       PLLA.PRICE_OVERRIDE ||
       DECODE(PHA.CURRENCY_CODE, 'ILS', '', ' ' || PHA.CURRENCY_CODE) UNIT_PRICE,
       PLLA.NEED_BY_DATE,
       SUM(CASE
             WHEN (NVL(PRA.CANCEL_FLAG, 'N') = 'Y' OR
                  NVL(PLLA.CANCEL_FLAG, 'N') = 'Y') THEN
              NVL(PDA.AMOUNT_BILLED, 0) * NVL(PDA.RATE, 1)
             WHEN (NVL(PRA.CLOSED_CODE, '?') = 'FINALLY CLOSED' OR
                  NVL(PLLA.CLOSED_CODE, '?') = 'FINALLY CLOSED') THEN
              NVL(PDA.AMOUNT_BILLED, 0) * NVL(PDA.RATE, 1)
             WHEN NVL(PRA.AUTHORIZATION_STATUS, '?') NOT IN
                  ('PRE-APPROVED', 'IN PROCESS', 'APPROVED') THEN
              NVL(PDA.AMOUNT_BILLED, 0) * NVL(PDA.RATE, 1)
             ELSE
              GREATEST(NVL(NVL(PDA.AMOUNT_BILLED, 0) * NVL(PDA.RATE, 1), 0),
                       NVL(NVL(PDA.QUANTITY_ORDERED, 0) *
                           NVL(PLLA.PRICE_OVERRIDE, 0) * NVL(PDA.RATE, 1),
                           0))
           END) ||
       DECODE(PHA.CURRENCY_CODE, 'ILS', '', ' ' || PHA.CURRENCY_CODE) PO_AMMOUNT,
       (SELECT MAX(TRANSACTION_DATE)
          FROM MTL_MATERIAL_TRANSACTIONS
         WHERE TRANSACTION_ACTION_ID != 24
           AND (ORGANIZATION_ID = 42)
           AND (TRANSACTION_TYPE_ID = 18 AND TRANSACTION_SOURCE_TYPE_ID = 1 AND
               TRANSACTION_SOURCE_ID = PRA.PO_RELEASE_ID)
           AND (LOGICAL_TRANSACTION = 2 OR LOGICAL_TRANSACTION IS NULL)) LAST_PO_RECEIPT,
       SUM(PO_INQ_SV.GET_ACTIVE_ENC_AMOUNT(PDA.RATE,
                                           PDA.ENCUMBERED_AMOUNT,
                                           PLLA.SHIPMENT_TYPE,
                                           PDA.PO_DISTRIBUTION_ID)) ACTIVE_ENC_AMOUNT
  FROM PO_HEADERS_ALL               PHA,
       PO_VENDORS_ACTIVE_AP_V       VEND,
       PO_LINES_ALL                 PLA,
       PO_LINE_LOCATIONS_ALL        PLLA,
       PO_DISTRIBUTIONS_ALL         PDA,
       PO_RELEASES_ALL              PRA,
       AP_INVOICE_DISTRIBUTIONS_ALL AIDA
 WHERE PHA.PO_HEADER_ID = PLA.PO_HEADER_ID
   AND PLA.PO_LINE_ID = PLLA.PO_LINE_ID
   AND PLLA.LINE_LOCATION_ID = PDA.LINE_LOCATION_ID
   AND PRA.PO_RELEASE_ID = PLLA.PO_RELEASE_ID
   AND PRA.PO_HEADER_ID = PHA.PO_HEADER_ID
   AND AIDA.PO_DISTRIBUTION_ID = PDA.PO_DISTRIBUTION_ID
   AND PHA.VENDOR_ID = VEND.VENDOR_ID
   AND PHA.AUTHORIZATION_STATUS = 'APPROVED'
   AND PHA.TYPE_LOOKUP_CODE = 'BLANKET'
   AND PDA.PO_RELEASE_ID IS NOT NULL
   AND (PO_INQ_SV.GET_ACTIVE_ENC_AMOUNT(PDA.RATE,
                                           PDA.ENCUMBERED_AMOUNT,
                                           PLLA.SHIPMENT_TYPE,
                                           PDA.PO_DISTRIBUTION_ID) > 0.1 OR NVL(P_IS_ACTIVE, 'N') = 'N')
   AND AIDA.INVOICE_ID = &P_INVOICE_ID
 GROUP BY VEND.VENDOR_NAME,
          PLLA.PRICE_OVERRIDE,
          PHA.SEGMENT1,
          PHA.COMMENTS,
          PRA.APPROVED_DATE,
          PLA.ITEM_DESCRIPTION,
          PLLA.QUANTITY,
          PLA.UNIT_MEAS_LOOKUP_CODE,
          PLA.UNIT_PRICE,
          PHA.CURRENCY_CODE,
          PLLA.NEED_BY_DATE,
          PHA.PO_HEADER_ID,
          PRA.RELEASE_NUM,
          PRA.PO_RELEASE_ID

```


## פונקציה ראשית: COLLECT_BODY_INFO
> ### תיאור הפונקציה:
תפקידה הוא לחולל ולסדר את המידע שישמש את המשתמש שנדרש לבצע את ההערכה, כך שהערכתו תהיה מבוססת על מידע לגבי הרכישות האחרונות שיוצג בפניו.
המידע ייאסף ויוצג ע"פ אלגוריתם שייכתב בהמשך.
הצגת המידע תהיה בפורמט HTML ותיעשה באמצעות שימוש בפונקציות הרלוונטיות שבמארז OP_HTML_ALERT
> ### קלט ופלט
> 
| | משתנה | סוג | ברירת מחדל |
|-- |:--| :-- | -- |
| **קלט** | P_PERSON_NOTIF_ID | NUMBER | חובה |
| **קלט** | P_TASK_DATE | DATE| חובה |
|**קלט**| P_MAIL_DESC| VARCHAR2 | NULL |
|**קלט**| P_MAIL_BODY | VARCHAR2/LONG | NULL|
| **פלט** | V_FINAL_BODY|  VARCHAR2/LONG| | 
> ### הערות נוספות לשלב זה:
יש להוסיף מלל מנחה בשפה חופשית בתחילת כל שלב (לדוגמא: *--here will come the invoices display section*  וכן הלאה.  

### פעולת הפונקציה
יוגדרו משתני עזר הבאים:  
>  
 | שם המשתנה | טיפוס הנתונים | אתחול המשתנה |  
|:--|:-- | -- |  
|T_PO_TAB |  TABLE OF T_PO_ROW| יש לאתחל ללא ערכים|
| V_IS_SPECIFIED | VARCHAR2| בשליפה דלעייל|
|V_VENDOR_ID | NUMBER | בשליפה דלעייל|
| V_INVOICE_ID | NUMBER | בשליפה דלעייל | 
| G_DAYS_FOR_GM_REVAL | NUMBER | בשליפה דלעייל|
| G_MIN_PO_AMT | NUMBER | בשליפה דלעייל |
|G_GM_QRS_REQ_QTY| NUMBER | בשליפה דלעייל |
|G_INV_SUM_DAYS| NUMBER | בשליפה דלעייל |


ראשית, יש לשרשר למשתנה V_FINAL_BODY שיוחזר כפלט, את פרטי הכותרת העליונה של המייל (Header) (שימי לב, זהו לא ה-Subject של המייל אלא הכותרת העליונה בגוף המייל)באמצעות שימוש בתוכנית CUSTOM_HEADER שבמארז OP_HTML_ALERT.  
  
דוגמא מאלרט קיים, לגבי אופן השימוש במארז לצורך הוספת כותרת בגוף המייל (ניתן לראות את התוצר של האלרט [כאן](http://10.147.15.78:8080/My/DIST/%D7%9E%D7%9B%D7%99%D7%A8%D7%95%D7%AA%20%D7%99%D7%95%D7%9D%20%D7%94%D7%90%D7%AA%D7%9E%D7%95%D7%9C%20-%20%D7%A1%D7%A4%D7%A8%D7%99%20%D7%94%D7%95%D7%A6%D7%90%D7%AA%20%D7%94%D7%A1%D7%A4%D7%A8%D7%99%D7%9D.msg) ) :  
```sql 

	SELECT OP_HTML_ALERT.CUSTOM_HEADER(TITLE             => 'דוח מכירות יום אתמול',
                                   ALERT_NAME        => 'OP: Lamda Sales(HTML)',
                                   ALERT_DESCRIPTION => 'מכירות יום אתמול של ספרי הוצאת הספרים')
  FROM DUAL;
```
#### גוף המייל - חלק ראשון  
התוכנית תבצע הוספה של הכותרת בצורה הבאה: 
```sql
V_FINAL_BODY:= OP_HTML_ALERT.CUSTOM_HEADER(TITLE             => P_MAIL_DESC,
                                   ALERT_NAME        => 'תאריך שליחה ראשונה: '|| P_TASK_DATE,
                                   ALERT_DESCRIPTION => P_MAIL_BODY );
```
#### גוף המייל - חלק שני  
התוכנית תיצור את **גוף המייל והאינפורמציה העסקית שבו**.  
ראשית, התוכנית תאכלס את משתני העזר:
```sql
SELECT TASK.IS_SPECIFIED,
       TASK.INVOICE_ID,
       PARAMETER.G_DAYS_FOR_GM_REVAL,
       PARAMETER.G_MIN_PO_AMT,
       PARAMETER.G_GM_QRS_REQ_QTY,
       PARAMETER.G_INV_SUM_DAYS
  INTO V_IS_SPECIFIED,
       V_VENDOR_ID,
       V_INVOICE_ID,
       G_DAYS_FOR_GM_REVAL,
       G_MIN_PO_AMT,
       G_GM_QRS_REQ_QTY,
       G_INV_SUM_DAYS
  FROM OP_APEX_141_TASKS           TASK,
       OP_APEX_141_TASK_PARAMETERS PARAMETER,
       OP_APEX_141_PERSON_NOTIF    NOTIF
 WHERE TASK.TASK_ID = NOTIF.TASK_ID
   AND PARAMETER.TASK_ID = TASK.TASK_ID
   AND NOTIF.PERSON_NOTIF_ID = P_PERSON_NOTIF_ID;

```
אם חזרו נתונים, יש להמשיך לשלב 1.1 
אם לא חזרו נתונים, יש להמשיך לשלב 4.1
#### אלגוריתם איסוף נתונים - שלב 1.1 
בצע בדיקה האם סך השאלונים שנשלחו להערכת הגורם המעריך הראשי בתקופה האחרונה אינו גדול מהמשתנה . הבדיקה תיעשה באמצעות חישוב השאלונים בתקופת הימים שבין יום הריצה לבין G_DAYS_FOR_GM_REVAL הימים שלפני. 
```SQL
SELECT COUNT(1)
  FROM OP_APEX_141_TASKS TASK
 WHERE TASK.RESULT_CODE = 'INITIATED'
   AND TASK.VENDOR_ID = < V_VENDOR_ID >
   AND TASK.LAST_UPDATE_DATE >= SYSDATE - < G_DAYS_FOR_GM_REVAL >
```
באם כמות השאלונים הינה שווה או גדולה מהכמות שחזרה מהמשתנה
G_GM_QRS_REQ_QTY  , המשך לשלב 3.1
אם לא, המשך לשלב 2.1
#### אלגוריתם איסוף נתונים - שלב 2.1

יש להגדיר  CURSOR שיחזיק את הרשומות שיחזרו מהשליפה הבאה:
```sql
SELECT APS.VENDOR_NAME,
       AI.INVOICE_DATE,
       AI.INVOICE_AMOUNT ||
       DECODE(AI.INVOICE_CURRENCY_CODE,
              'ILS',
              '',
              ' ' || AI.INVOICE_CURRENCY_CODE) INVOICE_AMOUNT,
       AI.DOC_SEQUENCE_VALUE INVOICE_NO,
       AD.DESCRIPTION,
       AD.QUANTITY_INVOICED,
       AD.MATCHED_UOM_LOOKUP_CODE UOM,
       AD.UNIT_PRICE,
       AD.TOTAL_DIST_AMOUNT ||
       DECODE(AI.INVOICE_CURRENCY_CODE,
              'ILS',
              '',
              ' ' || AI.INVOICE_CURRENCY_CODE) TOTAL_DIST_AMOUNT,
       AD.PO_DISTRIBUTION_ID
  FROM AP_INVOICES_ALL              AI,
       AP_INVOICE_DISTRIBUTIONS_ALL AD,
       AP_SUPPLIERS                 APS
 WHERE AI.INVOICE_ID = AD.INVOICE_ID
   AND APS.VENDOR_ID = AI.VENDOR_ID
   AND AD.LINE_TYPE_LOOKUP_CODE NOT IN ('AWT', 'PREPAY')
   AND AI.INVOICE_TYPE_LOOKUP_CODE <> 'PREPAYMENT'
   AND AI.WFAPPROVAL_STATUS = 'WFAPPROVED'
   AND AI.CREATION_DATE > SYSDATE - G_INV_SUM_DAYS
   AND (AD.REVERSAL_FLAG = 'N' OR AD.REVERSAL_FLAG IS NULL)
   AND AI.VENDOR_ID = V_VENDOR_ID
   AND AI.INVOICE_ID IN
       (SELECT DISTINCT AIA.INVOICE_ID
          FROM AP_INVOICES_ALL AIA, AP_INVOICE_DISTRIBUTIONS_ALL ADA
         WHERE ADA.INVOICE_ID = AIA.INVOICE_ID
           AND AIA.VENDOR_ID = APS.VENDOR_ID
           AND ADA.LINE_TYPE_LOOKUP_CODE NOT IN ('AWT', 'PREPAY')
           AND AIA.INVOICE_TYPE_LOOKUP_CODE <> 'PREPAYMENT'
           AND AIA.WFAPPROVAL_STATUS = 'WFAPPROVED'
           AND AIA.CREATION_DATE > SYSDATE - G_INV_SUM_DAYS
           AND (ADA.REVERSAL_FLAG = 'N' OR ADA.REVERSAL_FLAG IS NULL)
           AND ROWNUM < 4);

```
אם לא חזרו רשומות, עבור לשלב 4.1  
אם חזרו רשומות,  

 אז עבור כל שורה שתחזור, יש לבדוק:
```SQL
...IF CRSOR.PO_DISTRIBUTION_ID IS NOT NULL THEN 
```
אם התנאי מתקיים, יש לבצע הוספה של שורות T_PO_ROWS לתוך המשתנה T_PO_TAB באמצעות שליחה של **_CURSOR_**.INVOICE_ID לפונקציה GET_PO_DETAIL.
הערך הנוסף (P_IS_ACTIVE) שיישלח לפונקציה יכיל  'Y'.  
אם התנאי לא מתקיים,  
אז אם **ורק אם** מדובר בשורה הראשונה ב-CURSOR,  יש לשרשר את קוד הHTML הבא למשתנה V_FINAL_BODY (**חשוב מאד: על הקוד הבא להשתרשר 
 <u>פעם אחת</u> במהלך שלב 2.1 ** ולא לבצע קוד זה עבור כל שורה בCURSOR! ) :  
```sql
'<p class=MsoNormal ><span class=class1>
פירוט פעילות ספק אחרונה בהיבט חשבוניות הרכש:
</span> </p>' ||
OP_HTML_ALERT.TABLE_HEADER(P_HEADER_1  => 'שם ספק',
                                  P_HEADER_2  => 'תאריך החשבונית',
                                  P_HEADER_3  => 'סכום החשבונית',
                                  P_HEADER_4  => 'מספר הוראת תשלום',
                                  P_HEADER_5  => 'תיאור פריט\שירות',
                                  P_HEADER_6  => 'כמות בשורת חשבונית',
                                  P_HEADER_7  => 'יחידת חיוב',
                                  P_HEADER_8  => 'מחיר ליחידה',
                                  P_HEADER_9 => 'סכום שורת חשבונית')
```
ולאחרי זה, עבור כל שורה ב-CURSOR (**חשוב מאד: כל שורה - כולל השורה הראשונה**) יש לבצע 
 הוספה של השורה שחזרה מה-CURSOR לטבלת ה-HTML , שתופיע במייל, באמצעות השרשור של המלל החוזר מן הפונקציה הבאה למשתנה V_FINAL_BODY:
```sql 
OP_HTML_ALERT.TABLE_DATA(P_NUM_OF_BLOCKS => 9,
                                P_HEADER_1      => VENDOR_NAME,
                                P_HEADER_2      => INVOICE_DATE,
                                P_HEADER_3      => INVOICE_AMOUNT,
                                P_HEADER_4      => INVOICE_NO,
                                P_HEADER_5      => DESCRIPTION,
                                P_HEADER_6      => QUANTITY_INVOICED,
                                P_HEADER_7      => UOM,
                                P_HEADER_8      => UNIT_PRICE,
                                P_HEADER_9      => TOTAL_DIST_AMOUNT)
```  
בסיום השלב, יש לעבור לשלב 5.1

#### אלגוריתם איסוף נתונים - שלב 3.1  
יש לבצע הוספה של שורות T_PO_ROWS לתוך המשתנה T_PO_TAB באמצעות שליחה של **V**_INVOICE_ID לפונקציה GET_PO_DETAIL. הערך הנוסף (P_IS_ACTIVE) שיישלח לפונקציה יכיל  'Y'.

אם לא חזרו רשומות מהפונקציה, עבור לשלב 4.1   
יש לעבור לשלב 5.1
 
#### אלגוריתם איסוף נתונים - שלב 4.1 
יש להוסיף הערה שלא נמצאו נתונים.  
יש להוסיף למשתנה V_FINAL_BODY את המלל:  
``` HTML
<tr>
<td colspan="3"> </br></br></br></br>
<p class=MsoNormal ><span class=class1>
לא נתקבלה היסטוריית פעילות מול הספק. 
</span> </p>
</td>
</tr>
<tr>
<td colspan="3">
<table>
<td>
<tr> 
```

לאחר ההוספה יש לעבור לשלב 6.1
 
#### אלגוריתם איסוף נתונים - שלב 5.1 
בשלב זה תתבצע הוספה של טבלת נתוני ההזמנות לגוף המייל.  
אם אין נתונים בטבלה T_PO_TAB יש לעבור לשלב 6.1  
אם יש נתונים, יש לבצע כדלהלן:  

ראשית, יש לשרשר למשתנה V_FINAL_BODY את קוד הHTML הבא:
``` html
</table>
</td>
</tr> 
<tr>
<td colspan="3"> </br></br></br></br>
<p class=MsoNormal ><span class=class1>
פירוט פעילות ספק אחרונה בהיבט הזמנות הרכש:
</span> </p>
</td>
</tr>
<tr>
<td colspan="3">
``` 

שנית, יש להוסיף **פעם אחת** את המלל שחוזר מהפונקציה הבאה, אל תוך המשתנה V_FINAL_BODY  :  
```sql 
OP_HTML_ALERT.TABLE_HEADER(P_HEADER_1  => 'סוג ההזמנה',
                                  P_HEADER_2  => 'שם ספק',
                                  P_HEADER_3  => 'מספר הזמנה',
                                  P_HEADER_4  => 'תיאור הכותרת בהזמנה',
                                  P_HEADER_5  => 'סכום ההזמנה',
                                  P_HEADER_6  => 'תאריך אישור ההזמנה',
                                  P_HEADER_7  => 'תיאור פריט\שירות',
                                  P_HEADER_8  => 'כמות',
                                  P_HEADER_9  => 'יחידת מידה',
                                  P_HEADER_10 => 'מחיר ליחידה',
                                  P_HEADER_11 => 'מועד הקבלה האחרונה למלאי',
                                  P_HEADER_12 => 'דרוש עד')
 
```

לאחר מכן, יש להוסיף **עבור כל שורה שבטבלה T_PO_TAB ** את הערך שלה שחוזר מהפונקציה הבאה, אל תוך המשתנה V_FINAL_BODY:
```SQL 
OP_HTML_ALERT.TABLE_DATA(P_NUM_OF_BLOCKS => 12,
                                P_HEADER_1      => TYPE,
                                P_HEADER_2      => VENDOR_NAME,
                                P_HEADER_3      => PO_NUMBER,
                                P_HEADER_4      => PO_DESCRIPTION,
                                P_HEADER_5      => PO_AMMOUNT,
                                P_HEADER_6      => APPROVED_DATE,
                                P_HEADER_7      => ITEM_DESCRIPTION,
                                P_HEADER_8      => QUANTITY,
                                P_HEADER_9      => UOM,
                                P_HEADER_10     => UNIT_PRICE,
                                P_HEADER_11     => LAST_PO_RECEIPT,
                                P_HEADER_12     => NEED_BY_DATE)
```
לסיום, יש לעבור לשלב 6.1 


#### חלק שלישי  - שלב 6.1
התוכנית תוסיף את הכותרת התחתונה (FOOTER) של גוף המייל בצורה הבאה:
```sql
V_FINAL_BODY := V_FINAL_BODY ||  OP_HTML_ALERT.CUSTOM_FOOTER();
```

ולבסוף התוכנית תחזיר כפלט את V_FINAL_BODY



## פונקצייה ראשית: BUILD_MAIL 

 >  ### תיאור הפונקציה:
התוכנית הזו תשמש כתוכנית מעטפת שתקבל נתונים אודות נוטיפיקציה ותחזיר רשומה מסוג מייל שיישלח למעריכים\מנהלים.
### קלט ופלט  
| | משתנה | סוג |
|-- | :--| :-- |
| **קלט** | P_PERSON_NOTIF_ID | NUMBER |
| **פלט** | V_MAIL_ROW|  T_MAIL_ROW |


 ### איתחול הפונקציה    
 
  יוגדרו משתני עזר הבאים:    
  
 | שם המשתנה | טיפוס הנתונים | אתחול המשתנה |  
|:--| :-- | -- |  
|V_FINAL_BODY| LONG/VARCHAR2| ללא |
|V_MAIL_TO|VARCHAR2| שליפה 2 לעייל|  
|V_MAIL_CC|VARCHAR2| שליפה 2 לעייל|  
|V_MAIL_BCC|VARCHAR2| שליפה 2 לעייל|  
|V_MAIL_SUBJECT|VARCHAR2| שליפה 2 לעייל|  
|V_MAIL_BODY|VARCHAR2/LONG| שליפה 2 לעייל|  
|V_MAIL_DESC|VARCHAR2/LONG| שליפה 2 לעייל|  
|V_VENDOR|VARCHAR2|שליפה 1 לעייל|
|V_WORKER_NAME|VARCHAR2|שליפה 1 לעייל|
|V_WORKER_MAIL|VARCHAR2|שליפה 1 לעייל|
|V_DIR_NAME|VARCHAR2| שליפה 1 לעייל|
|V_TOP_NAME|VARCHAR2| שליפה 1 לעייל|
|V_DIR_MAIL|VARCHAR2| שליפה 1 לעייל|
|V_TOP_MAIL|VARCHAR2| שליפה 1 לעייל|
|V_CEO_NAME|VARCHAR2| שליפה 3 לעייל|
|V_CEO_MAIL|VARCHAR2| שליפה 3 לעייל|
|V_INVOICE_NUM|VARCHAR2|שליפה 1 לעייל|
|V_SUB_ACCOUNT|VARCHAR2|שליפה 1 לעייל|
|V_BEGIN_DATE|VARCHAR2|שליפה 1 לעייל|
|V_LINK|VARCHAR2|שליפה 1 לעייל|

#### השמת המשתנים  
אם אחת מהשליפות אינה מחזירה נתונים, נא להחזיר שגיאה ללוג.  
***שליפה 1:***
 ``` sql
	SELECT NOTIF.NOTIF_TYPE,
	TASK.BEGIN_DATE,
       VENDORS.VENDOR_NAME,
       PERSON.EMP_NAME,
       PERSON.MAIL_ADRESS,
       PERSON.DIRECT_MNGR_NAME,
       PERSON.TOP_MGR_NAME,
       PERSON.DIR_MGR_EMAIL,
       PERSON.TOP_MGR_EMAIL,
       AIA.INVOICE_NUM,
       TASK.SUB_ACCOUNT,
       TASK.BEGIN_DATE,
       (SELECT VALUE
          FROM APEX_INSTANCE_PARAMETERS
         WHERE NAME = 'EMAIL_INSTANCE_URL') ||
       APEX_UTIL.PREPARE_URL('f?p=141:Q::' ||
                             APEX_ESCAPE.HTML(SURVEY.ROW_KEY) || ':::code:' ||
                             APEX_ESCAPE.HTML(PERSON.Q_KEY)) AS LINK
  INTO V_VENDOR,
       V_WORKER_NAME,
       V_WORKER_MAIL,
       V_DIR_NAME,
       V_TOP_NAME,
       V_DIR_MAIL,
       V_TOP_MAIL,
       V_INVOICE_NUM V_SUB_ACCOUNT,
       V_BEGIN_DATE,
       V_Q_KEY,
       V_LINK
  FROM OP_APEX_141_PERSON_NOTIF NOTIF,
       OP_APEX_141_TASKS        TASK,
       OP_APEX_141_TASK_PERSONS PERSON,
       PO_VENDORS_ACTIVE_AP_V   VENDORS,
       AP_INVOICES_ALL          AIA,
       EBA_SB_SURVEYS           SURVEY
 WHERE NOTIF.NOTIF_STATUS = 'NEW'
   AND TASK.TASK_ID = PERSON.TASK_ID
   AND PERSON.PERSON_TASK_ID = NOTIF.PERSON_TASK_ID
   AND TASK.VENDOR_ID = VENDORS.VENDOR_ID
   AND SURVEY.ID = PERSON.SURVEY_ID
   AND TASK.INVOICE_ID = AIA.INVOICE_ID (+)
   AND NOTIF.PERSON_NOTIF_ID = <P_PERSON_NOTIF_ID> ;
	```

***שליפה 2:***
	```sql
SELECT M_PARAM.MAIL_TO,
       M_PARAM.CC,
       M_PARAM.BCC,
       M_PARAM.SUBJECT,
       M_PARAM.BODY,
       M_PARAM.STEP_DESC,
  INTO V_MAIL_TO,
       V_MAIL_CC,
       V_MAIL_BCC,
       V_MAIL_SUBJECT,
       V_MAIL_BODY,
       V_MAIL_DESC
  FROM OP_APEX_141_PERSON_NOTIF NOTIF, OP_APEX_141_MAIL_PARAMTERS M_PARAM
 WHERE M_PARAM.STEP_CODE = NOTIF.NOTIF_TYPE
   AND NOTIF.PERSON_NOTIF_ID = < P_PERSON_NOTIF_ID >;
   >	```

***שליפה 3:***
	```sql
SELECT EMP.EMP_NAME, EMPDET.EMAIL
  INTO V_CEO_NAME, V_CEO_MAIL
  FROM EMPLOYEE_DETAILS_TAB@PRX_OP_LINK EMP,
       KOACH.EMPLOYEES@PRX_OP_LINK      EMPDET
 WHERE JOB_POSSITION = '003'
   AND EMP_STATUS = 'ע'
   AND EMP_DEPTNO = '010'
   AND EMPDET.EMPLOYEEID = EMP.MIS_ZEHUT
   AND ROWNUM = 1;
```

### פעולת הפונקציה    
הפונקציה תעבור בלופ עבור כל אחד מן המשתנים דלהלן:

| שם המשתנה | 
|:--| 
|V_VENDOR|
|V_WORKER_NAME|
|V_WORKER_MAIL|
|V_DIR_NAME|
|V_TOP_NAME|
|V_DIR_MAIL|
|V_TOP_MAIL|
|V_CEO_NAME|
|V_CEO_MAIL|
|V_INVOICE_NUM|
|V_SUB_ACCOUNT|
|V_BEGIN_DATE|
|V_LINK|
ועבור כל אחד מהם תבצע REPLACE לערכים שלהם במשתנים הבאים: 

 | שם המשתנה |
|:--|   
|V_MAIL_TO|
|V_MAIL_CC|
|V_MAIL_BCC|
|V_MAIL_SUBJECT|
|V_MAIL_BODY|  

כך לדוגמא, עבור המשתנה V_VENDOR שחזר מן השליפה, יש להחליף כל מופע של P_VENDOR שיופיע באחד השדות שבטבלת ההגדרות OP_APEX_141_MAIL_PARAMTERS : 
```sql
REPLACE( V_MAIL_TO, 'P_VENDOR'  , V_VENDOR );
REPLACE( V_MAIL_CC, 'P_VENDOR'  , V_VENDOR );
REPLACE( V_MAIL_BCC, 'P_VENDOR'  , V_VENDOR );
REPLACE( V_MAIL_SUBJECT, 'P_VENDOR'  , V_VENDOR );
REPLACE( V_MAIL_BODY, 'P_VENDOR'  , V_VENDOR );
```
לאחר שכל המשתנים שהיו בשדות טבלת ההגדרות הוחלפו בערכים הנכונים, התוכנית תבצע איסוף של מידע שיש להציגו למשתמש באמצעות פונקציית העזר COLLECT_BODY_INFO ותצרף את המידע הנוסף למשתנה V_FINAL_BODY . דוגמא אפשרית למימוש:
```sql
V_FINAL_BODY := COLLECT_BODY_INFO(P_PERSON_NOTIF_ID, V_BEGIN_DATE, V_MAIL_DESC, V_MAIL_BODY );
```



ולבסוף הפונקציה תחזיר כפלט את רשומת T_MAIL_ROW (יש לזכור לאכלס גם את השדה P_PERSON_NOTIF_ID שבמבנה הנתונים)


## תוכנית ראשית: HANDLING_MAILS 


תוכנית זו תהיה אחראית על:
1. איסוף המידע שנדרש לצורך שליחת המייל לנמענים הנדרשים לבצע הערכת ספק, או לנמענים הנדרשים לפקח על ביצוע ההערכה ע"י העובד שתחתם.
1. תהליך איסוף המידע שנדרש להציג לנמענים.
1. ארגון וסידור המידע בתצורת מייל HTML.
1. שליחת המייל בפועל.


> ### קריאה לתוכנית   
> הקריאה לתוכנית תתבצע מהתוכנית MAIN לאחר שהתוכנית סיימה להריץ את התוכנית 
HANDLING_NOTIFS_STATUSES. שבתוכנית זו בוצע עדכון רשימות הנמענים והמיילים שעליהם לקבל. 
> ### קלט ופלט  
ייתכן והתוכנית תרוץ כתוכנית נפרדת בשלב כלשהו ותתוזמן בנפרד ולכן נדרשים הקלט והפלט דלהלן:
>
| שם משתנה  | טיפוס הנתונים |  סוג המשתנה |
| :-- | :-- | :-- |
| X_RESULT | varchar2 | IN\OUT | 
| X_RESULT_DESCRIPTION |  Varchar2 | IN\OUT |

### פעולת התוכנית
#### משתני עזר
יוגדרו משתני עזר הבאים:  

| שם המשתנה | טיפוס הנתונים | אתחול המשתנה |  
|:--| :-- | -- |  
|T_MAIL_ROW |RECORD| ללא |  
| T_MAILS_TAB | TABLE OF T_MAIL_ROW | ללא | 
|V_MAIL_ID|NUMBER|ללא|
הצעה לסקריפט:
- נא להתעלם מגודל המשתנים.  
- יש לנהל בשום שכל כך שהתוכנית תתפקד טוב עם כל המלל שיישלח.
- את יצירת ה-TYPE אני מניח שיש לבצע ברמת המארז, להחלטתך.

```sql
CREATE TYPE T_MAIL_ROW AS OBJECT (
  PERSON_NOTIF_ID NUMBER,
  MAIL_BODY  VARCHAR2(4000),
  MAIL_SUBJECT VARCHAR2(4000),
  MAIL_TO VARCHAR2(512),
  MAIL_CC  VARCHAR2(512),
  MAIL_BCC VARCHAR2(512),
);


CREATE TYPE T_MAILS_TAB IS TABLE OF T_MAIL_ROW;
```
#### לולאת נתונים
התוכנית תרוץ ב-LOOP עבור כל רשומה מן הרשומות הבאות:  
```sql
SELECT NOTIF.PERSON_NOTIF_ID, NOTIF.PERSON_TASK_ID, NOTIF.TASK_ID
  FROM OP_APEX_141_PERSON_NOTIF NOTIF
 WHERE NOTIF.NOTIF_STATUS = 'NEW';
```  
#### שליחה לתוכנית BUILD_MAIL
עבור כל רשומה התוכנית תשלח לתוכנית העזר  BUILD_MAIL את המשתנה PERSON_NOTIF_ID  ותקבל בחזרה RECORD  מסוג T_MAIL_ROW   
לאחר חזרת המשתנה T_MAIL_ROW מהפונקציה, התוכנית תבצע הוספה של המשתנה מסוג T_MAIL_ROW לתוך טבלת המשתנים T_MAILS_TAB. 

#### שליחה לתוכנית SEND_MAIL וביצוע עדכון סטטוסים

 התוכנית תריץ את התוכנית SEND שבמארז APEX_MAIL. הפונקציה מקבלת את נתוני המייל ומחזירה את הערך MAIL_ID (שאותו יש להכניס למשתנה V_MAIL_ID) הפונקציה מוגדרת כך:
```sql
  FUNCTION SEND(P_TO        IN VARCHAR2,
                P_FROM      IN VARCHAR2,
                P_BODY      IN CLOB,
                P_BODY_HTML IN CLOB DEFAULT NULL,
                P_SUBJ      IN VARCHAR2 DEFAULT NULL,
                P_CC        IN VARCHAR2 DEFAULT NULL,
                P_BCC       IN VARCHAR2 DEFAULT NULL,
                P_REPLYTO   IN VARCHAR2 DEFAULT NULL) RETURN NUMBER;
```

עבור כל רשומת T_MAIL_ROW שבטבלת T_MAILS_TAB התוכנית תריץ את הפונקציה:
```SQL
  V_MAIL_ID := APEX_MAIL.SEND(P_TO   => T_MAIL_ROW.MAIL_TO,
                              P_FROM => 'POSurvey@openu.ac.il',
                              P_BODY => T_MAIL_ROW.MAIL_BODY,
                              P_SUBJ => T_MAIL_ROW.MAIL_SUBJECT,
                              P_CC   => T_MAIL_ROW.MAIL_CC,
                              P_BCC  => T_MAIL_ROW.MAIL_BCC);
```

באם הערך :
```sql 
V_MAIL_ID IS NOT NULL
```
אז יש לבצע את העדכונים הבאים:
```sql
UPDATE OP_APEX_141_TASKS
   SET RESULT_CODE = 'INITIATED', LAST_UPDATE_DATE = SYSDATE
 WHERE TASK_ID IN
       (SELECT TASK_ID
          FROM OP_APEX_141_PERSON_NOTIF
         WHERE PERSON_NOTIF_ID = T_MAIL_ROW.PERSON_NOTIF_ID);
```

```SQL
UPDATE OP_APEX_141_PERSON_NOTIF
   SET SENT_DATE = SYSDATE, NOTIF_STATUS = 'SENT', MAIL_ID = V_MAIL_ID
 WHERE PERSON_NOTIF_ID = T_MAIL_ROW.PERSON_NOTIF_ID;

```

#### ביצוע PUSH_QUEUE

לאחר סיום המעבר על הלולאה, יש לבצע בסוף התוכנית קריאה לתוכנית הבאה, בצורה הבאה:
```sql
BEGIN
  APEX_MAIL.PUSH_QUEUE;
END;
```

### לוגים וטיפול בשגיאות
יש לכתוב את הלוגים בתוכניות הראשיות עם פירוט רמת ה-TASK_ID.  
כמו כן,  בכל לוג שיש לי את המידע, אז בתיאור הלוג, יש לציין את המזהה של ה- 
PERSON_NOTIF_ID. 


	
</div>
	
#op/erp/po/suppliers/assessment