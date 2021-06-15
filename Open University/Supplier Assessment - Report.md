---
tags: [documents, spec, op, po, assessment,]  
created: 2021-06-03 12:16
modified: 2021-06-03 12:16
type: Document
title: Supplier Assessment - Report
link: [[Supplier Assessment - Report | דוח היררכיות הערכת ספקים]]
---
[[2021-05-30]]
# דוח היררכיות - הערכת ספקים
[[index]]/[[Open University]]/[[ERP]]/[[Purchasing]]/[[Supplier Assessment]]
## רקע
אפליקציה 141 - הערכת ספקים

לצורך הצגת תמונת מאשרים וחיבורים, יש להציג למשתמשים תמונת מצב עדכנית של המשתמשים וההיררכיות שמעליהם בהתבסס על חשבוניות נתונות
* שם הדף יהיה "היררכיות נמענים לחשבונית"
* תפריט הגישה לדף - תחת תפריט "ניהול" 
* פתיחה ראשונה של הדף ללא הרצת הדוח.
* הדוח יהיה בתצורת Master-detail
* יש לתת פתרון יצירתי לתצוגת שלש רמות בן לרמת האב  

## פרמטרים לדוח
| parameter col name | parameter title | default value |
| ------------------ | --------------- | ------------- |
| invoice_date       | מתאריך          | sysdate-1     |
| invoice_date       | עד תאריך        | Null          |
| invoice_number     | מספר חשבונית    | null               |

> פרמטר "מספר חשבונית" יכיל ערך מתוך [[Supplier Assessment - Report#רשימת ערכים לפרמטר - מספר חשבונית | רשימת הערכים לפרמטר]] להלן כאשר **רשימת הערכים מותנית** בפרמטר התאריך (אם נבחר)

## שדות הדוח - Master
| Column Name             | Column Title |
| ----------------------- | ------------ |
| מספר חשבונית            |      INVOICE_NUM        |
| סכום חשבונית            |      INVOICE_AMOUNT        |
| תאריך חשבונית           |        INVOICE_DATE      |
| תאריך אישור\שינוי אחרון |      LAST_UPDATE_DATE        |
| שם ספק                  |     VENDOR_NAME         |
| תחום רכש                |       PURCH_CAT       |
| תת חשבון                |       SUB_ACCOUNT       |
| מאשר ראשון              |        FIRST_APPROVER      |
| דורש                    |       REQUESTOR       |
| יוזם                    |      INITITATOR        |

## שדות הדוח - Detail
| Column Name      | Column Title    |
| ---------------- | --------------- |
| USERNAME         | שם משתמש        |
| EMP_NAME         | שם העובד        |
| EMAIL            | מייל עובדד      |
| PHONE_3          | טלפון עובד      |
| EMP_DEPT_DESC    | מחלקת עובד      |
| JOB_POS_DESC     | תפקיד העובד     |
| EMP_STATUS_DESC  | סטטוס עובד      |
| DIRECT_MNGR_NAME | שם מנהל ישיר    |
| DIR_MGR_EMAIL    | מייל מנהל ישיר  |
| TOP_MGR_NAME     | שם מנהל יחידה   |
| TOP_MGR_EMAIL    | מייל מנהל יחידה |
|                  |                 |
## רשימת ערכים לפרמטר - מספר חשבונית
רשימת הערכים תציג את כל השדות שבשליפה מלבד INVOICE_NUM
```SQL
SELECT AIA.INVOICE_NUM,
       AIA.INVOICE_AMOUNT,
       AIA.INVOICE_ID,
       AIA.LAST_UPDATE_DATE
FROM AP_INVOICES_ALL AIA
WHERE (AIA.LAST_UPDATE_DATE > <PARAMTER: FROM_DATE> OR <PARAMTER: FROM_DATE> IS NULL)
     AND (AIA.LAST_UPDATE_DATE <= <PARAMTER: TO_DATE> OR <PARAMTER: TO_DATE> IS NULL)
```
## שליפת נתונים - Master
```sql 
SELECT AIA.INVOICE_NUM,
       AIA.INVOICE_AMOUNT,
       AIA.INVOICE_DATE,
       AIA.LAST_UPDATE_DATE,
       VEN.VENDOR_NAME,
       PURCH.FLEX_VALUE || ' - ' || PURCH.DESCRIPTION PURCH_CAT,
       SUB.SUB_ACCOUNT,
       OP_APEX_141_VENDOR_ASSIGN_PKG.FIND_FIRST_APPROVER(AIA.INVOICE_ID) FIRST_APPROVER,
       OP_APEX_141_VENDOR_ASSIGN_PKG.FIND_REQUESTOR(AIA.INVOICE_ID) REQUESTOR,
       -- OP_APEX_141_VENDOR_ASSIGN_PKG.FIND_BUYER(aia.invoice_id) buyer,
       --OP_APEX_141_VENDOR_ASSIGN_PKG.FIND_PROF_FACTOR(aia.invoice_id) prof_factor
       OP_APEX_141_VENDOR_ASSIGN_PKG.FIND_INITIATOR(AIA.INVOICE_ID) INITITATOR
  FROM AP_INVOICES_ALL AIA,
       PO_VENDORS_ACTIVE_AP_V VEN,
       FND_FLEX_VALUES_VL PURCH,
       (SELECT DISTINCT CC.SUB_ACCOUNT, CC.SUB_ACCT_DESC, A.INVOICE_ID
          FROM AP_INVOICES_ALL              A,
               AP_INVOICE_DISTRIBUTIONS_ALL AIDA,
               MALAM_GL_CC_DESCRIPTION      CC
         WHERE A.WFAPPROVAL_STATUS = 'WFAPPROVED'
           AND A.INVOICE_ID = AIDA.INVOICE_ID
           AND A.INVOICE_TYPE_LOOKUP_CODE = 'STANDARD'
           AND AIDA.DIST_CODE_COMBINATION_ID = CC.CODE_COMBINATION_ID
           AND CC.SUB_ACCOUNT <> '0000'
           AND AIDA.LINE_TYPE_LOOKUP_CODE NOT IN ('AWT', 'PREPAY')
           AND TO_CHAR(A.CREATION_DATE, 'YYYY') > 2014
        UNION ALL
        SELECT DISTINCT CCD.SUB_ACCOUNT, CCD.SUB_ACCT_DESC, A.INVOICE_ID
          FROM AP_INVOICES_ALL              A,
               AP_INVOICE_DISTRIBUTIONS_ALL AIDA,
               MALAM_GL_CC_DESCRIPTION      CC,
               MALAM_GL_CC_DESCRIPTION      CCD,
               PO_DISTRIBUTIONS_ALL         PDA
         WHERE A.WFAPPROVAL_STATUS = 'WFAPPROVED'
           AND A.INVOICE_ID = AIDA.INVOICE_ID
           AND A.INVOICE_TYPE_LOOKUP_CODE = 'STANDARD'
           AND AIDA.DIST_CODE_COMBINATION_ID = CC.CODE_COMBINATION_ID
           AND AIDA.PO_DISTRIBUTION_ID = PDA.PO_DISTRIBUTION_ID
           AND PDA.CODE_COMBINATION_ID = CCD.CODE_COMBINATION_ID
           AND CC.SUB_ACCOUNT = '0000'
           AND CCD.SUB_ACCOUNT <> '0000'
           AND AIDA.LINE_TYPE_LOOKUP_CODE NOT IN ('AWT', 'PREPAY')
           AND TO_CHAR(A.CREATION_DATE, 'YYYY') > 2014) SUB

 WHERE PURCH.FLEX_VALUE_SET_ID = 1018439
   AND PURCH.FLEX_VALUE IN
       (SELECT F_SUB.ATTRIBUTE1
          FROM FND_FLEX_VALUES_VL F_SUB, FND_FLEX_VALUE_SETS FS_SUB
         WHERE NVL(FS_SUB.FLEX_VALUE_SET_NAME, 'MLM_SUB_ACCOUNT') =
               'MLM_SUB_ACCOUNT'
           AND F_SUB.FLEX_VALUE_SET_ID = F_SUB.FLEX_VALUE_SET_ID
           AND SYSDATE BETWEEN NVL(F_SUB.START_DATE_ACTIVE, SYSDATE - 1) AND
               NVL(F_SUB.END_DATE_ACTIVE, SYSDATE + 1) --Yaki
           AND NVL(F_SUB.ENABLED_FLAG, '?') = 'Y' --Yaki
           AND F_SUB.VALUE_CATEGORY = 'MLM_SUB_ACCOUNT' -- Yaki
           AND F_SUB.FLEX_VALUE = SUB.SUB_ACCOUNT)
   AND SUB.INVOICE_ID = AIA.INVOICE_ID
   AND VEN.VENDOR_ID = AIA.VENDOR_ID
   AND (AIA.LAST_UPDATE_DATE BETWEEN < PARAMTER :FROM_DATE > AND < PARAMETER
        :TO_DATE > OR < PARAMER :INVOICE_NUMBER > IS NOT NULL)
   AND AIA.INVOICE_NUM < PARAMER :INVOICE_NUMBER >
```

## שליפת נתונים - Detail
```sql
SELECT EMP.USERLOGIN AS USERNAME,
       EMP_HRR.EMP_NAME,
       EMP.EMAIL,
       EMP.PHONE_3,
       EMP_HRR.EMP_DEPT_DESC,
       EMP_HRR.JOB_POS_DESC,
       EMP_HRR.EMP_STATUS_DESC,
       EMP_HRR.DIRECT_MNGR_NAME,
       MGR_DIRECT.EMAIL         DIR_MGR_EMAIL,
       EMP_HRR.LEVEL_THREE_NAME TOP_MGR_NAME,
       TOP_MGR.EMAIL            TOP_MGR_EMAIL,
  FROM KOACH.EMPLOYEE_DETAILS_TAB@PRX_OP_LINK EMP_HRR,
       KOACH.EMPLOYEES@PRX_OP_LINK            EMP,
       KOACH.EMPLOYEES@PRX_OP_LINK            MGR_DIRECT,
       KOACH.EMPLOYEES@PRX_OP_LINK            TOP_MGR
WHERE EMP_HRR.MIS_ZEHUT = EMP.EMPLOYEEID
   AND EMP_HRR.DIRECT_MANAGER = MGR_DIRECT.EMPLOYEEID(+)
   AND EMP_HRR.LEVEL_THREE_MNGR = TOP_MGR.EMPLOYEEID (+)
   AND EMP.USERLOGIN = <MASTER: INITIATOR/REQUESTOR/FIRST_APPROVER>
```

#op/erp/po/suppliers/assessment 
#op/erp/apex