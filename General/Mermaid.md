---
tags: [devops, mermaid, markdown, notes, op]  
created: 2021-05-25 12:27
modified: 2021-05-25 12:27
type: Document
title: Mermaid
---
[[2021-05-23]]
# Mermaid
[[index]]/ [[Professional]]


## Examples

```mermaid
graph RL
    id1{This is the text in the box} --> id2{hilton}
--> TD
    id2 <--> id3{somthing}
```
## pie
```mermaid
pie title Pets adopted by volunteers
	"Dogs" : 386
	"Cats" : 85
	"Rats" : 15
```
## Sequence
```mermaid
sequenceDiagram
autonumber
     participant חוץ 
     participant עזרה
     participant מזבח הפנימי
     participant פרוכת 
     participant קודש הקודשים
    עזרה -> עזרה : וידוי על פר החטאת
    עזרה -> עזרה : גורל שני השעירים 
    עזרה -> עזרה : וידוי שני על הפר 
    עזרה -> עזרה : שחיטת הפר 
    עזרה ->> קודש הקודשים: הכנסת המחתה והקטרת הקטורת 
    עזרה ->> קודש הקודשים: הזאת דם הפר על פני הכפורת
    עזרה ->> עזרה: שחיטת השעיר שעלה לה'
    עזרה ->> קודש הקודשים: הזאת דם השעיר על הכפורת ולפני הכפורת
    עזרה ->> פרוכת: הזאת דם הפר על הפרוכת
    עזרה->> פרוכת: הזאת דם השעיר על הפרוכת
    עזרה ->> מזבח הפנימי: הזאת דם הפר והשעיר על המזבח
    עזרה -> עזרה : וידוי על השעיר לעזאזל 
    עזרה -->> חוץ : שילוח השעיר לעזאזל
    קודש הקודשים --> עזרה : הוצאת הכף והמחתה
    עזרה -> עזרה: הקרבת עולתו ועולת העם
    עזרה -> עזרה : הקרבת חלב הפר והשעיר הפנימי
    עזרה -->> חוץ : שריפת הפר והשעיר הפנימי
```


          
## Internal link
```mermaid
graph TD
	HM["Hilton Meyer"]
	B["Dean"]
	C["Lily Meyer"]
	HM --> B
	HM --> C
	class HM,B internal-link;
```

## More about Mermaid: 
[mermaid - Markdownish syntax for generating flowcharts, sequence diagrams, class diagrams, gantt charts and git graphs. (mermaid-js.github.io)](https://mermaid-js.github.io/mermaid/#/)
#documents #mermaid 