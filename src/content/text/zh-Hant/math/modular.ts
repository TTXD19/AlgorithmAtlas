import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Fast Exponentiation、GCD & LCM",
  applications: [
    {
      title: "HTTPS 連線的 Diffie–Hellman 金鑰交換",
      problem: "瀏覽器和伺服器要在會被竊聽的網路上約定一把共同金鑰。雙方各自挑一個 2048 位元的祕密數字 a、b，公開交換的只有 g^a 和 g^b。這些數字的真實大小是 2048 位元再取 2048 位元的次方，宇宙裡的原子都不夠寫。",
      why: "所有計算都在模一個 2048 位元的質數 p 之下進行：g^a mod p 用快速冪每一步取模，數字永遠不超過 p，兩三千次模乘法就算完。對方收到後再算 (g^b)^a mod p，兩邊得到同一個 g^(ab) mod p；竊聽者手上只有 g^a、g^b，要從中反推 a 就是困難的離散對數問題。",
    },
    {
      title: "IBAN 銀行帳號的檢查碼",
      problem: "國際匯款的 IBAN 帳號長達三十幾個字元，打錯一碼錢就會匯到別人帳戶。系統必須在送出前檢查格式，而 IBAN 的規則是：前四碼移到最後、字母換成兩位數，得到的三十多位整數除以 97 餘數要等於 1。這個整數早就超過 64 位元。",
      why: "取模可以分配到加法和乘法上，所以不必組出整個大整數：從左到右每讀一位，就把目前的餘數乘 10 再加上新的數字，然後立刻 mod 97，餘數永遠小於 97。97 是質數，任何一個數字打錯、或相鄰兩個數字對調，都會讓餘數改變，一定抓得到。",
    },
    {
      title: "把主金鑰拆給多位主管保管",
      problem: "公司的主金鑰不能交給單一個人。要把它拆成 5 份分給 5 位主管，任意 3 位到齊就能還原，但只有 2 位的話完全得不到任何資訊。",
      why: "Shamir 秘密分享把金鑰當成一個二次多項式的常數項，發給每位主管多項式上的一個點，所有運算都在模大質數之下。3 個點用拉格朗日插值還原多項式，公式裡要做除法，模數之下的除法就是乘上反元素。模數是質數，所以任何非零的數都有反元素，用費馬小定理加快速冪就能算。",
    },
  ],
  cue: "答案很大要求取模 10⁹+7、中間計算會溢位、大整數的餘數、要在模數之下做除法（分數、機率、期望值）、次方很大的 a^b mod m、反元素、密碼學與檢查碼。",
  steps: [
    "選定模數 m，每次加、減、乘之後立刻取模，讓中間值永遠小於 m；乘法前確認 `(m − 1)²` 放得進使用的整數型別。",
    "減法寫成 `(a − b + m) mod m`；任何可能是負數的值都用 `((x mod m) + m) mod m` 拉回 0 到 m − 1。",
    "遇到除以 b：先確認 `gcd(b, m) = 1`，把「除以 b」換成「乘上 b 的反元素」。",
    "模數是質數 p 時，反元素是 `b^(p−2) mod p`，用快速冪計算；模數不是質數時用擴展歐幾里得。",
    "要 1 到 n 全部的反元素時，用 `inv[i] = (p − ⌊p/i⌋) · inv[p mod i] mod p` 由小到大 O(n) 算完。",
  ],
  demoNote:
    "在模 13 之下找 5 的反元素。第一段把 k = 1 到 12 逐一乘上 5 再取餘數：藍色是這一步，下排綠色標出已經出現過的餘數，乘到 k = 8 時餘數是 1，黃色標出 5 的反元素 8。乘完 12 個之後每個餘數剛好出現一次，由此推出費馬小定理，得到 5⁻¹ ≡ 5¹¹。第二段用快速冪算 5¹¹ mod 13：11 的二進位是 1011，表格逐位列出 base 和 result，四輪之後 result = 8，和試出來的一致；接著用它算出 7 / 5 ≡ 4。最後換成合數模數 12：a = 4 時餘數只有 0、4、8，1 從來不出現，沒有反元素；a = 5 雖然有反元素 5，照抄費馬公式卻算出 1，黃色框標出這個錯誤。",
  codeNote:
    "Python 放快速冪、費馬小定理求反元素、O(n) 算出 1 到 n 的反元素，以及邊讀邊取模的 IBAN 檢查。C++ 放快速冪、費馬版與擴展歐幾里得版的反元素，並示範三個常見情境：機率以分數取模輸出、負數的餘數、指數對 p − 1 取模。",
  problems: [
    { src: "LeetCode 1497", name: "Check If Array Pairs Are Divisible by k（負數的餘數要先拉回正的）", diff: "Medium" },
    { src: "LeetCode 1015", name: "Smallest Integer Divisible by K（只記餘數，不記整個數）", diff: "Medium" },
    { src: "LeetCode 2550", name: "Count Collisions of Monkeys on a Polygon（2ⁿ − 2 取模，減完要加回模數）", diff: "Medium" },
    { src: "LeetCode 2961", name: "Double Modular Exponentiation", diff: "Medium" },
    { src: "LeetCode 1808", name: "Maximize Number of Nice Divisors（拆成 3 的次方，快速冪取模）", diff: "Hard" },
    { src: "LeetCode 1622", name: "Fancy Sequence（全體乘法要反過來做，需要模反元素）", diff: "Hard" },
  ],
};
