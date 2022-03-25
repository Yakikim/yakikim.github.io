---
layout: mynote
cssclasses: rtl
tags: [] 
created: 2022-03-02 21:51
modified: 2022-03-02 21:51
type: document
title: 2022-03-02N1 - Bash-Replace the first line
---
Week Of: [[2022-02-27]]
[[2022-03-02]]

[[home]]/

while read p; do  
if [ $(head -n 2 "$p") == "---" ]; then
sed -i '1d' "$p"
fi
done < ddaf.txt

 for file in '$(fgrep -rnwl "dafyomi" $(pwd))'; do head -n 2 "$file"; done
